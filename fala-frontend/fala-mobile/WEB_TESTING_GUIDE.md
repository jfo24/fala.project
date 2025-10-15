# 🌐 Testar App no Web Browser

## 🚀 **Setup Instantâneo (0 minutos)**

### **1. Iniciar App Web:**
```bash
expo start --web
```

### **2. Abrir Browser:**
- **URL:** http://localhost:19006
- **Browser:** Chrome, Firefox, Edge, Safari

### **3. Testar Funcionalidades:**
- ✅ **Login** → funciona
- ✅ **Modo Listen/Talk** → funciona
- ✅ **Chat** → funciona
- ✅ **Mira AI** → funciona
- ✅ **Lista de conversas** → funciona

## 📱 **Como Testar**

### **1. Login:**
- Clica em "Login with Google"
- Simula login (demo)

### **2. Escolher Modo:**
- **"Quero Ouvir"** → modo listener
- **"Preciso de Falar"** → modo talker

### **3. Testar Chat:**
- **Mira AI** → conversa com bot
- **Chat real** → entre dois browsers

### **4. Testar Notificações:**
- **Web notifications** → funcionam no browser
- **Permitir notificações** quando o browser pedir

## 🔧 **Comandos Úteis**

### **Iniciar Web:**
```bash
expo start --web
```

### **Iniciar com Porta Específica:**
```bash
expo start --web --port 3000
```

### **Ver Logs:**
- **F12** → Console do browser
- **Network** → ver requests
- **Application** → ver storage

## 📱 **Testar em Múltiplos Browsers**

### **1. Abrir Múltiplas Abas:**
- **Aba 1:** http://localhost:19006 (Listener)
- **Aba 2:** http://localhost:19006 (Talker)

### **2. Testar Comunicação:**
- **Listener** → entra em modo listen
- **Talker** → entra em modo talk
- **Chat** → mensagens aparecem em tempo real

### **3. Testar Notificações:**
- **Permitir notificações** em ambos os browsers
- **Notificações web** aparecem quando alguém precisa de falar

## 🎯 **Vantagens do Web**

- ✅ **Setup zero** → só abrir browser
- ✅ **Teste rápido** → sem instalação
- ✅ **Debug fácil** → F12 console
- ✅ **Múltiplos dispositivos** → várias abas
- ✅ **Notificações web** → funcionam no browser

## ⚠️ **Limitações do Web**

- ❌ **Não é app nativa** → só web
- ❌ **Notificações limitadas** → só web notifications
- ❌ **Sem funcionalidades do telemóvel** → câmara, GPS, etc.
- ❌ **Performance** → pode ser mais lenta

## 🔧 **Troubleshooting**

### **App não carrega:**
- Verifica se o servidor está a correr
- Tenta http://localhost:19006
- Verifica console do browser (F12)

### **Notificações não funcionam:**
- Verifica se permitiste notificações
- Verifica se o browser suporta notificações
- Tenta em Chrome (melhor suporte)

### **Chat não funciona:**
- Verifica se o backend está a correr
- Verifica console do browser
- Tenta recarregar a página

## 📱 **URLs Úteis**

- **App Web:** http://localhost:19006
- **Metro Bundler:** http://localhost:8081
- **Expo DevTools:** http://localhost:19002

## 🎯 **Resultado Esperado**

- ✅ **App carrega** → interface funciona
- ✅ **Login funciona** → simulação Google
- ✅ **Modos funcionam** → listen/talk
- ✅ **Chat funciona** → mensagens em tempo real
- ✅ **Mira AI funciona** → conversa com bot
- ✅ **Notificações web** → funcionam no browser

---

**Nota:** O web browser é perfeito para testar funcionalidades básicas e desenvolvimento rápido, mas não substitui a experiência nativa do telemóvel.
