# 🌐 Como Iniciar a App Web

## ✅ **Comando Correto**

### **Em vez de:**
```bash
expo start --web  # ❌ Erro: comando não encontrado
```

### **Use:**
```bash
npx expo start --web  # ✅ Funciona!
```

## 🚀 **Passo a Passo**

### **1. Iniciar App Web:**
```bash
npx expo start --web
```

### **2. Abrir Browser:**
- **URL:** http://localhost:19006
- **Browser:** Chrome, Firefox, Edge, Safari

### **3. Testar Funcionalidades:**
- ✅ **Login** → clica em "Login with Google"
- ✅ **Modo Listen/Talk** → escolhe o modo
- ✅ **Chat** → conversa com Mira AI
- ✅ **Lista de conversas** → vê histórico

## 🔧 **Comandos Úteis**

### **Iniciar Web:**
```bash
npx expo start --web
```

### **Iniciar Mobile:**
```bash
npx expo start
```

### **Ver Versão:**
```bash
npx expo --version
```

## 📱 **Testar em Múltiplos Browsers**

### **1. Abrir Múltiplas Abas:**
- **Aba 1:** http://localhost:19006 (Listener)
- **Aba 2:** http://localhost:19006 (Talker)

### **2. Testar Chat:**
- **Listener** → entra em modo listen
- **Talker** → entra em modo talk
- **Mensagens** → aparecem em tempo real

## 🎯 **O que Podes Testar**

- ✅ **Login** → simulação Google
- ✅ **Modos** → listen/talk
- ✅ **Chat** → Mira AI e chat real
- ✅ **Notificações web** → permitir quando pedir
- ✅ **Tempo real** → mensagens instantâneas

## 🔧 **Troubleshooting**

### **Erro "expo not found":**
- Use `npx expo` em vez de `expo`
- Ou instale globalmente: `npm install -g @expo/cli`

### **App não carrega:**
- Verifica se o servidor está a correr
- Tenta http://localhost:19006
- Verifica console do browser (F12)

### **Chat não funciona:**
- Verifica se o backend está a correr
- Verifica console do browser
- Tenta recarregar a página

## 📱 **URLs Úteis**

- **App Web:** http://localhost:19006
- **Metro Bundler:** http://localhost:8081
- **Expo DevTools:** http://localhost:19002

---

**Nota:** Sempre use `npx expo` em vez de `expo` diretamente para evitar erros de comando não encontrado.
