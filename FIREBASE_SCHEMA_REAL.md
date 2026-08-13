# 📋 Schema Firebase Firestore - Painel Médico Dr. Diego Funahashi
## BASEADO NO BANCO REAL (agenda-5dee5)

---

## Estrutura de Coleções (Nível Raiz - SEM subcoleções)

```
agendamentos/{appointmentId}     ← Agendamentos de consultas
arquivos/{arquivoId}             ← Arquivos/Exames dos pacientes
articles/{articleId}             ← Artigos educativos (biblioteca)
chats/{msgId}                    ← Mensagens do chat
configuracoes_agenda/{configId}  ← Configuração da agenda por dia
consentimentos/{consentimentoId} ← Consentimentos assinados
diagnosticos/{diagnosisId}       ← Diagnósticos do paciente (histórico)
horarios_disponiveis/{slotId}    ← Slots de horário livres
laudos/{reportId}                ← Laudos médicos
notificacoes/{notificacaoId}     ← Notificações para usuários
patients/{patientId}             ← Pacientes (dados básicos)
receitas/{prescriptionId}        ← Receitas médicas
settings/{settingId}             ← Configurações da clínica
terapias/{therapyId}             ← Terapias do paciente
users/{uid}                      ← Usuários (médicos, pacientes, staff)
```

---

## 1. patients/{patientId}

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `patientID` | string | ID do paciente (ex: PAT-0001) |
| `nome completo` | string | Nome completo da criança |
| `nome do responsável` | string | Nome do responsável legal |
| `sexo` | string | "menino" ou "menina" |
| `data de nascimento` | timestamp | Data de nascimento |
| `idade` | string | Idade em anos (ex: "3") |
| `peso` | string | Peso em kg (ex: "10") |
| `cpf` | string | CPF do paciente/responsável |
| `email` | string | Email de contato |
| `telefone` | number | Telefone de contato |
| `endereco` | map | {rua, numero, bairro, cidade} |
| `localizacao` | string | "Araxá", "ABC", "São Paulo - Capital" |
| `source` | string | Origem: "agenda", "laudo", "receita", "portal", "whatsapp", "site" |
| `status` | string | "active", "inactive", "pending_review" |
| `createdAt` | timestamp | Data de cadastro |
| `updatedAt` | timestamp | Última atualização |

### Exemplo JSON:
```json
{
  "patientID": "PAT-0001",
  "nome completo": "João Silva Santos",
  "nome do responsável": "Maria Silva",
  "sexo": "menino",
  "data de nascimento": { "_seconds": 1785812400, "_nanoseconds": 0 },
  "idade": "3",
  "peso": "10",
  "cpf": "123.456.789-00",
  "email": "maria@email.com",
  "telefone": 11999999999,
  "endereco": { "rua": "Rua das Flores", "numero": "123", "bairro": "Centro", "cidade": "São Paulo" },
  "localizacao": "São Paulo - Capital",
  "source": "agenda",
  "status": "active",
  "createdAt": { "_seconds": 1785985200, "_nanoseconds": 0 },
  "updatedAt": { "_seconds": 1785985200, "_nanoseconds": 0 }
}
```

---

## 2. receitas/{prescriptionId}

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `prescriptionId` | string | ID da receita (ex: RX-0001) |
| `patientId` | string | Referência ao paciente |
| `doctorUid` | string | UID do médico que prescreveu |
| `endereco` | map | {rua, numero, bairro, cidade} do paciente na época |
| `cpf` | string | CPF na época da receita |
| `idade` | string | Idade na época |
| `peso` | string | Peso na época |
| `medicacoes` | array | Lista de medicamentos [{nome, dose, via, frequencia}] |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |

### Exemplo JSON:
```json
{
  "prescriptionId": "RX-0001",
  "patientId": "PAT-0001",
  "doctorUid": "Tb2s2NCNgedbHShQno0l8WzGF1u1",
  "endereco": { "cidade": "São Paulo", "rua": "Rua das Flores", "bairro": "Centro", "numero": "123" },
  "cpf": "123.456.789-00",
  "idade": "3",
  "peso": "10",
  "medicacoes": [
    { "nome": "Levetiracetam", "dose": "30 mg/kg/dia", "via": "oral", "frequencia": "De 12 em 12 horas" },
    { "nome": "Risperidona", "dose": "0,02 mg/kg/dia", "via": "oral", "frequencia": "À noite" }
  ],
  "createdAt": { "_seconds": 1786071600, "_nanoseconds": 0 },
  "updatedAt": { "_seconds": 1786071600, "_nanoseconds": 0 }
}
```

---

## 3. laudos/{reportId}

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `reportId` | string | ID do laudo (ex: LA-0001) |
| `patientId` | string | Referência ao paciente |
| `idade` | string | Idade na época do laudo |
| `data de nascimento` | timestamp | Data de nascimento do paciente |
| `appointmentId` | string | ID da consulta vinculada (ex: AG-0001) |
| `doctorUid` | string | UID do médico |
| `cidCodes` | array | Códigos CID-10/11 (ex: ["F84.0", "G40.0"]) |
| `diagnosisIds` | array | IDs dos diagnósticos (ex: ["DX-0001", "DX-0002"]) |
| `textoLaudo` | string | Texto completo do laudo |
| `status` | string | "draft", "signed", "amended" |
| `informacoes adiconais` | string | Observações adicionais |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |

### Exemplo JSON:
```json
{
  "reportId": "LA-0001",
  "patientId": "PAT-0001",
  "idade": "3",
  "data de nascimento": { "_seconds": 1785639600, "_nanoseconds": 0 },
  "appointmentId": "AG-0001",
  "doctorUid": "Tb2s2NCNgedbHShQno0l8WzGF1u1",
  "cidCodes": ["F84.0", "G40.0"],
  "diagnosisIds": ["DX-0001", "DX-0002"],
  "textoLaudo": "Paciente apresenta padrão de comportamento compatível com TEA...",
  "status": "signed",
  "informacoes adiconais": "Retorno em 30 dias. Orientações de segurança reforçadas.",
  "createdAt": { "_seconds": 1786071600, "_nanoseconds": 0 },
  "updatedAt": { "_seconds": 1786071600, "_nanoseconds": 0 }
}
```

---

## 4. diagnosticos/{diagnosisId}

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `diagnosisId` | string | ID do diagnóstico (ex: DX-0001) |
| `patientId` | string | Referência ao paciente |
| `cidCode` | string | Código CID (ex: "F84") |
| `nomeDiagnostico` | string | Nome do diagnóstico |
| `descricao` | string | Texto resumido do quadro |
| `dataInicio` | timestamp | Data do diagnóstico |
| `status` | string | "active", "resolved", "suspected" |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |

---

## 5. terapias/{therapyId}

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `therapyId` | string | ID da terapia (ex: TH-0001) |
| `patientId` | string | Referência ao paciente |
| `nomeTerapia` | string | Nome da terapia (ex: "ABA") |
| `tipo` | string | Tipo: "psicologia", "fono", "TO", etc. |
| `status` | string | "active", "past", "planned" |
| `descricao` | string | Detalhes importantes |
| `frequencia por semana` | number | Horas/semana |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |

---

## 6. agendamentos/{appointmentId}

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `appointmentId` | string | ID do agendamento (ex: AG-0001) |
| `patientId` | string | Referência ao paciente |
| `dataHora` | timestamp | Data e hora da consulta |
| `tipoConsulta` | string | "primeira", "retorno", "encaixe", "avaliacao", "teleconsulta" |
| `status` | string | "pendente", "confirmada", "cancelada", "no-show", "retorno" |
| `source` | string | "whatsapp", "site", "portal" |
| `doctorUid` | string | UID do médico |
| `createdByUid` | string | UID de quem criou |
| `slotId` | string | ID do slot (ex: SLOT-SP-2026-08-10-0800) |
| `inicioEm` | timestamp | Início da consulta |
| `unidadeId` | string | "sp_capital", "abc", "araxa" |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |

---

## 7. users/{uid}

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `uid` | string | UID do Firebase Auth |
| `email` | string | Email |
| `role` | string | "doctor", "patient", "staff" |
| `isApproved` | boolean | Aprovado pelo médico? |
| `guardianName` | string | Nome do responsável/doutor |
| `childName` | string | Nome da criança (apenas pacientes) |
| `childAge` | string | Idade da criança (apenas pacientes) |
| `patientId` | string | ID do paciente vinculado (apenas pacientes) |
| `active` | boolean | Usuário ativo? |
| `permissions` | map | {createReports, createPrescriptions, approveAppointments, manageStaff} |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |

---

## 8. consentimentos/{consentimentoId}

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `CONS-0001` | string | ID do consentimento |
| `patientId` | string | Referência ao paciente |
| `userUid` | string | UID do responsável que assinou |
| `versaoTermo` | timestamp | Versão do termo |
| `aceito` | boolean | Aceitou? |
| `aceitoEm` | timestamp | Data da assinatura |
| `tipo` | string | "portal", "comunicacao_whatsapp", "compartilhamento_documentos", "telemedicina", "marketing", "curso_personalizado" |

---

## 9. arquivos/{arquivoId}

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ARQ-0001` | string | ID do arquivo |
| `patientId` | string | Referência ao paciente |
| `nomeOriginal` | string | Nome original do arquivo |
| `storagePath` | string | Caminho no Firebase Storage |
| `createdAt` | timestamp | Data de upload |
| `categoria` | string | "exame", "relatorio_escolar", "relatorio_terapeutico", "laudo" |

---

## 10. configuracoes_agenda/{configId}

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `configId` | string | ID da config (ex: CFG-SP-SEG) |
| `doctorUid` | string | UID do médico |
| `unidadeId` | string | "sp_capital", "abc", "araxa" |
| `diaSemana` | array | ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"] |
| `inicioAtendimento` | string | "08:00" |
| `fimAtendimento` | string | "18:00" |
| `duracaoMinutos` | number | 50 |
| `modalidade` | string | "presencial" ou "teleconsulta" |
| `tiposConsultaPermitidos` | array | ["primeira_consulta", "retorno", "encaixe", "avaliacao", "teleconsulta"] |
| `maximoAgendamentosDia` | string | "8" |
| `antecedenciaMinimaHoras` | number | 12 |
| `ativo` | string | "true" |
| `intervaloMinutos` | number | 10 |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |

---

## 11. settings/{settingId}

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `clinic_config` | map | Configurações da clínica |
| `locationDays` | map | Dias por localidade {Araxá: [3,4,5], São Paulo: [3], Santo André: [4], Teleconsulta: [5,6]} |
| `blockedSlots` | array | Slots bloqueados |
| `araxaWeek` | string | Semana de Araxá |

---

## Regras de Segurança (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Função helper: verifica se é médico
    function isDoctor() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor';
    }

    // Função helper: verifica se é o próprio paciente
    function isOwnPatient() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.patientId == resource.data.patientId;
    }

    // Função helper: verifica se é staff aprovado
    function isApprovedStaff() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff' &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isApproved == true;
    }

    // Pacientes: médico lê/escreve tudo; paciente lê apenas o próprio
    match /patients/{patientId} {
      allow read: if isDoctor() || isOwnPatient();
      allow write: if isDoctor() || isApprovedStaff();
    }

    // Receitas: médico lê/escreve; paciente lê o próprio
    match /receitas/{prescriptionId} {
      allow read: if isDoctor() || (isOwnPatient() && resource.data.patientId == request.auth.uid);
      allow write: if isDoctor();
    }

    // Laudos: médico lê/escreve; paciente lê o próprio
    match /laudos/{reportId} {
      allow read: if isDoctor() || (isOwnPatient() && resource.data.patientId == request.auth.uid);
      allow write: if isDoctor();
    }

    // Diagnósticos: médico lê/escreve; paciente lê o próprio
    match /diagnosticos/{diagnosisId} {
      allow read: if isDoctor() || isOwnPatient();
      allow write: if isDoctor();
    }

    // Terapias: médico lê/escreve; paciente lê o próprio
    match /terapias/{therapyId} {
      allow read: if isDoctor() || isOwnPatient();
      allow write: if isDoctor();
    }

    // Agendamentos: médico/staff lê/escreve; paciente lê o próprio
    match /agendamentos/{appointmentId} {
      allow read: if isDoctor() || isApprovedStaff() || isOwnPatient();
      allow write: if isDoctor() || isApprovedStaff();
    }

    // Configurações da agenda: apenas médico
    match /configuracoes_agenda/{configId} {
      allow read: if isDoctor() || isApprovedStaff();
      allow write: if isDoctor();
    }

    // Settings: apenas médico
    match /settings/{settingId} {
      allow read: if isDoctor() || isApprovedStaff();
      allow write: if isDoctor();
    }

    // Consentimentos: médico lê; paciente lê/escreve o próprio
    match /consentimentos/{consentimentoId} {
      allow read: if isDoctor() || isOwnPatient();
      allow write: if request.auth != null;
    }

    // Arquivos: médico lê/escreve; paciente lê o próprio
    match /arquivos/{arquivoId} {
      allow read: if isDoctor() || isOwnPatient();
      allow write: if isDoctor();
    }

    // Notificações: usuário lê/escreve o próprio
    match /notificacoes/{notificacaoId} {
      allow read, write: if request.auth != null && 
        resource.data.userUid == request.auth.uid;
    }

    // Artigos: todos leem (público)
    match /articles/{articleId} {
      allow read: if true;
      allow write: if isDoctor();
    }

    // Chats: participantes da conversa
    match /chats/{msgId} {
      allow read, write: if request.auth != null;
    }

    // Usuários: próprio lê/escreve; médico lê todos
    match /users/{uid} {
      allow read: if request.auth != null && (request.auth.uid == uid || isDoctor());
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## Índices Compostos Necessários

Crie no Firebase Console → Firestore Database → Indexes:

**Coleção: receitas**
- `patientId` (Ascending) + `createdAt` (Descending)

**Coleção: laudos**
- `patientId` (Ascending) + `createdAt` (Descending)

**Coleção: diagnosticos**
- `patientId` (Ascending) + `createdAt` (Descending)

**Coleção: terapias**
- `patientId` (Ascending) + `createdAt` (Descending)

**Coleção: agendamentos**
- `patientId` (Ascending) + `dataHora` (Descending)
- `doctorUid` (Ascending) + `dataHora` (Descending)
- `status` (Ascending) + `dataHora` (Descending)

**Coleção: arquivos**
- `patientId` (Ascending) + `createdAt` (Descending)

**Coleção: patients**
- `nome completo` (Ascending)
- `status` (Ascending) + `createdAt` (Descending)
