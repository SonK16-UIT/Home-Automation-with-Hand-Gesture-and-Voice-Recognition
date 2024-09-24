import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable, Switch } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/authContext';
import { LinearGradient } from 'expo-linear-gradient';
import CustomModal from '../../components/CustomModal';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import Foundation from '@expo/vector-icons/Foundation';
import { CreateActionThunk, DeleteActionThunk, GetActionsThunk, UpdateActionThunk } from '../../redux/slices/actions';
import { useDispatch, useSelector } from 'react-redux';

export default function DeviceActions() {
  const route = useRoute();
  const { id } = useLocalSearchParams();
  const actionId = id;

  const dispatch = useDispatch();
  const actions = useSelector((state) => state.actions.actions) || []; // Ensure actions is an array

  const [showModal, setShowModal] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [scenario, setScenario] = useState(null);

  const { getScenarioWithActionID, CreateAction, DeleteAction, UpdateAction, getSensorDataByUserId, GetActions } = useAuth();

  const handleDevicePress = (item) => {
    console.log('Selected device:', item);
  };
  
  // Function to fetch scenario data
  const fetchScenarioData = async () => {
    try {
      const response = await getScenarioWithActionID(actionId);
      if (response.success && response.result) {
        setScenario(response.result);
        console.log("Fetched Scenario:", response.result);
      } else {
        console.warn('Failed to fetch scenario or invalid response:', response);
      }
    } catch (error) {
      console.error('Error fetching scenario data:', error);
    }
  };

  // Function to fetch devices data
  const fetchDevices = async (hubId) => {
    try {
      const result = await getSensorDataByUserId(hubId);
      if (result.success && Array.isArray(result.data)) {
        const existingDeviceNames = actions.map(action => action.device_name?.toLowerCase().trim() || '');
        const filteredDevices = result.data.filter(device => {
          const deviceNameLower = device.device_name?.toLowerCase().trim();
          return deviceNameLower && !existingDeviceNames.includes(deviceNameLower);
        });
        setDevices(filteredDevices);
      } else {
        setDevices([]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  // Effect to fetch scenario data on component mount or actionId change
  useEffect(() => {
    fetchScenarioData();
  }, [actionId]);

  // Effect to refetch devices when the modal is opened
  useEffect(() => {
    if (showModal && scenario?.HubID) {
      fetchDevices(scenario.HubID);
    }
  }, [showModal, scenario]);

  const fetchScenario = () => {
    dispatch(GetActionsThunk({ actionId, GetActions }));
  };

  const handleActionButtonPress = () => {
    const selectedDevice = devices[selectedIndex];
    if (selectedDevice) {
      dispatch(CreateActionThunk({ 
        actionId, 
        status: selectedDevice.status, 
        deviceName: selectedDevice.device_name, 
        CreateAction 
      })).then(() => fetchScenario());
    }
  };

  const handleDeleteAction = async (index) => {
    dispatch(DeleteActionThunk({ actionId, index, DeleteAction })).then(() => fetchScenario());
  };

  const toggleDeviceStatus = async (index, item) => {
    if (!item) return;
    const newStatus = item.action === 'ON' ? 'OFF' : 'ON';
    dispatch(UpdateActionThunk({ 
      actionId, 
      hubID: scenario?.HubID, 
      index, 
      deviceName: item.device_name, 
      status: newStatus, 
      UpdateAction 
    })).then(() => fetchScenario());
  };

  const renderItem = ({ item }) => {
    if (!item) return null;
    return (
      <TouchableOpacity
        style={styles.actionItem}
        onPress={() => toggleDeviceStatus(item.id, item)}
      >
        <Foundation
          name="lightbulb"
          size={40}
          color={item.action === 'ON' ? 'yellow' : 'black'}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.deviceText}>{item.device_name || 'Unknown'}</Text>
          <Text style={styles.deviceStatus}>{item.action === 'ON' ? 'On' : 'Off'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHiddenItem = ({ item }) => {
    if (!item) return null;
    return (
      <View style={styles.btnWrapper}>
        <TouchableOpacity
          style={styles.delete}
          onPress={() => handleDeleteAction(item.id)}
        >
          <Text style={styles.btnTitle}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDeviceItem = ({ item, index }) => (
    item.type === "toggle" && (
      <TouchableOpacity
        style={[
          styles.deviceItem,
          selectedIndex === index && styles.selectedDeviceItem,
        ]}
        onPress={() => {
          setSelectedIndex(index);
          handleDevicePress(item);
        }}
      >
        <MaterialIcons name="devices" size={24} color="white" />
        <Text style={styles.deviceText2}>{item.device_name}</Text>
      </TouchableOpacity>
    )
  );

  return (
    <View style={styles.container}>
      <CustomModal isOpen={showModal} withInput>
        <View className="bg-gray-900 p-6 rounded-3xl w-full max-w-md mx-auto">
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Thiết bị của bạn</Text>
            <Pressable onPress={() => setShowModal(false)} style={styles.closeButton}>
              <AntDesign name="close" size={25} color="white" />
            </Pressable>
          </View>
          <FlatList
            data={devices}
            keyExtractor={(item, index) => index?.toString() || String(index)}
            renderItem={renderDeviceItem}
            contentContainerStyle={styles.listContainer}
          />
          {selectedIndex !== null && (
            <TouchableOpacity style={styles.actionButton} onPress={handleActionButtonPress}>
              <LinearGradient
                colors={['#F3B28E', '#F8757C']}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>Thêm</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </CustomModal>

      <Text style={styles.title}>Ngữ cảnh</Text>
      <Text style={styles.detailText}>{`Tên: ${scenario?.name || 'Unknown'}`}</Text>
      <Text style={styles.detailText}>{`Thời gian: ${scenario?.time || 'Unknown'}`}</Text>
      <View style={styles.hubsHeader}>
        <Text style={styles.headerText}>Phụ kiện</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <LinearGradient
            colors={['#F3B28E', '#F8757C']}
            style={styles.addButtonGradient}
          >
            <Text style={styles.addButtonText}>Thêm hành động</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {actions.length === 0 ? (
        <Text style={styles.emptyMessage}>No actions available. Please add a new action.</Text>
      ) : (
        <SwipeListView
          data={actions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-80}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonGradient: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hubsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    position: 'absolute',
    right: 0,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1F233A',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 5,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3C3551',
    borderRadius: 8,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'column',
  },
  deviceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceStatus: {
    color: '#aaa',
    fontSize: 14,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  actionButton: {
    marginTop: 10,
    alignSelf: 'center',
    width: '100%',
  },
  actionButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
    paddingVertical: 5,
    paddingRight: 15,
  },
  delete: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '80%',
    marginVertical: 5,
    borderRadius: 8,
    marginLeft: 10, // Add spacing between buttons
  },
  btnTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
   deviceItem: {
    padding: 10,
    backgroundColor: '#2F2A3E',
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDeviceItem: {
    borderColor: '#F8757C',
    borderWidth: 2,
  },
  deviceText2: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
  actionButton: {
    marginTop: 10,
    alignSelf: 'center',
    width: '100%',
  },
  actionButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});