# Restaurante — Hotel Araguaia Palace

App Next.js independente para o room service do hotel (pedidos de pizza/bebida
entregues no quarto), separado do LavaPronto (lavanderia).

## Por que existe separado, mas usa o mesmo Supabase

Guest e staff já têm conta no LavaPronto (login, cadastro, papel de admin).
Duplicar esse sistema de login aqui criaria duas contas por pessoa e dois
painéis administrativos para a mesma equipe operar. Por isso este app:

- é um **projeto/deploy independente** (porta própria, `package.json` próprio,
  pode subir sozinho no Vercel);
- mas **usa o mesmo projeto Supabase** do LavaPronto (mesma URL/chave, mesmas
  tabelas `profiles`, `food_orders`, `food_order_items`, mesmo RLS).

Como os cookies de sessão do Supabase não são restritos por porta, um hóspede
ou administrador que já logou no LavaPronto (`:3002`) chega autenticado aqui
(`:3003`) automaticamente, em `localhost`. Em produção, isso só continua
valendo se os dois apps ficarem em subdomínios do mesmo domínio raiz — ajuste
`NEXT_PUBLIC_LAVANDERIA_URL` conforme a URL real de produção do LavaPronto.

## Como rodar localmente

```bash
npm install
cp .env.example .env.local   # já vem preenchido com a URL/chave pública do Supabase
npm run dev
```

Abra http://localhost:3003. Faça login primeiro em http://localhost:3002/login
(LavaPronto) — a sessão é compartilhada.

## Painel administrativo

`/admin` — mesma conta com `role = 'admin'` no Supabase usada no LavaPronto.
Lista os pedidos do restaurante e permite avançar o status
(Recebido → Preparando → Pronto → Entregue); ao marcar "Pronto", dispara aviso
automático por WhatsApp (precisa de `WHATSAPP_TOKEN` e
`WHATSAPP_PHONE_NUMBER_ID` no `.env.local`, mesmas credenciais do LavaPronto).

## Nota sobre a migração

As rotas originais (`/restaurante`, `/admin/(protected)/restaurante`, API de
status) **continuam funcionando dentro do LavaPronto** — não foram removidas
de lá. Este app novo é uma cópia funcional e independente. Decidir quando
desligar as rotas antigas do LavaPronto (e atualizar o menu de lá para
apontar pra cá) é um passo separado, deliberado — não foi feito automaticamente
para não quebrar o que já estava no ar.
