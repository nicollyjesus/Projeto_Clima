// Formata data e hora completa (ex: segunda-feira, 13 de outubro de 2025, 15:00)
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

// Mapeia códigos de clima para ícones da biblioteca Weather Icons
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

// Altera o fundo da página com base no horário (dia/noite)
function ajustarFundo(isDay) {
  document.body.classList.remove("day", "night");
  document.body.classList.add(isDay ? "day" : "night");
}

// Função principal que busca clima com base no nome da cidade
async function getWeather(city) {
  const resultado = document.getElementById("resultado");
  try {
    // Etapa 1: Geocodificação
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("Cidade não encontrada.");
    }

    const { name, country, latitude, longitude } = geoData.results[0];

    // Etapa 2: Consulta de clima
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    const clima = weatherData.current_weather;
    const icone = obterIconeClima(clima.weathercode);
    const dataHora = formatarDataCompleta(clima.time);

    // Ajusta fundo com base no horário
    ajustarFundo(clima.is_day);

    // Exibe os dados na tela
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

// Evento do formulário
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
