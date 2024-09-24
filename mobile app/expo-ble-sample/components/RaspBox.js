import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Switch } from 'react-native';
import { useDispatch } from 'react-redux';
import { AntDesign, Feather, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Menu, MenuOptions, MenuTrigger, MenuOption } from 'react-native-popup-menu';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import CustomModal from './CustomModal';
import { MenuItem } from './CustomMenuItems';
import { useAuth } from '../context/authContext';
import { GetDeviceThunk, UpdateDeviceNameThunk } from '../redux/slices/device';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link, router } from 'expo-router';

const RaspBox = ({ item, onDelete }) => {
  const dispatch = useDispatch();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deviceName, setDeviceName] = useState(item.device_name || ''); // Initialize with current name
  const [deviceId, setDeviceId] = useState(item.id || ''); // Initialize with device id
  const [activeError, setActiveError] = useState('');

  const { updateStatus, UpdateDeviceName, GetDeviceData } = useAuth(); // Removed UpdateDeviceName from useAuth since it will be handled by Redux

  const handleEdit = () => {
    setDeviceName(item.device_name); // Set device name on edit
    setDeviceId(item.id); // Set device id
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      // Dispatch the thunk for updating the device name
      dispatch(UpdateDeviceNameThunk({ 
        hubID: item.HubID, // Use the hubID associated with the item
        deviceId: deviceId, 
        deviceName: deviceName, 
        UpdateDeviceName,
        GetDeviceData
      }));
      setShowModal(false);
      console.log(`Device name updated to: ${deviceName}`);
    } catch (error) {
      console.error('Failed to update device name:', error);
      setActiveError('Failed to update device name. Please try again.');
    }
  };

  const handleDelete = () => {
    onDelete(deviceId); // Ensure the correct id is passed
  };

  const handleLongPress = () => {
    setMenuVisible(true);
  };

  const handleMenuClose = () => {
    setMenuVisible(false);
  };

  const toggleSwitch = async (item) => {
    try {
      const newStatus = item.status === 'ON' ? 'OFF' : 'ON';
      await updateStatus(item.id, newStatus);
      dispatch(GetDeviceThunk({ hubID: item.HubID, GetDeviceData }));
      console.log(`Status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Failed to toggle device status:', error);
    }
  };

  return (
    <View style={styles.boxContainer}>
      {item.type === 'sensor' && (
        <Pressable onLongPress={handleLongPress}>
          <View style={styles.sensorBox}>
            <View style={styles.flexRow}>
              <Feather name="thermometer" size={20} color="white" />
              <Feather name="droplet" size={20} color="white" />
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.sensorId}>Nhiệt độ</Text>
              <Text style={styles.sensorId}>Độ ẩm</Text>
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.sensorValue}>{item.temperature}°C</Text>
              <Text style={styles.sensorId}>{item.device_name}</Text>
              <Text style={styles.sensorValue}>{item.humidity}%</Text>
            </View>
          </View>
        </Pressable>
      )}
      {(item.type === 'toggle' && item.id.includes('LIGHT')) && (
        <Pressable onLongPress={handleLongPress}>
          <View style={styles.deviceBox}>
            <View style={styles.flexRow}>
              <FontAwesome name="lightbulb-o" size={20} color={item.status === 'ON' ? "white" : "#555"} />
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.deviceLabel}>LED</Text>
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.deviceId}>{item.device_name}</Text>
              <Switch
                onValueChange={() => toggleSwitch(item)}
                value={item.status === 'ON'}
                thumbColor={item.status === 'ON' ? "#F8757C" : "#E1E1E1"}
              />
            </View>
          </View>
        </Pressable>
      )}
      {(item.type === 'toggle' && item.id.includes('FAN')) && (
        <Pressable onLongPress={handleLongPress}>
          <View style={styles.deviceBox}>
            <View style={styles.flexRow}>
              <FontAwesome5 name="fan" size={20} color={item.status === 'ON' ? "white" : "#555"} />
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.deviceLabel}>QUẠT</Text>
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.deviceId}>{item.device_name}</Text>
              <Switch
                onValueChange={() => toggleSwitch(item)}
                value={item.status === 'ON'}
                thumbColor={item.status === 'ON' ? "#F8757C" : "#E1E1E1"}
              />
            </View>
          </View>
        </Pressable>
      )}
      {(item.type === 'toggle' && item.id.includes('MOTION')) && (
        <Pressable onLongPress={handleLongPress}  onPress={() => router.push({ pathname: `/connect/motion`, params: { id: item.id } })}>
          <View style={styles.deviceBox}>
            <View style={styles.flexRow}>
              <MaterialCommunityIcons name="motion-sensor" size={20} color={item.status === 'ON' ? "white" : "#555"} />
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.deviceLabel}>Quan sát chuyển động</Text>
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.deviceId}>{item.device_name}</Text>
              <Switch
                onValueChange={() => toggleSwitch(item)}
                value={item.status === 'ON'}
                thumbColor={item.status === 'ON' ? "#F8757C" : "#E1E1E1"}
              />
            </View>
          </View>
        </Pressable>
      )}
      <CustomModal isOpen={showModal} withInput>
        <View className="bg-gray-900 p-6 rounded-3xl w-full max-w-md mx-auto">
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Chỉnh sửa tên Thiết bị</Text>
            <Pressable onPress={() => setShowModal(false)} style={styles.closeButton}>
              <AntDesign name="close" size={25} color="white" />
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên thiết bị..."
            placeholderTextColor="gray"
            value={deviceName}
            onChangeText={setDeviceName}
          />
          {activeError && <Text style={styles.errorText}>{activeError}</Text>}
          <Pressable onPress={handleUpdate} style={styles.buttonContainer}>
            <LinearGradient
              colors={['#F3B28E', '#F8757C']}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Hoàn tất</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </CustomModal>
      <Menu opened={menuVisible} onBackdropPress={handleMenuClose}>
        <MenuTrigger />
        <MenuOptions
          customStyles={{
            optionsContainer: {
              borderRadius: 10,
              borderCurve: 'continuous',
              marginTop: 0,
              marginLeft: 0,
              backgroundColor: 'white',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 0 },
              width: 160,
            },
          }}
        >
          <MenuItem icon={<Feather name="edit" size={hp(2.5)} color="#737373" />} action={handleEdit} text="Chỉnh sửa" />
          <Divider />
          <MenuItem icon={<AntDesign name="delete" size={hp(2.5)} color="#737373" />} action={handleDelete} text="Xóa" />
        </MenuOptions>
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  boxContainer: {
    flex: 1,
    width: '50%',
    borderRadius: 10,
    backgroundColor: '#2B2F3A',
    margin: 6,
  },
  sensorBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#3A3F4A',
    justifyContent: 'space-between',
    marginBottom: 6,
    height: 120, // Adjust height to match the motion box
  },
  deviceBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#3A3F4A',
    justifyContent: 'space-between',
    marginBottom: 6,
    height: 120, // Ensure both boxes have the same height
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  sensorId: {
    fontSize: 14,
    color: '#A0A3BD',
    marginRight: 5,
  },
  sensorValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  deviceLabel: {
    fontSize: 14,
    color: '#A0A3BD',
    textAlign: 'center',
    marginVertical: 4,
  },
  deviceId: {
    fontSize: 12,
    color: 'gray',
    marginRight: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  buttonContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
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
  input: {
    backgroundColor: '#2F2A3E',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

const Divider = () => {
  return <View style={{ padding: 1, width: '100%', backgroundColor: 'gray' }} />;
};

export default RaspBox;
