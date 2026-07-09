import { z } from "zod";

// Campo de data/hora (já convertido pra ISO no navegador antes do submit —
// ver useLocalDatetimeSubmit) que não pode estar no futuro. Reusado pelos
// schemas Zod de medições, doses, refeições e atividades.
export function pastOrPresentTimestamp(
  message = "A data e hora não podem estar no futuro.",
  requiredMessage = "Informe a data e hora.",
) {
  return z
    .string()
    .min(1, requiredMessage)
    .refine((value) => new Date(value).getTime() <= Date.now(), { message });
}
