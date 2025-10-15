# 🎯 Popup de Estatísticas do Próximo Badge

## 🎯 **Funcionalidade Implementada**

Quando o usuário clica no badge para ver as estatísticas, agora pode clicar no **próximo badge** para ver um popup detalhado com:
- **Requisitos completos** do próximo badge
- **Progresso atual** em cada requisito
- **Visualização clara** do que falta para alcançar o próximo nível

## ✅ **Funcionalidades Implementadas**

### **1. Próximo Badge Clicável**
- **Botão interativo** no próximo badge
- **Dica visual** "👆 Toca para ver detalhes"
- **Feedback tátil** ao tocar

### **2. Modal Detalhado do Próximo Badge**
- **Seção do Badge**: Emoji, nome e nível
- **Seção de Requisitos**: Lista detalhada dos requisitos
- **Seção de Progresso**: Barras de progresso visuais
- **Design atrativo** com cores e ícones

### **3. Informações Detalhadas**
- **⏰ Tempo Total de Conversa**: Quantas horas/minutos são necessários
- **💬 Mensagens Enviadas**: Quantas mensagens são necessárias
- **⭐ Rating Médio**: Qual rating médio é necessário
- **📊 Progresso Visual**: Barras de progresso para cada requisito

## 🔧 **Código Implementado**

### **Estado para Modal do Próximo Badge:**
```typescript
const [showNextBadgeModal, setShowNextBadgeModal] = useState(false);
```

### **Próximo Badge Clicável:**
```typescript
<TouchableOpacity
  style={styles.nextBadgeButton}
  onPress={() => setShowNextBadgeModal(true)}
  activeOpacity={0.7}
>
  <Text style={styles.nextBadgeName}>
    {badgeStats.nextBadge.emoji} {badgeStats.nextBadge.name}
  </Text>
  <Text style={styles.nextBadgeHint}>👆 Toca para ver detalhes</Text>
</TouchableOpacity>
```

### **Modal Detalhado:**
```typescript
<Modal
  visible={showNextBadgeModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowNextBadgeModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modal}>
      <Text style={styles.modalTitle}>🎯 Próximo Badge</Text>
      
      {/* Seção do Badge */}
      <View style={styles.nextBadgeDetailSection}>
        <Text style={styles.nextBadgeDetailEmoji}>{badgeStats.nextBadge.emoji}</Text>
        <Text style={styles.nextBadgeDetailName}>{badgeStats.nextBadge.name}</Text>
        <Text style={styles.nextBadgeDetailLevel}>Nível {badgeStats.nextBadge.level}</Text>
      </View>

      {/* Seção de Requisitos */}
      <View style={styles.requirementsSection}>
        <Text style={styles.requirementsTitle}>📋 Requisitos</Text>
        
        <View style={styles.requirementItem}>
          <Text style={styles.requirementIcon}>⏰</Text>
          <View style={styles.requirementInfo}>
            <Text style={styles.requirementLabel}>Tempo Total de Conversa</Text>
            <Text style={styles.requirementValue}>
              {formatTime(badgeStats.nextBadge.requirements.time)}
            </Text>
          </View>
        </View>
        
        {/* Mais requisitos... */}
      </View>

      {/* Seção de Progresso */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>📊 Teu Progresso</Text>
        
        {/* Barras de progresso... */}
      </View>
    </View>
  </View>
</Modal>
```

## 🧪 **Como Testar a Funcionalidade**

### **Cenário de Teste:**
1. **Usuário** em modo "listen" com badge atual
2. **Próximo badge** disponível para alcançar

### **Passo 1: Abrir Estatísticas do Badge**
1. **Ir para** tela de perfil
2. **Verificar** que badge aparece (modo listen)
3. **Clicar** no badge atual
4. **Verificar** que modal de estatísticas abre

### **Passo 2: Ver Próximo Badge**
1. **Verificar** que seção "🎯 Próximo Badge" aparece
2. **Verificar** que próximo badge é clicável
3. **Verificar** que aparece dica "👆 Toca para ver detalhes"

### **Passo 3: Abrir Popup do Próximo Badge**
1. **Clicar** no próximo badge
2. **Verificar** que novo modal abre
3. **Verificar** que título é "🎯 Próximo Badge"

### **Passo 4: Verificar Conteúdo do Modal**
1. **Seção do Badge**: Emoji, nome e nível
2. **Seção de Requisitos**: Lista com ícones e valores
3. **Seção de Progresso**: Barras de progresso visuais
4. **Botão Fechar**: Funciona corretamente

## ✅ **Resultados Esperados**

### **Comportamento Correto:**
- ✅ **Próximo badge** é clicável no modal principal
- ✅ **Dica visual** aparece "👆 Toca para ver detalhes"
- ✅ **Modal detalhado** abre ao clicar
- ✅ **Requisitos** são mostrados claramente
- ✅ **Progresso** é visualizado com barras
- ✅ **Design** é atrativo e organizado

### **Conteúdo do Modal:**
- ✅ **Título**: "🎯 Próximo Badge"
- ✅ **Badge**: Emoji grande, nome e nível
- ✅ **Requisitos**: 3 itens com ícones (⏰💬⭐)
- ✅ **Progresso**: 3 barras de progresso
- ✅ **Botão**: "Fechar" funcional

### **Exemplo de Conteúdo:**
```
🎯 Próximo Badge

✨ Glowie
Nível 2

📋 Requisitos
⏰ Tempo Total de Conversa: 1h
💬 Mensagens Enviadas: 60+ mensagens  
⭐ Rating Médio: 4.2/5 estrelas

📊 Teu Progresso
Tempo: [████░░░░░░] 30min/1h
Mensagens: [████████░░] 45/60
Rating: [████████░░] 4.0/4.2
```

## 🎯 **Cenários de Teste**

### **Cenário 1: Badge Nível 1 → 2**
- **Badge atual**: Pebbie 🪶
- **Próximo**: Glowie ✨
- **Requisitos**: 60+ msgs, 1h+, 4.2⭐
- **Resultado**: ✅ Popup mostra requisitos do Glowie

### **Cenário 2: Badge Nível 2 → 3**
- **Badge atual**: Glowie ✨
- **Próximo**: Heartie 💌
- **Requisitos**: 180+ msgs, 3h+, 4.4⭐
- **Resultado**: ✅ Popup mostra requisitos do Heartie

### **Cenário 3: Badge Nível 5 (Máximo)**
- **Badge atual**: Seraphie 🕊️
- **Próximo**: Não há próximo
- **Resultado**: ✅ Seção "Próximo Badge" não aparece

## 🎨 **Design e UX**

### **Elementos Visuais:**
- **🎯 Ícone** no título do modal
- **📋 Ícone** na seção de requisitos
- **📊 Ícone** na seção de progresso
- **⏰💬⭐ Ícones** para cada requisito
- **Cores**: Azul (#6b5bff) para destaque
- **Bordas**: Arredondadas e suaves

### **Interatividade:**
- **TouchableOpacity** com feedback tátil
- **activeOpacity={0.7}** para feedback visual
- **Dica visual** "👆 Toca para ver detalhes"
- **Modal** com animação fade

### **Layout:**
- **Seções organizadas** com espaçamento adequado
- **Barras de progresso** visuais e coloridas
- **Texto legível** com hierarquia clara
- **Botão de fechar** bem posicionado

## 🎉 **Sucesso**
O teste é bem-sucedido quando:
1. ✅ **Próximo badge** é clicável no modal principal
2. ✅ **Modal detalhado** abre ao clicar
3. ✅ **Requisitos** são mostrados claramente
4. ✅ **Progresso** é visualizado com barras
5. ✅ **Design** é atrativo e organizado
6. ✅ **Funcionalidade** é intuitiva e fácil de usar

## 📝 **Notas Técnicas**
- **Modal separado** para não interferir com o modal principal
- **Estado independente** `showNextBadgeModal`
- **Reutilização** de funções `formatTime` e `getProgressPercentage`
- **Estilos consistentes** com o design existente
- **Responsivo** para diferentes tamanhos de tela
- **Acessível** com feedback tátil e visual
