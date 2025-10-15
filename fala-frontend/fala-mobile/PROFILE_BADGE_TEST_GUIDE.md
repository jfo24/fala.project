# 🏆 Teste do Badge no Profile Screen

## 🎯 **Objetivo**
Verificar se o badge de listener aparece corretamente no screen de profile quando o usuário está em modo "listen".

## 📱 **Como Testar**

### **Passo 1: Configurar Modo Listen**
1. **Abrir a app**
2. **Fazer login** (Google OAuth)
3. **Escolher modo "Quero ouvir"**
4. **Aguardar** o loading screen

### **Passo 2: Acessar Profile**
1. **Clicar no botão de profile** (ícone de usuário)
2. **Verificar** se aparece a seção "🏆 Teu Badge de Listener"
3. **Verificar** se o badge aparece com emoji e nome

### **Passo 3: Testar Funcionalidade do Badge**
1. **Clicar no badge** no profile
2. **Verificar** se abre o modal com:
   - Estatísticas atuais
   - Progresso para próximo badge
   - Lista de todos os badges
3. **Fechar o modal**

### **Passo 4: Verificar Chat Header**
1. **Voltar ao chat** (se houver conversa ativa)
2. **Verificar** que o badge NÃO aparece no header do chat
3. **Confirmar** que apenas o timer aparece no header

## ✅ **Resultados Esperados**

### **No Profile Screen:**
- ✅ **Seção "🏆 Teu Badge de Listener"** aparece quando em modo listen
- ✅ **Badge visível** com emoji e nome (ex: "🪶 Pebbie")
- ✅ **Badge clicável** abre modal com estatísticas
- ✅ **Modal completo** com todas as informações

### **No Chat Header:**
- ✅ **Badge NÃO visível** no header durante conversa
- ✅ **Apenas timer** aparece no header
- ✅ **Interface limpa** sem badge

### **Quando em Modo Talk:**
- ✅ **Badge NÃO aparece** no profile
- ✅ **Seção de badge** não é exibida

## 🐛 **Possíveis Problemas**

### **Badge não aparece no profile:**
- Verificar se `currentMode === 'listen'`
- Verificar se `user?.id` existe
- Verificar se componente `BadgeDisplay` está importado

### **Modal não abre:**
- Verificar se `BadgeDisplay` está funcionando
- Verificar logs do console para erros
- Verificar se backend está rodando

### **Estatísticas não carregam:**
- Verificar se backend está rodando
- Verificar endpoint `/api/user/:userId/stats`
- Verificar logs do backend

## 🔧 **Debug**

### **Logs do Frontend:**
```javascript
// No console do Expo
console.log('ProfileScreen - currentMode:', currentMode);
console.log('ProfileScreen - user.id:', user?.id);
console.log('BadgeDisplay - userId:', userId);
```

### **Logs do Backend:**
```javascript
// No terminal do servidor
console.log('GET /api/user/:userId/stats - userId:', userId);
console.log('User stats response:', stats);
```

## 📊 **Cenários de Teste**

### **Cenário 1: Usuário Novo (Pebbie)**
- **Modo**: Listen
- **Badge esperado**: 🪶 Pebbie
- **Estatísticas**: 0 tempo, 0 mensagens, 0 rating

### **Cenário 2: Usuário com Algumas Conversas**
- **Modo**: Listen
- **Badge esperado**: 🪶 Pebbie ou ✨ Glowie
- **Estatísticas**: Tempo > 0, mensagens > 0, rating > 0

### **Cenário 3: Usuário em Modo Talk**
- **Modo**: Talk
- **Badge esperado**: Nenhum
- **Seção**: Não deve aparecer

## 🎉 **Sucesso**
O teste é bem-sucedido quando:
1. ✅ Badge aparece no profile em modo listen
2. ✅ Badge não aparece em modo talk
3. ✅ Modal abre com todas as informações
4. ✅ Badge NÃO aparece no chat header
5. ✅ Estatísticas carregam corretamente

## 📝 **Notas**
- O badge aparece **apenas** no profile screen
- O chat header mantém **interface limpa** com apenas o timer
- O design deve ser **harmonioso** com o resto do profile
- A performance deve ser **fluida** sem delays
