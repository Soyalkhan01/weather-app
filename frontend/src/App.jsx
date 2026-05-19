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

  const BACKEND_URL = "https://weather-backend-n5fs.onrender.com";

  const getWeather = async (selectedCity) => {

    if (!selectedCity) return;

    setLoading(true);

    try {

      const res = await fetch(
        `${BACKEND_URL}/weather/${selectedCity}`
      );

      const data = await res.json();

      if (data.error) {

        setError(data.error.message);

        setWeather(null);

      } else {

        setWeather(data);

        setError("");

        getHistory();

      }

    } catch (err) {

      setError("Server error");

    } finally {

      setLoading(false);

    }
  };

  const searchCities = async (value) => {

    setCity(value);

    if (value.trim().length === 0) {

      setSuggestions([]);

      return;

    }

    try {

      const res = await fetch(
        `${BACKEND_URL}/search/${value}`
      );

      const data = await res.json();

      setSuggestions(data);

    } catch (err) {

      console.log(err);

    }
  };

  const getHistory = async () => {

    try {

      const res = await fetch(
        `${BACKEND_URL}/history`
      );

      const data = await res.json();

      setHistory(data);

    } catch (err) {

      console.log(err);

    }
  };

  const getCurrentLocationWeather = () => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(

        async (position) => {

          const lat = position.coords.latitude;

          const lon = position.coords.longitude;

          setLoading(true);

          try {

            const res = await fetch(
              `${BACKEND_URL}/weather/${lat},${lon}`
            );

            const data = await res.json();

            setWeather(data);

            setCity(data.location.name);

            setError("");

            getHistory();

          } catch (err) {

            setError("Location weather failed");

          } finally {

            setLoading(false);

          }

        },

        () => {

          getWeather("Sikar");

        }

      );

    } else {

      getWeather("Sikar");

    }
  };

  useEffect(() => {

    getCurrentLocationWeather();

    getHistory();

  }, []);

  return (

    <div className={darkMode ? "container dark" : "container light"}>

      <div className="weather-box">

        <div className="theme-toggle">

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="theme-btn"
          >
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>

        </div>

        <h1>🌤 Weather App</h1>

        <div className="search-box">

          <div className="search-container">

            <input
              type="text"
              placeholder="Search any city in world..."
              value={city}
              onChange={(e) =>
                searchCities(e.target.value)
              }
            />

            {

              suggestions.length > 0 && (

                <div className="dropdown">

                  {

                    suggestions.map((item, index) => (

                      <div
                        key={index}
                        className="dropdown-item"
                        onClick={() => {

                          setCity(item.name);

                          getWeather(item.name);

                          setSuggestions([]);

                        }}
                      >

                        🌍 {item.name}, {item.region}, {item.country}

                      </div>

                    ))

                  }

                </div>

              )

            }

          </div>

          <button
            onClick={() => getWeather(city)}
          >
            Search
          </button>

        </div>

        {

          loading && (

            <p className="loading">
              Loading weather...
            </p>

          )

        }

        {

          error && (

            <p className="error">
              {error}
            </p>

          )

        }

        {

          weather && !loading && (

            <WeatherCard weather={weather} />

          )

        }

        <div className="history-box">

          <h2>📜 Search History</h2>

          {

            history.length > 0 ? (

              history.map((item, index) => (

                <div
                  key={index}
                  className="history-item"
                  onClick={() =>
                    getWeather(item.city)
                  }
                >

                  🌍 {item.city}

                </div>

              ))

            ) : (

              <p>No history found</p>

            )

          }

        </div>

      </div>

    </div>

  );
};

export default App;