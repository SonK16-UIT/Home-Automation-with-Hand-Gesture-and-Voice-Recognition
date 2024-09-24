import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import theme from '../theme';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';

export default function SenarioBox({ item, onNavigate }) {
  const { CountScenarios } = useAuth();
  const [actionCount, setActionCount] = useState(0);

  const handleNavigate = () => {
    onNavigate(item.id);
  };

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await CountScenarios(item.id); // Ensure you're using the correct ID for HubID
        setActionCount(count);
      } catch (error) {
        console.error('Error fetching scenario count:', error);
      }
    };

    fetchCount();
  }, [item.HubID, CountScenarios]); // Dependencies include item.HubID and CountScenarios

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={handleNavigate}>
      <View style={styles.itemLeft}>
        <View style={styles.textContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
        </View>
      </View>
      <Text style={styles.itemActions}>{`${actionCount} Actions`}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: theme.accent,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    margin: 5, // Ensure spacing between items
    borderRadius: 8,
    width: '45%', // Set width to fit two columns with spacing
    aspectRatio: 1, // Maintain square shape
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  itemLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center', // Center text
  },
  itemName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center', // Center text
  },
  itemActions: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center', // Center text
  },
  settingsButton: {
    padding: 8,
  },
});
