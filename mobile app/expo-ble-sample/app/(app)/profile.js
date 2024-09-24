import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '../../context/authContext';
import * as ImagePicker from 'expo-image-picker';
import theme from '../../theme';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { readImage, updateImage } from '../../redux/slices/image';
import * as FileSystem from 'expo-file-system';

const imgDir = FileSystem.documentDirectory + 'images/';

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(imgDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
  }
};

export default function Profile() {
  const { user, GetImage, UploadImage, EditUserInfo, updateUserProfile } = useAuth();
  const [fullname, setFullName] = useState(user.fullname || '');
  const [username, setUserName] = useState(user.username || '');
  const [password, setPassword] = useState(user.password ||'');
  const [selectedImage, setSelectedImage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const dispatch = useDispatch();

  const { imageUrl, loading, error } = useSelector((state) => state.image);

  useEffect(() => {
    ensureDirExists();
    if (user && user.uid) {
      dispatch(readImage({ userId: user.uid, GetImage }));
    }
  }, [user, dispatch]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleImageSelection = async (useLibrary) => {
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    };

    let result;
    if (useLibrary) {
      result = await ImagePicker.launchImageLibraryAsync(options);
    } else {
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync(options);
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      setSelectedImage(selectedImage);
      const filename = `${imgDir}${new Date().getTime()}.jpg`;
      await FileSystem.copyAsync({ from: selectedImage, to: filename });
      console.log('Image saved to:', filename);
      await dispatch(updateImage({ image: filename, userId: user.uid, UploadImage, GetImage }));
      console.log('Profile updated successfully');
    } else {
      console.warn('Image selection was canceled or no assets found.');
    }
  };

  const handleFormSubmit = async () => {
    try {
      await EditUserInfo({
        fullname: fullname,
        username: username, // Assuming username is unchanged
        password: password,
        userId: user.uid,
      });

      updateUserProfile({
        fullname: fullname,
        username: user.username,
        password: password,
      });

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  return (
    <SafeAreaView
    style={{
      flex:1,
    }}
    >
    <ScrollView 
      contentContainerStyle={styles.scrollView} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: 'https://picsum.photos/seed/696/3000/2000' }}
          style={styles.bannerImage}
        />
      </View>

      <View style={styles.profileHeader}> 
        <TouchableOpacity onPress={() => handleImageSelection(true)} style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl || selectedImage }}
            style={styles.profileImage}
          />
          <View style={styles.cameraIcon}>
            <AntDesign name="camera" size={18} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{user.username}</Text>
        <Text style={styles.userDescription}>-- Home Automation Nestify User -- </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={fullname}
            onChangeText={setFullName}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Tên người dùng</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUserName}
            placeholder="Enter your username"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mật khẩu</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={user.password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
              <Feather name={isPasswordVisible ? 'eye' : 'eye-off'} size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        <Pressable onPress={handleFormSubmit} style={styles.buttonContainer}>
          <LinearGradient colors={['#F3B28E', '#F8757C']} style={styles.gradientButton}>
            <Text style={styles.buttonText}>Kích hoạt</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    alignItems: 'center',
    padding: 0,
    backgroundColor: theme.background,
  },
  bannerContainer: {
    width: '100%',
  },
  bannerImage: {
    height: 228,
    width: '100%',
  },
  profileHeader: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: theme.primary,
    marginTop: -80, 
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary,
    borderRadius: 12,
    padding: 4,
  },
  formContainer: {
    paddingHorizontal: 16,
    width: '100%',
    paddingBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textWhite,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderColor: theme.secondary,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: theme.textWhite,
    paddingHorizontal: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.secondary,
    borderRadius: 8,
    backgroundColor: theme.textWhite,
    width: '100%',
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    height: 44,
    color: '#000',
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  gradientButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
  },
});
