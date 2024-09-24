import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Fourth() {
  const route = useRoute();
  const { id } = route.params;
  const router = useRouter();
  const navigation = useNavigation();

  const handleHomePress = () => {
    router.push(`/connect/rasp?id=${id}`); // Replace 'Home' with your home screen route name
  };

  useEffect(() => {
    console.log("fourth id:", id);
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesome name="check-circle" size={60} color="white" />
      </View>
      <Text style={styles.title}>Done!</Text>
      <View style={styles.separator} />
      <Text style={styles.subtitle}>Click the below button to get back to your Hub</Text>
      <TouchableOpacity style={styles.homeButton} onPress={handleHomePress}>
        <View style={styles.iconBackground}>
          <AntDesign name="hdd" size={30} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F233A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(3.5),
    color: 'white',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  separator: {
    width: wp(80),
    height: 1,
    backgroundColor: 'white',
    marginBottom: hp(2),
  },
  subtitle: {
    fontSize: hp(2),
    color: 'gray',
    textAlign: 'center',
    marginBottom: hp(4),
  },
  homeButton: {
    marginTop: hp(2),
    alignItems: 'center',
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: 40,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
