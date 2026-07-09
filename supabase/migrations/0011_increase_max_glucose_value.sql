-- GlicoTrack — 0011: aumentar o limite máximo de value_mg_dl para 3000
-- Existem casos clínicos reais de glicemia acima de 1000 mg/dL (o limite
-- original era um sanity bound conservador demais). Rode este arquivo se você
-- já aplicou o schema antes desta correção.
alter table public.glucose_measurements
  drop constraint if exists glucose_measurements_value_mg_dl_check;

alter table public.glucose_measurements
  add constraint glucose_measurements_value_mg_dl_check
  check (value_mg_dl > 0 and value_mg_dl <= 3000);
