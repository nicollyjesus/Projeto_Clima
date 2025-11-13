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

async function getWeather(city) {
  const resultado = document.getElementById("resultado");
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("Cidade não encontrada.");
    }

    const { name, country, latitude, longitude } = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    const clima = weatherData.current_weather;
    const icone = obterIconeClima(clima.weathercode);
    const dataHora = formatarDataCompleta(clima.time);

    ajustarFundo(clima.is_day);

    resultado.innerHTML = `
      <h2>${name}, ${country}</h2>
      <p>${dataHora}</p>
      <i class="wi ${icone}"></i>
      <p>🌡️ Temperatura: ${clima.temperature}°C</p>
      <p>💨 Vento: ${clima.windspeed} km/h</p>
    `;
  } catch (erro) {
    resultado.innerHTML = `<p style="color:red;">Erro: ${erro.message}</p>`;
  }
}

document.getElementById("weather-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const city = document.getElementById("city-input").value.trim();
  if (city) {
    document.getElementById("resultado").innerHTML = "🔄 Buscando...";
    getWeather(city);
  } else {
    document.getElementById("resultado").innerHTML = "Por favor, digite o nome de uma cidade.";
  }
});

// Alternância manual de tema
const toggleBtn = document.getElementById("toggle-theme");
let modoEscuroAtivo = false;

toggleBtn.addEventListener("click", () => {
  modoEscuroAtivo = !modoEscuroAtivo;
  document.body.classList.remove("day", "night");
  document.body.classList.add(modoEscuroAtivo ? "night" : "day");
  toggleBtn.textContent = modoEscuroAtivo ? "☀️ Voltar para modo claro" : "🌙 Ativar modo escuro";
});
