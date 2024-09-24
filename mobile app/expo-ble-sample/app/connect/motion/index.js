import { View, Text, StyleSheet, FlatList, Image, Pressable, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../context/authContext';
import { AntDesign } from '@expo/vector-icons';
import CustomModal from '../../../components/CustomModal';

export default function MotionPicturesScreen() {
  const route = useRoute();
  const { id } = useLocalSearchParams(); // Assuming 'id' is the deviceId
  const { user, GetMotionPictures } = useAuth();
  const [pictures, setPictures] = useState([]);
  const [selectedPicture, setSelectedPicture] = useState(null); // State for selected image
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  // Fetch motion pictures and set the data in state
  useEffect(() => {
    const fetchMotionPictures = async () => {
      if (user && id) {
        const result = await GetMotionPictures(user.uid, id); // Fetch the pictures
        if (result.success) {
          setPictures(result.pictures); // Set the pictures into state
        }
        console.log('Motion Pictures Result:', result); // Log the result to the console
      }
    };

    fetchMotionPictures(); // Call the async function when the component mounts
  }, [user, id, GetMotionPictures]); // Dependencies: triggers on change of user, id, or GetMotionPictures

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => {
        setSelectedPicture(item); // Set the selected picture
        setShowModal(true); // Show the modal
      }}
      style={styles.boxContainer}
    >
      <Image source={{ uri: item.url }} style={styles.image} />
      <Text style={styles.timestamp}>{item.formattedTimestamp}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pictures}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()} // Use index as key
        numColumns={2} // Two columns for grid
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContent}
      />

      <CustomModal
        visible={showModal}
        withInput
      >
        <View className="bg-gray-800 p-6 rounded-3xl w-full max-w-md mx-auto">
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowModal(false)} style={styles.closeButton}>
              <AntDesign name="close" size={25} color="white" />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            {selectedPicture && (
              <>
                <Image source={{ uri: selectedPicture.url }} style={styles.fullImage} />
                <Text style={styles.timestampModal}>
                  {selectedPicture.formattedTimestamp}
                </Text>
              </>
            )}
          </View>
        </View>
      </CustomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F233A',
  },
  boxContainer: {
    flex: 1,
    width: '48%',
    borderRadius: 10,
    backgroundColor: '#2B2F3A',
    margin: 6,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
  flatListContent: {
    paddingBottom: 80,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  timestamp: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  modalHeader: {
    position: 'relative',
    alignItems: 'flex-end', // Align the close button to the right
  },
  closeButton: {
    padding: 10, // Add some padding for the touchable area
  },
  modalContent: {
    alignItems: 'center',
    paddingTop: 10, // Adjust padding to space content properly
  },
  fullImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  timestampModal: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});
