function formatarDataCompleta(isoString) {
  const data = new Date(isoString);
  const opcoes = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  return data.toLocaleString("pt-BR", opcoes);
}

function obterIconeClima(weathercode) {
  const mapa = {
    0: "wi-day-sunny",
    1: "wi-day-sunny-overcast",
    2: "wi-day-cloudy",
    3: "wi-cloudy",
    45: "wi-fog",
    48: "wi-fog",
    51: "wi-sprinkle",
    53: "wi-showers",
    55: "wi-rain",
    61: "wi-rain",
    63: "wi-rain-wind",
    65: "wi-rain-mix",
    71: "wi-snow",
    73: "wi-snow-wind",
    75: "wi-snowflake-cold",
    95: "wi-thunderstorm",
    96: "wi-storm-showers",
    99: "wi-thunderstorm"
  };
  return mapa[weathercode] || "wi-na";
}

function ajustarFundo(isDay) {
  if (!modoEscuroAtivo) {
    document.body.classList.remove("day", "night");
    document.body.classList.add(isDay ? "day" : "night");
  }
}

function verificarCache(chave) {
  const cache = localStorage.getItem(chave);
  if (!cache) return null;

  const { timestamp, dados } = JSON.parse(cache);
  const agora = Date.now();
  const expiracao = 30 * 60 * 1000;
  return agora - timestamp < expiracao ? dados : null;
}

function salvarCache(chave, dados) {
  const pacote = {
    timestamp: Date.now(),
    dados
  };
  localStorage.setItem(chave, JSON.stringify(pacote));
}

function exibirClima(dados) {
  const resultado = document.getElementById("resultado");
  ajustarFundo(dados.is_day);
  resultado.innerHTML = `
    <h2>${dados.name}, ${dados.country}</h2>
    <p>${dados.dataHora}</p>
    <i class="wi ${dados.icone}"></i>
    <p>🌡️ Temperatura: ${dados.clima.temperature}°C</p>
    <p>💨 Vento: ${dados.clima.windspeed} km/h</p>
    <hr>
    <h3>📅 Previsão para os próximos 5 dias:</h3>
    <div class="previsao-container">
      ${dados.previsao
        .map(
          (dia) => `
        <div class="card-dia">
          <strong>${dia.data}</strong>
          <p>☀️ Máx: ${dia.max}°C</p>
          <p>❄️ Mín: ${dia.min}°C</p>
          <p>🌧️ Precipitação: ${dia.precipitacao} mm</p>
          <p>💧 Umidade: ${dia.umidade}%</p>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

async function getWeather(city) {
  const resultado = document.getElementById("resultado");
  try {
    const cacheKey = `clima-${city.toLowerCase()}`;
    const dadosCache = verificarCache(cacheKey);
    if (dadosCache) {
      exibirClima(dadosCache);
      return;
    }

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("Cidade não encontrada.");
    }

    const { name, country, latitude, longitude } = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,relative_humidity_2m_max&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    const clima = weatherData.current_weather;
    const icone = obterIconeClima(clima.weathercode);
    const dataHora = formatarDataCompleta(clima.time);
