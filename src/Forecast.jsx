function Forecast({ forecast, unit }) {
    // Group forecast by day
    const dailyForecast = forecast.list.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
  
    // Convert to array and skip today
    const forecastDays = Object.entries(dailyForecast).slice(1, 6);
  
    return (
      <div className="forecast-container">
        <h3>5-Day Forecast</h3>
        <div className="forecast-days">
          {forecastDays.map(([date, items]) => {
            const dayTemp = items[0].main.temp;
            const nightTemp = items[items.length - 1].main.temp;
            const icon = items[Math.floor(items.length / 2)].weather[0].icon;
            
            return (
              <div key={date} className="forecast-day">
                <p>{new Date(date).toLocaleDateString([], { weekday: 'short' })}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                  alt={items[0].weather[0].description}
                />
                <div className="forecast-temps">
                  <span>{Math.round(dayTemp)}°{unit}</span>
                  <span className="forecast-night">{Math.round(nightTemp)}°{unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  export default Forecast;