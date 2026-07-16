const measuredAtFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  dateStyle: "short",
  timeStyle: "short",
});

// Formata timestamptz fixando o fuso de São Paulo — o app é para uso no
// Brasil (premissas seção 1/4.1), independente do timezone do servidor.
export function formatMeasuredAt(iso: string): string {
  return measuredAtFormatter.format(new Date(iso));
}

const datetimeLocalParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// Gera o valor pro <input type="datetime-local"> a partir de um timestamptz,
// já convertido pro horário de São Paulo — calculado no Server Component
// (não no client) pra não depender do timezone do navegador/servidor.
export function toDatetimeLocalBR(iso: string): string {
  const parts = datetimeLocalParts.formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

// Isolado numa função à parte (em vez de "new Date(Date.now() - ...)" direto
// no corpo de um Server Component) porque o eslint (react-hooks/purity) recusa
// chamadas impuras diretamente no render — aqui é só uma consulta ao banco,
// não afeta a pureza da renderização.
export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}
