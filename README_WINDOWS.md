# Painel Medico - Dr. Diego Funahashi
# INSTRUCOES PARA WINDOWS

## 1. PRE-REQUISITOS
- Node.js 18+ instalado: https://nodejs.org
- Git instalado: https://git-scm.com/download/win

## 2. INSTALAR DEPENDENCIAS
Abra o Prompt de Comando (CMD) ou PowerShell na pasta do projeto:

    cd C:\Users\diego\Downloads\painel-medico-diego-COMPLETO
    npm install

Aguarde o download (pode levar 2-5 minutos).

## 3. CONFIGURAR FIREBASE
O arquivo .env.local JA VEM PREENCHIDO com seus dados do Firebase.
Se quiser conferir, abra o arquivo .env.local no Bloco de Notas.

## 4. RODAR O PROJETO
    npm run dev

Acesse no navegador: http://localhost:3000

## 5. PRIMEIRO ACESSO
1. Crie um usuario no Firebase Authentication:
   - Acesse: https://console.firebase.google.com
   - Vá em: Authentication → Users → Add user
   - Email: digofunahashi@gmail.com (ou qualquer email)
   - Senha: qualquer senha de 6+ digitos

2. Adicione o documento do medico no Firestore:
   - Coleção: users
   - Document ID: UID do usuario criado acima
   - Dados:
     {
       "uid": "COLOQUE_O_UID_AQUI",
       "email": "diegofunahashi@gmail.com",
       "role": "doctor",
       "isApproved": true,
       "guardianName": "Dr. Diego Funahashi",
       "active": true,
       "permissions": {
         "createReports": true,
         "createPrescriptions": true,
         "approveAppointments": true,
         "manageStaff": false
       }
     }

3. Volte no navegador (http://localhost:3000) e faça login.

## 6. DEPLOY (colocar no ar)
Veja o guia completo em: deploy/GUIA_DEPLOY.md

Resumo rapido:
1. Suba no GitHub
2. Conecte na Vercel (vercel.com)
3. Configure o subdominio: painel.drdiegofunahashi.com.br
