import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  reauthenticateWithCredential, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updatePassword, 
  updateProfile
} from 'firebase/auth';
import { auth, db, storage } from "../firebaseConfig";
import { ref, set, get, update, query, orderByChild, equalTo, orderByKey, remove, push, onValue } from "firebase/database";
import { ref as refSTR, getDownloadURL, listAll, uploadBytes, deleteObject } from "firebase/storage";
import * as FileSystem from 'expo-file-system';
import { EmailAuthProvider } from "firebase/auth/web-extension";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        await initializeUser(user); // Initialize user with additional data
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const initializeUser = async (user) => {
    try {
      const userRef = ref(db, 'users/' + user.uid);
      const userSnapshot = await get(userRef);

      let userData = {
        username: 'Unknown',
        fullname: 'Unknown',
        password: 'Unknown',
      };

      if (userSnapshot.exists()) {
        userData = userSnapshot.val();
      } else {
        console.error('User data does not exist in the Realtime Database');
      }

      const isGoogle = user.providerData.some(
        (provider) => provider.providerId === "google.com"
      );
      setIsGoogleUser(isGoogle);

      const isEmail = user.providerData.some(
        (provider) => provider.providerId === "password"
      );
      setIsEmailUser(isEmail);

      setUser({ 
        ...user, 
        username: userData.username, 
        fullname: userData.fullname,
        password: userData.password
      });
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

  const updateUserProfile = (updatedData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedData,
    }));
  };

  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      await initializeUser(response.user); // Fetch additional user info after login
      return { success: true };
    } catch (e) {
      let msg = e.message;
      if (msg.includes('(auth/invalid-email)')) msg = 'Email không hợp lệ!';
      if (msg.includes('(auth/wrong-password)')) msg = 'Sai mật khẩu!';
      if (msg.includes('(auth/invalid-credential)')) msg = 'Sai mật khẩu!';
      console.error('Login error:', e);
      return { success: false, msg };
    }
  };

  const doSignInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return { success: true, data: result.user };
    } catch (e) {
      let msg = e.message;
      console.error('Error during Google sign in:', e);
      return { success: false, msg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (e) {
      console.error('Logout error:', e);
      return { success: false, msg: e.message };
    }
  };

  const register = async (email, password, username, fullname) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, 'users/' + response.user.uid), {
        fullname,
        username,
        email,
        password
      });
      
      // Define the source image path (e.g., "Main Images" folder)
      const mainImagesFolder = refSTR(storage, 'Main Images/');
      
      // Retrieve the list of all images in the "Main Images" folder
      const listResponse = await listAll(mainImagesFolder);
      
      if (listResponse.items.length > 0) {
        const sourceImageRef = listResponse.items[0];

        // Get the download URL of the source image
        const sourceImageUrl = await getDownloadURL(sourceImageRef);

        // Download the image data
        const imageResponse = await fetch(sourceImageUrl);
        const blob = await imageResponse.blob();

        // Define the destination path
        const userFolderRef = refSTR(storage, `Users/${response.user.uid}/${sourceImageRef.name}`);

        // Upload the downloaded blob to the new user's folder
        await uploadBytes(userFolderRef, blob);

      } else {
        console.error('No images found in Main Images folder.');
      }

      await initializeUser(response.user); // Initialize the user to fetch additional data
      return { success: true, data: response.user };
    } catch (e) {
      let msg = e.message;
      if (msg.includes('(auth/invalid-email)')) msg = 'Email không hợp lệ!';
      if (msg.includes('(auth/email-already-in-use)')) msg = 'Email này đã dùng!';
      console.error('Error during registration:', e);
      return { success: false, msg };
    }
  };

  const activateHub = async (activeID, userID) => {
      if (!activeID || !userID) {
        throw new Error("Invalid ActivationCode or userID");
      }
  
      const hubsRef = ref(db, 'Hub');
      const hubsQuery = query(hubsRef, orderByChild('activation'), equalTo(activeID));
      const snapshot = await get(hubsQuery);
  
      if (snapshot.exists()) {
        const updatePromises = [];
        snapshot.forEach((childSnapshot) => {
          const hubKey = childSnapshot.key;
          const updatePromise = update(ref(db, `Hub/${hubKey}`), { UserID: userID });
          updatePromises.push(updatePromise);
        });
        await Promise.all(updatePromises);
        setActiveError(null);
      } else {
        setActiveError('Activation code not found');
      }
  };

  const createHub = async (activeCode, user) => {
    try {
      if (!user) {
        throw new Error('User is not authenticated');
      }
      
      // Create a new reference with an auto-generated ID
      const newRaspRef = push(ref(db, 'Hub'));
      
      // Set the data with the new structure
      await set(newRaspRef, {
        activation: activeCode,
        UserID: user.uid,
        chosen_device: {
          addr: "",
          name: ""
        },
        command: "idle",
        password: "",
        scanned_devices: [],
        ssid: ""
      });
  
      console.log('Raspberry Pi created successfully');
      return { success: true };
    } catch (error) {
      console.error('Error creating Raspberry Pi:', error);
      return { success: false, msg: error.message };
    }
  };

  const getRaspDataByUserId = async (userId) => {
    try {
      const devicesRef = ref(db, 'Hub');
      const devicesQuery = query(devicesRef, orderByChild('UserID'), equalTo(userId));
      const devicesSnapshot = await get(devicesQuery);
  
      let devicesData = [];
      if (devicesSnapshot.exists()) {
        devicesSnapshot.forEach((childSnapshot) => {
          const deviceData = { id: childSnapshot.key, ...childSnapshot.val() };
          devicesData.push(deviceData);
        });
      } else {
        console.log('No Raspberry Pi data found for this userId');
      }
      return { success: true, data: devicesData };
    } catch (e) {
      console.error('Error fetching device data:', e);
      return { success: false, msg: e.message };
    }
  };

  const countDevicesByHubId = async (hubId) => {
  try {
      const sensorRef = ref(db, 'Device');
      const sensorQuery = query(sensorRef, orderByChild('HubID'), equalTo(hubId));
      const snapshot = await get(sensorQuery);

      let deviceCount = 0;
      if (snapshot.exists()) {
        deviceCount = snapshot.size; // Count the number of matching devices
      }
      return { success: true, count: deviceCount };
    } catch (error) {
      console.error('Error counting devices:', error);
      return { success: false, msg: error.message };
    }
  };

  const DeleteActivation = async (raspId) => {
    try {
      const deviceRef = ref(db, `Hub/${raspId}`);
      const snapshot = await get(deviceRef);
  
      if (snapshot.exists()) {
        await update(deviceRef, { UserID: "" });
        console.log('Hub deactivated successfully');
        return { success: true };
      } else {
        console.log('Raspberry Pi not found');
        return { success: false, msg: 'Raspberry Pi not found' };
      }
    } catch (error) {
      console.error('Error deactivating hub:', error);
      return { success: false, msg: error.message };
    }
  };

  const updateWifiSSID = async (raspId, ssid, password) => {
    try {
      const deviceRef = ref(db, `Hub/${raspId}`);
      await update(deviceRef, { ssid, password });
      console.log('WiFi SSID and password updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating WiFi SSID and password:', error);
      return { success: false, msg: error.message };
    }
  };

  const updateCommand = async (raspId, command) => {
    try {
      const deviceRef = ref(db, `Hub/${raspId}`);
      await update(deviceRef, { command });
      console.log('Command updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating command:', error);
      return { success: false, msg: error.message };
    }
  };
  
  const getScannedWithRaspID = async (raspId) => {
    try {
        const deviceRef = ref(db, `Hub/${raspId}/scanned_devices`);
        const snapshot = await get(deviceRef);
        let scannedDevices = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const device = childSnapshot.val();
                scannedDevices.push({
                    key: childSnapshot.key, // use key for unique identifier
                    addr: device.addr || "Unknown",
                    name: device.name || "Unnamed"
                });
            });
        }
        console.log('Fetched scanned devices:', scannedDevices);
        return { success: true, data: scannedDevices };
    } catch (error) {
        console.error('Error fetching scanned devices:', error);
        return { success: false, msg: error.message };
    }
};

const connectToDevice = async (raspId, addr, name) => {
  try {
    const raspRef = ref(db, `Hub/${raspId}`);
    await update(raspRef, {
      'chosen_device/addr': addr,
      'chosen_device/name': name,
      'command': 'connecting',
    });
    console.log('Connected to device:', { addr, name });
    return { success: true };
  } catch (error) {
    console.error('Error connecting to device:', error);
    return { success: false, msg: error.message };
  }
};

const updateStatus = async (deviceId, newStatus) => {
  try {
    // Direct reference to the status field of the specified device
    const statusRef = ref(db, `Device/${deviceId}/status`);

    // Update the status directly
    await set(statusRef, newStatus); // Directly set the status value

    console.log('Status updated to ${newStatus}');
    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, msg: error.message };
  }
};

const fetchCommand = async (id) => {
  try {
    const deviceRef = ref(db, `Hub/${id}/command`);
    const snapshot = await get(deviceRef);
    if (snapshot.exists()) {
      const command = snapshot.val();
      console.log('Fetched command:', command);
      return { success: true, command };
    } else {
      return { success: false, msg: 'Command not found' };
    }
  } catch (error) {
    console.error('Error fetching command:', error);
    return { success: false, msg: error.message };
  }
};
const fetchHubName = async (hubId) => {
  try {
    const hubRef = ref(db, `Hub/${hubId}/name`);
    const snapshot = await get(hubRef);
    if (snapshot.exists()) {
      const name = snapshot.val();
      console.log('Fetched hub name:', name);
      return { success: true, name };
    } else {
      return { success: false, msg: 'Hub name not found' };
    }
  } catch (error) {
    console.error('Error fetching hub name:', error);
    return { success: false, msg: error.message };
  }
};
const updateHubName = async (hubId, name) => {
  try {
    const hubRef = ref(db, `Hub/${hubId}`);
    await update(hubRef, { name });
    console.log('Hub name updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating hub name:', error);
    return { success: false, msg: error.message };
  }
};
const GetImage = async (userId) => {
  try {
    const userFolderRef = refSTR(storage, `Users/${userId}/`); // Reference to the user's folder
    const fileList = await listAll(userFolderRef);
    let imageUrl = '';

    if (fileList.items.length > 0) {
      imageUrl = await getDownloadURL(fileList.items[0]);
    } else {
      console.error('No images found for the user in Firebase Storage');
    }
    return { success: true,data: imageUrl};
  } catch (error) {
    console.error("Error fetching image URL:", error);
    return null;
  }
};

const UploadImage = async (imageUri, userId) => {
  try {
    // Ensure the image URI is valid and readable
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    // Read the file as a blob
    const blob = await fetch(imageUri).then((response) => response.blob());

    // Define Firebase storage reference
    const userRef = refSTR(storage, `Users/${userId}`);
    const listResult = await listAll(userRef);

    // Delete existing images
    const deletePromises = listResult.items.map((itemRef) => deleteObject(itemRef));
    await Promise.all(deletePromises);

    // Upload the new image
    const newImageRef = refSTR(storage, `Users/${userId}/${fileInfo.uri.split('/').pop()}`);
    await uploadBytes(newImageRef, blob);

    // Get the download URL for the uploaded image
    const downloadURL = await getDownloadURL(newImageRef);
    console.log('Image uploaded successfully. URL:', downloadURL);

    // Return an object with a success flag and the URL
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading image:', error);

    // Return an object with a success flag set to false and the error message
    return { success: false, msg: error.message };
  }
};

const reauthenticateUser = async (currentUser, password) => {
  const credential = EmailAuthProvider.credential(
    currentUser.email,
    password
  );

  try {
    await reauthenticateWithCredential(currentUser, credential);
    console.log("Re-authentication successful");
  } catch (error) {
    console.error("Error during re-authentication:", error);
    throw error; // Re-throw the error to handle it in your flow
  }
};

const EditUserInfo = async ({ fullname, username, password, userId }) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User is not authenticated");
  }

  try {
    // Re-authenticate the user with their current password before updating sensitive info
    await reauthenticateUser(currentUser, password);

    // Update Firebase Authentication profile
    await updateProfile(currentUser, {
      displayName: username,
    });

    // Update password in Firebase Authentication
    await updatePassword(currentUser, password);

    // Update the Realtime Database
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
      fullname,
      username,
      password, // Ensure the password is stored securely if at all
    });

    console.log("User information updated successfully");
  } catch (error) {
    console.error("Error updating user information:", error);
    throw error;
  }
};

const GetScenariosData = async (hubID) => {
  try {
    // Reference to the 'Scenarios' node in your Firebase Realtime Database
    const scenariosRef = ref(db, 'Scenarios');
    // Create a query to filter scenarios by the HubID
    const scenariosQuery = query(scenariosRef, orderByChild('HubID'), equalTo(hubID));
    // Execute the query and get the snapshot
    const snapshot = await get(scenariosQuery);

    let scenariosData = [];
    // Check if snapshot exists and iterate through each matching scenario
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        // Construct the scenario object with ID and its data
        const scenario = { id: childSnapshot.key, ...childSnapshot.val() };
        // Push the scenario to the scenariosData array
        scenariosData.push(scenario);
      });
    }

    // Return the result with success status and data
    return { success: true, data: scenariosData };
  } catch (error) {
    // Log and return error if any occurs
    console.error('Error fetching scenarios data:', error);
    return { success: false, msg: error.message };
  }
};


const getScenarioWithActionID = async (actionID) => {
  try {
    // Direct reference to the specific scenario using the actionID
    const scenarioRef = ref(db, `Scenarios/${actionID}`);

    // Fetch the data from the database
    const snapshot = await get(scenarioRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Fetched Scenario:', data); // Log the fetched scenario
      return { success: true, result: data }; // Return the scenario data
    } else {
      console.error('No matching scenario found');
      return { success: false, msg: 'No matching scenario found' };
    }
  } catch (error) {
    console.error('Failed to fetch scenario:', error.message);
    return { success: false, msg: error.message };
  }
};

const CreateAction = async (actionId, action, device_name) => {
  try {
    // Reference to the specific actions path using actionId
    const actionsRef = ref(db, `Scenarios/${actionId}/actions`);

    // Get the current actions list
    const actionsSnapshot = await get(actionsRef);
    let actions = {};

    if (actionsSnapshot.exists()) {
      actions = actionsSnapshot.val(); // Retrieve current actions as an object
    }

    // Determine the next index by finding the maximum index and adding 1
    const currentIndices = Object.keys(actions).map(key => parseInt(key));
    const newIndex = currentIndices.length > 0 ? Math.max(...currentIndices) + 1 : 0;

    // Prepare the update object with the new action
    const updateObject = { [newIndex]: { action, device_name } };

    // Update the actions in Firebase with the new action added
    await update(actionsRef, updateObject); // Use the correct update object format

    console.log(`Action added with index ${newIndex}:`, { action, device_name });
  } catch (error) {
    console.error('Error updating actions:', error);
  }
};

const DeleteAction = async (actionId, index) => {
  try {
    // Directly reference the action at the specified index path
    const actionRef = ref(db, `Scenarios/${actionId}/actions/${index}`);

    // Delete the action at the specified index
    await remove(actionRef);

  } catch (error) {
    console.error('Error deleting action:', error);
  }
};
const DeleteScenario = async (scenarioId) => {
  try {
    // Reference to the specific scenario path in Firebase
    const scenarioRef = ref(db, `Scenarios/${scenarioId}`);

    // Delete the scenario at the specified path
    await remove(scenarioRef);

    console.log(`Scenario ${scenarioId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting scenario ${scenarioId}:`, error);
  }
};
const CreateScenario = async (hubID, name, time) => {
  try {
    // Reference to the Scenarios path and generate a new scenario key
    const scenariosRef = ref(db, 'Scenarios');
    const newScenarioRef = push(scenariosRef); // Creates a new unique key for the scenario

    // Create the scenario object
    const newScenario = {
      HubID: hubID,
      actions: "", // Initialize actions as an empty object
      name: name,
      time: time,
    };

    // Use `update` to ensure the structure is respected
    await update(newScenarioRef, newScenario);

    console.log(`Scenario created successfully with ID: ${newScenarioRef.key}`);
  } catch (error) {
    console.error('Error creating scenario:', error);
  }
};

const UpdateAction = async (actionId, hubId, index, device_name, status) => {
  try {
    // Reference to the specific scenario path using the actionId
    const scenarioRef = ref(db, `Scenarios/${actionId}`);

    // Fetch the current data of the scenario
    const snapshot = await get(scenarioRef);
    if (!snapshot.exists()) {
      console.error(`No scenario found for Action ID: ${actionId}`);
      return;
    }

    const scenarioData = snapshot.val();
    // Check if the HubID matches
    if (scenarioData.HubID !== hubId) {
      console.error(`HubID does not match for Action ID: ${actionId}`);
      return;
    }

    // Locate the action using index
    let actions = scenarioData.actions || {};

    // Convert actions to an array if necessary
    actions = Array.isArray(actions) ? actions : Object.values(actions);

    // Check if the action exists at the specified index
    if (index >= actions.length || !actions[index]) {
      console.error(`Action at index ${index} not found in Action ID: ${actionId}`);
      return;
    }

    // Update the action's status and device name
    actions[index] = {
      ...actions[index],
      action: status,
      device_name: device_name,
    };

    // Convert the updated actions back to an object if necessary
    const updatedActions = actions.reduce((acc, action, idx) => {
      acc[idx] = action; // Re-index actions with numeric keys
      return acc;
    }, {});

    // Reference to the specific scenario's actions path
    const actionsRef = ref(db, `Scenarios/${actionId}/actions`);

    // Update the actions in Firebase with the modified list
    await update(actionsRef, updatedActions);

    console.log(`Action at index ${index} updated successfully in Action ID: ${actionId}`);
  } catch (error) {
    console.error('Error updating action:', error);
  }
};
const CountScenarios = async (hubID) => {
  try {
    // Reference to the "Scenarios" path in the database
    const scenariosRef = ref(db, 'Scenarios');

    // Get all scenarios
    const snapshot = await get(scenariosRef);

    // Check if scenarios exist
    if (!snapshot.exists()) {
      console.log('No scenarios found.');
      return 0;
    }

    const scenarios = snapshot.val(); // Retrieve all scenarios
    let count = 0;

    // Iterate through each scenario to count the matching HubID
    for (const key in scenarios) {
      if (scenarios[key]?.HubID === hubID) {
        count += 1; // Increment the count for each matching HubID
      }
    }

    console.log(`Number of scenarios with HubID ${hubID}: ${count}`);
    return count;

  } catch (error) {
    console.error('Error counting scenarios:', error);
    return 0;
  }
};

const UpdateDeviceName = async (deviceId, deviceName) => {
  try {
    const deviceRef = ref(db, `Device/${deviceId}`);

    await update(deviceRef, {
      device_name: deviceName,
    });

    console.log(`Device name updated successfully for ${deviceId} to ${deviceName}`);
    return { success: true, data: null };
  } catch (error) {
    console.error('Error updating device name:', error);
    return { success: false, data: error.message };
  }
};

const GetDeviceData = (hubID) => {
  return new Promise((resolve) => {
    try {
      const sensorRef = ref(db, 'Device');
      const sensorQuery = query(sensorRef, orderByChild('HubID'), equalTo(hubID));

      onValue(
        sensorQuery,
        (snapshot) => {
          let deviceList = [];
          snapshot.forEach((childSnapshot) => {
            const device = childSnapshot.val();
            deviceList.push({ id: childSnapshot.key, ...device });
          });

          resolve({ success: true, data: deviceList });
        },
        (error) => {
          console.error(`Failed to fetch device data: ${error.message}`);
          resolve({ success: false, data: error.message });
        }
      );
    } catch (error) {
      console.error(`Error in GetDeviceData: ${error.message}`);
      resolve({ success: false, data: error.message });
    }
  });
};

const DeleteDevice = (deviceId) => {
  return new Promise((resolve) => {
    try {
      const deviceRef = ref(db, `Device/${deviceId}`);

      remove(deviceRef)
        .then(() => {
          console.log(`Device with ID ${deviceId} has been deleted.`);
          resolve({ success: true, data: null });
        })
        .catch((error) => {
          console.error(`Failed to delete device with ID ${deviceId}: ${error.message}`);
          resolve({ success: false, data: error.message });
        });
    } catch (error) {
      console.error(`Error in DeleteDevice: ${error.message}`);
      resolve({ success: false, data: error.message });
    }
  });
};

const GetActions = async (actionId) => {
  try {
    const actionsRef = ref(db, `Scenarios/${actionId}/actions`); // Reference to actions node based on actionId
    const snapshot = await get(actionsRef); // Fetch data from the reference

    if (snapshot.exists()) {
      const actionsData = [];
      snapshot.forEach((childSnapshot) => {
        // Extract each action and include the key as its ID
        const actionData = { id: childSnapshot.key, ...childSnapshot.val() };
        actionsData.push(actionData); // Push to the array
      });

      return { success: true, result: actionsData }; // Return the data with success status
    } else {
      console.log('No actions found for this actionId');
      return { success: false, result: [] }; // Return empty result if no actions found
    }
  } catch (error) {
    console.error('Error fetching actions:', error);
    return { success: false, result: [], message: error.message }; // Handle and return error
  }
};
const GetMotionPictures = async (userId, deviceId) => {
  try {
    // Helper function to format the timestamp from the filename
    const formatTimestamp = (timestamp) => {
      // The filename is in format DDMMYYYY_HHMMSS, so extract the date and time.
      const [datePart, timePart] = timestamp.split('_');

      if (datePart && timePart) {
        const day = datePart.substring(0, 2);  // Extract day
        const month = datePart.substring(2, 4);  // Extract month
        const year = datePart.substring(4, 8);  // Extract year

        const hours = timePart.substring(0, 2);  // Extract hours
        const minutes = timePart.substring(2, 4);  // Extract minutes
        const seconds = timePart.substring(4, 6);  // Extract seconds

        // Return formatted string
        return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
      } else {
        return 'Invalid Timestamp';
      }
    };

    // Define Firebase storage reference to the device's folder
    const deviceRef = refSTR(storage, `Users/${userId}/${deviceId}`);
    
    // List all files (images) within the folder
    const listResult = await listAll(deviceRef);
    
    // Map the results to get URLs and timestamps
    const pictureData = await Promise.all(
      listResult.items.map(async (item) => {
        const url = await getDownloadURL(item); // Get the image URL
        const timestamp = item.name.split('_')[0]; // Extract timestamp from the file name
        const formattedTimestamp = formatTimestamp(item.name.split('.')[0]); // Format timestamp from filename
        return { timestamp, url, formattedTimestamp };
      })
    );

    return { success: true, pictures: pictureData };
  } catch (error) {
    console.error('Error fetching motion pictures:', error);
    return { success: false, msg: error.message };
  }
};

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      activateHub,
      createHub,
      getRaspDataByUserId,
      DeleteActivation,
      updateWifiSSID,
      updateCommand,
      getScannedWithRaspID,
      connectToDevice,
      updateStatus,
      countDevicesByHubId,
      fetchCommand,
      fetchHubName,
      updateHubName,
      GetImage,
      doSignInWithGoogle,
      UploadImage,
      EditUserInfo,
      updateUserProfile,
      GetScenariosData,
      getScenarioWithActionID,
      CreateAction,
      DeleteAction,
      DeleteScenario,
      CreateScenario,
      UpdateAction,
      CountScenarios,
      UpdateDeviceName,
      GetDeviceData,
      DeleteDevice,
      GetActions,
      GetMotionPictures
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be wrapped inside AuthContextProvider');
  }
  return value;
};
