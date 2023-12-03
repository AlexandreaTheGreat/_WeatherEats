import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { BookmarkIcon, HeartIcon } from 'react-native-heroicons/outline';
import axios from 'axios';
import Recipes from '../components/recipes';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from './FavoritesContext';
import WeatherContainer from '../components/WeatherContainer';
import * as Location from 'expo-location';


export default function HomeScreen() {

  const [meals, setMeals] = useState([]);
  const [location, setLocation] = useState(null);
  const navigation = useNavigation();
  const { favorites = [], addToFavorites, removeFromFavorites } = useFavorites();

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (location) {
      getRecipes();
    }
  }, [location]); 

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      console.error('Error getting location:', error.message);
    }
  };

  const navigateToFavorites = () => {
    navigation.navigate('FavoritesScreen', { favorites });
  };

  const getRecipes = async () => {
    try {
      // Use the user's coordinates to fetch weather and recipes
      console.log('Location:', location);
      if (location) {
        const { latitude, longitude } = location.coords;
        console.log("Latitude: ", latitude);
        console.log("Longitude:", longitude);
        // Fetch recipes using user's coordinates
        const recipesResponse = await axios.get(
          `http://192.168.100.129:5000/api/recipe?latitude=${latitude}&longitude=${longitude}`
        );
        
        const recipesData = recipesResponse.data.recipes;

        // Set weather data and recipes
        setMeals(recipesData);
      } else {
        console.warn('Location not available');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* avatar and bell icon */}
        <View style={styles.avatarAndBell}>
          {/* Add button to navigate to Favorites screen */}
          <Image source={require('../../assets/images/custom-logo.png')} style={styles.avatarImage} />
          <TouchableOpacity onPress={navigateToFavorites} style={styles.bellIconContainer}>
            <BookmarkIcon style={styles.bellIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.greetings}>
          <Text style={styles.greetingsText}>
            Weather Today
          </Text>
        </View>

        <View style={styles.middleContent}>
          <WeatherContainer />
        </View>

        {/* recipes */}
        <View>
          {meals && meals.length > 0 ? (
            <Recipes meals={meals} />
          ) : (
            <Text>No recipes available.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F0F6',
    marginTop: 10,
  },
  scrollViewContent: {
    paddingBottom: 50,
    marginTop: 30
  },
  avatarAndBell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    
  },
  avatarImage: {
    height: hp(5),
    width: hp(5.5),
  },
  bellIconContainer: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'skyblue',
    
  },
  bellIcon: {
    color: 'white',
    fontSize: 40,
  },
  greetings: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  greetingsText: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: 'black',

  },
  middleContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
});
