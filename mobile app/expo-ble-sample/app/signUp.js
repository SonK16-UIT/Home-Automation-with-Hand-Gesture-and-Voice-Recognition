import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import AntDesign from '@expo/vector-icons/AntDesign';
import "../global.css";
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import Loading from '../components/Loading';
import CustomKeyboardViews from '../components/CustomKeyboardViews';
import { useAuth } from '../context/authContext';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center', // Ensure text is centered
    padding: 10,
    borderRadius: 10, // Adjust as needed
  },
  buttonHeight: {
    height: hp(6.5),
  },
  buttonGradient: {
    borderRadius: 15,
  },
});

export default function SignUp() {
    const router = useRouter();
    const {register} = useAuth();
    const [loading,setLoading] = useState(false);
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const usernameRef = useRef("");
    const fullnameRef = useRef("");

    const handleRegister = async ()=>{
        if(!emailRef.current || !passwordRef.current || !usernameRef.current || !fullnameRef.current){
            Alert.alert('Sign Up',"Please fill all the fields");
            return;
        }
        setLoading(true);

        let response = await register(emailRef.current, passwordRef.current, usernameRef.current,fullnameRef.current)
        setLoading(false);

        console.log('got results: ',response);

        if(!response.success){
          Alert.alert('Sign up', response.msg);
        }
      }
  return (
    <CustomKeyboardViews>
    <View className="flex-1">
      <StatusBar style="dark" />
      <View style={{ paddingTop: hp(22), paddingHorizontal: wp(5),backgroundColor: '#1F233A' }} className="flex-1 gap-50">
        <View className="items-center">
          <Image style={{ height: hp(20) }} resizeMode="contain" source={require('../assets/images/register.png')} />
        </View>

        <View className="gap-10">
          {/* inputs */}
          <View className="gap-4">
            <View style={{ height: hp(7) }} className="flex-row gap-4 px-4 bg-slate-950 items-center rounded-2xl">
              <FontAwesome6 name="contact-card" size={hp(2.7)} color="gray" />
              <TextInput
                onChangeText={value=> fullnameRef.current=value}
                style={{ fontSize: hp(2) ,color: 'white'  }}
                className="flex-1 font-semibold text-neutral-700"
                placeholder="Họ và tên"
                placeholderTextColor="gray"
              />
            </View>
            <View style={{ height: hp(7) }} className="flex-row gap-4 px-4 bg-slate-950 items-center rounded-2xl">
              <AntDesign name="user" size={hp(2.7)} color="gray" />
              <TextInput
                onChangeText={value=> usernameRef.current=value}
                style={{ fontSize: hp(2) ,color: 'white'  }}
                className="flex-1 font-semibold text-neutral-700"
                placeholder="Tên tài khoản"
                placeholderTextColor="gray"
              />
            </View>
            <View style={{ height: hp(7) }} className="flex-row gap-4 px-4 bg-slate-950 items-center rounded-2xl">
              <AntDesign name="mail" size={hp(2.7)} color="gray" />
              <TextInput
                onChangeText={value=> emailRef.current=value}
                style={{ fontSize: hp(2) , color: 'white'}}
                className="flex-1 font-semibold text-neutral-700"
                placeholder="Địa chỉ email"
                placeholderTextColor="gray"
              />
            </View>
              <View style={{ height: hp(7), color: 'white' }} className="flex-row gap-4 px-4 bg-slate-950 items-center rounded-2xl">
                <AntDesign name="lock" size={hp(2.7)} color="gray" />
                <TextInput
                  onChangeText={value=> passwordRef.current=value}
                  style={{ fontSize: hp(2) }}
                  className="flex-1 font-semibold text-neutral-700"
                  placeholder="Mật khẩu"
                  secureTextEntry
                  placeholderTextColor="gray"
                />
              </View>
              
            {/* submit button */}
            <View>
                {
                    loading ? (
                        <View className="flex-row justify-center">
                          <Loading size={hp(10)} />
                        </View> 
                    ) : (
                      <LinearGradient 
                      colors={['#F3B28E', '#F8757C']}
                      style={[styles.buttonHeight, styles.buttonGradient]}
                        >
                        <Pressable onPress={handleRegister} style={[styles.button, styles.buttonHeight]} className="rounded-xl justify-center items-center">
                        <Text style={{ fontSize: hp(2.7)}} className="text-white font-bold tracking-wider">
                          Đăng ký
                        </Text>
                      </Pressable> 
                      </LinearGradient>
                    )
                }
            </View>
           

            <View className="flex-row justify-center">
              <Text style={{fontSize: hp(1.8)}} className="font-semibold text-neutral-500">Đã có tài khoản ? </Text>
              <Pressable onPress={() => router.push('signIn')}>
                <Text style={{fontSize: hp(1.8)}} className="font-semibold text-cyan-300">Đăng nhập</Text>
              </Pressable>
              
            </View>

          </View>
        </View>
      </View>
    </View>
    </CustomKeyboardViews>
  );
}
