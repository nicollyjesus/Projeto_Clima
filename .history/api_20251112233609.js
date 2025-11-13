let modoEscuroAtivo = false;

document.getElementById("toggle-theme").addEventListener("click", () => {
  modoEscuroAtivo = !modoEscuroAtivo;
  document.body.classList.toggle("night", modoEscuroAtivo);
});

document.getElementById("weather-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("city-input").value.trim();
  if (!city) return;

  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "🔄 Buscando...";

  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) throw new Error("Cidade não encontrada.");

    const { latitude, longitude, name, country } = geoData.results[0];
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max&timezone=auto`);
    const weatherData = await weatherRes.json();

    const clima = weatherData.current_weather;
    const dias = weatherData.daily.time.slice(0, 5).map((data, i) => ({
      data,
      max: weatherData.daily.temperature_2m_max[i],
      min: weatherData.daily.temperature_2m_min[i],
      chuva: weatherData.daily.precipitation_sum[i],
      umidade: weatherData.daily.relative_humidity_2m_max[i]
    }));

    resultado.innerHTML = `
      <div class="clima-card">
        <div class="clima-info">
          <i class="wi wi-cloudy"></i>
          <div class="temperatura">