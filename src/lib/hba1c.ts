const MIN_SAMPLE_SIZE = 3;

export type HbA1cEstimate = {
  percentage: number;
  averageGlucose: number;
  sampleSize: number;
};

// Fórmula ADAG (estudo "A1C-Derived Average Glucose"): converte a média de
// glicemia (mg/dL) numa estimativa de HbA1c. É a mesma usada por
// calculadoras clínicas de "eAG para A1C" — não substitui o exame laboratorial.
export function estimateHbA1c(values: number[]): HbA1cEstimate | null {
  if (values.length < MIN_SAMPLE_SIZE) {
    return null;
  }

  const averageGlucose = values.reduce((sum, v) => sum + v, 0) / values.length;
  const percentage = (averageGlucose + 46.7) / 28.7;

  return {
    percentage: Math.round(percentage * 10) / 10,
    averageGlucose: Math.round(averageGlucose),
    sampleSize: values.length,
  };
}
