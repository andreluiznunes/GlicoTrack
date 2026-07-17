# Migrations do GlicoTrack

Não há Supabase CLI instalada nesta máquina, então o schema é aplicado colando SQL
diretamente no **SQL Editor** do painel do Supabase (não é `supabase db push`).

## Como aplicar (projeto novo/vazio)

1. Abra o painel do seu projeto em https://supabase.com/dashboard → **SQL Editor**.
2. Cole o conteúdo de `0000_full_schema.sql` (schema completo, já na ordem certa) e rode.
3. Confira em **Table Editor** que as tabelas `profiles`, `professional_patient_links`,
   `invite_codes`, `patient_targets`, `glucose_measurements`, `medication_doses`, `meals`,
   `activities`, `patient_notes` foram criadas, todas com RLS habilitada (ícone de cadeado).

Os arquivos `0001_...sql` até `0012_...sql` são a mesma coisa, separados por assunto —
use-os só se quiser aplicar/entender por partes, ou se precisar reaplicar um pedaço
específico depois de uma mudança futura. Todos os `create`/`drop policy` são idempotentes
(podem ser rodados de novo sem erro), exceto `create type` e `create table`, que já
usam `if not exists`/tratamento de erro de duplicidade.

## Configuração adicional necessária no painel (fora do SQL)

Em **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000` (trocar pelo domínio da Vercel quando for pra produção)
- **Redirect URLs**: adicionar `http://localhost:3000/**` (wildcard — cobre `/auth/callback` com
  qualquer query string; usar wildcard evita ter que listar cada variação de URL)

Em **Authentication → Providers → Email**: confirme que "Confirm email" está **ativado**
(é o padrão em projetos novos).

**Não é necessário editar os templates de e-mail.** O app usa o link padrão do Supabase
(`{{ .ConfirmationURL }}`, sem customização — útil em planos onde a edição de template não está
disponível). O link padrão redireciona para `/auth/callback`, uma página client-side
(`src/app/auth/callback/page.tsx` + `src/components/AuthCallbackHandler.tsx`) que processa a
confirmação no navegador (cobre tanto o formato `?code=` quanto `#access_token=...`, dependendo
de como o Supabase gerar o link) e só então redireciona para dentro do app.

Opcional: em **Authentication → Email Templates**, se algum dia tiver acesso, dá pra traduzir o
texto dos e-mails para PT-BR (não precisa mexer no link/`href`).

## Como promover a primeira conta a administrador

Não existe cadastro público de administrador (proposital — evita que qualquer um vire admin).
Depois de aplicar a migration `0012_professional_approval.sql` (ou o `0000_full_schema.sql`
atualizado), cadastre normalmente uma conta pelo app (paciente ou profissional, não importa o
papel) e depois rode no **SQL Editor**:

```sql
update public.profiles set is_admin = true where email = 'seu-email@exemplo.com';
```

Só funciona rodando direto no SQL Editor (como superusuário) — a aplicação em si nunca consegue
setar `is_admin`, nem por essa conta nem por nenhuma RPC (bloqueado por trigger,
`prevent_profile_privilege_self_change` em `0012_professional_approval.sql`).

## Depois de mudar o schema

Como não há CLI para gerar tipos automaticamente (`supabase gen types`), os tipos em
`src/types/database.ts` são escritos à mão. Se alterar uma tabela, atualize o arquivo
`.sql` correspondente, reconcatene em `0000_full_schema.sql` e atualize os tipos manualmente.
