# 🧪 Fluxos de Teste - Sistema de OS

Abaixo estão os fluxos para validar o funcionamento do sistema.  
Cada fluxo representa um cenário específico, com **endpoints** para execução.

---

## 1️⃣ Cenário Feliz (com serviços e peças)
1. Criar usuário:  
POST /users

2. Criar veículo:  
POST /vehicle

3. Criar OS (com serviços e peças):  
POST /service-order

4. Mecânico aceita OS:  
POST /service-order/{id}/accept

5. Mecânico inicia OS:  
POST /service-order/{id}/start

6. Mecânico finaliza OS:  
POST /service-order/{id}/finish

7. Cliente sinaliza entrega da OS:  
POST /service-order/{id}/deliverd

---

## 2️⃣ Cenário Ruim (com serviços e peças - mecânico recusa)
1. Criar usuário:  
POST /users

2. Criar veículo:  
POST /vehicle

3. Criar OS (com serviços e peças):  
POST /service-order

4. Mecânico recusa OS:  
POST /service-order/{id}/accept

---

## 3️⃣ Cenário Feliz (sem serviços e peças)
1. Criar usuário:  
POST /users

2. Criar veículo:  
POST /vehicle

3. Criar OS (sem serviços e peças):  
POST /service-order

4. Mecânico aceita OS:  
POST /service-order/{id}/accept

5. Mecânico gera diagnóstico e orçamento:  
POST /service-order/{id}/budget

6. Cliente aprova OS:  
POST /budget/{id}/accept

7. Mecânico inicia OS:  
POST /service-order/{id}/start

8. Mecânico finaliza OS:  
POST /service-order/{id}/finish

9. Cliente sinaliza entrega da OS:  
POST /service-order/{id}/deliverd

---

## 4️⃣ Cenário Ruim (sem serviços e peças - mecânico nega)
1. Criar usuário:  
POST /users

2. Criar veículo:  
POST /vehicle

3. Criar OS (sem serviços e peças):  
POST /service-order

4. Mecânico nega OS:  
POST /service-order/{id}/accept

---

## 5️⃣ Cenário Ruim (sem serviços e peças - cliente nega)
1. Criar usuário:  
POST /users

2. Criar veículo:  
POST /vehicle

3. Criar OS (sem serviços e peças):  
POST /service-order

4. Mecânico aceita OS:  
POST /service-order/{id}/accept

5. Mecânico gera diagnóstico e orçamento:  
POST /service-order/{id}/budget

6. Cliente reprova OS:  
POST /budget/{id}/accept