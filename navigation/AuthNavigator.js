import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import GoogleAuthTest from '../screens/GoogleAuthTestSimple';

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
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Inscription'
        }}
      />
      
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
