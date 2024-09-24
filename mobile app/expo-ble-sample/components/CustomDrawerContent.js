import React, { useEffect, useState } from "react";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useAuth } from "../context/authContext";
import { DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from 'expo-image';
import theme from "../theme";
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { readImage, updateImage } from '..//redux/slices/image';

export default function CustomDrawerContent(props) {
    const { user, logout, GetImage } = useAuth();
    const [error, setError] = useState('');
    const { top, bottom } = useSafeAreaInsets();
    const dispatch = useDispatch();
    const { imageUrl, loading} = useSelector((state) => state.image);

    useEffect(() => {
        if (user && user.uid) {
          dispatch(readImage({ userId: user.uid, GetImage }));
          
        }
      }, [user, dispatch]);

    const handleLogout = async () => {
        await logout();
    }

    return (
        <View style={styles.container}>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
                <View style={styles.profileContainer}>
                    <Image
                        style={styles.profileImage}
                        source={{ uri: imageUrl }}
                    />
                    <View style={{ marginBottom: 20 }} />
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>{user.username}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                </View>
                <Divider />
                <View style={styles.drawerItemList}>
                    <DrawerItemList {...props} />
                    <DrawerItem
                        label="Logout"
                        onPress={handleLogout}
                        icon={({ size }) => <MaterialIcons name="logout" color={'#A0A3BD'} size={size} style={styles.icon} />}
                        labelStyle={styles.label}
                    />
                </View>
            </DrawerContentScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.primary,
    },
    drawerContent: {
        backgroundColor: theme.primary,
    },
    profileContainer: {
        flexDirection: 'column',
        alignItems: 'left',
        padding: 15,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 10,
    },
    userInfo: {
        justifyContent: 'center',
    },
    username: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 5,
    },
    userEmail: {
        color:theme.bgWhite(0.15),
        fontSize: 14,
    },
    drawerItemList: {
        flex: 1,
        backgroundColor: theme.primary,
        paddingTop: 10,
    },
    icon: {
        marginRight: -10, // Adjust this value as needed
    },
    label: {
        color: '#A0A3BD',
        marginLeft: -10, // Adjust this value as needed
    },
});

const Divider = () => {
    return (
        <View
            style={{
                height: 1,
                width: '91%',
                backgroundColor: '#ccc',
                alignSelf: 'center',
            }}
        />
    )
}
