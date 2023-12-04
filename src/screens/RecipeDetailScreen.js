import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CachedImage } from '../helpers/image';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon, ClockIcon, FireIcon } from 'react-native-heroicons/outline';
import { HeartIcon, Square3Stack3DIcon, UsersIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Loading from '../components/loading';
import YouTubeIframe from 'react-native-youtube-iframe';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { useFavorites } from './FavoritesContext';

const ios = Platform.OS == 'ios';

export default function RecipeDetailScreen(props) {
  const item = props.route.params;
  const [isFavourite, setIsFavourite] = useState(false);
  const navigation = useNavigation();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { favorites = [], addToFavorites, removeFromFavorites } = useFavorites();

  const { recipe, setFavorites } = props.route.params || {};
  const favoriteItems = Array.isArray(favorites) ? favorites : [];
  console.log('props.route.params:', item); // Log the entire params object
  console.log('favorites:', favorites); // Log the favorites value
  console.log('favoriteItems:', favoriteItems);

  const isFavorite = favorites.some((fav) => fav.id === item.id);

  const handleToggleFavorite = () => {
    setIsFavourite(!isFavourite);

    // Update favorites array
    if (isFavorite) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  useEffect(() => {
    const apiEndpoint = `http://192.168.221.134:5000/api/recipe/${item.id}`;
    console.log(apiEndpoint);
    getMealData(apiEndpoint);
  }, []);

  const getMealData = async (apiEndpoint) => {
    try {
      const response = await axios.get(apiEndpoint);
      if (response && response.data) {
        setMeal(response.data.recipe);
        setLoading(false);
      } else {
        console.log('Recipe not found');
        setLoading(false);
      }
    } catch (err) {
      console.log('error: ', err.message);
    }
  };

  const ingredientsIndexes = (meal) => {
    if (!meal) return [];
    let indexes = [];
    for (let i = 1; i <= 20; i++) {
      if (meal['Ingredients' + i]) {
        indexes.push(i);
      }
    }

    return indexes;
  };

  const getYoutubeVideoId = (url) => {
    const regex = /[?&]v=([^&]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >

        {/* recipe image */}
        <View style={styles.imageContainer}>
          <CachedImage
            uri={item.image}
            style={styles.recipeImage}
          />
        </View>

        {/* back button */}
        <Animated.View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#0077B6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
            <HeartIcon size={hp(3.5)} strokeWidth={4.5} color={isFavourite ? "red" : "gray"} />
          </TouchableOpacity>
        </Animated.View>

        {/* meal description */}
        {loading ? (
          <Loading size="large" style={styles.loading} />
        ) : (
          <View style={styles.descriptionContainer}>
            {/* name and area */}
            <Animated.View style={styles.nameAndAreaContainer}>
              <Text style={styles.recipeName}>{meal?.Name}</Text>
              <Text style={styles.recipeDescription}>{meal?.Description}</Text>
            </Animated.View>

            {/* misc */}
            <Animated.View style={styles.miscContainer}>
              <View style={styles.miscItem}>
                <View style={styles.miscItemIcon}>
                  <ClockIcon size={hp(4)} strokeWidth={2.5} color="#525252" />
                </View>
                <View style={styles.miscItemText}>
                  <Text style={styles.miscItemValue}>{meal?.CookingTime}</Text>
                  <Text style={styles.miscItemLabel}>Min</Text>
                </View>
              </View>
              <View style={styles.miscItem}>
                <View style={styles.miscItemIcon}>
                  <UsersIcon size={hp(4)} strokeWidth={2.5} color="#525252" />
                </View>
                <View style={styles.miscItemText}>
                  <Text style={styles.miscItemValue}>{meal?.Servings}</Text>
                  <Text style={styles.miscItemLabel}>Servings</Text>
                </View>
              </View>
              <View style={styles.miscItem}>
                <View style={styles.miscItemIcon}>
                  <FireIcon size={hp(4)} strokeWidth={2.5} color="#525252" />
                </View>
                <View style={styles.miscItemText}>
                  <Text style={styles.miscItemValue}>{meal?.Calories}</Text>
                  <Text style={styles.miscItemLabel}>Cal</Text>
                </View>
              </View>
              <View style={styles.miscItem}>
                <View style={styles.miscItemIcon}>
                  <Square3Stack3DIcon size={hp(4)} strokeWidth={2.5} color="#525252" />
                </View>
                <View style={styles.miscItemText}>
                  <Text style={styles.miscItemValue}>{meal?.Difficulty}</Text>
                  <Text style={styles.miscItemLabel}>Difficulty</Text>
                </View>
              </View>
            </Animated.View>

            {/* ingredients */}
            <Animated.View style={styles.ingredientsContainer}>
              <Text style={styles.ingredientsTitle}>Ingredients</Text>
              <View style={styles.ingredientsList}>
                {meal?.Ingredients.split(',').map((ingredient, index) => (
                  <Text key={index} style={styles.ingredientItem}>
                    {`\u2022 ${ingredient}`}
                  </Text>
                ))}
              </View>
            </Animated.View>

            {/* instructions */}
            <Animated.View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Instructions</Text>
              <View style={styles.instructionsList}>
              <Text style={styles.instructionItem}>
                {meal?.Instruction}
              </Text>
              </View>
            </Animated.View>

          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E3F0F6',
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeImage: {
    width: wp(100),
    height: hp(50),
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backButtonContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp(6),
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'white',
    marginLeft: 5,

    
  },
  favoriteButton: {
    padding: 10,
    borderRadius: 50,
    marginLeft: 243,
    backgroundColor: 'white',
    
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  nameAndAreaContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recipeName: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: 'black',
  },
  recipeDescription: {
    fontSize: hp(2),
    fontWeight: 'light',
    color: 'black',
  },
  miscContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  miscItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'skyblue',
    borderRadius: 50,
    padding: 10,
    margin: 5
  },
  miscItemIcon: {
    height: hp(6.5),
    width: hp(6.5),
    backgroundColor: 'white',
    borderRadius: hp(6.5) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miscItemText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  miscItemValue: {
    fontSize: hp(2),
    fontWeight: 'bold',
    color: 'white',
  },
  miscItemLabel: {
    fontSize: hp(1.3),
    fontWeight: 'bold',
    color: 'white',
  },
  ingredientsContainer: {
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    color: 'black',
  },
  ingredientsList: {
    marginLeft: 10,
    marginRight: 10
  },
  ingredientItem: {
    fontSize: hp(1.7),
    fontWeight: 'light',
    color: 'black',
  },
  instructionsContainer: {
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    color: 'black',
  },
  
  instructionsList: {
    marginLeft: 10,
    marginRight: 10
  },

  instructionItem: {
    fontSize: hp(1.7),
    fontWeight: 'light',
    color: 'black',
    textAlign: 'justify'
    
  },
  loading: {
    marginTop: 16,
  },
});
