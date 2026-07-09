import type { MeasurementContext } from "@/types/database";

export const MEASUREMENT_CONTEXTS: { value: MeasurementContext; label: string }[] = [
  { value: "jejum", label: "Jejum ao acordar" },
  { value: "antes_cafe", label: "Antes do café da manhã" },
  { value: "antes_almoco", label: "Antes do almoço" },
  { value: "antes_jantar", label: "Antes do jantar" },
  { value: "depois_cafe_2h", label: "2h depois do café da manhã" },
  { value: "depois_almoco_2h", label: "2h depois do almoço" },
  { value: "depois_jantar_2h", label: "2h depois do jantar" },
  { value: "antes_dormir", label: "Antes de dormir" },
  { value: "madrugada", label: "Madrugada" },
  { value: "outro", label: "Outro" },
];

const LABEL_BY_VALUE = new Map(MEASUREMENT_CONTEXTS.map((c) => [c.value, c.label]));

export function measurementContextLabel(value: MeasurementContext): string {
  return LABEL_BY_VALUE.get(value) ?? value;
}
