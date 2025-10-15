# 🚀 Teste Simples de Notificações Push

## 📱 **Sem Android Studio - Alternativas Simples**

### **Opção 1: Expo Go + Teste Básico**

#### **1. Testar com Expo Go (Limitado mas Funcional)**
```bash
# Iniciar app
expo start

# Abrir no telemóvel via QR code
# Ou usar web: expo start --web
```

#### **2. Testar Notificações (App Ativa)**
- ✅ **App ativa** → Notificações funcionam
- ✅ **App em background** → Notificações funcionam (limitado)
- ❌ **Telemóvel bloqueado** → Limitado no Expo Go

#### **3. Simular Cenários**
1. **Abrir app** no telemóvel
2. **Entrar em modo listen**
3. **Minimizar app** (não bloquear)
4. **No outro dispositivo** → entrar em modo talk
5. **Notificação aparece** → quando app está ativa

### **Opção 2: Usar Web Browser (Desenvolvimento)**

#### **1. Testar no Browser**
```bash
# Iniciar app web
expo start --web

# Abrir no browser
# http://localhost:19006
```

#### **2. Simular Notificações Web**
- ✅ **Notificações web** → funcionam no browser
- ✅ **Teste rápido** → sem instalar nada
- ✅ **Debug fácil** → console do browser

### **Opção 3: Usar Telemóvel Físico (Recomendado)**

#### **1. Development Build no Telemóvel**
```bash
# Criar build para telemóvel
eas build --profile development --platform android

# Baixar APK e instalar no telemóvel
# Substitui Expo Go
```

#### **2. Testar Notificações Reais**
- ✅ **Notificações reais** → funcionam sempre
- ✅ **Telemóvel bloqueado** → notificação aparece
- ✅ **App suspensa** → notificação aparece
- ✅ **Teste completo** → todas as funcionalidades

### **Opção 4: Usar Expo Snack (Online)**

#### **1. Testar Online**
- Vai para: https://snack.expo.dev
- Cria um snack com o código da app
- Testa no browser ou telemóvel

#### **2. Vantagens**
- ✅ **Sem instalação** → tudo online
- ✅ **Teste rápido** → sem setup
- ✅ **Compartilhar** → fácil de mostrar

## 🎯 **Recomendação por Cenário**

### **Desenvolvimento Rápido:**
- **Expo Go** + **Telemóvel físico**
- **Notificações limitadas** mas funcionais
- **Setup mínimo** → só instalar Expo Go

### **Teste Completo:**
- **Development Build** + **Telemóvel físico**
- **Notificações reais** → funcionam sempre
- **Setup médio** → criar build + instalar APK

### **Demonstração:**
- **Expo Web** + **Browser**
- **Funcionalidades básicas** → sem notificações
- **Setup zero** → só abrir browser

## 📋 **Setup Mínimo (Expo Go)**

### **1. Instalar Expo Go**
- **Android:** Google Play Store
- **iOS:** App Store

### **2. Iniciar App**
```bash
expo start
```

### **3. Conectar Telemóvel**
- **QR Code** → escanear com Expo Go
- **Mesma rede** → telemóvel e PC

### **4. Testar Funcionalidades**
- ✅ **Login** → funciona
- ✅ **Modo listen/talk** → funciona
- ✅ **Chat** → funciona
- ✅ **Mira AI** → funciona
- ⚠️ **Notificações** → limitadas

## 🔧 **Comandos Úteis**

### **Expo Go:**
```bash
# Iniciar
expo start

# Web
expo start --web

# Android
expo start --android

# iOS
expo start --ios
```

### **Development Build:**
```bash
# Criar build
eas build --profile development --platform android

# Ver builds
eas build:list

# Baixar build
eas build:download [BUILD_ID]
```

## ⚡ **Setup Mais Rápido**

### **1. Expo Go (5 minutos)**
```bash
# 1. Instalar Expo Go no telemóvel
# 2. expo start
# 3. Escanear QR code
# 4. Testar app
```

### **2. Development Build (30 minutos)**
```bash
# 1. eas build --profile development --platform android
# 2. Baixar APK
# 3. Instalar no telemóvel
# 4. Testar notificações reais
```

## 🎯 **Resultado Esperado**

### **Expo Go:**
- ✅ **App funciona** → todas as funcionalidades
- ⚠️ **Notificações limitadas** → só quando app ativa
- ✅ **Desenvolvimento rápido** → sem setup complexo

### **Development Build:**
- ✅ **App funciona** → todas as funcionalidades
- ✅ **Notificações reais** → funcionam sempre
- ✅ **Teste completo** → como app real

---

**Nota:** Para notificações que funcionem com telemóvel bloqueado, o development build é necessário. O Expo Go tem limitações para esta funcionalidade específica.
