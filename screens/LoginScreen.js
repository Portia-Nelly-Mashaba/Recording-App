import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Toast from 'react-native-toast-message'; // Import toast
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = () => {
        navigation.navigate('Signup');
    };

    const handleLogin = async () => {
        try {
            const user = await AsyncStorage.getItem('user');
            if (user) {
                const parsedUser = JSON.parse(user);
                if (parsedUser.email === email && parsedUser.password === password) {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'Login successful!',
                    });
                    navigation.navigate('MainApp'); // Redirect to profile or main app page
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Invalid email or password.',
                    });
                }
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'No registered user found.',
                });
            }
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to login. Please try again.',
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topImageContainer}>
                <Image source={require('../assets/topVector.png')} style={styles.topImage} />
            </View>
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome Back</Text>
            </View>
            <View>
                <Text style={styles.signInText}>Sign in to your account</Text>
            </View>
            <View style={styles.inputContainer}>
                <FontAwesome name={'user'} size={24} color={'#9A9A9A'} style={styles.inputIcon} />
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
            <Text style={styles.forgotPasswordText}>Forgot your Password?</Text>
            <View style={styles.signInButtonContainer}>
                <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Sign In</Text>
                    <AntDesign name="arrowright" size={24} color="white" style={styles.arrowIcon} />
                </TouchableOpacity>
            </View>
            <Text style={styles.signUpText}>
                {' '}
                Don't have an account?
                <TouchableOpacity onPress={handleRegister}>
                    <Text style={{ textDecorationLine: 'underline' }}> Sign-up</Text>
                </TouchableOpacity>
            </Text>
            {/* Toast Component */}
            <Toast />
        </View>
    );
};

export default LoginScreen;

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
    welcomeContainer: {
        marginTop: 70,
    },
    welcomeText: {
        textAlign: 'center',
        fontSize: 40,
        fontWeight: '700',
        color: 'black',
        marginBottom: 15,
    },
    signInText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#262626',
        marginBottom: 30,
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
    forgotPasswordText: {
        color: '#BEBEBE',
        textAlign: 'right',
        width: '90%',
        fontSize: 18,
    },
    signInButtonContainer: {
        alignItems: 'center',
        marginTop: 70,
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
