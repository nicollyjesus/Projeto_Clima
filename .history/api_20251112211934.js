/**
 * Verifica se há dados em cache para a cidade e se ainda são válidos.
 *
 * @param {string} city - Nome da cidade.
 * @returns {Object|null} Dados do clima ou null se inválido.
 */
function verificarCache(city) {
  const cache = localStorage.getItem(city.toLowerCase());
  if (!cache) return null;

  const { timestamp, dados } = JSON.parse(cache);
  const agora = Date.now();
  const expiracao = 30 * 60 * 1000; // 30 minutos

  return agora - timestamp < expiracao ? dados : null;
}

/**
 * Salva os dados meteorológicos no cache.
 *
 * @param {string} city - Nome da cidade.
 * @param {Object} dados - Dados meteorológicos.
 */
function salvarCache(city, dados) {
  const pacote = {
    timestamp: Date.now(),
    dados
  };
  localStorage.setItem(city.toLowerCase(), JSON.stringify(pacote));
}

async function getWeather(city) {
  const resultado = document.getElementById("resultado");
  try {
    const dadosCache = verificarCache(city);
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

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    const clima = weatherData.current_weather;
    const icone = obterIconeClima(clima.weathercode);
    const dataHora = formatarDataCompleta(clima.time);

    const dados = {
      name,
      country,
      clima,
      icone,
      dataHora,
      is_day: clima.is_day
    };

    salvarCache(city, dados);
    exibirClima(dados);
  } catch (erro) {
    resultado.innerHTML = `<p style="color:red;">Erro: ${erro.message}</p>`;
  }
}

/**
 * Exibe os dados meteorológicos no DOM.
 *
 * @param {Object} dados - Dados meteorológicos.
 */
function exibirClima(dados) {
  const resultado = document.getElementById("resultado");
  ajustarFundo(dados.is_day);
  resultado.innerHTML = `
    <h2>${dados.name}, ${dados.country}</h2>
    <p>${dados.dataHora}</p>
    <i class="wi ${dados.icone}"></i>
    <p>🌡️ Temperatura: ${dados.clima.temperature}°C</p>
    <p>💨 Vento: ${dados.clima.windspeed} km/h</p>
  `;
}
