import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../context/authContext';
import { AntDesign } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRoute } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';

export default function Second() {
  const route = useRoute();
  const router = useRouter  ();
  const { id } = route.params;
  const { updateCommand, getScannedWithRaspID, connectToDevice } = useAuth();
  const [scannedDevices, setScannedDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleScanDevices = async () => {
    const scanResult = await getScannedWithRaspID(id);
    if (scanResult.success) {
      setScannedDevices(scanResult.data);
      const commandResult = await updateCommand(id, 'scanning');
      if (!commandResult.success) {
        console.error('Failed to update command:', commandResult.msg);
      }
    } else {
      console.error('Failed to fetch scanned devices:', scanResult.msg);
    }
    setLoading(false);
  };

  const handleConnectToDevice = async () => {
    if (selectedIndex !== null) {
      const selectedDevice = scannedDevices[selectedIndex];
      const connectResult = await connectToDevice(id, selectedDevice.addr, selectedDevice.name);
      if (connectResult.success) {
        console.log('Connected to device:', selectedDevice);
      } else {
        console.error('Error connecting to device:', connectResult.msg);
      }
    }
  };

  useEffect(() => {
    console.log("second id:", id);
    handleScanDevices();

    // Progress bar animation
    let progressInterval;
    if (loading) {
      progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 1) {
            clearInterval(progressInterval);
            setCompleted(true);
            handleScanDevices();
            return 1;
          }
          return prevProgress + 0.007; // Increment progress every 100ms
        });
      }, 100);
    }

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  const renderDeviceItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.deviceItem,
        selectedIndex === index && styles.selectedDeviceItem,
      ]}
      onPress={() => setSelectedIndex(index)}
    >
      <MaterialIcons name="devices" size={24} color="white" />
      <Text style={styles.deviceText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {completed ? (
          <FontAwesome name="check-circle" size={60} color="white" />
        ) : (
          <FontAwesome name="bluetooth" size={60} color="white" />
        )}
      </View>
      <Text style={styles.title}>
        {completed ? `Found ${scannedDevices.length} devices!` : 'Searching for devices...'}
      </Text>
      <View style={styles.progressContainer}>
        <Progress.Bar 
          progress={progress} 
          width={wp(80)} 
          color="white" 
          unfilledColor="transparent" 
          borderColor="white" 
          borderWidth={2} 
        />
      </View>
      <Text style={styles.subtitle}> {completed ? "Select a device to establish connection": "Make sure your device is on and its Bluetooth is enabled"}</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={scannedDevices}
          renderItem={renderDeviceItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<Text style={styles.historyTitle}>{completed ? "Devices" : "History"}</Text>}
        />
      )}
      {completed && (
        <Link href={{ pathname: "/connect/modal/third", params: { id } }} asChild>
        <TouchableOpacity style={styles.addButton} onPress={handleConnectToDevice}>
          <LinearGradient colors={['#F3B28E', '#F8757C']} style={styles.addButtonGradient}>
            <Text className="text-white text-center" style={styles.addButtonText}>Pair</Text>
          </LinearGradient>
        </TouchableOpacity>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F233A',
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(3.5),
    color: 'white',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  subtitle: {
    fontSize: hp(2),
    color: 'gray',
    textAlign: 'center',
    marginBottom: hp(4),
  },
  loadingText: {
    fontSize: hp(2.5),
    color: 'gray',
    textAlign: 'center',
  },
  historyTitle: {
    fontSize: hp(3),
    color: 'white',
    marginBottom: hp(2),
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B2F3A',
    padding: 15,
    borderRadius: 10,
    marginBottom: hp(1),
  },
  selectedDeviceItem: {
    backgroundColor: '#F8757C',
  },
  deviceText: {
    marginLeft: 10,
    color: 'white',
    fontSize: hp(2.5),
  },
  addButton: {
    marginTop: hp(2),
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
