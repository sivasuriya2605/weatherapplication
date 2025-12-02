// ---------------- LIVE CLOCK ----------------
function startClock() {
  const clock = document.getElementById("clock");
  function update() {
    const now = new Date();
    clock.innerText = now.toLocaleTimeString("en-IN", { hour12: true });
  }
  update();
  setInterval(update, 1000);
}

// ---------------- CITY DATA ----------------
const cities = {
  // --- Tamil Nadu ---
  chennai: { lat: 13.0827, lon: 80.2707 },
  coimbatore: { lat: 11.0168, lon: 76.9558 },
  madurai: { lat: 9.9252, lon: 78.1198 },
  tiruchirappalli: { lat: 10.7905, lon: 78.7047 },
  trichy: { lat: 10.7905, lon: 78.7047 },
  salem: { lat: 11.6643, lon: 78.1460 },
  tirunelveli: { lat: 8.7139, lon: 77.7567 },
  thoothukudi: { lat: 8.7642, lon: 78.1348 },
  vellore: { lat: 12.9165, lon: 79.1325 },
  erode: { lat: 11.3410, lon: 77.7172 },
  dindigul: { lat: 10.3673, lon: 77.9803 },
  kumbakonam: { lat: 10.9601, lon: 79.3845 },
  karaikudi: { lat: 10.0730, lon: 78.7717 },
  nagapattinam: { lat: 10.7672, lon: 79.8449 },
  thiruvarur: { lat: 10.7726, lon: 79.6360 },

  // --- Popular Indian Cities ---
  delhi: { lat: 28.7041, lon: 77.1025 },
  mumbai: { lat: 19.0760, lon: 72.8777 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
  bangalore: { lat: 12.9716, lon: 77.5946 },
  hyderabad: { lat: 17.3850, lon: 78.4867 },
  pune: { lat: 18.5204, lon: 73.8567 },
  ahmedabad: { lat: 23.0225, lon: 72.5714 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  chandigarh: { lat: 30.7333, lon: 76.7794 },
  lucknow: { lat: 26.8467, lon: 80.9462 },
  bhopal: { lat: 23.2599, lon: 77.4126 },
  patna: { lat: 25.5941, lon: 85.1376 },
  surat: { lat: 21.1702, lon: 72.8311 },
  nagpur: { lat: 21.1458, lon: 79.0882 }
};

// ---------------- HELP TEXT ----------------
function showHelp() {
  const help = document.getElementById("help");
  help.innerHTML = `<b>Try:</b> Chennai, Coimbatore, Madurai, Trichy, Delhi, Mumbai, Bangalore`;
}

function findNearestHourIndex(timeArray) {
  const nowMs = Date.now();
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < timeArray.length; i++) {
    const t = Date.parse(timeArray[i]);
    if (isNaN(t)) continue;
    const diff = Math.abs(t - nowMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}
async function getWeather() {
  const input = document.getElementById("city");
  const result = document.getElementById("result");
  const cityNameRaw = input.value.toLowerCase().trim();

  if (!cityNameRaw) {
    result.innerHTML = "Please enter a city name (e.g. Chennai).";
    return;
  }

  if (!cities[cityNameRaw]) {
    
    result.innerHTML = `
      <b>City not found.</b><br>
      Try with main cities<br>
      (Make sure your input spelling is correct)
    `;
    return;
  }

  result.innerHTML = "Loading weather...";

  const { lat, lon } = cities[cityNameRaw];

  // timezone=auto ensures times are returned in local timezone for that lat/lon
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,rain&timezone=auto`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Network response was not OK");

    const data = await resp.json();

    if (!data.hourly || !data.hourly.time) {
      result.innerHTML = "Weather data not available for this location.";
      return;
    }

    const times = data.hourly.time; 
    const temps = data.hourly.temperature_2m || [];
    const rains = data.hourly.rain || [];

    const idx = findNearestHourIndex(times);

    const timeText = times[idx] ? times[idx].replace("T", " ") : "N/A";
    const tempNow = (typeof temps[idx] !== "undefined") ? temps[idx] : "N/A";
    const rainNow = (typeof rains[idx] !== "undefined") ? rains[idx] : "N/A";

    const displayCity = cityNameRaw.charAt(0).toUpperCase() + cityNameRaw.slice(1);

    result.innerHTML = `
      <h3>${displayCity}</h3>
      <p><b>Time:</b> ${timeText}</p>
      <p>🌡 <b>Temperature:</b> ${tempNow} °C</p>
      <p>🌧 <b>Rain (last hour):</b> ${rainNow} mm</p>
    `;
  } catch (err) {
    console.error(err);
    result.innerHTML = "Error fetching weather. Check your internet connection.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  startClock();
  showHelp();

  const btn = document.getElementById("getBtn");
  btn.addEventListener("click", getWeather);

//   for enter 
  const input = document.getElementById("city");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") getWeather();
  });
});
