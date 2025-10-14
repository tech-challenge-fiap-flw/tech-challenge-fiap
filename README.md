# 🛠️ Sistema de Ordem de Serviço e Controle de Estoque - Oficina Mecânica

## 📋 Descrição do Projeto
Este projeto é uma aplicação **backend** desenvolvida em **Nest.js** para gerenciar **ordens de serviço** e **controle de estoque** em uma oficina mecânica.  
O sistema permite o registro de veículos, criação e gerenciamento de ordens de serviço (OS), atribuição de mecânicos, controle de orçamento, atualização de status e histórico de alterações.

### Principais Funcionalidades
- **Cadastro e gerenciamento de veículos**
- **Criação de ordens de serviço** com ou sem orçamento inicial
- **Atribuição de mecânicos** às ordens
- **Controle de estoque** de peças
- **Registro de histórico de alterações** (MongoDB) para cada OS
- **Autenticação e autorização** com controle de permissões via *roles* (`admin`, `mechanic`)

---

## 🚀 Como Rodar o Projeto
### Pré-requisitos
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Passos para execução
1. **Clone o repositório**
   ```bash
   git clone https://github.com/lufepedrosa/tech-challenge-fiap
   ```

2. **Copie o arquivo .env.example para .env e configure as variáveis**
   ```bash
   cp .env.local
   ```

3. **Suba os containers com Docker Compose**
   ```bash
   docker compose up --build
   ```

4. **Acesse a aplicação**
   ```bash
   API: http://localhost:3000
   ```

---   

## 🧪 Cenários de Teste
Para facilitar a validação do projeto, criamos um arquivo separado com **5 fluxos completos de teste**, cobrindo cenários felizes e cenários de erro.

🔗 [Acessar os fluxos de teste](./TEST_FLOWS.md)

---

## 🛠️ Tecnologias Utilizadas
- **Nest.js**
- **TypeORM** (MySQL)
- **Mongoose** (MongoDB)
- **Docker & Docker Compose**
- **JWT** para autenticação

---

## ✅ Testes Automatizados
O projeto utiliza **Jest** com **TypeScript (ts-jest)** para testes unitários. Os testes atuais cobrem a lógica de domínio e serviços do módulo de usuários, incluindo criação, atualização, remoção lógica, busca, listagem e contagem.

### Scripts Disponíveis

```bash
npm test            # Executa a suíte uma vez
npm run test:watch  # Executa em modo watch
npm run test:coverage # Gera relatório de cobertura em ./coverage
```

### Estrutura de Testes
Os arquivos de teste ficam ao lado do código em pastas `__tests__` ou com sufixo `.spec.ts`.

### Adicionando Novos Testes
1. Crie um arquivo `*.spec.ts` dentro do módulo alvo.
2. Use mocks para repositórios e serviços externos (exemplo em `src/modules/user/__tests__/mocks.ts`).
3. Evite acessar infraestrutura real (DB, redes) em testes unitários.


## ✉️ Notificações por E-mail de Status da OS
O histórico de mudanças de status de uma Ordem de Serviço agora dispara um e-mail automático para o cliente (dono da OS) utilizando **Nodemailer** e SMTP.

### Variáveis de Ambiente Necessárias
Adicione ao seu `.env`:

```
EMAIL_HOST=smtp.seuprovedor.com
EMAIL_PORT=587
EMAIL_USER=seu_usuario
EMAIL_PASS=seu_password
EMAIL_FROM="Nome da Oficina <no-reply@seu-dominio.com>"
```

Se alguma variável crítica estiver ausente, o sistema continuará funcionando mas os e-mails serão ignorados (um aviso será exibido no log).

### Personalização do Conteúdo
O conteúdo padrão inclui: número da OS, status anterior e novo status, além da data da alteração. Ajustes podem ser feitos em `src/modules/service-order-history/application/ServiceOrderHistoryService.ts`.

### Testes
Os testes de `ServiceOrderHistoryService` agora validam que o serviço de e-mail é chamado quando apropriado.

---