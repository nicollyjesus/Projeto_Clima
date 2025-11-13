/**
 * @fileoverview Script para buscar e exibir dados meteorológicos atuais e previsão de 5 dias com cache.
 */

/**
 * Formata uma data ISO em formato legível com dia da semana, data e hora.
 * @param {string} isoString - Data em formato ISO 8601.
 * @returns {string} Data formatada em português.
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
 * @param {number} weathercode - Código numérico do clima.
 * @returns {string} Nome da classe do ícone da biblioteca Weather Icons.
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
 * @param {boolean} isDay - Indica se é dia (true) ou noite (false).
 */
function ajustarFundo(isDay) {
  if (!modoEscuroAtivo) {
    document.body.classList.remove("day", "night");
    document.body.classList.add(isDay ? "day" : "night");
  }
}

/**
 * Verifica se há dados em cache para a cidade e se ainda são válidos.
 * @param {string} chave - Nome da cidade ou chave de cache.
 * @returns {Object|null} Dados do clima ou null se inválido.
 */
function verificarCache(chave) {
  const cache = localStorage.getItem(chave);
  if (!cache) return null;

  const { timestamp, dados } = JSON.parse(cache);
  const agora = Date.now();
  const expiracao = 30 * 60 * 1000; // 30 minutos

  return agora - timestamp < expiracao ? dados : null;
}

/**
 * Salva os dados meteorológicos no cache.
 * @param {string} chave - Nome da cidade ou chave de cache.
 * @param {Object} dados - Dados meteorológicos.
 */
function salvarCache(chave, dados) {
  const pacote = {
    timestamp: Date.now(),
    dados
  };
  localStorage.setItem(chave, JSON.stringify(pacote));
}

/**
 * Exibe os dados meteorológicos no DOM.
 * @param {Object} dados - Dados meteorológicos.
 */
function exibirClima(dados) {
  resultado.innerHTML = `
  <div class="clima-atual">
    <h2>Previsão do Tempo</h2>
    <div class="clima-card">
      <div class="clima-info">
        <i class="wi ${dados.icone}"></i>
        <div class="temperatura">${dados.clima.temperature}°</div>
      </div>
      <div class="local-info">
        <h3>${dados.name}, ${dados.country}</h3>
        <p>${dados.dataHora}</p>
      </div>
      <div class="detalhes">
        <div class="box">
          <span>💧 Umidade</span>
          <strong>${dados.previsao[0].umidade}%</strong>
        </div>
        <div class="box">
          <span>💨 Vento</span>
          <strong>${dados.clima.windspeed} km/h</strong>
        </div>
        <div class="box">
          <span>🌧️ Precipitação</span>
          <strong>${dados.previsao[0].precipitacao} mm</strong>
        </div>
      </div>
    </div>
  </div>
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
        <p>🌧️ ${dia.precipitacao} mm</p>
        <p>💧 ${dia.umidade}%</p>
      </div>
    `
      )
      .join("")}
  </div>
`;
}


/**
 * Busca dados meteorológicos atuais e previsão de 5 dias.
 * @param {string} city - Nome da cidade.
 */
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

    const previsao = weatherData.daily.time.slice(0, 5).map((data, i) => ({
      data,
      max: weatherData.daily.temperature_2m_max[i],
      min: weatherData.daily.temperature_2m_min[i],
      precipitacao: weatherData.daily.precipitation_sum[i],
      umidade: weatherData.daily.relative_humidity_2m_max[i]
    }));

    const dados = {
      name,
      country,
      clima,
      icone,
      dataHora,
      is_day: clima.is_day,
      previsao
    };

    salvarCache(cacheKey, dados);
    exibirClima(dados);
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

// Alternância manual de tema
const toggleBtn = document.getElementById("toggle-theme");
let modoEscuroAtivo = false;

toggleBtn.addEventListener("click", () => {
  modoEscuroAtivo = !modoEscuroAtivo;
  document.body.classList.remove("day", "night");
  document.body.classList.add(modoEscuroAtivo ? "night" : "day");
  toggleBtn.textContent = modoEscuroAtivo ? "☀️ Voltar para modo claro" : "🌙 Ativar modo escuro";
});
