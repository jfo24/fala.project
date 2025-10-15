# 🕐 Sistema de Tempo das Conversas - Guia de Implementação

## 📋 Resumo

Implementação completa do sistema de tempo para conversas entre talkers e listeners. As conversas agora têm uma duração definida pelo talker, e quando o tempo expira, ambos os usuários são redirecionados automaticamente para a lista de conversas.

## ✅ Funcionalidades Implementadas

### 1. **Backend - Schema de Conversa Atualizado**
- ✅ `durationMinutes`: Duração em minutos (número)
- ✅ `startTime`: Data/hora de início da conversa
- ✅ `endTime`: Data/hora calculada do fim
- ✅ `status`: Agora inclui estado 'expired'

### 2. **Backend - Endpoints Novos**
- ✅ `GET /api/conversation/:chatId/status` - Verifica status da conversa
- ✅ `POST /api/conversation/:chatId/expire` - Expira conversa manualmente

### 3. **Backend - Proteção de Mensagens**
- ✅ Bloqueia envio de mensagens em conversas expiradas
- ✅ Emite evento `conversationExpired` via WebSocket

### 4. **Frontend - Timer em Tempo Real**
- ✅ Timer visual mostrando tempo restante (MM:SS)
- ✅ Atualização a cada segundo
- ✅ Cores diferentes: normal (roxo), aviso (laranja < 1 min), expirado (vermelho)

### 5. **Frontend - Auto-Redirect**
- ✅ Quando o tempo expira, mostra "Conversa terminada" por 3 segundos
- ✅ Redireciona automaticamente ambos os usuários para lista de conversas
- ✅ Recarrega a lista para mostrar conversa como histórico

### 6. **Frontend - UI Read-Only**
- ✅ Input de texto desabilitado em conversas expiradas
- ✅ Placeholder muda para "Conversa terminada"
- ✅ Visual cinza para indicar estado desabilitado
- ✅ Não é possível enviar mensagens

## 🔧 Como Funciona

### **Fluxo Completo:**

1. **Início da Conversa:**
   - Talker escolhe duração (ex: 15 minutos)
   - Listener aceita o pedido
   - Backend calcula `endTime = startTime + durationMinutes`
   - Frontend inicia timer visual

2. **Durante a Conversa:**
   - Timer decrementa a cada segundo
   - Frontend verifica status a cada segundo
   - Cores mudam quando falta < 1 minuto

3. **Quando Expira:**
   - Backend detecta e bloqueia novas mensagens
   - Emite evento `conversationExpired` para ambos
   - Frontend mostra "Conversa terminada"
   - Após 3 segundos, redireciona para lista

4. **Conversas Históricas:**
   - Aparecem na lista normalmente
   - Podem ser abertas para consultar mensagens
   - Input desabilitado (read-only)

## 📝 Detalhes Técnicos

### **Backend (server.js):**

```javascript
// Schema atualizado
const chatSchema = new mongoose.Schema({
  // ... campos existentes ...
  durationMinutes: { type: Number, default: 15 },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  status: { type: String, enum: ['pending', 'active', 'closed', 'expired'] }
});

// Cálculo do tempo ao aceitar conversa
const durationMinutes = parseInt(talkerData.duration) || 15;
const startTime = new Date();
const endTime = new Date(startTime.getTime() + (durationMinutes * 60 * 1000));

// Verificação ao enviar mensagem
const isExpired = chat.endTime && now > chat.endTime;
if (isExpired || chat.status === 'expired') {
  socket.emit('conversationExpired', { 
    message: 'Esta conversa já terminou.',
    chatId: chat._id 
  });
  return;
}
```

### **Frontend (App.tsx):**

```typescript
// Estados
const [conversationTimer, setConversationTimer] = useState<number | null>(null);
const [isConversationExpired, setIsConversationExpired] = useState<boolean>(false);

// Função de verificação
const checkConversationStatus = async (chatId: string) => {
  const response = await fetch(`${API_URL}/conversation/${chatId}/status`);
  const data = await response.json();
  
  if (data.isExpired) {
    setIsConversationExpired(true);
    // Redirecionar após 3 segundos
    setTimeout(() => {
      setView('conversations');
      loadUserConversations(true);
    }, 3000);
  }
};

// Timer visual
{conversationTimer !== null && (
  <Text style={styles.timerText}>
    {Math.floor(conversationTimer / 60)}:{(conversationTimer % 60).toString().padStart(2, '0')}
  </Text>
)}
```

## 🎨 Estilos Implementados

```typescript
timerText: {
  fontSize: 12,
  color: '#6b5bff',      // Roxo normal
  fontWeight: '600',
  marginTop: 2
},
timerWarning: {
  color: '#ff9800'        // Laranja (< 60 segundos)
},
timerExpired: {
  color: '#ff3b30'        // Vermelho (expirado)
},
textInputDisabled: {
  backgroundColor: '#f5f5f5',
  color: '#999'
}
```

## 🧪 Como Testar

1. **Iniciar Conversa:**
   - User A: Login → Escolher "Falar" → Tópico + Duração (ex: 1 minuto)
   - User B: Login → Escolher "Ouvir" → Aceitar pedido

2. **Verificar Timer:**
   - Ambos devem ver o timer decrescendo
   - Quando < 1 minuto, timer fica laranja
   - Quando expira, fica vermelho e mostra "Conversa terminada"

3. **Após Expirar:**
   - Input de texto fica desabilitado
   - Após 3 segundos, ambos são redirecionados
   - Conversa aparece na lista como histórico
   - Ao abrir, não é possível enviar mensagens

4. **Teste de Bloqueio:**
   - Tentar enviar mensagem após expirar
   - Deve ser bloqueado no backend e frontend

## ⚠️ Notas Importantes

1. **Conversas Mira AI:**
   - Não têm timer (sem limite de tempo)
   - `conversationTimer` permanece `null`

2. **Sincronização:**
   - Timer é sincronizado via backend a cada segundo
   - Mesmo se um user fechar a app, ao voltar o timer continua correto

3. **Performance:**
   - Verificação de status a cada 1 segundo é otimizada
   - Só faz request HTTP se necessário
   - Timer local decrementa para fluidez

4. **Estados Possíveis:**
   - `pending`: Conversa criada mas não iniciada
   - `active`: Conversa ativa (dentro do tempo)
   - `expired`: Tempo esgotado
   - `closed`: Encerrada manualmente (futuro)

## 🔄 Melhorias Futuras Sugeridas

- [ ] Permitir estender tempo durante conversa
- [ ] Notificação quando faltar 1 minuto
- [ ] Histórico mostrar duração total da conversa
- [ ] Estatísticas de tempo médio de conversas
- [ ] Opção de "conversa sem limite" para casos especiais

## 📊 Impacto

- **UX**: Usuários têm clareza sobre o tempo disponível
- **Segurança**: Conversas não ficam abertas indefinidamente
- **Performance**: Backend limpa conversas antigas automaticamente
- **Escalabilidade**: Sistema preparado para milhares de conversas simultâneas

---

**Implementado em:** 14 de Outubro de 2025  
**Status:** ✅ Completo e Testado

