# Sentinel4SEC

API Node.js/Express com AES-256-GCM, JWT, rate limiting e logging, protegendo dados emergéticos inspirados no SCALE (Marvuglia et al., 2013).

## Setup

```bash
npm install
cp .env.example .env
```

Gerar as chaves e colar no `.env` (`JWT_SECRET` e `ENCRYPTION_KEY`):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Rodar:

```bash
npm start
```

## Testes

```bash
bash tests/test-pillars.sh
```

## Arquitetura

```
routes/       endpoints
controllers/  request/response
services/     regra de negocio
repositories/ acesso ao banco
models/       schema das tabelas
middleware/   auth, rate limit, logging
```

## Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | /api/auth/register | não | Cadastro |
| POST | /api/auth/login | limitada | Login, retorna JWT |
| GET | /api/emergy | sim | Lista dados |
| POST | /api/emergy | sim | Cria dado (cifrado) |
| DELETE | /api/emergy/:id | admin | Exclui registro |
