# 🚀 Development Build Guide - Push Notifications

## 📱 **Por que usar Development Build?**

O **Expo Go** não suporta notificações push reais que funcionem com o telemóvel bloqueado. Para testar notificações push completas, precisas de um **Development Build**.

## 🛠️ **Passo a Passo**

### **1. Instalar EAS CLI**
```bash
npm install -g @expo/eas-cli
```

### **2. Fazer Login no Expo**
```bash
eas login
```

### **3. Configurar EAS Build**
```bash
eas build:configure
```

### **4. Criar Development Build para Android**
```bash
eas build --profile development --platform android
```

### **5. Instalar o APK no Telemóvel**
- O build será criado na nuvem
- Baixa o APK e instala no telemóvel Android
- Substitui o Expo Go por este development build

## 📋 **Configuração Necessária**

### **app.json - Adicionar configuração de build:**
```json
{
  "expo": {
    "name": "Fala",
    "slug": "fala-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.fala.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.fala.mobile",
      "permissions": [
        "android.permission.VIBRATE",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.WAKE_LOCK"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "notification": {
      "icon": "./assets/icon.png",
      "color": "#FF231F7C",
      "androidMode": "default",
      "androidCollapsedTitle": "Fala - Alguém precisa de ti"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#FF231F7C",
          "defaultChannel": "fala-notifications"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

### **eas.json - Criar ficheiro de configuração:**
```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 🔧 **Comandos Úteis**

### **Criar Development Build:**
```bash
eas build --profile development --platform android
```

### **Ver Status do Build:**
```bash
eas build:list
```

### **Baixar Build:**
```bash
eas build:download [BUILD_ID]
```

## 📱 **Testar Notificações Push**

### **1. Instalar Development Build**
- Baixa o APK do build
- Instala no telemóvel Android
- Substitui o Expo Go

### **2. Testar Notificações**
- Abre a app (development build)
- Entra em modo listen
- Bloqueia o telemóvel
- No outro telemóvel, entra em modo talk
- A notificação deve aparecer no ecrã de bloqueio

## ⚠️ **Limitações do Expo Go**

- ❌ **Não suporta notificações push reais**
- ❌ **Não funciona com telemóvel bloqueado**
- ❌ **Limitado a funcionalidades básicas**

## ✅ **Vantagens do Development Build**

- ✅ **Notificações push reais**
- ✅ **Funciona com telemóvel bloqueado**
- ✅ **Todas as funcionalidades nativas**
- ✅ **Teste completo da app**

## 🚀 **Alternativa Rápida**

Se não quiseres criar development build agora, podes:

1. **Testar com app ativa** - notificações funcionam quando app está aberta
2. **Usar Expo Go** - para desenvolvimento básico
3. **Criar build mais tarde** - quando precisares de notificações reais

## 📞 **Suporte**

- **Expo Docs:** https://docs.expo.dev/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Notifications:** https://docs.expo.dev/versions/latest/sdk/notifications/

---

**Nota:** Development builds são necessários para notificações push reais que funcionem mesmo com o telemóvel bloqueado. O Expo Go tem limitações para esta funcionalidade.
