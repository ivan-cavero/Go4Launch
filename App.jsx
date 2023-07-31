import React from "react";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, useColorScheme, TouchableOpacity } from "react-native";
import { MenuProvider } from 'react-native-popup-menu';

import { setTheme } from './src/store/configuration';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { persistor } from './src/store';
import * as Linking from 'expo-linking';
import { PersistGate } from 'redux-persist/integration/react'

import UpcomingLaunchList from "./src/components/Launches/UpcomingLaunchList";
import RocketIcon from "./src/components/Icons/RocketIcon";
import PastLaunchList from "./src/components/Launches/PastLaunchList";
import HistoryIcon from "./src/components/Icons/HistoryIcon";
import Header from "./src/components/Header/Header";
import ConfigurationView from "./src/components/Configuration/ConfigurationView";
import FavoritesView from "./src/components/Favorites/FavoritesView";

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const App = () => {
  const checkTheme = useSelector((state) => state.configuration?.theme);
  const scheme = checkTheme ?? useColorScheme();
  const dispatch = useDispatch();
  if (!checkTheme) {
    dispatch(setTheme(scheme));
  }

  const [fontsLoaded] = useFonts({
    "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  const createScreenOptions = ({ route }) => ({
    tabBarActiveTintColor: '#0074B7',
    tabBarInactiveTintColor: 'gray',
    tabBarStyle: {
      backgroundColor: '#fff',
      paddingBottom: 2,
    },
    tabBarItemStyle: {
      paddingTop: 8, 
    },
  
    tabBarIcon: ({ color, size }) => {
      const iconComponent = route.name === 'Upcoming' ? (
        <RocketIcon size={size} color={color} />
      ) : (
        <HistoryIcon size={size} color={color} />
      );
  
      return iconComponent;
    },
  });

  const HomeScreen = ({ navigation }) => (
    <Tab.Navigator swipeEnabled={true} screenOptions={createScreenOptions}>
      <Tab.Screen name="Upcoming" component={UpcomingLaunchList} options={{ header: () => <Header navigation={navigation} /> }} />
      <Tab.Screen name="Past" component={PastLaunchList} options={{ header: () => <Header navigation={navigation} /> }} />
    </Tab.Navigator>
  );

  const ConfigurationScreen = ({ navigation }) => (
    <React.Fragment>
      <Header navigation={navigation} />
      <ConfigurationView />
    </React.Fragment>
  );

  const FavoritesScreen = ({ navigation }) => (
    <React.Fragment>
      <Header navigation={navigation} />
      <FavoritesView />
    </React.Fragment>
  );

  const CustomDrawerContent = (props) => (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <HeaderDrawer />
      <DrawerItemList {...props} />
      <View style={{ flex: 1 }}></View>
      <FooterDrawer />
    </DrawerContentScrollView>
  );

  const HeaderDrawer = () => (
    <React.Fragment>
      <Text style={{ marginLeft: 20, fontSize: 20, fontWeight: 'bold', marginVertical: 20 }}>Launch4Fun</Text>
      <View style={{ borderBottomWidth: 1, borderBottomColor: 'gray', marginBottom: 20 }}></View>
    </React.Fragment>
  );

  const FooterDrawer = () => (
    <React.Fragment>
      <View style={{ borderTopWidth: 1, borderTopColor: 'gray', paddingVertical: 10, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => Linking.openURL('https://www.buymeacoffee.com/ivancavero')}>
          <Text style={{ flex: 1, marginRight: 5 }}>Developed by Ivan Cavero</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 10 }}>❤️</Text>
      </View>
    </React.Fragment>
  );

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Configuration" component={ConfigurationScreen} />
          <Drawer.Screen name="Favorites" component={FavoritesScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <MenuProvider>
        <App />
      </MenuProvider>
    </PersistGate>
  </Provider>
);
