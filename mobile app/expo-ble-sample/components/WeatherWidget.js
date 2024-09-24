import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../theme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
const WeatherWidget = () => {
  const initialWeatherData = {
    main: {
      temp: 22,
      feels_like: 27,
      humidity: 66,
    },
    weather: [
      {
        description: 'Mostly Cloudy',
      },
    ],
    wind: {
      speed: 16,
    },
    sys: {
      country: 'VN',
      sunrise: 1627128000,
      sunset: 1627178400,
    },
    name: 'Ho Chi Minh City',
    visibility: 10000,
  };

  const [weatherData] = useState(initialWeatherData);

  const { main, weather, wind, name, sys } = weatherData;

  return (
    <View style={[styles.container, { backgroundColor: theme.accent }]}>
      <View style={styles.header}>
      <FontAwesome5 name="cloud-sun" size={50} color="white" />
        <View style={styles.headerText}>
          <Text style={styles.description}>{weather[0].description}</Text>
          <Text style={styles.location}>{name}, {sys.country}</Text>
        </View>
        <Text style={styles.temperature}>{Math.round(main.temp)}°</Text>
      </View>
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailText}>{Math.round(main.feels_like)}°C</Text>
          <Text style={styles.detailLabel}>Sensible</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailText}>4%</Text>
          <Text style={styles.detailLabel}>Precipitation</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailText}>{main.humidity}%</Text>
          <Text style={styles.detailLabel}>Humidity</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailText}>{wind.speed} km/h</Text>
          <Text style={styles.detailLabel}>Wind</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    marginLeft: 8,
  },
  description: {
    fontSize: 18,
    color: 'gray',
  },
  location: {
    color: 'lightgray',
  },
  temperature: {
    fontSize: 48,
    color: 'white',
    marginLeft: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    width: '100%',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  detailLabel: {
    fontSize: 12,
    color: 'gray',
  },
});

export default WeatherWidget;
