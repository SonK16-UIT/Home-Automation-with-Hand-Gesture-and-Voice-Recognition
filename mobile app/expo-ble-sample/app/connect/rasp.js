import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector
import { AntDesign } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import RaspBox from '../../components/RaspBox';
import { DeleteDeviceThunk, GetDeviceThunk } from '../../redux/slices/device';
import { useAuth } from '../../context/authContext';
import { setDevices, setError } from '../../redux/slices/device'; // Import the actions

export default function Rasp() {
  const route = useRoute();
  const { id } = route.params;
  const router = useRouter();
  const dispatch = useDispatch();

  // Accessing devices from Redux store
  const devices = useSelector((state) => state.device.device); // Ensure the state path is correct
  const validDevices = devices || []; // Fallback in case devices is undefined
  const { user, fetchHubName, GetDeviceData, DeleteDevice } = useAuth();
 
  const [raspName, setRaspName] = useState('');

  useEffect(() => {
    const fetchHubAndDeviceData = async () => {
      if (user && user.uid) {
        console.log(validDevices);
        const hubNameResult = await fetchHubName(id);
        if (hubNameResult.success) {
          setRaspName(hubNameResult.name);
        } else {
          console.error('Failed to fetch hub name:', hubNameResult.msg);
        }
        try {
          // Fetch devices using GetDeviceThunk and update Redux store
          const deviceData = await GetDeviceData(id);
          if (deviceData.success) {
            dispatch(setDevices(deviceData.data)); // Set the fetched devices into Redux
          } else {
            dispatch(setError(deviceData.data)); // Set error in Redux store
          }
        } catch (error) {
          dispatch(setError(error.message)); // Handle any other errors
        }
      }
    };
  
    fetchHubAndDeviceData();
  }, [user, id, fetchHubName, dispatch]);
  
  const handleDelete = async (deviceId) => {
    dispatch(DeleteDeviceThunk({ hubID: id, deviceId,DeleteDevice,GetDeviceData }));
  };

  const renderItem = ({ item }) => (
    <RaspBox
      item={item}
      onDelete={() => handleDelete(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('home')}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{raspName}</Text>
      </View>
      <FlatList
        data={validDevices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContent}
      />
      <Link href={{ pathname: "/connect/modal", params: { id } }} style={styles.floatingButton}>
        <LinearGradient colors={['#F3B28E', '#F8757C']} style={styles.floatingButtonGradient}>
          <View style={styles.floatingButtonOverlay}>
            <AntDesign name="plus" size={30} color="white" />
          </View>
        </LinearGradient>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#1F233A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#1F233A',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sensorBox: {
    backgroundColor: '#2B2F3A',
    borderRadius: 10,
    padding: 10,
    width: '48%', // Keeps the width close to half for two columns
    margin: 4,
    justifyContent: 'center',
  },
  deviceBox: {
    backgroundColor: '#2B2F3A',
    borderRadius: 10,
    padding: 15,
    width: '48%', // Keeps the width close to half for two columns
    margin: 4,
    justifyContent: 'center',
  },
  sensorValue: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  sensorId: {
    color: 'gray',
    fontSize: 12,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  floatingButtonGradient: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
  },
  floatingButtonOverlay: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  flatListContent: {
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'space-between',
  },
});
