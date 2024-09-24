import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../theme';
import { useAuth } from '../../context/authContext';
import { useDispatch, useSelector } from 'react-redux';
import SenarioBox from '../../components/SenarioBox';
import { router, useNavigation } from 'expo-router';
import { fetchHubData } from '../../redux/slices/hub';
const ios = Platform.OS === 'ios';

export default function Scenarios() {
  const dispatch = useDispatch();

  const { top } = useSafeAreaInsets();
  const { user, getRaspDataByUserId } = useAuth();
  const hub = useSelector((state) => state.hub.hub);
  const devices = hub || [];

  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      dispatch(fetchHubData({ userId: user.uid, getRaspDataByUserId }));
    }
  }, [user, dispatch]);

  const renderItem = ({ item }) => (
    <SenarioBox
      item={item}
      onNavigate={(id) => router.push(`/actions/hubActions?id=${id}`)}
    />
  );

  return (
    <LinearGradient
      colors={['#1F233A', '#1F233A']}
      style={{ flex: 1, paddingTop: ios ? top : top + 10 }}
    >
      <View style={styles.container}>
        <FlatList
          data={devices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          numColumns={2} // Set number of columns to 2
          columnWrapperStyle={styles.columnWrapper} // Adjust the spacing between columns
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between', // Space out the items evenly
  },
});
