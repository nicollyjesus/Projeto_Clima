const fetch = require("node-fetch");
jest.mock("node-fetch", () => jest.fn());

const { Response } = jest.requireActual("node-fetch");

// Função simulada para teste (simplificada)
async function getCoordinates(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const response = await fetch(geoUrl);
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("Cidade não encontrada.");
  }
  return data.results[0];
}

describe("Função getCoordinates", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Retorna dados para cidade válida", async () => {
    const mockData = {
      results: [{ name: "São Paulo", latitude: -23.55, longitude: -46.63 }]
    };
    fetch.mockResolvedValue(new Response(JSON.stringify(mockData)));

    const result = await getCoordinates("São Paulo");
    expect(result).toMatchObject({ name: "São Paulo", latitude: -23.55 });
  });

  test("Lança erro para cidade inexistente", async () => {
    const mockData = { results: [] };
    fetch.mockResolvedValue(new Response(JSON.stringify(mockData)));

    await expect(getCoordinates("CidadeInexistente")).rejects.toThrow("Cidade não encontrada.");
  });

  test("Lança erro para entrada vazia", async () => {
    await expect(getCoordinates("")).rejects.toThrow();
  });

  test("Lança erro para falha na API", async () => {
    fetch.mockRejectedValue(new Error("Falha de rede"));

    await expect(getCoordinates("São Paulo")).rejects.toThrow("Falha de rede");
  });
});
