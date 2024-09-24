import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../../context/authContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import CustomKeyboardViews from '../../../components/CustomKeyboardViews';
import { useRoute } from '@react-navigation/native';
import { Link } from 'expo-router';

export default function ConnectIndex() {
  const route = useRoute();
  const { id } = route.params;
  const { updateWifiSSID } = useAuth();
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(true);

  const handleUpdateWifi = async () => {
    const result = await updateWifiSSID(id, ssid, password);
    if (!result.success) {
      console.error('Failed to update WiFi settings:', result.msg);
    }
  };

  useEffect(() => {
    console.log(
      "first index:", id);
  })

  return (
    <CustomKeyboardViews>
      <View style={styles.container}>
        <Text style={[styles.text, styles.title]}>
          Lựa chọn Mạng Wifi 2.4 GHz Wi-Fi và nhập mật khẩu
        </Text>
        <Text style={[styles.text, styles.subtitle]}>
          Nếu Wi-Fi là 5GHz, làm ơn đặt lại là 2.4GHz
        </Text>
        <View style={styles.imageContainer}>
          <Image style={styles.image} resizeMode="contain" source={require('../../../assets/images/Screenshot 2024-07-29 212732.png')} />
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Feather name="wifi" size={24} color="gray" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="SSID"
              placeholderTextColor="gray"
              value={ssid}
              onChangeText={setSsid}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={24} color="gray" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="gray"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={passwordVisible}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Feather name={passwordVisible ? 'eye-off' : 'eye'} size={24} color="gray" style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
        <Link href={{ pathname: "/connect/modal/second", params: { id } }} asChild>
          <TouchableOpacity style={styles.addButton} onPress={handleUpdateWifi}>
            <LinearGradient colors={['#F3B28E', '#F8757C']} style={styles.addButtonGradient}>
              <Text className="text-white text-center" style={styles.addButtonText}>Submit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>
      </View>
    </CustomKeyboardViews>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1F233A',
  },
  text: {
    color: 'white',
  },
  title: {
    fontSize: hp(3.5),
    marginBottom: hp(2),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: hp(2.5),
    marginBottom: hp(2),
    textAlign: 'center',
    color: '#A0A3BD',
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    height: hp(25),
    marginBottom: hp(2),
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: hp(6),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F233A',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginBottom: hp(2),

  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: hp(1.5),
    color: 'white',
  },
  addButton: {
    alignItems: 'center',
  },
  addButtonGradient: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(20),
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: hp(2.5),
  },
});

