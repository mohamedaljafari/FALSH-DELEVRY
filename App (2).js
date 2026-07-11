import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import WalletScreen from './src/screens/WalletScreen';

const Stack = createNativeStackNavigator();

// نقطة الدخول لتطبيق Flash Eat (الزبون)
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'فلاش إيت' }} />
        <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'المحفظة' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
