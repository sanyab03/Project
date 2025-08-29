// const map = document.getElementById("worldMap");
// const popup = document.getElementById("popup");

// map.addEventListener("click", function(event) {
//   const rect = map.getBoundingClientRect();
//   const x = event.clientX - rect.left; 
//   const y = event.clientY - rect.top;

//   // Position popup near the click
//   popup.style.left = x + "px";
//   popup.style.top = y + "px";

//   // Show popup with placeholder data
//   popup.style.display = "block";

//   // Optional: update random weather info for demo
//   const temps = [22, 25, 28, 30, 18, 15];
//   const conditions = ["Sunny ☀️", "Cloudy ☁️", "Rainy 🌧️", "Stormy ⛈️", "Snowy ❄️"];
//   const humidity = Math.floor(Math.random() * 40) + 40;

//   popup.innerHTML = `
//     <h3>Weather Info</h3>
//     <p><strong>Temperature:</strong> ${temps[Math.floor(Math.random()*temps.length)]}°C</p>
//     <p><strong>Condition:</strong> ${conditions[Math.floor(Math.random()*conditions.length)]}</p>
//     <p><strong>Humidity:</strong> ${humidity}%</p>
//   `;
// });



const map = document.getElementById("worldMap");
const popup = document.getElementById("popup");
const closeBtn = document.getElementById("closeBtn");

map.addEventListener("click", function(event) {
  const rect = map.getBoundingClientRect();
  const x = event.clientX - rect.left; 
  const y = event.clientY - rect.top;

  // Position popup near the click
  popup.style.left = x + "px";
  popup.style.top = y + "px";

  // Show popup
  popup.style.display = "block";

  // Random demo weather data
  const temps = [22, 25, 28, 30, 18, 15];
  const conditions = ["Sunny ☀️", "Cloudy ☁️", "Rainy 🌧️", "Stormy ⛈️", "Snowy ❄️"];
  const humidity = Math.floor(Math.random() * 40) + 40;

  popup.innerHTML = `
    <button class="close-btn" id="closeBtn">&times;</button>
    <h3>Weather Info</h3>
    <p><strong>Temperature:</strong> ${temps[Math.floor(Math.random()*temps.length)]}°C</p>
    <p><strong>Condition:</strong> ${conditions[Math.floor(Math.random()*conditions.length)]}</p>
    <p><strong>Humidity:</strong> ${humidity}%</p>
  `;

  // Re-attach close event (since innerHTML replaced button)
  document.getElementById("closeBtn").addEventListener("click", () => {
    popup.style.display = "none";
  });
});

// Extra: close popup when clicking outside map popup
document.addEventListener("click", function(event) {
  if (popup.style.display === "block" && !popup.contains(event.target) && event.target !== map) {
    popup.style.display = "none";
  }
});
