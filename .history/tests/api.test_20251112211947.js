describe("Cache de dados meteorológicos", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("Salva e recupera dados válidos do cache", () => {
    const cidade = "São Paulo";
    const dados = { clima: { temperature: 25 }, timestamp: Date.now() };
    localStorage.setItem(cidade.toLowerCase(), JSON.stringify({ timestamp: Date.now(), dados }));

    const resultado = verificarCache(cidade);
    expect(resultado).toBeDefined();
    expect(resultado.clima.temperature).toBe(25);
  });

  test("Ignora dados expirados do cache", () => {
    const cidade = "São Paulo";
    const dados = { clima: { temperature: 25 } };
    const timestampAntigo = Date.now() - 31 * 60 * 1000; // 31 minutos atrás
    localStorage.setItem(cidade.toLowerCase(), JSON.stringify({ timestamp: timestampAntigo, dados }));

    const resultado = verificarCache(cidade);
    expect(resultado).toBeNull();
  });
});
