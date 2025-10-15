# 📱 Guia de Configuração do Ícone da App

## 📁 Onde Colocar o Ícone

**Pasta:** `fala-frontend/fala-mobile/assets/`

### Ficheiros Necessários:

1. **`icon.png`** - Ícone principal da app
   - **Tamanho:** 1024x1024px
   - **Formato:** PNG com transparência
   - **Uso:** Ícone principal da app, splash screen, login screen

2. **`adaptive-icon.png`** - Ícone adaptativo para Android
   - **Tamanho:** 1024x1024px
   - **Formato:** PNG com transparência
   - **Uso:** Ícone adaptativo para Android (formas diferentes)

3. **`favicon.png`** - Ícone para web
   - **Tamanho:** 32x32px ou 64x64px
   - **Formato:** PNG
   - **Uso:** Ícone no browser quando a app é aberta na web

4. **`splash-icon.png`** - Ícone para splash screen
   - **Tamanho:** 1024x1024px
   - **Formato:** PNG com transparência
   - **Uso:** Ícone que aparece durante o carregamento da app

## 🎨 Especificações de Design

### Paleta de Cores "Pastel Dreamland Adventure":
- **#CDB4DB** - Lavender Dream (Espiritualidade, tranquilidade)
- **#FFC8DD** - Blush Pink (Carinho, empatia)
- **#FFAFCC** - Rose Petal (Amor, conexão)
- **#BDE0FE** - Sky Blue (Pureza, calma)
- **#A2D2FF** - Ocean Mist (Serenidade, confiança)

### Características do Ícone:
- **Estilo:** Suave, carinhoso, acolhedor
- **Cantos:** Arredondados (não muito sharp)
- **Cores:** Tons pastel da paleta
- **Símbolo:** Relacionado com escuta, conexão, empatia
- **Transparência:** Fundo transparente ou branco suave

## 🔧 Como Substituir os Ícones

1. **Substitui os ficheiros existentes:**
   ```
   fala-frontend/fala-mobile/assets/
   ├── icon.png (substituir)
   ├── adaptive-icon.png (substituir)
   ├── favicon.png (substituir)
   └── splash-icon.png (substituir)
   ```

2. **Mantém os mesmos nomes de ficheiro**

3. **Reinicia a app** para ver as mudanças

## 📱 Onde o Ícone Aparece

### Login Screen:
- **Localização:** Primeiro terço do ecrã, centralizado
- **Tamanho:** 250x250px (ocupa 1/3 do ecrã)
- **Estilo:** Logo limpo e direto, sem sombras ou fundos

### App Icon (Home Screen):
- **Android:** Ícone adaptativo com formas diferentes
- **iOS:** Ícone principal
- **Web:** Favicon no browser

### Splash Screen:
- **Durante carregamento:** Ícone centralizado
- **Tamanho:** Automático baseado no dispositivo

## 🎨 Implementação no Código

O ícone já está implementado no `LoginScreen.tsx`:

```tsx
<Image 
  source={require('./assets/icon.png')} 
  style={styles.appIcon}
  resizeMode="contain"
/>
```

### Estilos Aplicados:
```tsx
logoContainer: {
  alignItems: 'center',
  marginTop: 40,
  marginBottom: 20,
  flex: 1,
  justifyContent: 'center',
},
appIcon: {
  width: 250,
  height: 250,
  marginBottom: 20,
},
subtitle: {
  fontSize: 18,
  color: '#4A4A4A', // Dark Gray - Estabilidade
  textAlign: 'center',
  lineHeight: 26,
  fontWeight: '500',
  paddingHorizontal: 20,
},
```

## ✅ Checklist de Configuração

- [ ] Ícone principal (`icon.png`) - 1024x1024px
- [ ] Ícone adaptativo (`adaptive-icon.png`) - 1024x1024px  
- [ ] Favicon (`favicon.png`) - 32x32px ou 64x64px
- [ ] Splash icon (`splash-icon.png`) - 1024x1024px
- [ ] Todos os ficheiros na pasta `assets/`
- [ ] Nomes de ficheiro corretos
- [ ] Formato PNG com transparência
- [ ] Testado no login screen
- [ ] Testado no home screen do dispositivo
- [ ] Testado na web (se aplicável)

## 🚀 Próximos Passos

1. **Coloca o teu ícone** na pasta `assets/`
2. **Testa a app** para ver o ícone no login screen
3. **Ajusta o tamanho** se necessário no `appIcon` style
4. **Testa em diferentes dispositivos** para garantir compatibilidade

---

**Nota:** O ícone já está integrado no login screen com a nova paleta "Pastel Dreamland Adventure" e estilos suaves e acolhedores! 🌸
