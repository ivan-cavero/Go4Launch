import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { differenceInCalendarDays, differenceInHours, differenceInMinutes, differenceInSeconds, format, formatDistanceToNow } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import RocketImage from './ItemComponents/RocketImage';
import DetailsContainer from './ItemComponents/DetailsContainer';

const LaunchItem = ({ launch }) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const launchDate = utcToZonedTime(launch.net, timeZone);
  const daysUntilLaunch = differenceInCalendarDays(launchDate, new Date());

  const timeRemaining = () => {
    if (daysUntilLaunch > 1) {
      return formatDistanceToNow(launchDate, { addSuffix: true });
    } else {
      const hours = differenceInHours(launchDate, new Date());
      const minutes = differenceInMinutes(launchDate, new Date()) % 60;
      if (hours >= 1) {
        return `in ${hours}h ${minutes}m`;
      } else {
        const seconds = differenceInSeconds(launchDate, new Date()) % 60;
        if (minutes >= 1) {
          return `in ${minutes}m ${seconds}s`;
        } else {
          return seconds <= 0 ? "Waiting confirmation..." : `in ${seconds}s`;
        }
      }
    }
  };

  const [timeRemainingState, setTimeRemaining] = useState(timeRemaining());

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

  const statusBackgroundColor = launch.status.name === 'Go for Launch' ? '#32CD32' : '#FFA500';

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <RocketImage uri={launch.image} />
        <DetailsContainer
          name={launch.name}
          location={launch.pad.location.name}
          launchDate={launchDate}
          status={launch.status.name}
          statusBackgroundColor={statusBackgroundColor}
          timeRemaining={timeRemainingState}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 13,
    marginTop: 15,
  },
  card: {
    flexDirection: 'row-reverse',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    height: 134,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default LaunchItem;
