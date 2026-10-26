/** Regra de negócio violada (ex.: agendar antes de o cliente confirmar). Vira 409. */
export class RegraDeNegocioError extends Error {}

export class HorarioIndisponivelError extends RegraDeNegocioError {
  constructor() {
    super("Horário indisponível");
  }
}
