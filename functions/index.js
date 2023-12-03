const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firestore with your credentials
const serviceAccount = require("C:/Users/ALEXANDREA/_WeatherEats/weathereats.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const fetchWeatherData = async (latitude, longitude) => {
  const apiKey = '5851652f2f5da157701707dfc5f5b0f6';

  try {
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error.response || error.message || error);
    return null;
  }
}

const getWeatherCondition = (temperature, humidity, weather) => {
  if (temperature >= 30 && humidity >= 60) {
    return 'Hot and Humid';
  } else if (temperature >= 30 && humidity <= 60) {
    return 'hot and dry';
  } else if (temperature >= 20 && temperature < 30 && humidity >= 60) {
    return 'mild cool';
  } else if (temperature >= 20 && temperature < 30 && humidity <= 60) {
    return 'mild cool';
  } else if (temperature >= 25 && temperature < 32 && weather === "Rain" && humidity < 60) {
    return 'rainy and dry';
  } else if (temperature >= 25 && temperature < 32 && weather === "Rain" && humidity > 60) {
    return 'rainy and humid';
  }

  // Handle other cases or return a default condition
  return 'Default';
}

app.post('/api/weather', async (req, res) => {
  const coords = req.body.coords;
  const latitude = coords.latitude;
  const longitude = coords.longitude;

  const weatherData = await fetchWeatherData(latitude, longitude);

  if (weatherData) {
    const temperature = weatherData.main.temp - 273.15;
    const humidity = parseInt(weatherData.main.humidity);
    const weatherCondition = getWeatherCondition(temperature, humidity, weatherData.weather[0].main);

    console.log('Weather data:', weatherData);
    console.log('Weather condition:', weatherCondition);

    // Use weather condition to generate recipe suggestions or store it for later use
    // ...

    // Send response back to the client
    res.status(200).json({ message: 'Weather data received successfully' });
  } else {
    console.error('Error fetching weather data');
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Define your recipe routes
app.get('/api/recipe', async (req, res) => {
  try {
    // Retrieve recipes from Firestore based on TimeOfDay
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    let timeOfDay;

    if (currentHour >= 0 && currentHour < 10) {
      timeOfDay = 'Breakfast';
    } else if (currentHour >= 10 && currentHour < 15) {
      timeOfDay = 'Lunch';
    } else if (currentHour >= 15 && currentHour < 18) {
      timeOfDay = 'Snack';
    } else {
      timeOfDay = 'Dinner';
    }

    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    console.log("Latitude: ", latitude);
    console.log("Longitude:", longitude);

    const weatherData = await fetchWeatherData(latitude, longitude);

    if (!weatherData) {
      console.error('Error fetching weather data');
      res.status(500).json({ error: 'Failed to fetch weather data' });
      return;
    }

  const temperature = weatherData.main.temp - 273.15;
  const humidity = parseInt(weatherData.main.humidity);
  const weatherCondition = getWeatherCondition(temperature, humidity, weatherData.weather[0].main);

    const recipes = [];
    const recipeDocs = await db.collection(weatherCondition).where('TimeOfDay', '==', timeOfDay).get();

    recipeDocs.forEach(doc => {
      const recipe = doc.data();
      recipe.id = doc.id;
      recipes.push(recipe);
    });

    const responseData = { recipes };
    console.log('Server Response:', responseData);
    console.log('Weather: ', weatherCondition);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/recipe/:id', async (req, res) => {
  try {
    const recipeId = req.params.id;

    // Retrieve the specific recipe from Firestore based on the provided ID
    const allRecipesSnapshot = await db.collectionGroup('').get();

    // Filter the documents on the server side based on the ID
    const recipeDoc = allRecipesSnapshot.docs.find(doc => doc.id === recipeId);

    if (!recipeDoc.exists) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = recipeDoc.data();
    recipe.id = recipeDoc.id;
    const responseData = { recipe };
    console.log('Server Response:', responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
