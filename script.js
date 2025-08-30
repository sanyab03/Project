// Configuration
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNoYW4xMzMiLCJhIjoiY21leDV0dzNqMGQwdTJrczdtYTI3YTd3dCJ9.nWZ7_QLgUrjHt6SaVVCvhA';
const API_BASE_URL = 'http://localhost:5000'; 

// Initialize Mapbox
mapboxgl.accessToken = MAPBOX_TOKEN;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [78.9629, 20.5937],
  zoom: 3,
  projection: 'mercator'
});

// Add controls
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());

// Elements
const infoPanel = document.getElementById('infoPanel');
const infoPanelContent = document.getElementById('infoPanelContent');
const statusIndicator = document.getElementById('statusIndicator');

// Store clicked points
const clickedPoints = [];

// Track the current marker and popup (only one at a time)
let currentMarker = null;
let currentPopup = null;

// Utility functions
function updateStatus(message, isLoading = false) {
  statusIndicator.textContent = message;
  if (isLoading) statusIndicator.classList.add('pulse');
  else statusIndicator.classList.remove('pulse');
}

function closeInfoPanel() {
  infoPanel.classList.remove('show');
}

function showInfoPanel(content) {
  infoPanelContent.innerHTML = content;
  infoPanel.classList.add('show');
}

function formatWindDirection(degrees) {
  if (degrees === 'N/A') return 'N/A';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return `${directions[index]} (${degrees}°)`;
}

function getWeatherEmoji(condition) {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('clear')) return '☀️';
  if (conditionLower.includes('cloud')) return '☁️';
  if (conditionLower.includes('rain')) return '🌧️';
  if (conditionLower.includes('snow')) return '❄️';
  if (conditionLower.includes('thunder')) return '⛈️';
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️';
  return '🌤️';
}

map.on('click', async (e) => {
  const lat = e.lngLat.lat.toFixed(4);
  const lng = e.lngLat.lng.toFixed(4);

  clickedPoints.push({ lat: parseFloat(lat), lng: parseFloat(lng), timestamp: new Date() });
  updateStatus('Fetching weather data...', true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/weather-location?lat=${lat}&lng=${lng}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    const { weather, location, coordinates: coords } = data;
    const weatherEmoji = getWeatherEmoji(weather.condition);
    const windDir = formatWindDirection(weather.wind_direction);

    showInfoPanel(`
      <div class="location-info">
        <div class="location-name">${location.place}</div>
        <div>${location.state}, ${location.country}</div>
        <div class="coordinates">📍 ${coords.lat}°, ${coords.lng}°</div>
      </div>
      
      <div class="weather-grid">
        <div class="weather-item temperature-main">
          <div class="weather-label">Temperature</div>
          <div class="weather-value">${weatherEmoji} ${weather.temperature}°C</div>
        </div>
        <div class="weather-item">
          <div class="weather-label">Feels Like</div>
          <div class="weather-value">${weather.feels_like}°C</div>
        </div>
        <div class="weather-item">
          <div class="weather-label">Humidity</div>
          <div class="weather-value">${weather.humidity}%</div>
        </div>
        <div class="weather-item">
          <div class="weather-label">Wind</div>
          <div class="weather-value">${weather.wind_speed} m/s</div>
        </div>
        <div class="weather-item">
          <div class="weather-label">Direction</div>
          <div class="weather-value">${windDir}</div>
        </div>
        <div class="weather-item">
          <div class="weather-label">Pressure</div>
          <div class="weather-value">${weather.pressure} hPa</div>
        </div>
        <div class="weather-item">
          <div class="weather-label">Visibility</div>
          <div class="weather-value">${Math.round(weather.visibility / 1000)} km</div>
        </div>
        <div class="weather-item">
          <div class="weather-label">Clouds</div>
          <div class="weather-value">${weather.clouds}%</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 10px; padding: 10px; background: rgba(103, 126, 234, 0.1); border-radius: 8px;">
        <strong>${weather.condition}</strong>
      </div>
    `);

    // Remove old marker & popup if they exist
    if (currentMarker) currentMarker.remove();
    if (currentPopup) currentPopup.remove();

    // Add new marker
    currentMarker = new mapboxgl.Marker({ color: '#667eea', scale: 0.8 })
      .setLngLat(e.lngLat)
      .addTo(map);

    // Add new popup
    currentPopup = new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(e.lngLat)
      .setHTML(`
        <div class="popup-location"><strong>${location.place}</strong></div>
        <div style="color: #666; font-size: 12px; margin-bottom: 8px;">${location.state}, ${location.country}</div>
        <div class="popup-weather">
          <span class="popup-temp">${weatherEmoji} ${weather.temperature}°C</span>
        </div>
        <div style="font-size: 12px; color: #666;">${weather.condition}</div>
      `)
      .addTo(map);

    updateStatus(`Showing weather for ${location.place}`);
    console.log('Weather data:', data);
    console.log('All clicked points:', clickedPoints);

  } catch (error) {
    console.error('Error fetching weather data:', error);
    showInfoPanel(`
      <div class="error">
        <strong>⚠️ Error</strong><br>
        Failed to fetch weather data for this location.<br>
        <small>${error.message}</small>
      </div>
    `);
    updateStatus('Error fetching data');
  }
});

// Map events
map.on('load', () => {
  updateStatus('Map loaded - Click anywhere to explore!');
  map.getCanvas().style.filter = 'contrast(1.1) brightness(1.05)';
});

map.on('movestart', () => updateStatus('Moving map...'));
map.on('moveend', () => updateStatus('Ready to explore'));
map.on('mouseenter', () => map.getCanvas().style.cursor = 'crosshair');
map.on('mouseleave', () => map.getCanvas().style.cursor = '');

// Keyboard
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeInfoPanel(); });

// Backend health check
window.addEventListener('load', async () => {
  try {
    const healthCheck = await fetch(`${API_BASE_URL}/health`, { timeout: 5000 });
    if (!healthCheck.ok) throw new Error('Backend not responding');
    updateStatus('Connected to weather service ✓');
  } catch (error) {
    updateStatus('⚠️ Backend connection failed - Check if API server is running');
    console.error('Backend connection error:', error);
  }
});
