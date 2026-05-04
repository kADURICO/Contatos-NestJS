# Como Testar a Aplicacao

Este documento descreve o passo a passo para testar as novas implementacoes de seguranca, autenticacao e vinculacao de contatos da API.

## 1. Preparando o Ambiente e Banco de Dados

1. Certifique-se de que o seu servidor MySQL (XAMPP, Docker ou instalacao local) esta em execucao na porta 3306.
2. Abra o terminal na raiz do projeto e execute a migration para atualizar as tabelas do banco de dados:
   ```bash
   npx prisma migrate dev --name init_auth
   ```
3. Inicie a aplicacao em modo de desenvolvimento:
   ```bash
   npm run start:dev
   ```

## 2. Testando o Fluxo de Usuarios e Autenticacao

Para fazer as requisicoes HTTP, voce pode utilizar ferramentas como Postman, Insomnia ou cURL.

### Passo A: Criar um Usuario
Envie uma requisicao POST para `/users` com um corpo JSON. A validacao exigira nome, um email valido e uma senha com no minimo 6 caracteres.

**POST** `http://localhost:3000/users`
**Body (JSON):**
```json
{
  "name": "Usuario Teste",
  "email": "teste@email.com",
  "password": "senha"
}
```

### Passo B: Fazer Login (Gerar o Token)
Envie uma requisicao POST para `/auth/login` utilizando as credenciais criadas no passo anterior. A resposta contera o Token JWT necessario para as proximas etapas.

**POST** `http://localhost:3000/auth/login`
**Body (JSON):**
```json
{
  "email": "teste@email.com",
  "password": "senha_segura"
}
```

**Resposta Esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUz..."
}
```

## 3. Testando o Fluxo de Contatos (Rotas Protegidas)

Agora que voce possui o `access_token`, adicione-o ao Header (Cabecalho) das proximas requisicoes no formato `Authorization: Bearer <seu_token>`. No Postman ou Insomnia, va ate a aba "Auth", selecione "Bearer Token" e cole o token.

### Passo C: Criar um Contato
Crie um contato vinculado ao usuario logado. Nao e necessario passar o `userId` no corpo da requisicao, pois o sistema o extraira automaticamente do Token.

**POST** `http://localhost:3000/contacts`
**Headers:** `Authorization: Bearer <seu_token>`
**Body (JSON):**
```json
{
  "name": "Contato 1",
  "email": "contato1@email.com",
  "phone": "99999-9999"
}
```

### Passo D: Listar os Contatos do Usuario
Faca uma requisicao GET para `/contacts`. A API retornara apenas os contatos criados pelo usuario correspondente ao Token (Isolamento de contatos).

**GET** `http://localhost:3000/contacts`
**Headers:** `Authorization: Bearer <seu_token>`

## 4. Testando Restricoes de Admin

Se voce tentar acessar a rota de listar todos os usuarios:

**GET** `http://localhost:3000/users`
**Headers:** `Authorization: Bearer <seu_token>`

A resposta sera `403 Forbidden` (Acesso Negado), pois o usuario recem-criado possui o cargo padrao (`USER`). Para testar funcionalidades de Admin, voce precisa alterar manualmente a coluna `role` no banco de dados para a string `ADMIN` e gerar um novo token fazendo login novamente.
