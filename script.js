mapboxgl.accessToken = 'pk.eyJ1IjoiaXNoYW4xMzMiLCJhIjoiY21leDV0dzNqMGQwdTJrczdtYTI3YTd3dCJ9.nWZ7_QLgUrjHt6SaVVCvhA';
const OPENWEATHER_KEY = "b5353a7c0d55517a14d818a4881a0b49";

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [78.9629, 20.5937], // India
  zoom: 3
});

const infoDiv = document.getElementById('info');

// Store clicked coordinates
const clickedPoints = [];

map.on('click', async (e) => {
  const lat = e.lngLat.lat.toFixed(4);
  const lng = e.lngLat.lng.toFixed(4);

  // Store in array
  clickedPoints.push({ lat, lng });

  try {
    // 1. Reverse geocode (Mapbox)
    const geoResponse = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
    );
    const geoData = await geoResponse.json();

    let place = "", state = "", country = "";
    if (geoData.features.length > 0) {
      geoData.features.forEach(feature => {
        if (feature.place_type.includes("place")) place = feature.text;
        if (feature.place_type.includes("region")) state = feature.text;
        if (feature.place_type.includes("country")) country = feature.text;
      });
    }

    // 2. Fetch Weather from OpenWeather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_KEY}&units=metric`
    );
    const weatherData = await weatherResponse.json();

    const temperature = weatherData.main?.temp || "N/A";
    const condition = weatherData.weather?.[0]?.description || "N/A";

    // 3. Update info div
    infoDiv.innerHTML = `
      Coordinates: Lat ${lat}, Lng ${lng} |
      Place: ${place || "N/A"} | State: ${state || "N/A"} | Country: ${country || "N/A"} |
      🌡️ Temp: ${temperature}°C | ☁️ Condition: ${condition}
    `;

    // 4. Add popup
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <b>${place || "Unknown Place"}</b><br>
        ${state}, ${country}<br>
        🌡️ ${temperature}°C<br>
        ☁️ ${condition}
      `)
      .addTo(map);

    console.log("Clicked Points Array:", clickedPoints);

  } catch (err) {
    console.error("Error fetching data:", err);
    infoDiv.innerHTML = "Error fetching location/weather info!";
  }
});
