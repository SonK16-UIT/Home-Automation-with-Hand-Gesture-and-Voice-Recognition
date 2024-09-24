import React, { useEffect, useState } from 'react';
import { View, Text, Platform, StyleSheet, TouchableOpacity, TextInput, FlatList, Pressable } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHubData, activateHubThunk, clearHubMessages } from '../../redux/slices/hub';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/authContext';
import CustomModal from '../../components/CustomModal';
import { AntDesign } from '@expo/vector-icons';
import WeatherWidget from '../../components/WeatherWidget';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';
import HubBox from '../../components/HubBox';
import { router } from 'expo-router';
import CustomButtonHandle from '../../components/CustomButtonHandle';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';


const ios = Platform.OS === 'ios';

export default function Home() {
  const dispatch = useDispatch();
  const { user, activeError, DeleteActivation, activateHub, getRaspDataByUserId } = useAuth();
  const { top } = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const navigation = useNavigation();

  const hub = useSelector((state) => state.hub.hub);
  const hubLoading = useSelector((state) => state.hub.hubLoading);
  const hubError = useSelector((state) => state.hub.hubError);
  const hubSuccess = useSelector((state) => state.hub.hubSuccess);
  const devices = hub || [];

  const handleActivateCode = async () => {
    await dispatch(activateHubThunk({ code, userId: user.uid, activateHub, getRaspDataByUserId }));
    if (!hubError) {
      setShowModal(false);
    }
  };

  const handleDelete = async (raspId) => {
    const result = await DeleteActivation(raspId);
    if (result.success) {
      dispatch(fetchHubData({ userId: user.uid, getRaspDataByUserId })); 
    }
  };

  useEffect(() => {
    if (user) {
      dispatch(fetchHubData({ userId: user.uid, getRaspDataByUserId }));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (hubSuccess || hubError) {
      setTimeout(() => {
        dispatch(clearHubMessages());
      }, 3000); 
    }
  }, [hubSuccess, hubError, dispatch]);

  const renderItem = ({ item }) => (
    <HubBox
      item={item}
      onDelete={handleDelete}
      onNavigate={(id) => router.push(`/connect/rasp?id=${id}`)}
    />
  );

  return (
    <LinearGradient
      colors={['#1F233A', '#1F233A']}
      style={{ flex: 1, paddingTop: ios ? top : top + 10 }}
    >
      <View style={styles.main}>
      {/* <CustomButtonHandle  /> */}
        <View style={styles.centerView}>
          <WeatherWidget />
        </View>
        <CustomModal isOpen={showModal} withInput>
          <View className="bg-gray-900 p-6 rounded-3xl w-full max-w-md mx-auto">
              <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Nhập mã hub của bạn</Text>
                <Pressable onPress={() => setShowModal(false)} style={styles.closeButton}>
                  <AntDesign name="close" size={25} color="white" />
                </Pressable>
              </View>
              <Text className="text-gray-400 mb-4">Bằng cách nhập mã, bạn sẽ đăng ký hub với Nestify và thêm vào bộ sưu tập của bạn</Text>
              <Text className="text-white text-sm font-semibold mb-1">MÃ SẢN PHẨM MẪU</Text>
              <Text className="text-gray-400 mb-4">AAAAA-BBBBB-CCCCC-DDDDD-EEEEE</Text>
              <Text className="text-gray-400 mb-4">AAAABBBBCCCCDDDDEEEE</Text>
              <TextInput
              className="bg-gray-800 text-white p-4 rounded-full mb-4"
              placeholder="Enter your code here..."
              placeholderTextColor="gray"
              value={code}
              onChangeText={setCode}
            />
            {activeError && <Text className="text-red-500 mb-4">{activeError}</Text>}
            <Pressable onPress={handleActivateCode} style={styles.buttonContainer}>
              <LinearGradient
                colors={['#F3B28E', '#F8757C']}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Kích hoạt</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </CustomModal>
        <View style={styles.hubsContainer}>
          <View style={styles.hubsHeader}>
            <Text style={styles.headerText}>Hub của bạn</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
              <LinearGradient
                colors={['#F3B28E', '#F8757C']}
                style={styles.addButtonGradient}
              >
                <Text style={styles.addButtonText}>Thêm hub</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <FlatList
            data={devices}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
          />
        </View>
        <TouchableOpacity style={styles.floatingButton} onPress={() => setShowModal(true)}>
          <LinearGradient
            colors={['#F3B28E', '#F8757C']}
            style={styles.floatingButtonGradient}
          >
            <View style={styles.floatingButtonOverlay}>
              <AntDesign name="plus" size={30} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  addButtonGradient: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonView: {
    justifyContent: 'flex-start',
    padding: 10, // Reduced padding
  },
  centerView: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10
  },
  modalView: {
    backgroundColor: 'white',
    padding: 20, // Reduced padding
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5, // Reduced padding
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: wp('80%'),
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  successText: {
    color: 'green',
    marginBottom: 20,
  },
  hubsContainer: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0, // No padding between columns
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
