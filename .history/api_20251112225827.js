async function getWeather(city) {
  const resultado = document.getElementById("resultado");
  try {
    if (!city) throw new Error("Cidade não informada.");

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

    if (!weatherData.current_weather || !weatherData.daily) {
      throw new Error("Dados meteorológicos não disponíveis.");
    }

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
    console.error("Erro ao buscar clima:", erro);
  }
}
