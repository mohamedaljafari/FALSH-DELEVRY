import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnlineScreen from './src/screens/OnlineScreen';
import HeatmapScreen from './src/screens/HeatmapScreen';
import EarningsScreen from './src/screens/EarningsScreen';

const Stack = createNativeStackNavigator();

// نقطة الدخول لتطبيق Flash Man (السائق)
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Online" component={OnlineScreen} options={{ title: 'فلاش مان' }} />
        <Stack.Screen name="Heatmap" component={HeatmapScreen} options={{ title: 'الخريطة الحرارية' }} />
        <Stack.Screen name="Earnings" component={EarningsScreen} options={{ title: 'أرباحي' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
