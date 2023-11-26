import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import { Card, Button } from "react-bootstrap";
import DAY from "./Assets/IMG/144d.jpg";
import NIGHT from "./Assets/IMG/144n.jpg";
import LIGHT from "./Assets/IMG/light.jpg";
import DARK from "./Assets/IMG/dark.jpg";
import weatherIcons from "./WeatheIcons.js";
import nonfav from "./Assets/IMG/nonfav.png";
import fav from "./Assets/IMG/favorites-love-plus-icon.png";
import "./Body.css";

const ForecastCards = ({ forecastData }) => {
  if (!forecastData || !forecastData.DailyForecasts) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "10px",
      }}
    >
      {forecastData.DailyForecasts.map((day, index) => (
        <div
          key={index}
          style={{
            width: "100px",
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <p>Date: {new Date(day.Date).toLocaleDateString()}</p>
          <p>
            {day.Temperature.Minimum.Value}°{day.Temperature.Minimum.Unit}
          </p>
          <p style={{ marginBottom: "15px" }}>{day.Day.IconPhrase}</p>
          {weatherIcons[day.Day.IconPhrase] ? (
            <img
              src={weatherIcons[day.Day.IconPhrase]}
              alt={day.Day.IconPhrase}
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
            />
          ) : (
            <div>Icon not found</div>
          )}
        </div>
      ))}
    </div>
  );
};

const Body = () => {
  const [cityName, setCityName] = useState("Telaviv");
  const [initialLoad, setInitialLoad] = useState(true);
  const [cityKey, setCityKey] = useState(null);
  const [apiKey] = useState("irb0K8GEXib7Le9cJMQ3XZecVN8WIZl1");
  const [isDayTime, setIsDayTime] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [isMetric, setIsMetric] = useState(true);
  const [forecastData, setForecastData] = useState();
  const [darkMode, setDarkMode] = useState(false);

  const toggleTemperatureUnit = () => {
    setIsMetric(!isMetric);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const [suggestedCities, setSuggestedCities] = useState([]);

  const temperatureUnit = isMetric ? "C" : "F";
  const temperatureValue =
    isMetric && weatherData?.[0]?.Temperature?.Metric?.Value
      ? weatherData[0].Temperature.Metric.Value
      : weatherData?.[0]?.Temperature?.Imperial?.Value || "";

  useEffect(() => {
    if (initialLoad) {
      handleSearch();
      setInitialLoad(false);
    }
  }, [initialLoad]);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isInFavorites = favorites.some(
      (fav) => fav.cityName === cityName.toLowerCase().trim()
    );
    setIsInFavorites(isInFavorites);
  }, [cityName]);

  useEffect(() => {
    const observationDateTime = new Date(
      weatherData?.[0]?.LocalObservationDateTime
    );
    const hours = observationDateTime.getHours();
    setIsDayTime(hours >= 6 && hours < 18);
  }, [weatherData]);

  const toggleFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const normalizedCityName = cityName.toLowerCase().trim();

    const isInFavorites = favorites.some(
      (fav) => fav.cityName.toLowerCase().trim() === normalizedCityName
    );

    if (isInFavorites) {
      const updatedFavorites = favorites.filter(
        (fav) => fav.cityName.toLowerCase().trim() !== normalizedCityName
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } else {
      const newFavorite = {
        cityName: normalizedCityName,
        temperature: temperatureValue,
        weatherText: weatherData[0].WeatherText,
      };
      const updatedFavorites = [...favorites, newFavorite];
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    }

    setIsInFavorites(!isInFavorites);
  };

  const handleSearch = async () => {
    try {
      const cityKeyResponse = await fetch(
        `https://dataservice.accuweather.com/locations/v1/cities/search?q=${cityName}&apikey=${apiKey}`
      );
      const cityKeyData = await cityKeyResponse.json();

      if (cityKeyData && cityKeyData.length > 0) {
        const cityKey = cityKeyData[0].Key;

        const currentWeatherResponse = await fetch(
          `https://dataservice.accuweather.com/currentconditions/v1/${cityKey}?apikey=${apiKey}`
        );
        const currentWeatherData = await currentWeatherResponse.json();

        const forecastResponse = await fetch(
          `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${cityKey}?apikey=${apiKey}`
        );
        const forecastData = await forecastResponse.json();
        setWeatherData(currentWeatherData);
        setForecastData(forecastData);

        setIsDayTime(currentWeatherData[0].IsDayTime);
      } else {
        console.error("City not found");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const handleInputChange = async (e) => {
    const input = e.target.value;
    setCityName(input);

    try {
      const response = await fetch(
        `https://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${apiKey}&q=${input}`
      );
      const data = await response.json();
      setSuggestedCities(data);
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
    }
  };

  const handleCitySelection = (selectedCity) => {
    setCityName(
      `${selectedCity.LocalizedName}, ${selectedCity.Country.LocalizedName}`
    );
    setSuggestedCities([]);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "90vh",
          background: darkMode ? "#111" : "white",
          color: darkMode ? "white" : "black",
        }}
      >
        <div>
          <Button
            variant={darkMode ? "primary" : ""}
            onClick={toggleDarkMode}
            style={{
              position: "absolute",
              top: "10%",
              right: "10px",
              borderRadius: "50%",
              backgroundImage: `url(${darkMode ? LIGHT : DARK})`,
              backgroundSize: "cover",
              border: "none",
              color: darkMode ? "black" : "white",
              width: "50px",
              height: "50px",
            }}
          ></Button>

          <Form.Control
            type="text"
            placeholder="Enter city name"
            value={cityName}
            onChange={handleInputChange}
          />
          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>

          {suggestedCities.length > 0 && (
            <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
              {suggestedCities.map((city) => (
                <li
                  key={city.Key}
                  className="suggested-city-item"
                  onClick={() => handleCitySelection(city)}
                >
                  {city.LocalizedName}, {city.Country.LocalizedName}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ position: "relative", width: "30rem" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: isDayTime ? `url(${DAY})` : `url(${NIGHT})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1>Weather App</h1>
            <p>{cityName}</p>
            {weatherData && (
              <Card
                style={{
                  width: "30rem",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
              >
                <Card.Body>
                  <Button
                    variant={isInFavorites ? "" : ""}
                    onClick={toggleFavorites}
                  >
                    {isInFavorites ? (
                      <img
                        src={nonfav}
                        alt="Non-favorite"
                        style={{ width: "25px", height: "25px" }}
                      />
                    ) : (
                      <img
                        src={fav}
                        alt="Favorite"
                        style={{ width: "25px", height: "25px" }}
                      />
                    )}
                  </Button>
                  <Card.Title>Current Weather Conditions</Card.Title>
                  <Card.Text>
                    Temperature: {temperatureValue}°{temperatureUnit}
                  </Card.Text>
                  <Card.Text>
                    Weather: {weatherData?.[0]?.WeatherText}
                  </Card.Text>
                  {weatherIcons[weatherData?.[0]?.WeatherText] && (
                    <img
                      src={weatherIcons[weatherData?.[0]?.WeatherText]}
                      alt={weatherData?.[0]?.WeatherText}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                  <br />
                  <hr />
                  <Button variant="primary" onClick={toggleTemperatureUnit}>
                    {isMetric ? " Imperial" : "Metric"}
                  </Button>
                </Card.Body>
              </Card>
            )}
          </div>
        </div>
        <ForecastCards forecastData={forecastData} />
      </div>
    </>
  );
};

export default Body;
