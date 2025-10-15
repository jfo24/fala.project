# 🏆 Sistema de Badges - Guia Completo

## 📊 **Novos Requisitos de Dificuldade**

### 🪶 **Nível 1 — Pebbie**
*(automático ao entrar em modo listen pela primeira vez)*
- 🕒 **Tempo mínimo:** —
- 💬 **Mensagens:** —
- ⭐ **Rating médio:** —

---

### ✨ **Nível 2 — Glowie**
- 💬 **Mensagens enviadas:** **60+**
- 🕒 **Tempo total de conversa:** **≥ 1 hora (60min)**
- ⭐ **Rating médio:** **≥ 4.2 / 5**

---

### 💌 **Nível 3 — Heartie**
- 💬 **Mensagens enviadas:** **180+**
- 🕒 **Tempo total de conversa:** **≥ 3 horas (180min)**
- ⭐ **Rating médio:** **≥ 4.4 / 5**

---

### 🌙 **Nível 4 — Lumi**
- 💬 **Mensagens enviadas:** **400+**
- 🕒 **Tempo total de conversa:** **≥ 8 horas (480min)**
- ⭐ **Rating médio:** **≥ 4.6 / 5**

---

### 🕊️ **Nível 5 — Seraphie**
- 💬 **Mensagens enviadas:** **850+**
- 🕒 **Tempo total de conversa:** **≥ 18 horas (1080min)**
- ⭐ **Rating médio:** **≥ 4.8 / 5**

## 🧪 **Como Testar o Sistema**

### **Teste Rápido (1 minuto):**
1. **Dispositivo A (Talker):**
   - Login → "Falar"
   - Duração: "1 min"
   - Dar rating: 5 corações

2. **Dispositivo B (Listener):**
   - Login → "Ouvir"
   - Aceitar conversa
   - Enviar 5-10 mensagens
   - Ver badge no header

### **Resultado Esperado:**
- ✅ **Tempo**: +1min ao total
- ✅ **Mensagens**: +5-10 ao total
- ✅ **Rating**: +5 ao total
- ✅ **Badge**: Pode evoluir se atingir requisitos

## 📈 **Progressão de Badges**

### **Exemplo de Progressão:**

#### **Para atingir Glowie ✨:**
- **60 mensagens** (6 conversas de 10 mensagens cada)
- **60 minutos** (6 conversas de 10 minutos cada)
- **Rating médio 4.2** (pelo menos 4-5 estrelas em todas as conversas)

#### **Para atingir Heartie 💌:**
- **180 mensagens** (18 conversas de 10 mensagens cada)
- **180 minutos** (18 conversas de 10 minutos cada)
- **Rating médio 4.4** (pelo menos 4-5 estrelas em todas as conversas)

## 🔍 **Como Verificar o Progresso**

1. **No Chat Header:**
   - Clique no badge para abrir o modal
   - Veja estatísticas atuais
   - Veja progresso para próximo badge

2. **No Modal de Badges:**
   - **Estatísticas**: Tempo, mensagens, conversas, rating médio
   - **Próximo Badge**: Progresso com barras visuais
   - **Todos os Badges**: Lista completa com requisitos

## 🎯 **Estratégias para Evoluir**

### **Para Mensagens:**
- Seja ativo nas conversas
- Faça perguntas abertas
- Demonstre interesse genuíno

### **Para Tempo:**
- Aceite conversas de duração maior
- Mantenha conversas engajadas
- Evite conversas muito curtas

### **Para Rating:**
- Seja empático e compreensivo
- Ouça ativamente
- Dê conselhos úteis quando apropriado
- Mantenha um tom positivo e acolhedor

## 🚀 **Funcionalidades Implementadas**

### **Backend:**
- ✅ Tracking automático de tempo de conversa
- ✅ Contagem de mensagens em tempo real
- ✅ Cálculo de rating médio
- ✅ Sistema de upgrade automático
- ✅ Logs detalhados de progressão

### **Frontend:**
- ✅ Badge visível no chat header
- ✅ Modal com estatísticas completas
- ✅ Barras de progresso visuais
- ✅ Lista de todos os badges
- ✅ Animações para badges desbloqueados

## 📱 **Como Usar**

1. **Entrar em modo "Ouvir"**
2. **Aceitar conversas de talkers**
3. **Enviar mensagens empáticas**
4. **Receber ratings dos talkers**
5. **Ver badge evoluir automaticamente**

## 🎉 **Logs de Debug**

### **Quando Upgrade Acontece:**
```
🎉 BADGE UPGRADE!
User: user123
Old badge: Pebbie
New badge: Glowie ✨
Stats: { time: 60, messages: 60, rating: 4.2 }
```

### **Quando Estatísticas São Atualizadas:**
```
Listener stats updated for user: user123
Added conversation time: 15 minutes
Listener message count updated for user: user123
```

## 🔧 **Configuração Técnica**

### **Backend (server.js):**
```javascript
const BADGE_LEVELS = [
  { level: 1, name: 'Pebbie', emoji: '🪶', requirements: { time: 0, messages: 0, rating: 0 } },
  { level: 2, name: 'Glowie', emoji: '✨', requirements: { time: 60, messages: 60, rating: 4.2 } },
  { level: 3, name: 'Heartie', emoji: '💌', requirements: { time: 180, messages: 180, rating: 4.4 } },
  { level: 4, name: 'Lumi', emoji: '🌙', requirements: { time: 480, messages: 400, rating: 4.6 } },
  { level: 5, name: 'Seraphie', emoji: '🕊️', requirements: { time: 1080, messages: 850, rating: 4.8 } }
];
```

### **Frontend (BadgeDisplay.tsx):**
- Modal responsivo com todas as informações
- Barras de progresso animadas
- Lista visual de todos os badges
- Indicadores de badges desbloqueados

## 🎯 **Objetivo do Sistema**

O sistema de badges foi projetado para:
- **Motivar** listeners a serem mais ativos
- **Recompensar** qualidade e consistência
- **Criar** senso de progressão e conquista
- **Incentivar** engajamento a longo prazo

**Agora os listeners podem evoluir através dos 5 níveis de badges automaticamente!** 🏆
