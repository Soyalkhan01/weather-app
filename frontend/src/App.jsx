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

  useEffect(() => {
    const interval = setInterval(() => {
      if (city) {
        handleSearchRoute();
      }
    }, 300000);
    return () => clearInterval(interval);
  }, [city, currentCoords]);

  const handleSearchRoute = () => {
    if (currentCoords && city.trim().toLowerCase() === currentCoords.name.toLowerCase()) {
      getWeatherByCoords(currentCoords.lat, currentCoords.lon, currentCoords.name);
    } else {
      getCoordsByTextSearch(city);
    }
  };

  // Text se Coordinates nikalne ka master function (Google Maps Architecture)
  const getCoordsByTextSearch = async (searchText) => {
    if (!searchText?.trim()) return;
    setLoading(true);
    setError("");

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&countrycodes=in&limit=1&addressdetails=1`
      );
      const geoData = await geoRes.json();

      if (geoData && geoData.length > 0) {
        const { lat, lon, display_name, address } = geoData[0];
        
        // Exact Colony ya Mohalle ka naam nikalne ka fallback system
        const exactSpot = 
          address.neighbourhood || 
          address.suburb || 
          address.colony || 
          address.village || 
          display_name.split(",")[0];

        // Sikar, Rajasthan jaisa parent area short karne ke liye
        const parentArea = address.city || address.town || address.county || "";
        const finalDisplayName = parentArea ? `${exactSpot}, ${parentArea}` : exactSpot;
        
        await getWeatherByCoords(lat, lon, finalDisplayName);
      } else {
        await getWeatherByText(searchText);
      }
    } catch (err) {
      await getWeatherByText(searchText);
    } finally {
      setLoading(false);
    }
  };

  // Backup Text Weather
  const getWeatherByText = async (selectedCity) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/weather/${encodeURIComponent(selectedCity)}`
      );
      const data = await res.json();

      if (!res.ok || data?.error) {
        setError("Location not found");
        setWeather(null);
      } else {
        setWeather(data);
        setCity(data.location?.name || selectedCity);
        saveToLocalHistory(data.location?.name || selectedCity);
      }
    } catch (err) {
      setError("Server error");
    }
  };

  // Exact Coordinates Weather Loader
  const getWeatherByCoords = async (lat, lon, preciseName) => {
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
        // CRITICAL FORCE OVERWRITE: Pure weather object mein har jagah exact colony force kar rahe hain
        weatherData.location.name = preciseName;
        if (weatherData.location.country === "India") {
          weatherData.location.country = "Rajasthan, India"; 
        }

        setWeather(weatherData);
        setCity(preciseName);
        saveToLocalHistory(preciseName);
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Dropdown Suggestions (India Only Focused)
  const searchCities = async (value) => {
    setCity(value);
    if (!value.trim() || value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&limit=5&addressdetails=1`
      );
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const formattedSuggestions = data.map(item => {
          const spot = item.address.neighbourhood || item.address.suburb || item.address.colony || item.address.village || item.display_name.split(",")[0];
          const parent = item.address.city || item.address.town || item.address.state || "";
          return {
            name: parent ? `${spot}, ${parent}` : spot,
            lat: item.lat,
            lon: item.lon
          };
        });
        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
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
        getCoordsByTextSearch(data.city);
      } else {
        getCoordsByTextSearch("Sikar");
      }
    } catch (err) {
      getCoordsByTextSearch("Sikar");
    }
  };

  // Auto GPS Tracking on App Start
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

          const locationRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const locationData = await locationRes.json();
          
          const addr = locationData.address;
          const exactSpot = 
            addr.neighbourhood ||    
            addr.suburb ||           
            addr.colony ||           
            addr.village ||          
            addr.town ||             
            addr.road ||             
            "Current Spot";

          const parentCity = addr.city || addr.county || "";
          const combinedLocation = parentCity ? `${exactSpot}, ${parentCity}` : exactSpot;

          setCurrentCoords({ lat, lon, name: combinedLocation });
          await getWeatherByCoords(lat, lon, combinedLocation);

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
                placeholder="Search colony, village or city in India..."
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
                        getWeatherByCoords(item.lat, item.lon, item.name);
                        setSuggestions([]);
                      }}
                    >
                      🌍 {item.name}
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

        {loading && <p className="loading">Fetching Weather...</p>}

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
                      onClick={() => getCoordsByTextSearch(item.city)}
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