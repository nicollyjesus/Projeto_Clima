/**
 * @fileoverview Funções para buscar e exibir dados meteorológicos usando a API Open-Meteo.
 */

/**
 * Formata uma data ISO em formato legível com dia da semana, data e hora.
 *
 * @param {string} isoString - Data em formato ISO 8601.
 * @returns {string} Data formatada em português.
 * @example
 * formatarDataCompleta("2025-10-08T15:00") // "quarta-feira, 8 de outubro de 2025, 15:00"
 */
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

/**
 * Retorna o nome do ícone correspondente ao código de clima da API Open-Meteo.
 *
 * @param {number} weathercode - Código numérico do clima.
 * @returns {string} Nome da classe do ícone da biblioteca Weather Icons.
 * @example
 * obterIconeClima(0) // "wi-day-sunny"
 */
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

/**
 * Altera o fundo da página com base no horário (dia ou noite), exceto se o modo escuro estiver ativado.
 *
 * @param {boolean} isDay - Indica se é dia (true) ou noite (false).
 */
function ajustarFundo(isDay) {
  if (!modoEscuroAtivo) {
    document.body.classList.remove("day", "night");
    document.body.classList.add(isDay ? "day" : "night");
  }
}

/**
 * Busca dados meteorológicos atuais de uma cidade usando a API Open-Meteo.
 *
 * @async
 * @param {string} city - Nome da cidade a ser consultada.
 * @returns {Promise<void>} Atualiza o DOM com os dados do clima.
 * @throws {Error} Se a cidade não for encontrada ou houver falha de rede.
 * @example
 * getWeather("São Paulo");
 */
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
    resultado