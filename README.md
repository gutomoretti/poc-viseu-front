This repository delivers the PocViseu frontend (Next.js + PrimeReact) and connects to the ASP.NET Core 6 API available under `../backend`.

## Stack utilizada

- **Frontend**: Next.js 14 (App Router) com PrimeReact, PrimeFlex e PrimeIcons para os componentes responsivos.
- **Backend**: ASP.NET Core 6 + Entity Framework Core e MySQL (`poc_viseu`), com autenticação JWT e seeder automático.
- **Build/Dev tooling**: Node 18+, npm, .NET 6 SDK, XAMPP/MySQL 8+.

## Pré-requisitos

- Node.js 18 ou superior e npm (ou pnpm/yarn/bun).
- .NET 6 SDK instalado e disponível no `PATH`.
- Servidor MySQL configurado (pode ser XAMPP). Crie previamente o banco `poc_viseu` com collation `utf8mb4_general_ci`.

## Backend (ASP.NET Core)

1. Entre no diretório `backend`:
   ```bash
   cd backend
   ```
2. Ajuste `src/PocViseu.Api/appsettings.Development.json` com sua `DbConnection` (usuário/senha do MySQL) e, se necessário, `TokenKey`.
3. Instale/restaure dependências e compile:
   ```bash
   dotnet restore PocViseu.sln
   dotnet build PocViseu.sln
   ```
4. Execute a API:
   ```bash
   dotnet run --project src/PocViseu.Api/PocViseu.Api.csproj
   ```
   - A aplicação roda em `https://localhost:7227/` (Swagger em `https://localhost:7227/swagger`).
   - No primeiro boot o `Seeder` cria as tabelas e popula usuários/perfis.

## Frontend (Next.js)

1. Dentro de `front`, copie o arquivo de exemplo de variáveis e configure a URL da API (deve apontar para o backend rodando localmente):
   ```bash
   cp .env.local.example .env.local
   # edite NEXT_PUBLIC_API_BASE_URL, ex.: https://localhost:7227/
   ```
2. Instale dependências e suba o servidor de desenvolvimento:
   ```bash
   npm install
   npm run dev
   ```
3. Acesse `http://localhost:3000`. As rotas principais são:
   - `/login`: tela pública.
   - `/processos`: CRUD com PrimeReact DataTable (protegida por middleware).

### Autenticação e tokens

- O login chama `POST {API}/api/Auth/authenticate` com `username`, `password` e `conId`.
- O token JWT retornado é salvo via `/api/auth/session` (cookie HTTP Only + storage local) e usado automaticamente nas chamadas autenticadas (`ProcessoService`).
- Em caso de token ausente/expirado, o middleware redireciona o usuário para `/login`.

## Usuários para testes

| Perfil     | Usuário | Senha  | Observação                                                                              |
| ---------- | ------- | ------ | --------------------------------------------------------------------------------------- |
| Admin      | admin   | 123456 | Acesso completo: cria, edita e exclui processos e anexos.                               |
| Não-Admin  | viseu   | 123456 | Perfil comum: consegue listar/editar, mas botões de criação e exclusão ficam bloqueados |

*(Os dados acima são gerados pelo `Seeder` na primeira execução do backend.)*

## Resumo do fluxo

1. Inicialize o MySQL e confirme a existência do schema `poc_viseu`.
2. Suba a API (`dotnet run ...`). Ela garante as tabelas e insere os usuários de teste.
3. Ajuste `.env.local` do frontend apontando para `https://localhost:7227/`.
4. Rode `npm run dev` no diretório `front` e autentique-se com um dos logins acima para validar as regras de perfil.

Com isso é possível demonstrar o CRUD de Processos usando PrimeReact, validar as permissões Admin/Não-Admin e testar os fluxos requisitados.
