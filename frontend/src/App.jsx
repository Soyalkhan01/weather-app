import { useEffect, useState } from "react";
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
  const [isListening, setIsListening] = useState(false);

  const BACKEND_URL = "https://weather-backend-n5fs.onrender.com";

  const handleSearchRoute = () => {
    if (currentCoords && city.trim().toLowerCase() === currentCoords.name.toLowerCase()) {
      getWeatherByCoords(currentCoords.lat, currentCoords.lon, currentCoords.name);
    } else {
      getCoordsByTextSearch(city);
    }
  };

  // WhatsApp-Style Beep Sound Generator
  const playSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "start") {
        // High pitch clean ping sound (WhatsApp start style)
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "stop") {
        // Low soft bass tone (WhatsApp stop style)
        osc.type = "triangle";
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      console.log("Audio feedback error:", e);
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Search. Please try Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      playSound("start"); // Trigger Start Sound
      setIsListening(true);
      setCity("Listening...");
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      playSound("stop"); // Trigger Error Sound
      setIsListening(false);
      setCity("");
      setError("Voice not recognized. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      playSound("stop"); // Trigger Success End Sound
      const voiceResult = event.results[0][0].transcript;
      const cleanVoiceText = voiceResult.replace(/\.$/g, "").trim();
      
      setCity(cleanVoiceText);
      setSuggestions([]);
      getCoordsByTextSearch(cleanVoiceText);
    };

    recognition.start();
  };

  const getCoordsByTextSearch = async (searchText) => {
    if (!searchText?.trim() || searchText === "Listening...") return;
    setLoading(true);
    setError("");

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&countrycodes=in&limit=1&addressdetails=1`
      );
      const geoData = await geoRes.json();

      if (geoData && geoData.length > 0) {
        const { lat, lon, address, display_name } = geoData[0];
        
        const exactSpot = 
          address.neighbourhood || 
          address.colony || 
          address.residential || 
          address.suburb || 
          address.townquarter ||
          address.village || 
          address.hamlet || 
          address.road || 
          display_name.split(",")[0];

        const parentArea = address.city || address.town || address.county || address.state_district || "";
        const finalDisplayName = (parentArea && parentArea.toLowerCase() !== exactSpot.toLowerCase() && !exactSpot.includes(parentArea)) 
          ? `${exactSpot}, ${parentArea}` 
          : exactSpot;
        
        await getWeatherByCoords(lat, lon, finalDisplayName);
      } else {
        await getWeatherByText(searchText);
      }
    } catch {
      await getWeatherByText(searchText);
    } finally {
      setLoading(false);
    }
  };

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
    } catch{
      setError("Server error");
    }
  };

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
        weatherData.location.name = preciseName;
        setWeather(weatherData);
        setCity(preciseName);
        saveToLocalHistory(preciseName);
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

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
          const spot = 
            item.address.neighbourhood || 
            item.address.colony || 
            item.address.residential || 
            item.address.suburb || 
            item.address.village || 
            item.display_name.split(",")[0];
            
          const parent = item.address.city || item.address.town || item.address.county || "";
          return {
            name: (parent && parent.toLowerCase() !== spot.toLowerCase()) ? `${spot}, ${parent}` : spot,
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
    } catch {
      getCoordsByTextSearch("Sikar");
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

          const locationRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const locationData = await locationRes.json();
          
          const addr = locationData.address;
          const display = locationData.display_name;

          const nameParts = display.split(",");
          const geoFallback = nameParts.length > 1 ? `${nameParts[0].trim()}, ${nameParts[1].trim()}` : nameParts[0];
          
          const exactSpot = 
            addr.neighbourhood ||    
            addr.colony ||           
            addr.residential ||      
            addr.suburb ||           
            addr.townquarter ||
            addr.village ||          
            addr.town ||             
            addr.road ||             
            geoFallback;

          const parentCity = addr.city || addr.town || addr.county || addr.state_district || "";
          const combinedLocation = (parentCity && parentCity.toLowerCase() !== exactSpot.toLowerCase() && !exactSpot.includes(parentCity)) 
            ? `${exactSpot}, ${parentCity}` 
            : exactSpot;

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
}, );

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
              
              <button 
                type="button" 
                className={`voice-btn ${isListening ? "listening" : ""}`} 
                onClick={startVoiceRecognition}
                title="Search by voice"
              >
                {isListening ? "🛑" : "🎙️"}
              </button>

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