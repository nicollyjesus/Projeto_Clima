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
          <div class="temperatura">${clima.temperature}°</div>
        </div>
        <div class="local-info">
          <h3>${name}, ${country}</h3>
          <p>${new Date(clima.time).toLocaleString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div class="detalhes">
          <div class="box">
            <span>💧 Umidade</span>
            <strong>${dias[0].umidade}%</strong>
          </div>
          <div class="box">
            <span>💨 Vento</span>
            <strong>${clima.windspeed} km/h</strong>
          </div>
          <div class="box">
            <span>🌧️ Precipitação</span>
            <strong>${dias[0].chuva} mm</strong>
          </div>
        </div>
      </div>
      <h3>📅 Previsão para os próximos 5 dias:</h3>
      <div class="previsao-container">
        ${dias.map(d => `
          <div class="card-dia">
            <strong>${d.data}</strong>
            <p>Máx: ${d.max}°C</p>
            <p>Mín: ${d.min}°C</p>
            <p>🌧️ ${d.chuva} mm</p>
            <p>💧 ${d.umidade}%</p>
          </div>
        `).join("")}
      </div>
    `;
  } catch (err) {
    resultado.innerHTML = `<p style="color:red;">Erro: ${err.message}</p>`;
  }
});
