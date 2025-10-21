import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import GoogleAuthTest from '../screens/GoogleAuthTestSimple';
import EmailLoginScreen from '../screens/EmailLoginScreen';
import EmailSignupScreen from '../screens/EmailSignupScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Connexion'
        }}
      />
      <Stack.Screen 
        name="EmailSignup" 
        component={EmailSignupScreen}
        options={{
          title: 'Inscription'
        }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} />
      
      <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
      
      {/* 🧪 Test Google Auth - Accessible avant connexion */}
      <Stack.Screen 
        name="GoogleAuthTest" 
        component={GoogleAuthTest}
        options={{ 
          headerShown: true, 
          title: 'Test Google Auth',
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
