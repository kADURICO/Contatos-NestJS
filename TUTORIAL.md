# Tutorial Passo a Passo: Construindo uma API com NestJS, Prisma e JWT

Este guia detalha o processo de criação de uma API Restful robusta utilizando **NestJS**, com persistência de dados via **Prisma ORM** (MySQL) e segurança (Autenticação e Autorização) via **JWT**. O foco principal do projeto é um sistema de gerenciamento de contatos por usuários.

O objetivo deste documento não é fornecer um "copia e cola" do código final, mas sim **explicar o fluxo de desenvolvimento e os comandos necessários** para que você entenda *como* e *por que* cada peça se encaixa na arquitetura.

---

## 1. Inicializando o Projeto (NestJS)

O primeiro passo é criar a base da aplicação utilizando o CLI (Interface de Linha de Comando) do NestJS. O CLI cria uma estrutura de pastas organizada e já configurada com TypeScript.

**Comandos:**
```bash
# Caso não tenha o CLI instalado globalmente
npm i -g @nestjs/cli

# Cria um novo projeto chamado "contatos-nest"
nest new contatos-nest

# Entre na pasta do projeto
cd contatos-nest
```

Durante o desenvolvimento, precisaremos validar os dados recebidos na nossa API (por exemplo, garantir que um e-mail é válido). O NestJS integra muito bem com as bibliotecas `class-validator` e `class-transformer`.

**Comandos de Instalação:**
```bash
npm install class-validator class-transformer
```

> **📚 Documentação Útil:** 
> - [Primeiros Passos - NestJS](https://docs.nestjs.com/first-steps)
> - [Validação e Pipes - NestJS](https://docs.nestjs.com/techniques/validation)

---

## 2. Configurando o Banco de Dados com Prisma ORM

O **Prisma** é um ORM (Object-Relational Mapper) de última geração para Node.js e TypeScript. Ele facilita a comunicação com o banco de dados oferecendo um construtor de queries com tipagem forte e migrações automatizadas.

**Passo 2.1: Instalação e Inicialização**
```bash
# Instala o CLI do Prisma como dependência de desenvolvimento
npm install prisma --save-dev

# Instala o Cliente do Prisma que será usado no código
npm install @prisma/client

# Inicializa o Prisma no projeto
npx prisma init
```
O comando `init` criará uma pasta `prisma` com o arquivo `schema.prisma` e um arquivo `.env` na raiz do seu projeto. 

No `.env`, você configurará a sua **Connection String** apontando para o seu banco MySQL (ou outro banco escolhido).

**Passo 2.2: Modelagem de Dados (`schema.prisma`)**
É aqui que você define o esqueleto do seu banco de dados. No nosso caso, temos um `User`, um `Contact` (relacionado com User) e um `Role` (enum para regras).

*Exemplo de estrutura (referência para construir o seu):*
- Um modelo `User` com `id`, `name`, `email`, `password`, `role` e uma relação de 1 para N (um para muitos) com `Contact`.
- Um modelo `Contact` com os dados do contato e uma chave estrangeira apontando para `User`.

**Passo 2.3: Migrações e Geração do Cliente**
Depois de escrever seu schema, você precisa sincronizar essas tabelas no seu banco de dados real e gerar as tipagens TypeScript.

```bash
# Cria e aplica uma migração no banco de dados
npx prisma migrate dev --name init

# (Opcional, mas recomendado) Caso altere o schema futuramente:
npx prisma generate
```

**Passo 2.4: Módulo do Prisma no NestJS**
Como o NestJS trabalha com injeção de dependências, a melhor prática é ter um módulo e um serviço exclusivo para o Prisma.

```bash
# O CLI do NestJS gera os arquivos para você
nest generate module prisma
nest generate service prisma
```
Dentro do `PrismaService`, você implementará o `OnModuleInit` e fará a conexão com o banco extendendo o `PrismaClient`.

> **📚 Documentação Útil:** 
> - [Prisma + NestJS](https://docs.nestjs.com/recipes/prisma)
> - [Modelagem de Dados no Prisma](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model)

---

## 3. Construindo o CRUD de Usuários e Contatos

O NestJS possui um gerador de recursos maravilhoso chamado `resource`. Ele já cria todo o boilerplate: Module, Controller, Service, Entidades e DTOs para criar um CRUD.

**Comandos:**
```bash
nest generate resource users
nest generate resource contacts
```
*(Selecione a opção "REST API" e concorde com a geração dos entry points).*

**Fluxo de Trabalho em cada Recurso:**
1. **DTOs (Data Transfer Objects):** Na pasta `dto`, você definirá o que o usuário deve enviar. Exemplo: no `create-user.dto.ts`, você colocará `@IsEmail()` no campo de email e `@IsString()` no nome.
2. **Controller:** Define as rotas (ex: `@Post()`, `@Get()`) e chama as funções do Service.
3. **Service:** É aqui que a mágica (e a regra de negócio) acontece. Você deve injetar o `PrismaService` no construtor do Service (ex: `UsersService`) e usar os métodos do Prisma (`this.prisma.user.create(...)`) para manipular os dados no banco.

---

## 4. Segurança: Autenticação (JWT + Passport)

A autenticação garante *quem* é a pessoa acessando a API. Usaremos JWT (JSON Web Tokens) e a biblioteca Passport, que são os padrões recomendados pelo NestJS.
Como também precisamos salvar a senha de forma criptografada, usaremos o `bcrypt`.

**Passo 4.1: Instalação das Bibliotecas**
```bash
# Bibliotecas principais
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt

# Tipagens (devDependencies)
npm install --save-dev @types/passport-jwt @types/bcrypt
```

**Passo 4.2: Configurando a Lógica de Hash da Senha**
Antes de salvar um usuário no banco (lá no seu `UsersService` -> método `create`), você deve criptografar a senha usando o `bcrypt.hash()`.

**Passo 4.3: Criando o Módulo de Autenticação**
Vamos organizar a auth em seu próprio domínio.

```bash
nest generate module auth
nest generate service auth
nest generate controller auth
```

No `AuthModule`, você precisa importar o `JwtModule.register()` com as opções do seu secret JWT (recomenda-se colocar no `.env`) e do tempo de expiração do token (ex: `{ expiresIn: '1h' }`).

**Passo 4.4: Endpoint de Login**
No `AuthController`, você criará uma rota `@Post('login')`.
O `AuthService` vai procurar o usuário pelo e-mail fornecido e, com o `bcrypt.compare()`, validar se a senha bate com o hash no banco. Se tudo der certo, você gera o Token (usando `this.jwtService.sign()`) e retorna ao cliente.

**Passo 4.5: Estratégia e Proteção de Rotas (Guards)**
Para que o NestJS saiba extrair e ler o Token enviado pelo cliente, você cria uma classe "JwtStrategy" (extendendo de `PassportStrategy`).

Feito isso, em qualquer rota (ex: no `ContactsController`) você só precisa colocar o decorator:
```typescript
@UseGuards(AuthGuard('jwt'))
@Get()
findAll() { ... }
```
Assim, apenas requisições com um token JWT válido conseguirão acessar.

> **📚 Documentação Útil:** 
> - [Autenticação no NestJS](https://docs.nestjs.com/security/authentication)
> - [Bcrypt: Hashing Passwords](https://github.com/kelektiv/node.bcrypt.js)

---

## 5. Autorização (Controle de Acesso Baseado em Roles)

A autorização garante *o que* a pessoa autenticada pode fazer. Por exemplo, somente um usuário `ADMIN` deveria poder deletar contas de outros usuários.

**Passo 5.1: Criando Decorators Customizados**
Para deixar o código limpo, cria-se um decorator customizado chamado `@Roles()`, onde você passa quem pode acessar aquela rota.
```typescript
// Exemplo de uso
@Roles(Role.ADMIN)
@Delete(':id')
removeUser(...) { ... }
```

**Passo 5.2: O RolesGuard**
Em seguida, você cria um `RolesGuard` (que implementa a interface `CanActivate`). 
Esse Guard vai:
1. Usar o `Reflector` do NestJS para ler qual Role a rota está exigindo (no caso, ADMIN).
2. Pegar o usuário logado de dentro do objeto `request` (o AuthGuard do JWT já populou esse dado).
3. Verificar se a role do usuário bate com a exigida. Se sim, deixa passar; se não, retorna erro 403 Forbidden.

> **📚 Documentação Útil:** 
> - [Autorização no NestJS](https://docs.nestjs.com/security/authorization)
> - [Guards - NestJS](https://docs.nestjs.com/guards)

---

## Conclusão e Resumo do Fluxo do Projeto

Se você seguir este caminho de construção, você terá dominado os principais pilares de uma arquitetura limpa em backend moderno:

1. **Definição de Estrutura:** Usando `nest g` e se aproveitando dos Módulos.
2. **Definição de Dados:** Usando `schema.prisma` e as migrações automáticas.
3. **Casos de Uso (CRUD):** Usando os Services como intermediários entre Controladores (Rotas) e Prisma.
4. **Segurança:** Isolando a camada de autenticação e usando o ecossistema maduro do Passport e Guards do NestJS.

Sempre que tiver dúvidas sobre como implementar um decorator ou como lidar com as validações, a documentação oficial do NestJS é extremamente completa e serve como a melhor fonte de verdade.
