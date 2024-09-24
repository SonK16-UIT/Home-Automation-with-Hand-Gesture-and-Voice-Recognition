import { View, Text, TouchableOpacity, StyleSheet, Pressable, TextInput, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/authContext';
import { LinearGradient } from 'expo-linear-gradient';
import { SwipeListView } from 'react-native-swipe-list-view';
import CustomModal from '../../components/CustomModal';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Feather from '@expo/vector-icons/Feather';

export default function HubActions() {
  const route = useRoute();
  const { id } = route.params;
  const router = useRouter();
  const { GetScenariosData, DeleteScenario, CreateScenario } = useAuth();
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioTime, setScenarioTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeError, setActiveError] = useState('');

  const fetchScenarios = async () => {
    try {
      const result = await GetScenariosData(id);
      if (result.success) {
        setData(result.data);
        console.log(result.data);
      } else {
        console.error('Failed to fetch scenarios:', result.msg);
      }
    } catch (error) {
      console.error('Error fetching scenarios data:', error);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [id, GetScenariosData]);

  const handleDeleteScenario = async (scenarioId) => {
    await DeleteScenario(scenarioId);
    fetchScenarios(); // Refresh data after deletion
  };

  const handleCreateScenario = async () => {
    if (!scenarioName || !scenarioTime) {
      setActiveError('Please fill in all fields.');
      return;
    }

    try {
      await CreateScenario(id, scenarioName, scenarioTime);
      setShowModal(false); // Close modal on successful creation
      fetchScenarios(); // Refresh data after creation
      setScenarioName('');
      setScenarioTime('');
      setActiveError('');
    } catch (error) {
      console.error('Error creating scenario:', error);
      setActiveError('Failed to create scenario.');
    }
  };

  const showDatePickerHandler = () => {
    DateTimePickerAndroid.open({
      value: new Date(),
      mode: 'time',
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (selectedDate) {
          const dateString = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          setScenarioTime(dateString);
        }
      },
    });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Convert date to 24-hour format string (e.g., '20:44')
      const dateString = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      setScenarioTime(dateString);
    }
  };

  // Hidden actions component
  const renderHiddenItem = ({ item }) => (
    <View style={styles.btnWrapper}>
      <Pressable
        style={styles.edit}
        onPress={() => router.push({ pathname: `/actions/deviceActions`, params: { id: item.id } })}
      >
        <Text style={styles.btnTitle}>Edit</Text>
      </Pressable>
      <TouchableOpacity style={styles.delete} onPress={() => handleDeleteScenario(item.id)}>
        <Text style={styles.btnTitle}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => {
    // Function to determine the correct icon based on the time
    const getIcon = (time) => {
      if (!time) return <FontAwesome name="bed" size={24} color="#ccc" />;
  
      // Parse time into hours for easier comparison
      const [hour, minute] = time.split(':');
      const hourInt = parseInt(hour, 10);
      const isPM = time.includes('PM');
  
      // Convert PM times to 24-hour format
      const hour24 = isPM && hourInt !== 12 ? hourInt + 12 : hourInt;
  
      if (hour24 >= 6 && hour24 < 12) {
        // Morning time (6:00 to 12:00)
        return <Feather name="sunrise" size={24} color="white" />;
      } else if (hour24 >= 12 && hour24 < 18) {
        // Afternoon time (12:00 to 18:00)
        return <Feather name="sunset" size={24} color="white" />;
      } else if (hour24 >= 18 && hour24 < 24) {
        // Evening time (18:00 to 24:00)
        return <Feather name="moon" size={24} color="white" />;
      } else {
        // Default or unknown time
        return <FontAwesome name="bed" size={24} color="#ccc" />;
      }
    };
  
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          {getIcon(item.time)}
          <View style={styles.textContainer}>
            <Text style={styles.itemName}>{item.name || 'Unknown'}</Text>
            <Text style={styles.itemActions}>{item.time || 'Unknown'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <CustomModal isOpen={showModal} withInput>
          <View style={styles.modalContent}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Nhập thông tin dưới đây</Text>
              <Pressable onPress={() => setShowModal(false)} style={styles.closeButton}>
                <AntDesign name="close" size={25} color="white" />
              </Pressable>
            </View>
            <Text style={styles.label}>Nhập tên ngữ cảnh</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Scenario Name..."
              placeholderTextColor="gray"
              value={scenarioName}
              onChangeText={setScenarioName}
            />
            <Text style={styles.label}>Nhập thời gian</Text>
            <TouchableOpacity onPress={showDatePickerHandler}>
              <TextInput
                style={styles.input}
                placeholder="Select Time..."
                placeholderTextColor="gray"
                value={scenarioTime}
                editable={false}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePickerAndroid
                value={new Date()}
                mode="time"
                display="default"
                onChange={onDateChange}
              />
            )}
            {activeError && <Text style={styles.errorText}>{activeError}</Text>}
            <Pressable onPress={handleCreateScenario} style={styles.buttonContainer}>
              <LinearGradient colors={['#F3B28E', '#F8757C']} style={styles.gradientButton}>
                <Text style={styles.buttonText}>Kích hoạt</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </CustomModal>
        <SwipeListView
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-150}
        />
        <TouchableOpacity style={styles.floatingButton} onPress={() => setShowModal(true)}>
          <LinearGradient colors={['#F3B28E', '#F8757C']} style={styles.floatingButtonGradient}>
            <View style={styles.floatingButtonOverlay}>
              <AntDesign name="plus" size={30} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  modalContent: {
    backgroundColor: '#1F233A',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    alignSelf: 'center',
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
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
  container: {
    flex: 1,
    backgroundColor: '#1F233A',
    paddingHorizontal: 20, // Add padding for the entire container
    paddingVertical: 20, // Add padding for the entire container
  },
  itemContainer: {
    backgroundColor: '#3C3551',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  itemName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  itemActions: {
    fontSize: 14,
    color: '#aaa',
  },
  icon: {
    marginRight: 15,
  },
  btnWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
    paddingVertical: 5,
    paddingRight: 15,
  },
  edit: {
    backgroundColor: '#4CD964',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '80%',
    marginVertical: 5,
    borderRadius: 8,
  },
  delete: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '80%',
    marginVertical: 5,
    borderRadius: 8,
    marginLeft: 10,
  },
  btnTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2F2A3E',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
    alignSelf: 'center',
    width: '100%',
  },
  gradientButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});