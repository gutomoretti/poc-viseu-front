This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, configure the environment variables by copying the example file and adjusting values if necessary:

```bash
cp .env.local.example .env.local
```

`NEXT_PUBLIC_API_BASE_URL` defines the backend base URL (defaults to `https://localhost:7227/`).

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Principais rotas

- `/login`: tela pública para autenticação.
- `/processos`: listagem e CRUD utilizando PrimeReact DataTable (rota protegida).

### Autenticação e token

- Autentique-se enviando `POST https://localhost:7227/api/Auth/authenticate` (mesmo payload do backend).
- Exemplo de payload:

```json
{
    "username": "admin",
    "password": "123456",
    "conId": 0
}
```

- O token JWT retornado é armazenado com segurança (cookie HTTP Only + localStorage via `/api/auth/session`) e utilizado automaticamente nas chamadas protegidas (ex.: processos).
- A rota `/processos` é protegida via `middleware.ts`, redirecionando usuários não autenticados para `/login`.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
