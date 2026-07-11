import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersScreen from './src/screens/OrdersScreen';

const Stack = createNativeStackNavigator();

// نقطة الدخول لتطبيق/بوابة Flash Restaurant
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'فلاش رستورانت' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
