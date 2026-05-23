import React, { useEffect, useState } from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currentCoords, setCurrentCoords] = useState(null);

  const BACKEND_URL = "https://weather-backend-n5fs.onrender.com";

  // Automatic Background Refresh Block
  useEffect(() => {
    const interval = setInterval(() => {
      if (city) {
        handleSearchRoute();
      }
    }, 300000);
    return () => clearInterval(interval);
  }, [city, currentCoords]);

  const handleSearchRoute = () => {
    if (currentCoords && city === currentCoords.name) {
      getWeatherByCoords(currentCoords.lat, currentCoords.lon, currentCoords.name);
    } else {
      getWeatherByText(city);
    }
  };

  // 1. Text Search (Jab koi typing karke dhoonde)
  const getWeatherByText = async (selectedCity) => {
    if (!selectedCity?.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${BACKEND_URL}/weather/${encodeURIComponent(selectedCity)}`
      );
      const data = await res.json();

      if (!res.ok || data?.error) {
        setError("City not found");
        setWeather(null);
      } else {
        setWeather(data);
        setCity(data.location?.name || selectedCity);
        saveToLocalHistory(data.location?.name || selectedCity);
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Exact Coordinates Weather (Bina search kiye auto-load aur Google Maps accuracy ke liye)
  const getWeatherByCoords = async (lat, lon, fallbackName) => {
    setLoading(true);
    setError("");

    try {
      const weatherRes = await fetch(
        `${BACKEND_URL}/current-location/${lat}/${lon}`
      );
      const weatherData = await weatherRes.json();

      if (weatherData?.error) {
        getIPLocationWeather();
      } else {
        // API response ke andar location name ko hamare exact colony/village name se overwrite karenge
        weatherData.location.name = fallbackName;
        setWeather(weatherData);
        setCity(fallbackName);
        saveToLocalHistory(fallbackName);
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const searchCities = async (value) => {
    setCity(value);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/search/${value}`);
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  const getLocalHistory = () => {
    const localData = localStorage.getItem("weather_search_history");
    if (localData) {
      setHistory(JSON.parse(localData));
    }
  };

  const saveToLocalHistory = (cityName) => {
    let currentHistory = localStorage.getItem("weather_search_history");
    currentHistory = currentHistory ? JSON.parse(currentHistory) : [];
    
    currentHistory = currentHistory.filter(
      (item) => item.city.toLowerCase() !== cityName.toLowerCase()
    );
    
    currentHistory.unshift({ city: cityName });
    localStorage.setItem("weather_search_history", JSON.stringify(currentHistory));
    setHistory(currentHistory);
  };

  const removeHistoryItem = (e, cityName) => {
    e.stopPropagation();
    let currentHistory = localStorage.getItem("weather_search_history");
    currentHistory = currentHistory ? JSON.parse(currentHistory) : [];
    
    const updatedHistory = currentHistory.filter((item) => item.city !== cityName);
    localStorage.setItem("weather_search_history", JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  const getIPLocationWeather = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data?.city) {
        getWeatherByText(data.city);
      } else {
        getWeatherByText("Delhi");
      }
    } catch (err) {
      getWeatherByText("Delhi");
    }
  };
const getCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      getIPLocationWeather();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          setLoading(true);

          const weatherRes = await fetch(
            `${BACKEND_URL}/current-location/${lat}/${lon}`
          );
          const weatherData = await weatherRes.json();

          const locationRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const locationData = await locationRes.json();
          
          const addr = locationData.address;
          
          // Google Maps ki tarah priority order: Sabse choti local jagah se lekar city tak
          const exactLocation = 
            addr.neighbourhood ||    // Sabse pehle local mohalla/pados
            addr.suburb ||           // Colony / Area name
            addr.colony ||           // Agar specific colony field hai
            addr.village ||          // Gaon ka naam
            addr.town ||             // Town ka naam
            addr.road ||             // Agar kuch na mile toh jis road par ho us ka naam
            addr.commercial ||       // Koi shopping complex ya market area
            addr.industrial ||       // Industrial area
            addr.city_district ||    // City ka district
            weatherData.location?.name || 
            "My Location";

          if (weatherData?.error) {
            getIPLocationWeather();
          } else {
            // Ab yahan screen par "India" ya "Current Location" ke bajay aapki exact colony/village ka naam aayega
            weatherData.location.name = exactLocation;
            setWeather(weatherData);
            setCity(exactLocation);
            setError("");
          }
        } catch (err) {
          console.log(err);
          getIPLocationWeather();
        } finally {
          setLoading(false);
        }
      },
      () => {
        getIPLocationWeather();
      }
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchRoute();
      setSuggestions([]);
    }
  };

  useEffect(() => {
    getCurrentLocationWeather();
    getLocalHistory();
  }, []);

  return (
    <div className={darkMode ? "container dark" : "container light"}>
      <div className="weather-box">
        <div className="top-bar">
          <div className="search-box">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search city..."
                value={city}
                onChange={(e) => searchCities(e.target.value)}
                onKeyDown={handleKeyPress}
              />

              {suggestions.length > 0 && (
                <div className="dropdown">
                  {suggestions.map((item, index) => (
                    <div
                      key={index}
                      className="dropdown-item"
                      onClick={() => {
                        setCity(item.name);
                        getWeatherByText(item.name);
                        setSuggestions([]);
                      }}
                    >
                      🌍 {item.name}, {item.country}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                handleSearchRoute();
                setSuggestions([]);
              }}
            >
              Search
            </button>
          </div>

          <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀" : "🌙"}
          </button>
        </div>

        {loading && <p className="loading">Loading weather...</p>}

        {error && <p className="error">{error}</p>}

        {weather && !loading && (
          <div className="dashboard">
            <div className="left-panel">
              <WeatherCard weather={weather} />
            </div>
            <div className="right-panel">
              <h3>Search History</h3>
              <div className="history-scroll">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div
                      key={index}
                      className="history-item"
                      onClick={() => getWeatherByText(item.city)}
                    >
                      <span>🌍 {item.city}</span>
                      
                      <button
                        className="remove-btn"
                        onClick={(e) => removeHistoryItem(e, item.city)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No history found</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;