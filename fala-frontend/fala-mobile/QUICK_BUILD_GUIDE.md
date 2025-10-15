# ⚡ Guia Rápido - Development Build

## 🚀 **Solução Mais Rápida que Development Build Completo**

### **Opção 1: Expo Development Build (Recomendado)**

#### **1. Usar Expo Development Build**
```bash
# Criar development build (mais rápido)
eas build --profile development --platform android
```

**Vantagens:**
- ✅ **Mais rápido** que build completo
- ✅ **Notificações push reais** → funcionam sempre
- ✅ **Telemóvel bloqueado** → notificação aparece
- ✅ **Hot reload** → como Expo Go
- ✅ **Debug fácil** → como desenvolvimento

#### **2. Processo Rápido (15-20 minutos)**
```bash
# 1. Login (se não estiver)
eas login

# 2. Build rápido
eas build --profile development --platform android

# 3. Download APK
eas build:download [BUILD_ID]

# 4. Instalar no telemóvel
# Substitui Expo Go
```

### **Opção 2: Expo Go + Simulação (Mais Rápido)**

#### **1. Usar Expo Go com Simulação**
```bash
# Iniciar app
expo start

# Abrir no telemóvel via QR code
```

**Limitações:**
- ❌ **Notificações limitadas** → só quando app ativa
- ❌ **Não funciona com telemóvel bloqueado**
- ✅ **Setup instantâneo** → 2 minutos
- ✅ **Todas as outras funcionalidades** → funcionam

#### **2. Simular Notificações**
- ✅ **App ativa** → notificações funcionam
- ✅ **App em background** → notificações limitadas
- ❌ **Telemóvel bloqueado** → não funciona

### **Opção 3: Web + Notificações Web (Mais Rápido)**

#### **1. Testar no Browser**
```bash
# Iniciar web
expo start --web

# Abrir http://localhost:19006
```

**Vantagens:**
- ✅ **Setup zero** → só abrir browser
- ✅ **Notificações web** → funcionam no browser
- ✅ **Teste rápido** → sem instalação
- ✅ **Debug fácil** → console do browser

## 🎯 **Recomendação por Velocidade**

### **Mais Rápido (2 minutos):**
- **Expo Go** + **Telemóvel**
- **Notificações limitadas** mas funcionais
- **Setup instantâneo**

### **Rápido (15-20 minutos):**
- **Expo Development Build** + **Telemóvel**
- **Notificações reais** → funcionam sempre
- **Setup médio**

### **Instantâneo (0 minutos):**
- **Web Browser** + **PC**
- **Notificações web** → funcionam no browser
- **Setup zero**

## ⚡ **Setup Mais Rápido**

### **1. Expo Go (2 minutos)**
```bash
# 1. Instalar Expo Go no telemóvel
# 2. expo start
# 3. Escanear QR code
# 4. Testar app (notificações limitadas)
```

### **2. Development Build (15-20 minutos)**
```bash
# 1. eas build --profile development --platform android
# 2. Baixar APK
# 3. Instalar no telemóvel
# 4. Testar notificações reais
```

### **3. Web (0 minutos)**
```bash
# 1. expo start --web
# 2. Abrir browser
# 3. Testar funcionalidades
```

## 🔧 **Comandos Úteis**

### **Expo Go:**
```bash
expo start
```

### **Development Build:**
```bash
eas build --profile development --platform android
```

### **Web:**
```bash
expo start --web
```

## 📱 **Resultado Esperado**

### **Expo Go:**
- ✅ **App funciona** → todas as funcionalidades
- ⚠️ **Notificações limitadas** → só quando app ativa
- ✅ **Setup rápido** → 2 minutos

### **Development Build:**
- ✅ **App funciona** → todas as funcionalidades
- ✅ **Notificações reais** → funcionam sempre
- ✅ **Setup médio** → 15-20 minutos

### **Web:**
- ✅ **App funciona** → funcionalidades básicas
- ✅ **Notificações web** → funcionam no browser
- ✅ **Setup zero** → instantâneo

## 🎯 **Limitação Técnica**

**Expo Go não suporta notificações push reais** que funcionem com o telemóvel bloqueado. Esta é uma limitação do próprio Expo Go, não da nossa implementação.

**Para notificações que funcionem sempre:**
- ✅ **Development Build** → necessário
- ❌ **Expo Go** → limitado
- ❌ **Web** → só notificações web

---

**Nota:** O Expo Development Build é a solução mais rápida que mantém as notificações push reais do Android.
