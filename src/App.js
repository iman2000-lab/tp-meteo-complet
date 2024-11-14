import { Oval } from 'react-loader-spinner';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function Grp204WeatherApp() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    current: null,
    forecast: [],
    error: false,
  });
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Charger les villes favorites depuis le localStorage
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  const toDateFunction = (date) => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const WeekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const d = new Date(date);
    const formattedDate = `${WeekDays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
    return formattedDate;
  };

  const search = async (cityName) => {
    setWeather({ ...weather, loading: true });
    const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

    try {
      // Appel à l'API pour les données météo actuelles
      const currentWeatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: cityName,
          units: 'metric',
          appid: api_key,
        },
      });

      // Appel à l'API pour les prévisions à 5 jours
      const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: {
          q: cityName,
          units: 'metric',
          appid: api_key,
        },
      });

      // Filtrer les prévisions pour obtenir 5 jours
      const forecastData = forecastResponse.data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));

      setWeather({
        current: currentWeatherResponse.data,
        forecast: forecastData,
        loading: false,
        error: false,
      });
    } catch (error) {
      setWeather({ current: null, forecast: [], loading: false, error: true });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      search(input);
      setInput('');
    }
  };

  const addFavorite = () => {
    if (input && !favorites.includes(input)) {
      const updatedFavorites = [...favorites, input];
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setInput('');
    }
  };

  const loadFavorite = (cityName) => {
    search(cityName);
  };

  return (
    <div className="App">
      <h1 className="app-name">Application Météo grp204</h1>

      <div className="favorites">
        <h2>Villes favorites</h2>
        {favorites.map((city, index) => (
          <button key={index} className="favorite-city" onClick={() => loadFavorite(city)}>
            {city}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="favorite-btn" onClick={addFavorite}>Ajouter aux favoris</button>
      </div>

      {weather.loading && (
        <div className="loader">
          <Oval type="Oval" color="black" height={100} width={100} />
        </div>
      )}

      {weather.error && (
        <span className="error-message">
          <FontAwesomeIcon icon={faFrown} />
          <span>Ville introuvable</span>
        </span>
      )}

      {weather.current && (
        <div>
          <h2>{weather.current.name}, {weather.current.sys.country}</h2>
          <span>{toDateFunction(new Date())}</span>
          <img src={`https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`} alt={weather.current.weather[0].description} />
          <p>{Math.round(weather.current.main.temp)}°C</p>
          <p>Vitesse du vent : {weather.current.wind.speed} m/s</p>
        </div>
      )}

      {weather.forecast.length > 0 && (
        <div className="forecast">
          <h2>Prévisions pour les 5 prochains jours</h2>
          <div className="forecast-cards">
            {weather.forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <p>{toDateFunction(day.dt_txt)}</p>
                <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} alt={day.weather[0].description} />
                <p>{Math.round(day.main.temp)}°C</p>
                <p>{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Grp204WeatherApp;
