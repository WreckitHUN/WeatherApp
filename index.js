async function getWeather(city) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=c45a39ddfbab4f37aca140445240806&q=${city}&days=3`);
        if (!response.ok) {
            // If the response is not OK, parse the error message and throw it
            const errorResponse = await response.json();
            throw new Error(`${errorResponse.error.message}`);
        }
        const data = await response.json();
        console.log(data);
        return createWeatherObject(data);
    } catch (error) {
        // This will return API error message
        return error.message;
    }
}

const createWeatherObject = (data) => {
    const { current, forecast, location } = data;
    const tzId = location.tz_id;
    // Get the current date and time in the specified timezone
    const nowInTz = new Date(new Date().toLocaleString('en-US', { timeZone: tzId }));
    // Extract the hour without leading zeros
    const nowHour = nowInTz.getHours();
    // Format the date as "Today, Jun 24"
    const optionsDate = { month: 'short', day: 'numeric'};
    const today_date = `Today, ${nowInTz.toLocaleDateString('en-US', optionsDate)}`;

    // Function to create hourly forecast
    const createHourlyForecast = (dayIndex) => {
        return Array.from({ length: 24 }, (_, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            icon: forecast.forecastday[dayIndex].hour[hour].condition.icon,
            temp_c: Math.round(forecast.forecastday[dayIndex].hour[hour].temp_c)
        }));
    };

    // Create forecasts for today, tomorrow, and the day after tomorrow
    const todayForecast = createHourlyForecast(0);
    const tomorrowForecast = createHourlyForecast(1);
    const afterTomorrowForecast = createHourlyForecast(2);

    return {
        current: {
            city_name: location.name,
            today_date,
            chance_of_rain: forecast.forecastday[0].hour[nowHour].chance_of_rain,
            cloud: current.cloud,
            icon: current.condition.icon,
            condition: current.condition.text,
            temp_c: Math.round(current.temp_c)
        },
        today: todayForecast,
        tomorrow: tomorrowForecast,
        after_tomorrow: afterTomorrowForecast
    };
};

const searchCity = (city) => {
    // Loading screen
    const loading = document.querySelector(".loading");
    loading.showModal();
    setTimeout(() => loading.close(), 5000);
    getWeather(city)
    .then((data) => {
        if (typeof data === "string"){
            console.log(data);
            return;
        }
        loading.close();
        console.log(data);
        updateContainer(data);
    });
}
const updateContainer = async (city) => {
    // Get the DOM elements
    const placeName = document.querySelector(".placeName");
    const date = document.querySelector(".date");
    const conditionIcon = document.querySelector(".conditionIcon");
    const conditionText = document.querySelector(".conditionText");
    const weatherTemp = document.querySelector(".weatherTemp");
    const chanceRain = document.querySelector(".chanceRain");
    
    placeName.textContent = city.current.city_name === "Balmazújvárosi" ? "Balmazújváros" : city.current.city_name;
    date.textContent = city.current.today_date;
    conditionIcon.src = await city.current.icon;
    conditionText.textContent = city.current.condition;
    weatherTemp.textContent = `${city.current.temp_c} °C`;
    chanceRain.textContent = `${city.current.chance_of_rain} %`;
}

searchCity("Balmazújváros");