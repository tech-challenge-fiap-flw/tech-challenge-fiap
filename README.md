# 🛠️ Sistema de Ordem de Serviço e Controle de Estoque - Oficina Mecânica

## 📋 Descrição do Projeto
Este projeto é uma aplicação **backend** desenvolvida em **Node.js** para gerenciar **ordens de serviço** e **controle de estoque** em uma oficina mecânica.  
O sistema permite o registro de veículos, criação e gerenciamento de ordens de serviço (OS), atribuição de mecânicos, controle de orçamento, atualização de status e histórico de alterações.

### ⚙️ Principais Funcionalidades
- **Cadastro e gerenciamento de veículos**
- **Criação de ordens de serviço (OS)** com ou sem orçamento inicial
- **Atribuição de mecânicos** às ordens
- **Controle de estoque** de peças e materiais
- **Registro de histórico de alterações** de status (MongoDB)
- **Autenticação e autorização** com controle de permissões via *roles* (`admin`, `mechanic`)

---

## 🧩 Arquitetura Geral
A aplicação foi desenvolvida em **Node.js** com bancos de dados gerenciados na AWS: **RDS (MySQL)** e **DocumentDB (MongoDB)**.  
A validação de CPF é feita via **Lambda** no **API Gateway**.  
O deploy é feito em **Kubernetes** na AWS, provisionado via **Terraform**.

Infraestrutura e deploy são totalmente automatizados com:
- **Docker** para containerização
- **Kubernetes** para orquestração
- **Terraform** para infraestrutura (projetos separados)
- **GitHub Actions (CI/CD)**

---

## 🚀 Deploy na AWS

### 🧱 Pré-requisitos
- Acesso à AWS com permissões para EKS, RDS, DocumentDB, API Gateway, Lambda
- [kubectl](https://kubernetes.io/docs/tasks/tools/) configurado para o cluster EKS
- [Terraform](https://www.terraform.io/) (nos projetos de infraestrutura)
- [Node.js](https://nodejs.org/) (para build local)

### 🧰 Passos
1. **Clone o repositório**
   ```bash
   git clone https://github.com/lufepedrosa/tech-challenge-fiap
   cd tech-challenge-fiap
   ```

2. **Provisionar infraestrutura (projetos 2 e 3)**
   - Execute Terraform nos projetos de Infra K8s e Infra DB para criar EKS, RDS, DocumentDB, API Gateway, Lambda.

3. **Atualizar configurações**
   - Edite `k8s/configmap.yaml` e `k8s/secrets.yaml` com os endpoints e credenciais reais da AWS.
   - Substitua placeholders por valores reais (ex: rds-mysql-endpoint.amazonaws.com).

4. **Deploy no K8s**
   ```bash
   kubectl apply -f k8s/
   ```

5. **Acesse a aplicação**
   - Via API Gateway (URL fornecida pelo projeto 2).

## 🛠️ Tecnologias Utilizadas
- **Node.js** com **Express**
- **MySQL2** (RDS)
- **MongoDB Driver** (DocumentDB)
- **Docker**
- **JWT** para autenticação
- **Zod** para validação

---

## ✅ Testes Automatizados
O projeto utiliza **Jest** com **TypeScript (ts-jest)** para testes unitários. Os testes atuais cobrem a lógica de domínio e serviços do módulo de usuários, incluindo criação, atualização, remoção lógica, busca, listagem e contagem.

### Scripts Disponíveis

📌 Para testar localmente:
```bash
kubectl get hpa
kubectl get pods
```
Simule carga e observe o aumento de réplicas automaticamente.   

## 🏗️ Provisionamento da Infraestrutura com Terraform 
A infraestrutura AWS (EKS, RDS, DocumentDB) é provisionada automaticamente com Terraform nos projetos 2 e 3.

### 📋 O que é criado automaticamente
- Cluster EKS
- RDS MySQL
- DocumentDB MongoDB
- API Gateway com Lambda para validação de CPF

### ⚙️ Passos para provisionar
1. **Nos projetos 2 e 3, execute Terraform**
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```
   ```bash
   terraform apply -auto-approve
   ``` 
   
5. **Verifique os recursos criados**
   ```bash
   kubectl get all -n tech-challenge-fiap
   ```    

## 🔄 CI/CD (GitHub Actions)
A pipeline automatiza as etapas de **build, testes, análise de qualidade e deploy no Kubernetes.**

### ⚙️ Workflow: `.github/workflows/ci-cd.yml`
Etapas:
1. Checkout do código
2. Instalação e testes do Node.js
3. Build da aplicação
4. Build da imagem Docker
5. Deploy no cluster Kubernetes
   - Aplicação
   - MongoDB e MySQL
   - Configurações e HPA

A pipeline é executada automaticamente a cada push ou pull request nas branches `main` e `staging`.

## 🧪 Testes Automatizados
Os testes são executados automaticamente na pipeline (`npm test`).
Você também pode rodá-los localmente:
```bash
npm install
npm test
```

## 🛠️ Tecnologias Utilizadas
- Node.js
- MySQL
- MongoDB
- Docker & Docker Compose
- Kubernetes
- Terraform
- GitHub Actions (CI/CD)
- JWT Authentication

## 🧪 Cenários de Teste
Há um documento separado com 5 fluxos de testes completos, cobrindo cenários felizes e de erro.
🔗 [Acessar os fluxos de teste](./TEST_FLOWS.md)

## 🧊 Collection Postman
[tech_challenge.postman_collection.json](./tech_challenge.postman_collection.json)

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

## ✏️ Arquitetura Infraestrutura
![Alt text](arquitetura-infra.png)