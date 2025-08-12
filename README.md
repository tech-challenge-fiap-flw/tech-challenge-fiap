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
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
   ```

2. **Copie o arquivo .env.example para .env e configure as variáveis**
   ```bash
   cp .env.example .env
   ```

3. **Suba os containers com Docker Compose**
   ```bash
   docker compose up --build
   ```

4. **Acesse a aplicação**
   ```bash
   API: http://localhost:3000
   Documentação Swagger: http://localhost:3000/api
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
- **Swagger** para documentação
- **JWT** para autenticação