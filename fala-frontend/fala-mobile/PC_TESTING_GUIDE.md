# 🖥️ Testar Notificações Push no PC

## 📱 **Usando Android Emulator**

### **1. Instalar Android Studio**
1. Baixa **Android Studio** de: https://developer.android.com/studio
2. Instala com todas as opções padrão
3. Abre Android Studio

### **2. Criar Emulador Android**
1. **AVD Manager** → Create Virtual Device
2. **Escolher dispositivo** → Pixel 4 ou similar
3. **Sistema Image** → Android 11+ (API 30+)
4. **Configurar** → RAM: 4GB, Internal Storage: 8GB
5. **Criar** → Start emulator

### **3. Instalar Development Build no Emulador**
```bash
# Criar development build
eas build --profile development --platform android

# Baixar APK e instalar no emulador
# Arrastar APK para o emulador ou usar:
adb install path/to/your-app.apk
```

### **4. Testar Notificações Push**
1. **Abrir app** no emulador
2. **Entrar em modo listen** 
3. **Bloquear emulador** (Ctrl+L)
4. **No outro dispositivo** → entrar em modo talk
5. **Notificação aparece** → no ecrã de bloqueio do emulador

## 🚀 **Alternativa: Usar Expo Go + Simulação**

### **1. Testar com Expo Go (Limitado)**
```bash
# Iniciar app
expo start

# Abrir no emulador
# Pressionar 'a' para abrir no Android emulator
```

### **2. Simular Notificações**
- ✅ **App ativa** → Notificações funcionam
- ❌ **App suspensa** → Limitado no Expo Go
- ❌ **Emulador bloqueado** → Limitado no Expo Go

## 🔧 **Comandos Úteis para Emulador**

### **Instalar APK no Emulador:**
```bash
# Listar dispositivos
adb devices

# Instalar APK
adb install path/to/app.apk

# Abrir app
adb shell am start -n com.fala.mobile/.MainActivity
```

### **Testar Notificações:**
```bash
# Ver logs do emulador
adb logcat | grep "Fala"

# Simular notificação
adb shell am broadcast -a com.fala.mobile.NOTIFICATION_TEST
```

## 📱 **Configuração do Emulador**

### **1. Habilitar Notificações**
- **Settings** → Apps → Fala → Notifications → ON
- **Settings** → Sound → Notification sound → ON
- **Settings** → Display → Lock screen → Show notifications → ON

### **2. Testar Cenários**
1. **App ativa** → Notificação aparece
2. **App em background** → Notificação aparece
3. **Emulador bloqueado** → Notificação aparece no lock screen
4. **App fechada** → Notificação aparece

## ⚡ **Setup Rápido**

### **1. Android Studio + Emulador**
```bash
# 1. Instalar Android Studio
# 2. Criar emulador Android 11+
# 3. Iniciar emulador
# 4. Instalar development build
# 5. Testar notificações
```

### **2. Expo Go (Desenvolvimento)**
```bash
# 1. Iniciar app
expo start

# 2. Abrir no emulador
# Pressionar 'a' no terminal

# 3. Testar funcionalidades básicas
# (Notificações limitadas)
```

## 🎯 **Vantagens do Emulador**

- ✅ **Teste completo** - todas as funcionalidades
- ✅ **Notificações reais** - funcionam como telemóvel real
- ✅ **Debug fácil** - logs e debugging
- ✅ **Múltiplos dispositivos** - testar diferentes tamanhos
- ✅ **Sem custos** - não precisa de telemóvel físico

## 📋 **Checklist de Teste**

### **Notificações Push:**
- [ ] App ativa → Notificação aparece
- [ ] App em background → Notificação aparece  
- [ ] Emulador bloqueado → Notificação no lock screen
- [ ] Som e vibração funcionam
- [ ] Tocar na notificação abre a app

### **Funcionalidades da App:**
- [ ] Login funciona
- [ ] Modo listen/talk funciona
- [ ] Chat em tempo real funciona
- [ ] Mira AI funciona
- [ ] Lista de conversas funciona

## 🚨 **Limitações do Expo Go**

- ❌ **Notificações limitadas** - não funcionam com emulador bloqueado
- ❌ **Funcionalidades nativas** - limitadas
- ❌ **Background** - limitado

## ✅ **Recomendação**

**Para teste completo:**
1. **Development Build** + **Android Emulator**
2. **Notificações reais** que funcionam sempre
3. **Teste completo** de todas as funcionalidades

**Para desenvolvimento rápido:**
1. **Expo Go** + **Android Emulator**  
2. **Funcionalidades básicas** funcionam
3. **Notificações limitadas**

---

**Nota:** O emulador Android é a melhor forma de testar notificações push no PC, especialmente com development builds.
