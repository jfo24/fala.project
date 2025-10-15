# 🔔 Teste de Notificação "Talker Ocupado"

## 🎯 **Objetivo**
Verificar se quando um listener aceita uma conversa, os outros listeners recebem uma notificação informando que alguém já está ouvindo a pessoa.

## 📱 **Como Testar**

### **Cenário de Teste:**
1. **Dispositivo A**: Listener 1 (em modo "Quero ouvir")
2. **Dispositivo B**: Listener 2 (em modo "Quero ouvir") 
3. **Dispositivo C**: Talker (em modo "Preciso de falar")

### **Passo 1: Configurar Listeners**
1. **Dispositivo A**: Login → "Quero ouvir" → Aguardar no loading
2. **Dispositivo B**: Login → "Quero ouvir" → Aguardar no loading
3. **Verificar** que ambos estão online e em modo listen

### **Passo 2: Talker Inicia Procura**
1. **Dispositivo C**: Login → "Preciso de falar"
2. **Escolher** tópico e duração
3. **Aguardar** que a notificação apareça nos dois listeners

### **Passo 3: Primeiro Listener Aceita**
1. **Dispositivo A**: Clicar "Vou ouvir" na notificação
2. **Verificar** que a conversa inicia entre Talker e Listener 1
3. **Verificar** que Listener 1 vai para o chat

### **Passo 4: Verificar Notificação no Segundo Listener**
1. **Dispositivo B**: Deve receber uma notificação "Alguém já está a ouvir"
2. **Verificar** que a notificação original desaparece
3. **Verificar** que o alerta mostra a mensagem correta

## ✅ **Resultados Esperados**

### **No Backend (Logs):**
```
=== ACCEPTING TALKER REQUEST ===
RequestId: xxx
ListenerId: listener1_id
TalkerData: {...}

Creating chat with data: {...}
Chat created: chat_id

Notified talker: talker_id
Notified listener: listener1_id

Notifying other listeners that talker is occupied: 1
Notified other listener: listener2_id that talker is occupied
```

### **No Frontend (Listener 1 - que aceitou):**
- ✅ **Conversa inicia** normalmente
- ✅ **Chat screen** abre
- ✅ **Timer** aparece
- ✅ **Pode enviar mensagens**

### **No Frontend (Listener 2 - que não aceitou):**
- ✅ **Notificação original** desaparece
- ✅ **Alert aparece** com título "Alguém já está a ouvir"
- ✅ **Mensagem** mostra nome do talker + "já está a ser ouvido por alguém"
- ✅ **Pode clicar OK** para fechar

### **No Frontend (Talker):**
- ✅ **Conversa inicia** com Listener 1
- ✅ **Chat screen** abre
- ✅ **Timer** aparece
- ✅ **Pode enviar mensagens**

## 🐛 **Possíveis Problemas**

### **Listener 2 não recebe notificação:**
- Verificar se está online e em modo listen
- Verificar logs do backend para "Notifying other listeners"
- Verificar se socket está conectado

### **Notificação não desaparece:**
- Verificar se `currentTalkerRequest` está sendo limpo
- Verificar se `setShowTalkerNotification(false)` é chamado
- Verificar se `setCurrentTalkerRequest(null)` é chamado

### **Alert não aparece:**
- Verificar se `Alert` está importado
- Verificar logs do frontend para "TALKER OCCUPIED"
- Verificar se o evento `talkerOccupied` está sendo recebido

## 🔧 **Debug**

### **Logs do Backend:**
```javascript
// Verificar se outros listeners são encontrados
console.log('Notifying other listeners that talker is occupied:', allListeners.length);

// Verificar se cada listener é notificado
console.log('Notified other listener:', otherListener._id, 'that talker is occupied');
```

### **Logs do Frontend:**
```javascript
// Verificar se evento é recebido
console.log('=== TALKER OCCUPIED ===');
console.log('Talker Name:', data.talkerName);
console.log('Message:', data.message);

// Verificar se notificação é limpa
console.log('Hiding talker notification for:', data.talkerName);
```

## 📊 **Cenários de Teste**

### **Cenário 1: 2 Listeners Online**
- **Resultado**: 1 listener aceita, 1 recebe notificação "ocupado"
- **Esperado**: ✅ Funciona

### **Cenário 2: 3+ Listeners Online**
- **Resultado**: 1 listener aceita, 2+ recebem notificação "ocupado"
- **Esperado**: ✅ Todos recebem notificação

### **Cenário 3: Apenas 1 Listener Online**
- **Resultado**: Listener aceita, ninguém recebe notificação "ocupado"
- **Esperado**: ✅ Não há outros para notificar

### **Cenário 4: Listener Offline**
- **Resultado**: Listener offline não recebe notificação
- **Esperado**: ✅ Apenas listeners online são notificados

## 🎉 **Sucesso**
O teste é bem-sucedido quando:
1. ✅ Talker inicia procura e notifica todos os listeners
2. ✅ Primeiro listener aceita e inicia conversa
3. ✅ Outros listeners recebem notificação "ocupado"
4. ✅ Notificação original desaparece dos outros listeners
5. ✅ Alert informativo aparece nos outros listeners
6. ✅ Conversa funciona normalmente entre talker e primeiro listener

## 📝 **Notas**
- A notificação "ocupado" deve aparecer **imediatamente** após aceitação
- O alert deve ser **informativo** mas não intrusivo
- A notificação original deve **desaparecer** automaticamente
- O sistema deve funcionar com **qualquer número** de listeners online
- A funcionalidade deve ser **robusta** e não quebrar o fluxo normal
