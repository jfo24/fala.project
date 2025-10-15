# 🔍 **Guia de Debug - Timer Não Aparece**

## 🎯 **Problema Identificado**

O timer não aparece quando inicias uma conversa nova. Adicionei logs de debug para identificar onde está o problema.

## 🔧 **Logs de Debug Adicionados**

### **1. No `chatReady` (quando listener aceita):**
```javascript
console.log('Duration received from backend:', data.duration);
console.log('Duration set in conversation:', conversation.duration);
```

### **2. No `handleConversationSelect` (quando abres conversa):**
```javascript
console.log('=== STARTING TIMER FOR CONVERSATION ===');
console.log('Conversation:', conversation);
console.log('Duration from conversation:', conversation.duration);
console.log('Parsing duration:', conversation.duration);
console.log('Parsed duration to seconds:', fallbackDuration);
console.log('Timer set immediately:', fallbackDuration, 'seconds');
```

## 🧪 **Como Testar e Debug:**

### **Passo 1: Iniciar Aplicação**
```powershell
# Backend (já rodando)
cd fala-backend
node server.js

# Frontend (já iniciado)
cd fala-frontend/fala-mobile
npx expo start
```

### **Passo 2: Teste Completo**
1. **Dispositivo A (Talker):**
   - Login → "Falar"
   - Tópico: "Teste timer"
   - **Duração: "1 min"** ← Importante!
   - Clicar "Começar a falar"

2. **Dispositivo B (Listener):**
   - Login → "Ouvir"
   - Aguardar notificação
   - Clicar "Vou ouvir"

### **Passo 3: Verificar Logs**

**No Console do Frontend, procura por:**

#### **Logs do `chatReady`:**
```
=== CHAT READY ===
Duration: 1 min
Duration received from backend: 1 min
Duration set in conversation: 1 min
```

#### **Logs do Timer:**
```
=== STARTING TIMER FOR CONVERSATION ===
Duration from conversation: 1 min
Parsing duration: 1 min
Parsed duration to seconds: 60
Timer set immediately: 60 seconds
```

## 🔍 **Possíveis Problemas:**

### **Problema 1: Backend não envia duração**
**Sintoma:** `Duration received from backend: undefined`
**Solução:** Verificar se backend está enviando `duration` no `chatReady`

### **Problema 2: Duração não é parseada**
**Sintoma:** `Duration from conversation: 1 min` mas `Parsed duration to seconds: 900`
**Solução:** Lógica de parsing não está funcionando

### **Problema 3: Timer não é definido**
**Sintoma:** `Timer set immediately: 60 seconds` mas timer não aparece
**Solução:** Problema na UI ou estado

### **Problema 4: Conversa não é reconhecida como real**
**Sintoma:** `Mira AI conversation, no timer needed`
**Solução:** `conversation.partnerName` está como 'Mira AI'

## 📱 **Verificações na UI:**

### **1. Timer Visível:**
- Deve aparecer no topo da conversa
- Formato: `1:00` ou `0:59`
- Cor: Roxo (normal), Laranja (< 1 min), Vermelho (expirado)

### **2. Condições para Timer:**
```javascript
{conversationTimer !== null && currentConversation?.partnerName !== 'Mira AI' && (
  <Text style={styles.timerText}>
    {isConversationExpired 
      ? 'Conversa terminada' 
      : `${Math.floor(conversationTimer / 60)}:${(conversationTimer % 60).toString().padStart(2, '0')}`
    }
  </Text>
)}
```

## 🚨 **Se Timer Ainda Não Aparecer:**

### **Verificar Estados:**
```javascript
console.log('conversationTimer:', conversationTimer);
console.log('currentConversation?.partnerName:', currentConversation?.partnerName);
console.log('isConversationExpired:', isConversationExpired);
```

### **Verificar Condições:**
- `conversationTimer !== null` → Deve ser `true`
- `currentConversation?.partnerName !== 'Mira AI'` → Deve ser `true`
- `isConversationExpired` → Deve ser `false`

## 🔧 **Soluções Rápidas:**

### **Se Backend não envia duração:**
```javascript
// Em server.js, linha ~536
socket.emit('chatReady', { 
  chatId: chat._id,
  talkerName: talker.name,
  topic: talkerData.topic,
  duration: talkerData.duration // ← Verificar se existe
});
```

### **Se Parsing não funciona:**
```javascript
// Adicionar mais casos no frontend
if (conversation.duration.includes('1 min')) {
  fallbackDuration = 1 * 60;
}
// ... outros casos
```

### **Se Timer não aparece:**
```javascript
// Forçar timer para debug
setConversationTimer(60); // 1 minuto fixo
```

## 📊 **Resultado Esperado:**

Após o teste, deves ver:
1. ✅ **Logs completos** no console
2. ✅ **Timer visível** no topo da conversa
3. ✅ **Timer decrementando** a cada segundo
4. ✅ **Cores mudando** quando < 1 minuto

---

**Testa agora e partilha os logs que aparecem no console!** 🔍
