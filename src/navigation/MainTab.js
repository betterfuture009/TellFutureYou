import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Images from '../theme/Images'

import ContactListScreen from '../screens/Contact/ContactListScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import MyAccountScreen from '../screens/MyAccount/MyAccountScreen';
import TabBarItem from './TabBarItem';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false, gestureEnabled: false }}/>
    </Stack.Navigator>
  );
}

function ContactStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ContactList" component={ContactListScreen} options={{ headerShown: false, gestureEnabled: false }}/>
    </Stack.Navigator>
  );
}

function MyAccountStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyAccount" component={MyAccountScreen} options={{ headerShown: false, gestureEnabled: false }}/>
    </Stack.Navigator>
  );
}

class CustomerTab extends React.Component {
  render() {
      return (
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  var iconImage;
                  if (route.name === 'ChatStack') {
                    iconImage = focused ? Images.tab_message_selected : Images.tab_message;
                  }
                  else if (route.name === 'ContactStack') {
                    iconImage = focused ? Images.tab_contacts_selected : Images.tab_contacts;
                  } 
                  else if (route.name === 'MyAccountStack') {
                    iconImage = focused ? Images.tab_profile_selected : Images.tab_profile;
                  }
                  return <TabBarItem icon={iconImage} page={route.name} />;
                },
              })}
              tabBarOptions={{
                showLabel: false,
              }}
            >
              <Tab.Screen name="ChatStack" component={ChatStack} />
              <Tab.Screen name="ContactStack" component={ContactStack} />
              <Tab.Screen name="MyAccountStack" component={MyAccountStack} />
            </Tab.Navigator>
      );      
  }
}

const styles = StyleSheet.create({
  iconImage: {
    width: 40,
    height: 40
  },

  inactiveIcon: {
    opacity: 0.3,
  },
})

export default CustomerTab;