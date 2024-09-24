import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { useAuth } from '../context/authContext';
import { useDispatch, useSelector } from 'react-redux';
import { updateHubNameThunk, clearHubMessages } from '../redux/slices/hub';
import { Menu, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { AntDesign, Feather } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MenuItem } from './CustomMenuItems';
import theme from '../theme';
import CustomModal from './CustomModal';
import { LinearGradient } from 'expo-linear-gradient';

const HubBox = ({ item, onDelete, onNavigate }) => {
  const dispatch = useDispatch();
  const { countDevicesByHubId, fetchHubName,updateHubName,user, getRaspDataByUserId } = useAuth();
  const [deviceCount, setDeviceCount] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hubName, setHubName] = useState('');
  const [activeError, setActiveError] = useState('');

  useEffect(() => {
    const fetchDeviceCount = async () => {
      const result = await countDevicesByHubId(item.id);
      if (result.success) {
        setDeviceCount(result.count);
      }
    };

    fetchDeviceCount();
  }, [item.id, countDevicesByHubId]);

  const fetchHubAndSensorData = async () => {
    const hubNameResult = await fetchHubName(item.id);
    if (hubNameResult.success) {
      setHubName(hubNameResult.name);
    } else {
      console.error('Failed to fetch hub name:', hubNameResult.msg);
    }
  };

  const handleEdit = () => {
    fetchHubAndSensorData();
    setShowModal(true);
  };

  const handleUpdate = async () => {
    dispatch(updateHubNameThunk({ hubId: item.id, name: hubName, updateHubName, userId: user.uid, getRaspDataByUserId }));
    setShowModal(false);
  };

  const handleDelete = () => {
    onDelete(item.id);
  };

  const handleLongPress = () => {
    setMenuVisible(true);
  };

  const handleMenuClose = () => {
    setMenuVisible(false);
  };
  
  const handleNavigate = () => {
    onNavigate(item.id);
  }
  return (
    <View style={styles.box}>
      <CustomModal isOpen={showModal} withInput>
        <View className="bg-gray-900 p-6 rounded-3xl w-full max-w-md mx-auto">
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Chỉnh sửa tên Hub</Text>
            <Pressable onPress={() => setShowModal(false)} style={styles.closeButton}>
              <AntDesign name="close" size={25} color="white" />
            </Pressable>
          </View>
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-full mb-4"
            placeholder="Enter your code here..."
            placeholderTextColor="gray"
            value={hubName}
            onChangeText={setHubName}
          />
          {activeError && <Text className="text-red-500 mb-4">{activeError}</Text>}
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
      <Pressable onPress={handleNavigate} onLongPress={handleLongPress}>
        <View style={styles.boxContent}>
          <Text style={styles.title}>{item.name || "Thiết bị"}</Text>
          <Text style={styles.deviceCount}>{deviceCount} Thiết bị</Text>
        </View>
      </Pressable>
      
      <Menu opened={menuVisible} onBackdropPress={handleMenuClose}>
        <MenuTrigger />
        <MenuOptions
          customStyles={{
            optionsContainer: {
              borderRadius: 10,
              borderCurve: 'continuous',
              marginTop: -120,
              marginLeft: -10,
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
  box: {
    width: '48%', // Fixed width for each box
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#2B2F3A',
    margin: 5,
  },
  boxContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  deviceCount: {
    fontSize: 14,
    color: '#A0A3BD',
    marginTop: 5,
  },
  menuButton: {
    color: 'white',
    fontSize: 18,
    alignSelf: 'flex-end',
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
    padding: 5, // Reduced padding
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
});

const Divider = () => {
  return <View style={{ padding: 1, width: '100%', backgroundColor: 'gray' }} />;
};

export default HubBox;
