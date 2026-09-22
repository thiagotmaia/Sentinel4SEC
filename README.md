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

Criar um administrador (não é possível se autopromover via `/api/auth/register`; a criação é feita fora da API pública):

```bash
node scripts/create-admin.js <usuario> <senha>
```

Gerar o certificado TLS autoassinado (habilita HTTPS; sem ele o servidor sobe em HTTP):

```bash
bash scripts/generate-cert.sh
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
| POST | /api/auth/register | não | Cadastro (sempre como usuario comum) |
| POST | /api/auth/login | limitada (IP + usuario) | Login, retorna JWT |
| GET | /api/emergy | sim | Lista dados |
| POST | /api/emergy | sim | Cria dado (cifrado) |
| DELETE | /api/emergy/:id | admin | Exclui registro |
| GET | /api/admin/logs | admin | Consulta logs de auditoria |

## Notas de seguranca

- Administradores nao sao criados via `/api/auth/register`; use `scripts/create-admin.js`.
- Cada requisicao autenticada revalida o usuario no banco (nao confia apenas no payload do JWT), entao usuarios excluidos ou com role alterada perdem acesso imediatamente, sem esperar o token expirar.
- Login bloqueia por usuario (alem de por IP) apos exceder `LOGIN_MAX_ATTEMPTS` tentativas falhas dentro de `LOGIN_WINDOW_MINUTES`.
- Erros inesperados (nao previstos pela regra de negocio) retornam mensagem generica ao cliente; o detalhe fica apenas no log do servidor.
- HTTPS: o servidor sobe em `https://localhost:3000` quando `certs/key.pem` e `certs/cert.pem` existem (gerados por `scripts/generate-cert.sh`); caso contrario, cai automaticamente para HTTP e avisa no console. O certificado e autoassinado (uso local/demonstracao), entao o navegador e o `curl` vao acusar "nao confiavel" — use `curl -k` ou aceite o aviso do navegador. Em producao, o normal e um certificado emitido por uma CA (ex: Let's Encrypt) e o TLS terminado num proxy reverso (nginx, load balancer), nao direto na aplicacao.
