async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ro&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Eroare geocoding");
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error("Orașul nu a fost găsit");
  const { latitude, longitude, name, country } = data.results[0];
  return { lat: latitude, lon: longitude, name, country };
}
// 2) Ia vremea curentă pe baza coordonatelor
async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Eroare la preluarea vremii");
  const data = await res.json();
  return data.current; // { time, temperature_2m, wind_speed_10m, relative_humidity_2m }
}
// 3) Leagă formularul de căutare
const form = document.getElementById("weatherForm");
const input = document.getElementById("cityInput");
const result = document.getElementById("result");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return;
  result.innerHTML = `<div class="muted">Se caută vremea pentru <b>${city}</b>…</div>`;
  try {
    const { lat, lon, name, country } = await geocodeCity(city);
    const current = await getWeather(lat, lon);
    renderWeather({ cityDisplay: `${name}, ${country}`, current });
  } catch (err) {
    result.innerHTML = `<div class="card bad">Eroare: ${err.message}</div>`;
  }
});
// 4) Afișează rezultatul într-un card
function renderWeather({ cityDisplay, current }) {
  const t = Math.round(current.temperature_2m);
  const w = Math.round(current.wind_speed_10m);
  const h = Math.round(current.relative_humidity_2m);
  const when = new Date(current.time).toLocaleString();

  result.innerHTML = `
    <div class="card">
      <div class="row">
        <div class="big">${t}°C</div>
        <div>
          <div><strong>${cityDisplay}</strong></div>
          <div class="muted">umiditate: ${h}% · vânt: ${w} km/h</div>
        </div>
      </div>
      <div class="muted">actualizat: ${when}</div>
    </div>
  `;
}
