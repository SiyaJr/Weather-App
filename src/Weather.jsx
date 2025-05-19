import { useState, useEffect } from 'react';
import { WiDaySunny, WiRain, WiSnow, WiCloudy, WiThunderstorm, WiFog } from 'react-icons/wi';
import Forecast from './Forecast';

function Weather() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('C');
  const [searchHistory, setSearchHistory] = useState([]);

  const getWeatherIcon = (condition, size = 48) => {
    const id = condition.toLowerCase();
    if (id.includes('thunderstorm')) return <WiThunderstorm size={size} />;
    if (id.includes('drizzle') || id.includes('rain')) return <WiRain size={size} />;
    if (id.includes('snow')) return <WiSnow size={size} />;
    if (id.includes('cloud')) return <WiCloudy size={size} />;
    if (id.includes('fog') || id.includes('mist')) return <WiFog size={size} />;
    return <WiDaySunny size={size} />;
  };

  const fetchWeather = async (location) => {
    setLoading(true);
    setError(null);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit === 'C' ? 'metric' : 'imperial'}&appid=32045d6ccc6b9283ed0219d738c5ebc8`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${unit === 'C' ? 'metric' : 'imperial'}&appid=32045d6ccc6b9283ed0219d738c5ebc8&cnt=40`
        )
      ]);
      
      if (!currentRes.ok || !forecastRes.ok) {
        throw new Error('City not found');
      }
      
      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();
      
      setWeatherData({
        current: currentData,
        forecast: forecastData
      });
      setSearchHistory(prev => {
        const newHistory = [location, ...prev.filter(item => item !== location)];
        return newHistory.slice(0, 5);
      });
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      // First get city name from coordinates
      const reverseGeoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=32045d6ccc6b9283ed0219d738c5ebc8`
      );
      
      if (!reverseGeoRes.ok) {
        throw new Error('Could not determine location');
      }
      
      const geoData = await reverseGeoRes.json();
      const locationName = geoData[0]?.name || "Your Location";
      
      // Now fetch weather using coordinates (more reliable than city name)
      const [currentRes, forecastRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit === 'C' ? 'metric' : 'imperial'}&appid=32045d6ccc6b9283ed0219d738c5ebc8`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit === 'C' ? 'metric' : 'imperial'}&appid=32045d6ccc6b9283ed0219d738c5ebc8&cnt=40`
        )
      ]);
      
      if (!currentRes.ok || !forecastRes.ok) {
        throw new Error('Weather data not available');
      }
      
      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();
      
      setWeatherData({
        current: { ...currentData, name: locationName }, // Use the reversed geocoded name
        forecast: forecastData
      });
      setCity(locationName);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError('Geolocation error: ' + err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  useEffect(() => {
    fetchWeather('London');
  }, []);

  return (
    <div className="weather-container">
      <h1>Weather App</h1>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        if (city.trim()) {
          fetchWeather(city);
        }
      }}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button type="submit">Search</button>
      </form>
      
      <div className="unit-toggle">
        <button 
          onClick={() => setUnit('C')} 
          className={unit === 'C' ? 'active' : ''}
        >
          °C
        </button>
        <button 
          onClick={() => setUnit('F')} 
          className={unit === 'F' ? 'active' : ''}
        >
          °F
        </button>
      </div>
      
      <button onClick={handleGeolocation} className="geo-btn">
        Use My Location
      </button>

      {loading && <p>Loading weather data...</p>}
      {error && <p className="error">{error}</p>}

      {weatherData && (
        <>
          <div className="weather-display">
            <h2>{weatherData.current.name}, {weatherData.current.sys.country}</h2>
            <div className="weather-main">
              {getWeatherIcon(weatherData.current.weather[0].main)}
              <span className="temp">
                {Math.round(weatherData.current.main.temp)}°{unit}
              </span>
            </div>
            <p className="weather-desc">
              {weatherData.current.weather[0].description}
            </p>
            <div className="weather-details">
              <p>Humidity: {weatherData.current.main.humidity}%</p>
              <p>Wind: {weatherData.current.wind.speed} {unit === 'C' ? 'm/s' : 'mph'}</p>
              <p>Feels like: {Math.round(weatherData.current.main.feels_like)}°{unit}</p>
            </div>
          </div>
          
          <Forecast forecast={weatherData.forecast} unit={unit} />
        </>
      )}
      
      {searchHistory.length > 0 && (
        <div className="search-history">
          <h4>Recent Searches:</h4>
          <ul>
            {searchHistory.map((item, index) => (
              <li key={index} onClick={() => fetchWeather(item)}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Weather;