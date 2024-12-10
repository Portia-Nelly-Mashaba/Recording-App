import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Load user data when the component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { name, email } = JSON.parse(userData);
          setName(name);
          setEmail(email);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Save the updated name to AsyncStorage
  const handleUpdateName = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Name cannot be empty',
      });
      return;
    }
    try {
      const userData = { name, email };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Name updated successfully',
      });
    } catch (error) {
      console.error('Error updating name:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update name',
      });
    }
  };

  // Handle user sign-out
  const handleSignOut = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.loggedIn = false; // Mark the user as logged out
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
      Toast.show({
        type: 'success',
        text1: 'Signed Out',
        text2: 'You have been signed out',
      });
      navigation.navigate('Login'); // Redirect to Login screen
    } catch (error) {
      console.error('Error signing out:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to sign out',
      });
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={24} color="#9A9A9A" style={styles.inputIcon} />
        <TextInput
          style={styles.inputText}
          placeholder="Enter Name"
          value={name}
          onChangeText={setName}
        />
      </View>
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateName}>
        <Text style={styles.updateButtonText}>Update Name</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#f46625',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 40,
    elevation: 10,
    height: 60,
    marginBottom: 20,
  },
  inputIcon: {
    marginLeft: 18,
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#f46625',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginHorizontal: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginHorizontal: 40,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
