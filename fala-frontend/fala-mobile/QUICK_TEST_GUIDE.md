# ⚡ **Guia de Teste Rápido - Timer de 1 Minuto**

## 🎯 **Teste Super Rápido do Sistema de Timer**

Agora podes testar o sistema de tempo das conversas em apenas **1 minuto**!

### 📱 **Como Testar:**

#### **Passo 1: Preparar Dois Dispositivos**
- **Dispositivo A** (Talker): Telemóvel ou browser
- **Dispositivo B** (Listener): Telemóvel ou browser

#### **Passo 2: Iniciar Backend**
```powershell
cd fala-backend
node server.js
```

#### **Passo 3: Iniciar Frontend**
```powershell
cd fala-frontend/fala-mobile
npx expo start
```

#### **Passo 4: Teste Rápido (1 minuto)**

**No Dispositivo A (Talker):**
1. ✅ Login → "Falar"
2. ✅ Tópico: "Teste rápido"
3. ✅ **Duração: "1 min"** ← **NOVA OPÇÃO!**
4. ✅ Clicar "Começar a falar"
5. ✅ Aguardar notificação aparecer

**No Dispositivo B (Listener):**
1. ✅ Login → "Ouvir"
2. ✅ Aguardar notificação popup
3. ✅ Clicar "Vou ouvir"

**Ambos os Dispositivos:**
1. ✅ Ver timer: **1:00** → **0:59** → **0:58**...
2. ✅ Quando < 1 minuto: Timer fica **laranja**
3. ✅ Quando expira: Timer fica **vermelho** + "Conversa terminada"
4. ✅ Após 3 segundos: Ambos voltam para lista de conversas

### 🎨 **O que Verás:**

#### **Timer Visual:**
- 🟣 **Roxo**: Tempo normal (1:00 - 0:01)
- 🟠 **Laranja**: Aviso (< 1 minuto)
- 🔴 **Vermelho**: Expirado (0:00)

#### **Estados da Conversa:**
- ✅ **Ativa**: Podes enviar mensagens
- ❌ **Expirada**: Input desabilitado, placeholder "Conversa terminada"

### 🧪 **Cenários de Teste:**

#### **Teste 1: Timer Normal**
- Escolher "1 min"
- Ver timer decrementar
- Enviar algumas mensagens
- Aguardar expirar

#### **Teste 2: Bloqueio de Mensagens**
- Aguardar conversa expirar
- Tentar enviar mensagem
- **Resultado**: Input desabilitado

#### **Teste 3: Histórico**
- Após expirar, ir para lista
- Abrir conversa expirada
- **Resultado**: Read-only (não podes enviar)

#### **Teste 4: Mira AI (Sem Timer)**
- Escolher "Chat with Mira AI"
- **Resultado**: Sem timer (pode durar quanto tempo quiseres)

### ⚡ **Opções de Duração Disponíveis:**

| Opção | Tempo | Uso |
|-------|-------|-----|
| **1 min** | 60 segundos | 🧪 **Teste rápido** |
| 15 min | 15 minutos | 💬 Conversa curta |
| 30 min | 30 minutos | 💬 Conversa média |
| 45 min | 45 minutos | 💬 Conversa longa |
| 1 hora | 60 minutos | 💬 Conversa muito longa |

### 🚀 **Vantagens do Teste de 1 Minuto:**

- ✅ **Teste rápido**: Vês o resultado em 1 minuto
- ✅ **Desenvolvimento ágil**: Testa mudanças rapidamente
- ✅ **Demo fácil**: Mostra funcionalidade rapidamente
- ✅ **Debug eficiente**: Identifica problemas rapidamente

### 🔧 **Para Desenvolvimento:**

Se quiseres testar ainda mais rápido, podes temporariamente alterar no backend:

```javascript
// Em server.js, linha ~489
if (talkerData.duration.includes('1 min')) {
  durationMinutes = 10; // 10 segundos para teste ultra-rápido
}
```

### 📊 **Logs para Verificar:**

**Backend:**
```
=== ACCEPTING TALKER REQUEST ===
Duration: 1 min
DurationMinutes: 1
EndTime: [timestamp + 1 minuto]
```

**Frontend:**
```
=== CONVERSATION SELECTED ===
Starting timer for chat: [chatId]
Timer: 1:00, 0:59, 0:58...
=== CONVERSATION EXPIRED ===
```

### 🎉 **Resultado Esperado:**

Após 1 minuto, ambos os usuários devem:
1. Ver "Conversa terminada" em vermelho
2. Ser redirecionados para lista de conversas
3. Ver a conversa no histórico (read-only)

---

**Tempo total do teste: ~2 minutos** (1 minuto de conversa + setup)

**Perfeito para desenvolvimento e demonstrações rápidas!** 🚀
