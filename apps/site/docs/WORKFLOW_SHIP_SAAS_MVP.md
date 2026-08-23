# Workflow Ativo: Ship a SaaS MVP

## Objetivo

Evoluir o projeto Araguaia Palace para um MVP mais seguro e operavel, com foco em:

- acesso administrativo protegido por backend
- fluxo principal de operacao funcionando fim a fim
- release com checklist e rollback minimo

## Escopo MVP (fase atual)

- Site institucional com area profissional protegida
- API de IA para concierge, copiloto operacional, previsao e analytics
- Login admin via API (sem credencial exposta no frontend)

## Criterios de aceitacao (fase atual)

- login admin deve validar credenciais no servidor
- sessao admin deve poder ser validada e encerrada por endpoint dedicado
- nenhum usuario/senha admin deve ficar hardcoded no bundle frontend
- variaveis de ambiente devem documentar configuracao de login

## Execucao por etapa

1. Plan the scope
- Status: concluido
- Evidencia: este documento com escopo e criterios

2. Build backend and API
- Status: concluido (baseline de auth)
- Evidencia:
  - `ai-server.mjs` com `/api/admin/login`, `/api/admin/session`, `/api/admin/logout`
  - sessoes em memoria com TTL configuravel
  - suporte a `ADMIN_USERS_JSON` ou `ADMIN_LOGIN_*`

3. Build frontend
- Status: concluido (baseline de auth)
- Evidencia:
  - `App.tsx` sem credenciais hardcoded
  - login consumindo API admin
  - validacao de sessao no bootstrap
  - botao de logout no painel profissional

4. Test and validate
- Status: pendente
- Proxima evidencia esperada:
  - teste manual de login/sessao/logout
  - smoke test dos endpoints `/api/concierge`, `/api/copilot`, `/api/predict`, `/api/analytics`

5. Ship safely
- Status: pendente
- Proxima evidencia esperada:
  - checklist de deploy
  - variaveis de ambiente de producao
  - plano de rollback para build anterior

## Riscos abertos

- sessoes admin sao armazenadas em memoria (reinicio do servidor encerra todas)
- ainda nao ha persistencia de usuarios admin em banco
- ainda nao ha suite automatizada de regressao
