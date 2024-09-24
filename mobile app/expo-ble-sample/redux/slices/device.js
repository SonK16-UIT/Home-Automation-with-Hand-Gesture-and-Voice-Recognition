import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, onValue, query, equalTo, orderByChild } from 'firebase/database'; // Import Firebase functions
import { db } from '../../firebaseConfig';

// Async thunk for fetching devices based on HubID and setting up a real-time listener
export const GetDeviceThunk = createAsyncThunk(
  'device/getDeviceData',
  async ({ hubID, GetDeviceData }, { dispatch, rejectWithValue }) => {
    try {
      const sensorRef = ref(db, 'Device');
      const sensorQuery = query(sensorRef, orderByChild('HubID'), equalTo(hubID));

      // Set up real-time listener
      onValue(sensorQuery, (snapshot) => {
        let deviceList = [];
        snapshot.forEach((childSnapshot) => {
          const device = childSnapshot.val();
          deviceList.push({ id: childSnapshot.key, ...device });
        });

        // Dispatch the action to update devices in the Redux store
        dispatch(setDevices(deviceList));
      }, (error) => {
        console.error(`Failed to fetch device data: ${error.message}`);
        dispatch(setError(error.message));
      });

      // Since onValue works in real-time, there is no need to return any data here
      return;
    } catch (error) {
      console.error('Error in GetDeviceThunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting a device based on deviceId
export const DeleteDeviceThunk = createAsyncThunk(
  'device/deleteDevice',
  async ({ hubID, deviceId, DeleteDevice, GetDeviceData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await DeleteDevice(deviceId);
      if (response.success) {
        await dispatch(GetDeviceThunk({ hubID, GetDeviceData }));
        return deviceId;
      } else {
        return rejectWithValue(response.data);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating the device name
export const UpdateDeviceNameThunk = createAsyncThunk(
  'device/updateDeviceName',
  async ({ hubID, deviceId, deviceName, UpdateDeviceName, GetDeviceData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await UpdateDeviceName(deviceId, deviceName);
      if (response.success) {
        await dispatch(GetDeviceThunk({ hubID, GetDeviceData }));
        return { deviceId, deviceName };
      } else {
        return rejectWithValue(response.data);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create the slice
const deviceSlice = createSlice({
  name: 'device',
  initialState: {
    device: [], // Use the correct state structure
    loading: false,
    error: null,
  },
  reducers: {
    setDevices: (state, action) => {
      state.device = action.payload; // Update devices in real-time
      state.loading = false; // Ensure loading stops when devices are updated
      state.error = null; // Clear any previous errors
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state) => {
      state.loading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetDeviceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetDeviceThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(GetDeviceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(DeleteDeviceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteDeviceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.device = state.device.filter((device) => device.id !== action.payload);
      })
      .addCase(DeleteDeviceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(UpdateDeviceNameThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateDeviceNameThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { deviceId, deviceName } = action.payload;
        const deviceIndex = state.device.findIndex((device) => device.id === deviceId);
        if (deviceIndex !== -1) {
          state.device[deviceIndex].device_name = deviceName;
        }
      })
      .addCase(UpdateDeviceNameThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { setDevices, setError, setLoading } = deviceSlice.actions;
export default deviceSlice.reducer;
