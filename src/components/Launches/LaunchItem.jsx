import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableHighlight, Text, Share } from 'react-native';
import { differenceInCalendarDays, differenceInHours, differenceInMinutes, differenceInSeconds, formatDistanceToNow } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { useDispatch, useSelector } from 'react-redux';
import { addToFavorites, removeFromFavorites } from '../../store/favorites';
import { useColorScheme } from 'react-native';
import * as Calendar from 'expo-calendar';
import { showMessage } from 'react-native-flash-message';

import RocketImage from './ItemComponents/RocketImage';
import DetailsContainer from './ItemComponents/DetailsContainer';

const LaunchItem = React.memo(({ launch, past }) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const launchDate = utcToZonedTime(launch.net, timeZone);
  const daysUntilLaunch = differenceInCalendarDays(launchDate, new Date());

  const timeRemaining = () => {
    if (past) {
      return formatDistanceToNow(launchDate, { addSuffix: false });
    }
  
    const hours = differenceInHours(launchDate, new Date());
    const minutes = differenceInMinutes(launchDate, new Date()) % 60;
    const seconds = differenceInSeconds(launchDate, new Date()) % 60;
  
    if (daysUntilLaunch > 1) {
      return formatDistanceToNow(launchDate, { addSuffix: true });
    }
  
    if (hours >= 1) {
      return `in ${hours}h ${minutes}m`;
    }
  
    if (minutes >= 1) {
      return `in ${minutes}m ${seconds}s`;
    }
  
    return seconds <= 0 ? "Waiting confirmation..." : `in ${seconds}s`;
  };
  

  const [timeRemainingState, setTimeRemaining] = useState(timeRemaining());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const checkTheme = useSelector((state) => state.configuration?.theme);
  const scheme = checkTheme ?? useColorScheme();

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining = timeRemaining();
      if (newTimeRemaining !== "Waiting confirmation") {
        setTimeRemaining(newTimeRemaining);
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const favorites = useSelector((state) => state.favorites.items);
  const isFavorite = favorites.some(item => item.id === launch.id);
  const [isInFavorites, setIsInFavorites] = useState(isFavorite);

  const dispatch = useDispatch();
  const handleAddOrRemoveFavorites = () => {
    if (isInFavorites) {
      const action = removeFromFavorites(launch);
      dispatch(action);
    } else {
      const action = addToFavorites(launch);
      dispatch(action);
    }
    setIsInFavorites(!isInFavorites);
  };

  const addToCalendar = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    
    if (status !== 'granted') {
      showMessage({
        message: 'Permission to access calendar denied',
        type: 'error'
      })

      setIsMenuOpen(false)
      return
    }
  
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const spaceLaunchesCalendar = calendars.find((calendar) => calendar.title === 'Launches');
  
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await Calendar.getDefaultCalendarAsync()
        : { isLocalAccount: true, name: 'Space' };
  
    const calendarData = spaceLaunchesCalendar || {
      id: await Calendar.createCalendarAsync({
        title: 'Launches',
        color: 'blue',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource.id,
        source: defaultCalendarSource,
        name: 'internalCalendarName',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      }),
    };
  
    const event = {
      title: `🚀 ${launch.name}`,
      startDate: launchDate,
      endDate: launchDate,
      timeZone: timeZone,
      alarms: [{ relativeOffset: -30 }],
      availability: 'busy',
      calendarId: calendarData.id,
    };
  
    await Calendar.createEventAsync(calendarData.id, event)
    setIsMenuOpen(false)

    showMessage({
      message: 'Event added to calendar',
      type: 'success'
    });
  }  

  const DOMAIN = 'https://launch4fun.com/';
  const shareUrl = async () => {
    const url = `${DOMAIN}${launch.name.replace(/ /g, '-')}`;
    const shareOptions = {
      title: 'Launch4Fun',
      message: `Check out this launch: ${launch.name} -> ${url}`,
      url
    };
    try {
      await Share.share(shareOptions);
    } catch (error) {
      showMessage({
        message: 'Error: ${error.message}',
        type: 'error'
      });
    }
  };

  const styles = StyleSheet.create({
    cardContainer: {
      paddingHorizontal: 13,
      marginTop: 15,
      flex: 1,
    },
    card: {
      flexDirection: 'row-reverse',
      backgroundColor: scheme === 'dark' ? '#333' : 'white',
      borderRadius: 10,
      overflow: 'hidden',
      width: '100%',
      minHeight: 130,
      flex: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
    touchable: {
      flex: 1,
      borderRadius: 10,
    },
  });

  return (
    <View style={styles.cardContainer}>
      <TouchableHighlight
        onLongPress={() => setIsMenuOpen(true)}
        underlayColor={scheme === 'dark' ? '#444' : '#f2f2f2'} 
        style={styles.touchable}
      >
        <View style={styles.card}>
          <RocketImage uri={launch.image} isFavorite={isInFavorites} />
          <DetailsContainer
            name={launch.name}
            agency={launch.launch_service_provider.name}
            launchDate={launchDate}
            status={launch.status.name}
            statusDescription={launch.status.description}
            timeRemaining={timeRemainingState}
          />
          <Menu opened={isMenuOpen} onBackdropPress={() => setIsMenuOpen(false)}>
            <MenuTrigger />
            <MenuOptions>
              <MenuOption onSelect={handleAddOrRemoveFavorites}><Text>{isInFavorites ? 'Remove from favorites' : 'Add to favorites'}</Text></MenuOption>
              <MenuOption onSelect={shareUrl}><Text>Share</Text></MenuOption>
              <MenuOption onSelect={addToCalendar}><Text>Add to Calendar</Text></MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </TouchableHighlight>
    </View>
  );
});

export default LaunchItem;
