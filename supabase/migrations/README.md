# Migrations do GlicoTrack

Não há Supabase CLI instalada nesta máquina, então o schema é aplicado colando SQL
diretamente no **SQL Editor** do painel do Supabase (não é `supabase db push`).

## Como aplicar (projeto novo/vazio)

1. Abra o painel do seu projeto em https://supabase.com/dashboard → **SQL Editor**.
2. Cole o conteúdo de `0000_full_schema.sql` (schema completo, já na ordem certa) e rode.
3. Confira em **Table Editor** que as tabelas `profiles`, `professional_patient_links`,
   `invite_codes`, `patient_targets`, `glucose_measurements`, `medication_doses`, `meals`,
   `activities`, `patient_notes` foram criadas, todas com RLS habilitada (ícone de cadeado).

Os arquivos `0001_...sql` até `0009_...sql` são a mesma coisa, separados por assunto —
use-os só se quiser aplicar/entender por partes, ou se precisar reaplicar um pedaço
específico depois de uma mudança futura. Todos os `create`/`drop policy` são idempotentes
(podem ser rodados de novo sem erro), exceto `create type` e `create table`, que já
usam `if not exists`/tratamento de erro de duplicidade.

## Configuração adicional necessária no painel (fora do SQL)

Em **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000` (trocar pelo domínio da Vercel quando for pra produção)
- **Redirect URLs**: adicionar `http://localhost:3000/auth/confirm` (e o equivalente em produção depois)

Em **Authentication → Providers → Email**: confirme que "Confirm email" está **ativado**
(é o padrão em projetos novos) — o app depende da rota `/auth/confirm` para validar o link
enviado por e-mail.

**Passo obrigatório — editar os templates de e-mail** (`Authentication → Email Templates`):
por padrão, o Supabase envia um link `{{ .ConfirmationURL }}` que aponta para o próprio domínio
do Supabase. Como este app usa uma rota própria (`/auth/confirm`) para validar o token, é
preciso editar dois templates para montar o link manualmente com `token_hash`/`type`/`next`:

- **Confirm signup**: troque o `href` do link de confirmação por
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/`
- **Reset Password**: troque o `href` do link por
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/redefinir-senha`

Sem essa edição, clicar no link do e-mail leva a uma página do Supabase em vez de voltar
para o app — o cadastro/redefinição de senha parece "não funcionar".

Opcional: no mesmo lugar, também dá para traduzir o texto dos templates para PT-BR.

## Depois de mudar o schema

Como não há CLI para gerar tipos automaticamente (`supabase gen types`), os tipos em
`src/types/database.ts` são escritos à mão. Se alterar uma tabela, atualize o arquivo
`.sql` correspondente, reconcatene em `0000_full_schema.sql` e atualize os tipos manualmente.
