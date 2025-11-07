// Weather API Configuration
const API_KEY = '48389d8a1692427396c155615250711';
const API_BASE = 'https://api.weatherapi.com/v1';

// Helper function to get day name from date string
function getDayName(dateStr) {
    const date = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

// Helper function to get formatted date
function getFormattedDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
}

// Helper function to get wind direction from degree
function getWindDirection(degree) {
    const directions = ['North', 'NNE', 'NE', 'ENE', 'East', 'ESE', 'SE', 'SSE',
        'South', 'SSW', 'SW', 'WSW', 'West', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degree / 22.5) % 16; //(el formula deh 3shan te7awel degree le index fe array el directions)
    return directions[index];
}

// Fetch weather data from API
async function fetchWeather(city) {
    try {
        const response = await fetch(
            `${API_BASE}/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no`
        );

        if (!response.ok) {
            throw new Error('Location not found');
        }

        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        alert('City not found. Please try again.');
    }
}

// Display weather data on UI
function displayWeather(data) {
    const location = data.location;
    const current = data.current;
    const forecast = data.forecast.forecastday;

    let html = '';

    // Today's weather (el card el kbeera)
    const todayData = forecast[0];
    const todayMaxTemp = todayData.day.maxtemp_c;
    const todayCondition = todayData.day.condition.text;
    const todayIcon = todayData.day.condition.icon;
    const todayChanceRain = todayData.day.daily_chance_of_rain;
    const todayWindKph = todayData.day.maxwind_kph;

    html += `
        <div class="today forecast col-lg-4 col-md-6 col-12 p-3 bg-dark border-end border-secondary">
            <div class="forecast-header">
                <div class="row align-items-center mb-2">
                    <div class="col">${getDayName(todayData.date)}</div>
                    <div class="col text-end">${getFormattedDate(todayData.date)}</div>
                </div>
            </div>
            <div class="forecast-content text-start">
                <div class="location fs-5 fw-normal mb-3">${location.name}, ${location.country}</div>
                <div class="degree d-flex align-items-center gap-3 mb-3">
                    <div class="num fs-1 fw-bold">${todayMaxTemp.toFixed(1)}<sup>o</sup>C</div>
                    <div class="forecast-icon">
                        <img src="https:${todayIcon}" alt="${todayCondition}" width="90">
                    </div>
                </div>
                <div class="custom text-info mb-3">${todayCondition}</div>
                <div class="d-flex flex-column gap-2 small">
                    <span><img src="img/icon-umberella@2x.png" alt="" width="21" height="21" class="me-2">${Math.round(todayChanceRain)}%</span>
                    <span><img src="img/icon-wind@2x.png" alt="" width="23" height="21" class="me-2">${todayWindKph.toFixed(1)}km/h</span>
                    <span><img src="img/icon-compass@2x.png" alt="" width="21" height="21" class="me-2">${getWindDirection(current.wind_degree)}</span>
                </div>
            </div>
        </div>
    `;

    // Next two days (cards 8albana shwaya)
    for (let i = 1; i < 3 && i < forecast.length; i++) {
        const dayData = forecast[i];
        const maxTemp = dayData.day.maxtemp_c;
        const minTemp = dayData.day.mintemp_c;
        const condition = dayData.day.condition.text;
        const icon = dayData.day.condition.icon;
        const bgClass = i === 1 ? 'bg-secondary' : 'bg-dark';

        html += `
            <div class="forecast col-lg-4 col-md-6 col-12 p-3 ${bgClass} text-center border-end border-secondary">
                <div class="forecast-header">
                    <div class="day fw-bold">${getDayName(dayData.date)}</div>
                </div>
                <div class="forecast-content">
                    <div class="forecast-icon mb-2">
                        <img src="https:${icon}" alt="${condition}" width="48">
                    </div>
                    <div class="degree fs-5 fw-bold text-white">${maxTemp.toFixed(1)}<sup>o</sup>C</div>
                    <small class="text-muted">${minTemp.toFixed(1)}<sup>o</sup></small>
                    <div class="custom text-info mt-2">${condition}</div>
                </div>
            </div>
        `;
    }

    document.getElementById('forecast').innerHTML = html;
}

// Get user's geolocation and fetch weather (Searched google )
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeather(`${lat},${lon}`);
            },
            (error) => {
                console.log('Geolocation error:', error);
                // Default to Cairo if geolocation fails
                fetchWeather('Cairo');
            }
        );
    } else {
        // Default to Cairo if geolocation not supported
        console.log('Geolocation not supported');
        fetchWeather('Cairo');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load weather based on user location or default
    getUserLocation();

    // Search functionality
    const searchInput = document.getElementById('search');
    const submitBtn = document.getElementById('submit');

    // Real-time search on input (searched google )
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const city = e.target.value.trim();
        
        if (city.length > 2) {
            searchTimeout = setTimeout(() => {
                fetchWeather(city);
            }, 500); // 500ms delay to avoid too many API calls
        }
    });

    // Also keep the button click for immediate search
    submitBtn.addEventListener('click', () => {
        clearTimeout(searchTimeout);
        const city = searchInput.value.trim();
        if (city) {
            fetchWeather(city);
            searchInput.value = '';
        }
    });

    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(searchTimeout);
            const city = searchInput.value.trim();
            if (city) {
                fetchWeather(city);
                searchInput.value = '';
            }
        }
    });
});
