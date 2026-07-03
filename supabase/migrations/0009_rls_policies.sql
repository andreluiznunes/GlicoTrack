-- GlicoTrack — 0009: políticas de RLS
-- Convenção: paciente CRUD nos próprios dados clínicos; profissional só SELECT
-- nos dados de pacientes vinculados (exceto patient_targets, que ele define).

-- profiles ------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_select_linked_professional_reads_patient" on public.profiles;
create policy "profiles_select_linked_professional_reads_patient" on public.profiles
  for select using (
    exists (
      select 1 from public.professional_patient_links l
      where l.patient_id = profiles.id and l.professional_id = auth.uid()
    )
  );

drop policy if exists "profiles_select_linked_patient_reads_professional" on public.profiles;
create policy "profiles_select_linked_patient_reads_professional" on public.profiles
  for select using (
    exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = profiles.id and l.patient_id = auth.uid()
    )
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- professional_patient_links -------------------------------------------
-- Sem policy de INSERT: vínculo só é criado pela RPC redeem_invite_code (security definer).
drop policy if exists "ppl_select_own" on public.professional_patient_links;
create policy "ppl_select_own" on public.professional_patient_links
  for select using (professional_id = auth.uid() or patient_id = auth.uid());

drop policy if exists "ppl_delete_own" on public.professional_patient_links;
create policy "ppl_delete_own" on public.professional_patient_links
  for delete using (professional_id = auth.uid() or patient_id = auth.uid());

-- invite_codes -----------------------------------------------------------
-- Sem policy de INSERT/UPDATE: geração e resgate só via RPC (security definer).
drop policy if exists "invite_codes_select_own" on public.invite_codes;
create policy "invite_codes_select_own" on public.invite_codes
  for select using (professional_id = auth.uid());

-- patient_targets ----------------------------------------------------------
drop policy if exists "patient_targets_select" on public.patient_targets;
create policy "patient_targets_select" on public.patient_targets
  for select using (patient_id = auth.uid() or professional_id = auth.uid());

drop policy if exists "patient_targets_insert" on public.patient_targets;
create policy "patient_targets_insert" on public.patient_targets
  for insert with check (
    professional_id = auth.uid()
    and exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = patient_targets.patient_id
    )
  );

drop policy if exists "patient_targets_update" on public.patient_targets;
create policy "patient_targets_update" on public.patient_targets
  for update using (
    professional_id = auth.uid()
    and exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = patient_targets.patient_id
    )
  )
  with check (
    professional_id = auth.uid()
    and exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = patient_targets.patient_id
    )
  );

-- glucose_measurements -------------------------------------------------
drop policy if exists "glucose_measurements_select" on public.glucose_measurements;
create policy "glucose_measurements_select" on public.glucose_measurements
  for select using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = glucose_measurements.patient_id
    )
  );

drop policy if exists "glucose_measurements_insert" on public.glucose_measurements;
create policy "glucose_measurements_insert" on public.glucose_measurements
  for insert with check (patient_id = auth.uid());

drop policy if exists "glucose_measurements_update" on public.glucose_measurements;
create policy "glucose_measurements_update" on public.glucose_measurements
  for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "glucose_measurements_delete" on public.glucose_measurements;
create policy "glucose_measurements_delete" on public.glucose_measurements
  for delete using (patient_id = auth.uid());

-- medication_doses -----------------------------------------------------
drop policy if exists "medication_doses_select" on public.medication_doses;
create policy "medication_doses_select" on public.medication_doses
  for select using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = medication_doses.patient_id
    )
  );

drop policy if exists "medication_doses_insert" on public.medication_doses;
create policy "medication_doses_insert" on public.medication_doses
  for insert with check (patient_id = auth.uid());

drop policy if exists "medication_doses_update" on public.medication_doses;
create policy "medication_doses_update" on public.medication_doses
  for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "medication_doses_delete" on public.medication_doses;
create policy "medication_doses_delete" on public.medication_doses
  for delete using (patient_id = auth.uid());

-- meals ------------------------------------------------------------------
drop policy if exists "meals_select" on public.meals;
create policy "meals_select" on public.meals
  for select using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = meals.patient_id
    )
  );

drop policy if exists "meals_insert" on public.meals;
create policy "meals_insert" on public.meals
  for insert with check (patient_id = auth.uid());

drop policy if exists "meals_update" on public.meals;
create policy "meals_update" on public.meals
  for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "meals_delete" on public.meals;
create policy "meals_delete" on public.meals
  for delete using (patient_id = auth.uid());

-- activities ---------------------------------------------------------------
drop policy if exists "activities_select" on public.activities;
create policy "activities_select" on public.activities
  for select using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = activities.patient_id
    )
  );

drop policy if exists "activities_insert" on public.activities;
create policy "activities_insert" on public.activities
  for insert with check (patient_id = auth.uid());

drop policy if exists "activities_update" on public.activities;
create policy "activities_update" on public.activities
  for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "activities_delete" on public.activities;
create policy "activities_delete" on public.activities
  for delete using (patient_id = auth.uid());

-- patient_notes --------------------------------------------------------
drop policy if exists "patient_notes_select" on public.patient_notes;
create policy "patient_notes_select" on public.patient_notes
  for select using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = patient_notes.patient_id
    )
  );

drop policy if exists "patient_notes_insert" on public.patient_notes;
create policy "patient_notes_insert" on public.patient_notes
  for insert with check (patient_id = auth.uid());

drop policy if exists "patient_notes_update" on public.patient_notes;
create policy "patient_notes_update" on public.patient_notes
  for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "patient_notes_delete" on public.patient_notes;
create policy "patient_notes_delete" on public.patient_notes
  for delete using (patient_id = auth.uid());
