# 🚀 Instruções para Criar Development Build

## 📱 **Passo a Passo para Criar APK**

### **1. Fazer Login no Expo**
```bash
eas login
```
- Vai abrir o browser para fazer login
- Usa a tua conta Expo ou cria uma nova

### **2. Configurar EAS Build**
```bash
eas build:configure
```
- Vai criar/atualizar o ficheiro `eas.json`
- Aceita as configurações padrão

### **3. Criar Development Build**
```bash
eas build --profile development --platform android
```
- Vai criar o build na nuvem
- Demora 5-15 minutos
- Vai mostrar um link para acompanhar o progresso

### **4. Baixar APK**
```bash
eas build:download [BUILD_ID]
```
- Substitui `[BUILD_ID]` pelo ID do build
- Vai baixar o APK para o PC

### **5. Instalar no Telemóvel**
- **Transferir APK** para o telemóvel
- **Instalar APK** (pode precisar de permitir instalação de fontes desconhecidas)
- **Substituir Expo Go** pela app instalada

## 🔧 **Comandos Úteis**

### **Ver Status do Build:**
```bash
eas build:list
```

### **Ver Detalhes do Build:**
```bash
eas build:view [BUILD_ID]
```

### **Baixar Build:**
```bash
eas build:download [BUILD_ID]
```

## 📱 **Configuração do Telemóvel**

### **Android:**
1. **Settings** → **Security** → **Unknown Sources** → **ON**
2. **Transferir APK** para o telemóvel
3. **Tocar no APK** para instalar
4. **Permitir instalação** quando pedido

### **Testar Notificações:**
1. **Abrir app** (development build)
2. **Entrar em modo listen**
3. **Bloquear telemóvel**
4. **No outro dispositivo** → entrar em modo talk
5. **Notificação aparece** no ecrã de bloqueio!

## ⚡ **Comandos Rápidos**

```bash
# 1. Login
eas login

# 2. Configure
eas build:configure

# 3. Build
eas build --profile development --platform android

# 4. Download (quando pronto)
eas build:download [BUILD_ID]
```

## 🎯 **Resultado Esperado**

- ✅ **APK criado** → desenvolvimento build
- ✅ **Notificações reais** → funcionam sempre
- ✅ **Telemóvel bloqueado** → notificação aparece
- ✅ **App suspensa** → notificação aparece
- ✅ **Teste completo** → como app real

## 🚨 **Se Algo Correr Mal**

### **Erro de Login:**
- Verifica se tens conta Expo
- Tenta criar nova conta

### **Erro de Build:**
- Verifica se `eas.json` existe
- Tenta `eas build:configure` novamente

### **APK não instala:**
- Verifica se "Unknown Sources" está ON
- Tenta transferir APK novamente

## 📞 **Suporte**

- **Expo Docs:** https://docs.expo.dev/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Troubleshooting:** https://docs.expo.dev/build/troubleshooting/

---

**Nota:** O development build é necessário para notificações push reais que funcionem mesmo com o telemóvel bloqueado.
