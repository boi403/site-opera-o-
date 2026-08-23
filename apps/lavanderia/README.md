# LavaPronto

Site da lavanderia do hotel aberto para o público da cidade: reserva de
lavagem online, planos mensais (pessoa física e empresa) com cobrança
automática via Stripe, e aviso automático por WhatsApp quando a roupa fica
pronta.

## O que já está pronto

- **Banco de dados (Supabase)**: projeto `lavapronto` já criado, com as
  tabelas `profiles`, `orders`, `plans` e `subscriptions`, e regras de
  segurança (RLS) que garantem que cada cliente só vê os próprios pedidos e
  assinaturas, e que só administradores enxergam tudo.
- **Site público**: landing page, cadastro/login, reserva de lavagem, página
  de planos com checkout do Stripe, e área "Minha conta" com o status dos
  pedidos.
- **Painel administrativo** (`/admin`): login separado, lista de todos os
  pedidos com botão para avançar o status (Recebido → Lavando → Pronto →
  Entregue) — ao marcar como "Pronto", o cliente recebe uma mensagem
  automática no WhatsApp — e lista de assinantes dos planos.

## Como rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra http://localhost:3002.

> O site principal do hotel (Vite) e o LavaPronto (Next.js) usam portas
> diferentes de propósito — 3000 e 3002 — para poder rodar os dois ao mesmo
> tempo sem conflito. Se ao abrir localhost:3000 você cair no site do hotel
> em vez do LavaPronto, é porque o site principal está rodando nessa porta;
> o LavaPronto agora vive em localhost:3002.

O `.env.example` já vem com a URL e a chave pública do Supabase
preenchidas. Você só precisa completar:

1. **`SUPABASE_SERVICE_ROLE_KEY`** — em
   https://supabase.com/dashboard/project/wfcpvydrzigcqhihrwcg/settings/api
   (chave "service_role", nunca exponha no frontend).
2. **Stripe** (para cobrança automática dos planos):
   - Crie uma conta em https://dashboard.stripe.com
   - Crie dois produtos recorrentes mensais (Plano Individual e Plano
     Empresarial) e copie o `price_id` de cada um.
   - No Supabase, atualize a tabela `plans` com esses IDs:
     ```sql
     update plans set stripe_price_id = 'price_xxx' where type = 'individual';
     update plans set stripe_price_id = 'price_yyy' where type = 'empresa';
     ```
   - Preencha `STRIPE_SECRET_KEY` (Dashboard → Developers → API keys).
   - Crie um webhook apontando para `https://SEU_DOMINIO/api/stripe/webhook`
     escutando `checkout.session.completed`,
     `customer.subscription.updated` e `customer.subscription.deleted`, e
     preencha `STRIPE_WEBHOOK_SECRET` com o "signing secret" gerado.
3. **Login com Google** (opcional, mas recomendado):
   - No [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
     crie uma credencial OAuth 2.0 do tipo "Aplicativo da Web" com a URI de
     redirecionamento `https://wfcpvydrzigcqhihrwcg.supabase.co/auth/v1/callback`.
   - No [Supabase Dashboard → Authentication → Providers](https://supabase.com/dashboard/project/wfcpvydrzigcqhihrwcg/auth/providers),
     ative o provedor "Google" e cole o Client ID e Client Secret gerados.
   - Como o Google não fornece o telefone do usuário, quem entra pela
     primeira vez com Google é levado para `/cadastro/completar` para
     preencher nome e WhatsApp antes de continuar.
4. **WhatsApp Cloud API** (para o aviso automático de "pronto"):
   - Crie um app em https://developers.facebook.com/apps com o produto
     "WhatsApp".
   - Copie o `WHATSAPP_PHONE_NUMBER_ID` e gere um `WHATSAPP_TOKEN`
     permanente (via System User, para não expirar em 24h).
   - Guia oficial:
     https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
   - Sem essas duas variáveis, o site funciona normalmente — só não envia a
     mensagem automática (fica registrado no log do servidor).

## Como virar administrador

Qualquer pessoa que se cadastra pelo site vira `cliente` por padrão. Para
transformar sua conta (ou a de um funcionário) em administrador, crie a
conta normalmente pelo `/cadastro` e depois rode no SQL Editor do Supabase:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'seuemail@exemplo.com');
```

Depois disso, essa conta consegue entrar em `/admin`.

## Publicar (deploy)

O projeto está pronto para deploy no Vercel:

```bash
npx vercel
```

Configure as mesmas variáveis de ambiente do `.env.local` no painel do
Vercel (Project Settings → Environment Variables) antes do deploy de
produção.

## Estrutura

```
app/
  page.tsx              -> landing page
  reservar/              -> formulário de reserva (cliente logado)
  planos/                 -> planos mensais + checkout Stripe
  login/, cadastro/       -> autenticação de clientes
  conta/                  -> status dos pedidos e assinaturas
  admin/
    login/                -> login separado do painel
    (protected)/           -> painel admin (exige role = admin)
  api/
    orders/[id]/status/    -> admin atualiza status e dispara WhatsApp
    stripe/checkout/        -> cria sessão de assinatura
    stripe/webhook/          -> sincroniza status da assinatura
lib/
  supabase/               -> clientes Supabase (browser, servidor, middleware)
  stripe.ts, whatsapp.ts   -> integrações
```
