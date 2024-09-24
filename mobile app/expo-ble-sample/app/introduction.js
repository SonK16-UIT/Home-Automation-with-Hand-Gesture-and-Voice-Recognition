import { View, Text, Image } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Introduction() {
  return (
    <View style={{ flex: 1, backgroundColor: '#1F233A', justifyContent: 'center', alignItems: 'center' }}>
      <Image style={{ height: hp(25) }} resizeMode="contain" source={require('../assets/images/login.png')} />
    </View>
  );
}
