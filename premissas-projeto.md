# Premissas do Projeto — App de Acompanhamento de Glicemia

> Documento de definição de escopo, construído por entrevista. Serve como referência para decisões futuras de design e desenvolvimento.
> Última atualização: 2026-07-17

## 1. Visão geral

Aplicativo web para acompanhamento de glicemia (nível de glicose no sangue), voltado ao **uso clínico**: pacientes registram suas próprias medições e profissionais de saúde acompanham múltiplos pacientes vinculados a eles.

- **Nome do projeto:** GlicoTrack
- **Plataforma:** aplicação web única, responsiva, funcionando tanto em desktop quanto em celular através do navegador (sem PWA instalável)
- **Stack técnica:** Next.js (React) + TypeScript, Supabase (backend, banco de dados e autenticação), hospedado na Vercel — ver seção 9

## 2. Público-alvo

O app deve atender pacientes com:
- Diabetes tipo 1
- Diabetes tipo 2
- Pré-diabetes / uso pessoal preventivo (sem tratamento intensivo)

*(Diabetes gestacional foi considerado, mas não incluído no escopo — ver seção 9, fora de escopo).*

## 3. Papéis de usuário

| Papel | Descrição |
|---|---|
| **Paciente** | Cria sua própria conta, registra suas medições e dados relacionados. Cadastro liberado imediatamente. |
| **Profissional de saúde** | Acompanha os pacientes vinculados a ele; define metas/faixas individuais para cada paciente; visualiza gráficos e relatórios. Cadastro fica **pendente de aprovação** (ver abaixo). |
| **Administrador** | Papel interno, sem cadastro público — a primeira conta é promovida manualmente pelo responsável técnico do projeto. Responsável por aprovar ou rejeitar cadastros de profissionais de saúde. |

- **Vínculo paciente–profissional:** o paciente se cadastra de forma independente e insere um **código/convite** fornecido pelo profissional para se vincular a ele.
- **Aprovação de profissional:** no cadastro, o usuário apenas *declara* que é profissional de saúde — não há validação de credencial nesse momento. Por isso, a conta nasce com status **pendente** e só pode gerar código de convite (e, por consequência, atender pacientes) depois que um administrador aprovar o cadastro pela área administrativa. Evita que qualquer pessoa se autodeclare profissional sem alguém validar.
- **Escopo institucional (MVP):** pensado para **uma única clínica/consultório** — não é multi-tenant (múltiplas instituições isoladas) nesta fase.

## 4. Dados a registrar

### 4.1 Medição de glicemia (registro principal)
- **Valor da glicemia**, na unidade **mg/dL** (padrão Brasil).
- **Data e hora** da medição.
- **Contexto/momento da medição**, com opções pré-definidas, por exemplo:
  - Jejum
  - Antes do café da manhã / almoço / jantar
  - 2h depois do café da manhã / almoço / jantar
  - Antes de dormir
  - Madrugada
  - Outro

### 4.2 Dados complementares (associados a um registro ou ao dia)
- **Doses de insulina/medicação:** horário e quantidade.
- **Alimentação/carboidratos:** o que foi consumido e estimativa de carboidratos, para relacionar com picos de glicemia.
- **Atividade física:** exercícios realizados, que também afetam a glicemia.
- **Notas livres/sintomas:** campo de texto livre para relatar sensações, sintomas de hipo/hiperglicemia etc.

## 5. Metas e faixas de referência

- As faixas de referência (o que é considerado normal/alto/baixo) são **configuráveis por paciente**, definidas pelo profissional de saúde — já que variam por idade, tipo de diabetes e orientação médica individual.
- Não há uma faixa padrão única fixa no sistema.

## 6. Alertas e notificações

- **Fora do escopo inicial.** Não haverá notificações de valores fora da faixa nem lembretes de horário para medir nesta primeira versão. Pode ser reavaliado em versão futura.

## 7. Visualização e relatórios

Funcionalidades de acompanhamento consideradas prioritárias:
- **Gráfico de linha do tempo:** evolução da glicemia ao longo de dias/semanas, destacando valores fora da faixa definida.
- **Média e estimativa de HbA1c** (hemoglobina glicada): indicador clínico usado em consultas, calculado a partir da média das medições.

*(Exportação em PDF e identificação de padrões por horário do dia foram consideradas, mas não confirmadas como prioridade — ver seção 9).*

## 8. Requisitos técnicos e não-funcionais

| Item | Decisão |
|---|---|
| Integração com hardware (glicosímetros/sensores Bluetooth, FreeStyle Libre etc.) | **Não nesta fase.** Registro sempre manual. Integração fica para fase futura. |
| Funcionamento offline | **Não é necessário.** O app pode assumir conexão com internet sempre disponível (sem lógica de sincronização offline). |
| Privacidade e segurança (LGPD) | **Preocupação formal desde o início.** Dados de saúde são sensíveis pela LGPD — o projeto deve prever consentimento, criptografia, controle de acesso e possibilidade de exclusão de dados dos pacientes. |
| Responsivo vs. instalável (PWA) | **Site responsivo comum, sem PWA.** Acesso via navegador, sem instalação/ícone/tela cheia. |
| Stack técnica (linguagem, framework, banco de dados, hospedagem) | Definida — ver seção 9. |

## 9. Decisões técnicas

| Camada | Escolha | Observação |
|---|---|---|
| **Linguagem** | TypeScript | Tipagem estática, reduz erros, combina bem com Next.js. |
| **Frontend** | Next.js (React) | Framework com roteamento e estrutura pronta sobre React. |
| **Backend** | Supabase | Backend-as-a-service: expõe API sobre o banco Postgres, dispensa servidor próprio separado. |
| **Banco de dados** | Supabase (PostgreSQL) | Banco relacional gerenciado pelo Supabase. |
| **Autenticação** | Supabase Auth | Login de pacientes e profissionais via email/senha, integrado nativamente ao Supabase. |
| **Hospedagem** | Vercel | Hospeda o frontend Next.js; combina com o mesmo fornecedor do framework. |
| **Gráficos** | Recharts | Biblioteca de gráficos em React, usada para o gráfico de linha do tempo da glicemia (seção 7). |
| **Estilização** | Tailwind CSS | Framework de classes utilitárias para CSS, usado para o layout responsivo (desktop e celular). |

> Nota: como o Supabase concentra banco de dados e autenticação, o controle de acesso entre paciente e profissional (RLS — Row Level Security) deve ser configurado no Supabase para garantir que um paciente só veja seus próprios dados e um profissional só veja os pacientes vinculados a ele — relevante para o requisito de LGPD da seção 8.

## 10. Fora de escopo (nesta fase) / questões em aberto

- Diabetes gestacional como público-alvo específico.
- Alertas e notificações (hipo/hiperglicemia, lembretes).
- Integração com dispositivos/sensores de medição.
- Suporte a múltiplas instituições (multi-tenant).
- Exportação de relatório em PDF e identificação automática de padrões por horário do dia (mencionados, não confirmados como prioridade do MVP).

## 11. Glossário rápido (conceitos de diabetes usados neste documento)

- **Glicemia:** concentração de glicose (açúcar) no sangue, medida em mg/dL.
- **Hipoglicemia:** glicemia abaixo do considerado normal (risco imediato à saúde).
- **Hiperglicemia:** glicemia acima do considerado normal.
- **HbA1c (hemoglobina glicada):** exame que reflete a média da glicemia nos últimos ~3 meses; usado por médicos para avaliar controle do diabetes a longo prazo.
- **Jejum:** medição feita sem ter comido por várias horas (geralmente ao acordar), usada como referência importante.
- **Carboidratos (carboidrato/contagem de carboidratos):** nutriente que mais impacta a glicemia após as refeições; pacientes com diabetes tipo 1 frequentemente ajustam a dose de insulina com base na quantidade de carboidratos consumida.
