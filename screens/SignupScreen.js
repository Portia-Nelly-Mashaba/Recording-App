
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message'; 
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

const SignupScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all fields',
      });
      return;
    }

    try {
      const user = { name, email, password };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Account created successfully',
      });
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save user',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topImageContainer}>
        <Image source={require('../assets/topVector.png')} style={styles.topImage} />
      </View>
      <View style={styles.createAccountContainer}>
        <Text style={styles.createAccount}>Create account</Text>
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome name={'user'} size={24} color={'#9A9A9A'} style={styles.inputIcon} />
        <TextInput
          style={styles.inputText}
          placeholder="Enter Name"
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.inputContainer}>
        <AntDesign name={'mail'} size={24} color={'#9A9A9A'} style={styles.inputIcon} />
        <TextInput
          style={styles.inputText}
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputContainer}>
        <Fontisto name={'locked'} size={24} color={'#9A9A9A'} style={styles.inputIcon} />
        <TextInput
          style={styles.inputText}
          placeholder="Enter Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <View style={styles.signInButtonContainer}>
        <TouchableOpacity style={styles.signInButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign-Up</Text>
          <AntDesign name="arrowright" size={24} color="white" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
      <Text style={styles.signUpText}>
        Already have an account?
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{ textDecorationLine: 'underline' }}> Sign-in</Text>
        </TouchableOpacity>
      </Text>
      <Toast /> {/* Add the Toast component */}
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  topImageContainer: {},
  topImage: {
    width: '100%',
    height: 130,
  },
  createAccountContainer: {
    marginTop: 70,
  },
  createAccount: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: '700',
    color: 'black',
    marginBottom: 60,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderRadius: 20,
    marginHorizontal: 40,
    elevation: 10,
    alignItems: 'center',
    height: 60,
    marginBottom: 40,
  },
  inputIcon: {
    marginLeft: 18,
    marginRight: 18,
  },
  inputText: {
    flex: 1,
  },
  signInButtonContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f46625',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
    marginRight: 10,
  },
  arrowIcon: {
    marginLeft: 5,
  },
  signUpText: {
    color: '#262626',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 40,
  },
});

