import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';

const WeatherContainer = () => {
  const [weatherData, setWeatherData] = useState(null);
  const apiKey = '5851652f2f5da157701707dfc5f5b0f6'; // Replace with your actual OpenWeatherMap API key

  const kelvinToCelsius = (kelvin) => {
    return kelvin - 273.15;
  };

  const currentDate = new Date(); // Get the current date
  const isWetSeason = currentDate.getMonth() >= 5 && currentDate.getMonth() <= 10; // Determine wet or dry season

  useEffect(() => {
    let locationWatcher;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please enable location services to use this feature.');
        return;
      }

      locationWatcher = await Location.watchPositionAsync(
        { enableHighAccuracy: true, distanceInterval: 500 }, // You can adjust distanceInterval as needed
        (newLocation) => {
          getWeatherData(newLocation.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          Alert.alert('Error', 'Failed to get location.');
        }
      );
    })();

    // Optionally, you can stop watching the location when the component unmounts
    return () => {
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, []);

  const getWeatherData = (coords) => {
    axios
      .get(`http://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${apiKey}`)
      .then((response) => {
        const data = response.data;
        setWeatherData(data);
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error.response || error.message || error);
        setWeatherData(null); // Set weatherData to null in case of an error
      });
    axios.post(`http://192.168.100.129:5000/api/weather`, { coords });
  };

  return (
    <View style={styles.container}>
      {weatherData ? (
        <View style={styles.weatherContainer}>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherCondition}>
              {weatherData.weather[0].main}
            </Text>
            <Text style={styles.temperature}>
              {kelvinToCelsius(weatherData.main.temp).toFixed(1)}°C
            </Text>
            <Text style={styles.location}>{weatherData.name}</Text>
            {/* You can display more weather data here */}
          </View>
          <View style={styles.weatherIconContainer}>
            <Image
              style={styles.weatherIcon}
              source={{
                uri: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`,
              }}
            />
            <Text style={styles.seasonText}>
            Season: {isWetSeason ? 'Wet' : 'Dry'}
            </Text>
          </View>
        </View>
      ) : (
        <Text>Error loading weather data or no data available.</Text>
      )}
      {weatherData ? (
        <View style={styles.bottomContainer}>
          <Text style={styles.humidity}>
            Humidity: {weatherData.main.humidity}%
          </Text>
          <Text>  </Text>
          <Text style={styles.weatherDescription}>
            Description: {weatherData.weather[0].description}
          </Text>
        </View>
      ) : (
        <Text>Error loading weather data or no data available.</Text>
      )}
    </View>
  );
};

export default WeatherContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginRight: 12
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#0077B6',
    padding: 20,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: '#0077B6'
  },
  bottomContainer: {
    flexDirection: 'row',
    maxWidth: '100%',
    justifyContent: 'space-between',
    border: 1,
    borderColor: '#78aed3',
    padding: 20,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: '#78aed3', 

  },
  weatherInfo: {
    flex: 1,
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'
  },
  weatherCondition: {
    fontSize: 16,
    color: 'white'
  },
  weatherDescription: {
    fontSize: 16,
    color: 'white'
  },
  temperature: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white'
  },
  humidity: {
    fontSize: 16,
    color: 'white'
  },
  weatherIconContainer: {
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  seasonText: {
    fontSize: 16,
    color: 'white'
  }
});