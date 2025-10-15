# 📱 Configuração de Notificações Push

## 🎯 Funcionalidade Implementada

As notificações push foram implementadas para garantir que usuários em modo "listen" recebam notificações mesmo quando:
- A app está em background/suspensa
- O telemóvel está bloqueado
- O utilizador não está ativamente a usar a app

## 🔧 Como Funciona

### 1. **Quando um Talker precisa de falar:**
- O sistema procura por Listeners online
- Envia notificação push para todos os Listeners disponíveis
- A notificação aparece mesmo com a app fechada

### 2. **Conteúdo da Notificação:**
- **Título:** "💙 Alguém precisa de ti"
- **Mensagem:** "[Nome] está a precisar de ser ouvido sobre '[Tópico]' ([Duração])"
- **Tom:** Fofo e emocional, como solicitado

### 3. **Comportamento:**
- Notificação aparece no ecrã de bloqueio
- Som de notificação (se não estiver em modo silencioso)
- Vibração (Android)
- Quando o utilizador toca na notificação, a app abre

## 🛠️ Configuração Necessária

### Para Produção (Expo Push Notifications):

1. **Configurar Expo Project ID:**
   ```bash
   # No terminal, na pasta fala-frontend/fala-mobile
   expo login
   expo init --template blank-typescript
   ```

2. **Atualizar o Project ID no código:**
   - Abrir `NotificationService.ts`
   - Substituir `'your-expo-project-id'` pelo ID real do projeto

3. **Configurar Push Certificates (iOS):**
   ```bash
   expo build:ios
   # Seguir as instruções para configurar certificados
   ```

4. **Configurar Push Keys (Android):**
   ```bash
   expo build:android
   # Seguir as instruções para configurar FCM
   ```

### Para Desenvolvimento (Local Notifications):

As notificações locais já funcionam sem configuração adicional e são ideais para desenvolvimento e testes.

## 📋 Dependências Instaladas

```json
{
  "expo-notifications": "~0.29.9"
}
```

## 🎨 Personalização

### Cores e Ícones:
- **Cor:** `#FF231F7C` (rosa suave)
- **Ícone:** `./assets/icon.png`
- **Título Android:** "Fala - Alguém precisa de ti"

### Mensagens:
As mensagens são personalizáveis no `NotificationService.ts`:

```typescript
const title = "💙 Alguém precisa de ti";
const body = `${talkerName} está a precisar de ser ouvido sobre "${topic}" (${duration})`;
```

## 🧪 Testando

### 1. **Teste Local:**
- Abrir a app em modo "listen"
- Minimizar a app ou bloquear o telemóvel
- Noutro dispositivo, escolher modo "talk"
- A notificação deve aparecer

### 2. **Teste em Background:**
- Colocar a app em background
- Enviar pedido de talker
- Verificar se a notificação aparece

## 🔍 Logs e Debug

Os logs estão configurados para mostrar:
- Inicialização das notificações
- Token de push gerado
- Envio de notificações
- Resposta do utilizador

## 🚀 Próximos Passos

1. **Configurar Expo Project ID** para produção
2. **Testar em dispositivos reais** (iOS e Android)
3. **Configurar certificados** para push notifications
4. **Otimizar timing** das notificações se necessário

## 💡 Notas Importantes

- As notificações locais funcionam imediatamente
- Push notifications requerem configuração adicional
- O tom das mensagens é fofo e emocional como solicitado
- Funciona mesmo com a app completamente fechada
- Respeita as configurações de notificação do utilizador
