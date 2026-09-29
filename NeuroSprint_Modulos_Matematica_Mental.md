# Módulos de Matemática Mental — Especificação Completa

## 1. Objetivo

Criar um sistema de treino matemático voltado para **automatização de contas básicas, velocidade de recuperação, cálculo mental, escolha de estratégias e raciocínio numérico**.

O sistema não deve ser apenas um gerador aleatório de contas.

Ele deve entender relações matemáticas, detectar redundâncias, acompanhar o domínio de cada conhecimento e adaptar o treino para concentrar esforço no que ainda não está automatizado.

```text
Pergunta
   ↓
Resposta
   ↓
Tempo + precisão
   ↓
Atualização do domínio
   ↓
Redução das questões dominadas
   ↓
Foco nas dificuldades
   ↓
Novas variações
```

---

# 2. Organização geral

```text
🧮 Matemática Mental
│
├── ➕ Adição
├── ➖ Subtração
├── ✖️ Multiplicação
├── ➗ Divisão
├── % Porcentagem
│
├── 🧠 Estratégias
├── 🔄 Famílias matemáticas
├── ⚡ Velocidade
└── 🎯 Treino adaptativo
```

O usuário pode escolher um módulo, fazer treino adaptativo, desafio misto ou revisão.

---

# 3. Conceito de domínio

Cada conhecimento possui um nível de domínio.

```text
🔴 Não dominado
🟠 Em aprendizado
🟡 Conhecido
🟢 Dominado
🔵 Automatizado
```

O domínio considera:

- acerto;
- tempo de resposta;
- quantidade de tentativas;
- erros recentes;
- consistência;
- dificuldade da representação;
- intervalo desde a última revisão.

O objetivo das contas fundamentais é chegar ao estado **automatizado**.

---

# 4. Velocidade

Registrar a resposta e o tempo.

```text
7 × 8 = 56
Tempo: 0,92s
```

Exemplo de evolução:

```text
4,2s
3,1s
2,0s
1,4s
0,9s
```

Isso permite identificar a passagem de cálculo consciente para recuperação automática.

---

# 5. Motor de repetição

Cada conhecimento possui seu próprio histórico.

```text
7 × 8

Acertos: 8
Erros: 1
Tempo médio: 1,3s
Domínio: 87%
```

Conhecimentos dominados aparecem menos.

Conhecimentos fracos aparecem mais.

---

# 6. Afunilamento

Um conjunto começa amplo e vai diminuindo:

```text
45
 ↓
38
 ↓
27
 ↓
15
 ↓
7
 ↓
3
 ↓
0
```

Os conhecimentos dominados saem temporariamente do conjunto ativo.

O treino deve terminar quando o objetivo de domínio da sessão for atingido.

---

# 7. Redundância matemática

O sistema deve reconhecer operações equivalentes.

## Multiplicação

```text
2 × 3
3 × 2
```

Pertencem à mesma relação fundamental.

O conhecimento pode ser:

```text
{2,3} → 6
```

Mas as duas formas podem aparecer posteriormente como variações de recuperação.

---

# 8. Famílias matemáticas

Exemplo:

```text
2 × 7 = 14
7 × 2 = 14
14 ÷ 2 = 7
14 ÷ 7 = 2
```

Todas pertencem à mesma família:

```text
2 ↔ 7 ↔ 14
```

Isso permite testar diferentes relações sem considerar tudo como conhecimento independente.

---

# 9. ➕ Adição

## Objetivo

Automatizar combinações fundamentais entre 1 e 9.

Como:

```text
1 + 7 = 7 + 1
```

as duas não precisam ser conhecimentos independentes.

### Conjunto

```text
1+1 ... 1+9
2+2 ... 2+9
3+3 ... 3+9
...
9+9
```

Total:

**45 combinações únicas.**

### Progressão

**Fase 1 — Recuperação**

```text
7 + 8
4 + 6
9 + 3
```

**Fase 2 — Ordem invertida**

```text
8 + 7
6 + 4
3 + 9
```

**Fase 3 — Transferência**

```text
17 + 8
27 + 9
38 + 7
```

**Fase 4 — Dois algarismos**

```text
47 + 38
63 + 29
78 + 16
```

**Fase 5 — Estratégias**

```text
48 + 37
```

Possível estratégia:

```text
48 + 30 = 78
78 + 7 = 85
```

---

# 10. ➖ Subtração

Subtração é diferente da adição.

```text
8 - 3 = 5
3 - 8 = -5
```

Logo, inverter os números não é redundância.

## Conjunto positivo

```text
2-1
3-1
3-2
4-1
4-2
4-3
...
9-8
```

Total:

**36 combinações.**

## Conjunto negativo

```text
1-2
1-3
...
8-9
```

Também devem ser treinados.

### Representações equivalentes

```text
3 - 8
-8 + 3
```

São a mesma relação matemática, embora a representação seja diferente.

### Progressão

1. Subtrações simples.
2. Resultados negativos.
3. Complementos para 10.
4. Dois algarismos.
5. Decomposição.
6. Cálculo rápido com números maiores.

Exemplo:

```text
83 - 47

83 - 40 = 43
43 - 7 = 36
```

---

# 11. ✖️ Multiplicação

## Objetivo

Automatizar as relações fundamentais das tabuadas de 2 a 9.

Como:

```text
2 × 7 = 7 × 2
```

não é necessário duplicar o conhecimento.

## Conjunto

```text
2×2 ... 2×9
3×3 ... 3×9
...
9×9
```

Total:

**36 combinações únicas.**

### Progressão

**Fase 1**

```text
7 × 8
6 × 9
4 × 7
```

**Fase 2**

```text
8 × 7
9 × 6
7 × 4
```

**Fase 3**

```text
7 × 8 = 56
? × 8 = 56
56 ÷ 8 = ?
```

**Fase 4**

```text
37 × 24
```

Estratégia:

```text
37 × 20 = 740
37 × 4 = 148
740 + 148 = 888
```

---

# 12. ➗ Divisão

Divisão não deve ser apenas multiplicação invertida.

## 12.1 Direta

```text
56 ÷ 7
72 ÷ 8
81 ÷ 9
```

## 12.2 Relação multiplicativa

```text
? ÷ 7 = 8
56 ÷ ? = 8
```

## 12.3 Quantos cabem?

```text
168 ÷ 12
```

```text
12 × 10 = 120
sobra 48
12 × 4 = 48
10 + 4 = 14
```

## 12.4 Decomposição

```text
156 ÷ 12

120 ÷ 12 = 10
36 ÷ 12 = 3

10 + 3 = 13
```

## 12.5 Divisores convenientes

```text
850 ÷ 25
```

```text
850 ÷ 100 × 4 = 34
```

## 12.6 Estimativa

```text
387 ÷ 19 ≈ ?
```

```text
19 ≈ 20
387 ÷ 20 ≈ 19
```

## 12.7 Resto

```text
137 ÷ 12
```

```text
11 grupos
5 restantes
```

## 12.8 Contexto

```text
180 km em 3 horas
```

```text
180 ÷ 3 = 60 km/h
```

O objetivo é reconhecer qual estratégia utilizar.

---

# 13. % Porcentagem

Porcentagem é um **módulo próprio**, porque treina proporção, decomposição, estimativa, comparação e raciocínio aplicado.

Não deve se limitar a:

```text
20% de 500 = 100
```

O módulo deve trabalhar várias famílias de problemas.

---

# 14. Porcentagens fundamentais

Criar referências:

```text
1%
5%
10%
20%
25%
50%
75%
100%
```

Depois:

```text
2%
15%
30%
40%
60%
80%
```

## Exemplos

```text
10% de 240 = 24
5% de 240 = 12
25% de 240 = 60
50% de 240 = 120
```

---

# 15. Decomposição de porcentagem

Treinar porcentagens construídas a partir de partes conhecidas.

### Exemplo

```text
15% de 240
```

```text
10% = 24
5% = 12

15% = 36
```

### Outro

```text
35% de 200
```

```text
30% = 60
5% = 10

35% = 70
```

### Outro

```text
17% de 300
```

```text
10% = 30
5% = 15
2% = 6

17% = 51
```

---

# 16. Porcentagem e frações

Associar porcentagens a frações simples:

```text
50% = 1/2
25% = 1/4
75% = 3/4
20% = 1/5
10% = 1/10
```

Exemplo:

```text
25% de 360
```

Pode ser resolvido como:

```text
360 ÷ 4 = 90
```

O sistema deve aceitar e ensinar diferentes estratégias equivalentes.

---

# 17. Porcentagem reversa

Não perguntar apenas:

```text
20% de 300 = ?
```

Também:

```text
60 é 20% de quanto?
```

Estratégia:

```text
20% = 1/5

60 × 5 = 300
```

Outro:

```text
45 representa 15% de qual número?
```

```text
15% = 10% + 5%
```

ou:

```text
45 ÷ 0,15 = 300
```

Para cálculo mental, priorizar estratégias simples e naturais.

---

# 18. Descobrir a porcentagem

Exemplo:

```text
30 de 120 corresponde a quantos %?
```

```text
30 ÷ 120 = 1/4
```

Resultado:

```text
25%
```

Outro:

```text
18 de 60
```

```text
18 ÷ 60 = 0,3
```

Resultado:

```text
30%
```

---

# 19. Aumento percentual

Exemplo:

```text
Preço: R$ 200
Aumento: 15%
```

```text
15% de 200 = 30
200 + 30 = 230
```

Depois:

```text
R$ 480 + 12%
```

---

# 20. Desconto percentual

Exemplo:

```text
R$ 250
20% de desconto
```

```text
20% = 50
250 - 50 = 200
```

Outro:

```text
R$ 380
15% de desconto
```

```text
10% = 38
5% = 19
15% = 57

380 - 57 = 323
```

---

# 21. Porcentagens sucessivas

Nível avançado.

```text
R$ 100
+20%
-20%
```

Primeiro:

```text
100 + 20 = 120
```

Depois:

```text
20% de 120 = 24
120 - 24 = 96
```

Resultado:

```text
96
```

Isso treina a compreensão de que a base muda após a primeira operação.

---

# 22. Comparação percentual

Exemplo:

```text
Produto A = R$ 80
Produto B = R$ 100
```

Pergunta:

> A é quantos % mais barato que B?

```text
Diferença = 20
Base = 100

20%
```

Agora inverter:

> B é quantos % mais caro que A?

```text
Diferença = 20
Base = 80

25%
```

O sistema deve ensinar que **a base da comparação importa**.

---

# 23. Estimativa percentual

Exemplo:

```text
17% de 598
```

Uma estratégia:

```text
20% de 600 ≈ 120
```

O objetivo é desenvolver senso numérico.

---

# 24. Porcentagem aplicada

Problemas curtos e cotidianos:

### Gorjeta

```text
Conta: R$ 180
Gorjeta: 10%
```

### Desconto

```text
R$ 240
15% OFF
```

### Variação

```text
Preço passou de R$ 80 para R$ 92.
Qual foi o aumento percentual?
```

### Taxa

```text
R$ 1.000
2% ao mês
```

O sistema deve aumentar gradualmente a complexidade.

---

# 25. Famílias de porcentagem

Uma mesma relação pode gerar várias perguntas.

Exemplo:

```text
25% de 200 = 50
```

Família:

```text
25% de 200 = ?
50 é 25% de quanto?
50 de 200 representa quantos %?
200 × 25% = ?
200 com redução de 25% = ?
200 com aumento de 25% = ?
```

Isso evita memorização de apenas um formato.

---

# 26. Redundância dentro da porcentagem

Exemplo:

```text
50% de 200
```

Pode ser:

```text
200 ÷ 2
200 × 0,5
1/2 de 200
```

O conhecimento fundamental é:

```text
50% ↔ 1/2
```

As representações podem variar para testar transferência.

---

# 27. Estratégias matemáticas

## Adição

```text
Quebrar dezenas e unidades.
Completar 10.
Arredondar e compensar.
```

## Subtração

```text
Quebrar o número.
Completar até o alvo.
Arredondar e compensar.
```

## Multiplicação

```text
Distribuir.
Dobrar e dividir.
Multiplicar por 10 e ajustar.
Usar múltiplos conhecidos.
```

## Divisão

```text
Decompor.
Aproximar.
Transformar o divisor.
Pensar em quantos cabem.
Usar relações multiplicativas.
```

## Porcentagem

```text
Usar 10%.
Usar 5%.
Usar 1%.
Usar frações conhecidas.
Decompor porcentagens.
Estimar.
```

---

# 28. Escolha de estratégia

Nos níveis avançados:

```text
875 ÷ 25

A) Divisão tradicional
B) ÷100 ×4
C) Estimar
D) Repetir subtrações
```

Depois:

> Resolva.

O sistema mede **eficiência estratégica**, não apenas resultado.

---

# 29. Treino misto

No modo misto, a operação não é anunciada previamente.

Exemplo:

```text
37 + 28
56 ÷ 7
15% de 240
8 × 9
83 - 47
```

O usuário precisa:

1. identificar a operação;
2. escolher mentalmente uma estratégia;
3. resolver;
4. responder.

---

# 30. Treino adaptativo

Exemplo de perfil:

```text
Adição        96%
Subtração     91%
Multiplicação 73%
Divisão       61%
Porcentagem   54%
```

O treino deve concentrar mais perguntas em:

```text
Divisão
Porcentagem
Multiplicação
```

sem abandonar completamente os conhecimentos dominados.

---

# 31. Repetição inteligente

Quando o usuário erra:

```text
Erro
 ↓
Outras questões
 ↓
Nova tentativa
 ↓
Acerto
 ↓
Revisão posterior
```

Evitar repetir imediatamente a mesma questão várias vezes.

Isso reduz memorização mecânica da sequência.

---

# 32. Revisão espaçada

Exemplo conceitual:

```text
agora
 ↓
5 minutos
 ↓
1 dia
 ↓
3 dias
 ↓
7 dias
 ↓
14 dias
```

O intervalo aumenta quando o conhecimento permanece estável.

---

# 33. Reversibilidade

Exemplo:

```text
7 × 8 = 56
```

Depois:

```text
8 × 7 = ?
56 ÷ 7 = ?
56 ÷ 8 = ?
? × 8 = 56
56 ÷ ? = 7
```

Isso verifica domínio da relação, e não apenas memorização de uma frase.

---

# 34. Transferência

Depois de dominar:

```text
7 × 8
```

gerar:

```text
70 × 8
7 × 80
70 × 80
```

Depois de dominar:

```text
25% de 200
```

gerar:

```text
25% de 360
25% de 480
```

---

# 35. Precisão versus velocidade

## Precisão

Tempo pouco relevante.

```text
Objetivo: máximo de acertos.
```

## Velocidade

Tempo fortemente considerado.

```text
Objetivo: resposta rápida sem perder precisão.
```

## Equilíbrio

```text
Precisão + velocidade.
```

---

# 36. Recordes

Cada módulo possui seus próprios indicadores:

```text
➕ Adição
Melhor tempo médio: 1,2s
Precisão: 100%

➖ Subtração
Precisão: 96%

✖️ Multiplicação
Maior sequência: 36

➗ Divisão
Maior dificuldade dominada: 82

% Porcentagem
Maior sequência: 27
```

---

# 37. Matriz de domínio

Exemplo:

```text
             Adição  Subtração  Multiplicação  Divisão  %
1 ↔ 1          🟢       —           —            —       🟡
2 ↔ 3          🟢       🟡          🟢           🟡       🟠
4 ↔ 7          🟢       🟢          🟡           🔴       🟡
7 ↔ 8          🟢       🟡          🔴           🔴       🟠
8 ↔ 9          🟡       🔴          🔴           🔴       🔴
```

---

# 38. Desafio matemático diário

Uma sessão pode combinar:

```text
➕ Adição          1:30
✖️ Multiplicação   1:30
➗ Divisão         1:30
% Porcentagem      1:30
🧠 Estratégia      1:30
```

Total:

```text
7:30
```

A distribuição é adaptada ao perfil.

---

# 39. Exemplo de sessão adaptativa

Perfil:

```text
Adição: automatizada
Subtração: boa
Multiplicação: média
Divisão: fraca
Porcentagem: muito fraca
```

Sessão:

```text
10% de 240
56 ÷ 7
25% de 360
7 × 8
387 ÷ 19 ≈ ?
15% de 300
83 - 47
50% de 780
```

---

# 40. Critério de domínio

Um conhecimento pode sair do conjunto ativo quando:

```text
precisão ≥ limite
+
tempo ≤ limite
+
mínimo de tentativas
+
sem erro recente
```

Exemplo conceitual:

```text
≥ 90% de precisão
≤ 2 segundos
3 acertos consistentes
```

Os limites devem variar conforme dificuldade e categoria.

---

# 41. Proteção contra falsa dominância

Não considerar algo dominado apenas porque o usuário acertou algumas vezes.

Variar:

- ordem;
- representação;
- contexto;
- intervalo;
- números equivalentes;
- formato da pergunta.

Exemplo:

```text
7 × 8
8 × 7
56 ÷ 7
? × 8 = 56
```

---

# 42. Banco de conhecimento

Cada conhecimento pode possuir:

```text
knowledge_id
category
family_id
operation
operand_a
operand_b
result
difficulty
representations
strategies
```

Exemplo:

```text
knowledge_id: mult_7_8
family_id: family_7_8_56
operation: multiplication
operand_a: 7
operand_b: 8
result: 56
```

---

# 43. Banco de perguntas

O conhecimento é separado da pergunta.

Uma mesma relação pode gerar:

```text
7 × 8 = ?
8 × 7 = ?
56 ÷ 7 = ?
56 ÷ 8 = ?
? × 8 = 56
```

Isso permite medir conhecimento e formato separadamente.

---

# 44. Modelo conceitual

```text
                 CONHECIMENTO
                       ↓
                    FAMÍLIA
                       ↓
               REPRESENTAÇÕES
                       ↓
                    PERGUNTA
                       ↓
                   RESPOSTA
                       ↓
          ┌────────────┴────────────┐
          ↓                         ↓
      PRECISÃO                  VELOCIDADE
          └────────────┬────────────┘
                       ↓
                    DOMÍNIO
                       ↓
               PRÓXIMA REVISÃO
```

---

# 45. Regra para erros

Durante o exercício, um erro **não deve interromper o fluxo**.

Registrar:

```text
Pergunta
Resposta correta
Resposta dada
Tempo
Tentativa
Estratégia utilizada
```

A questão pode voltar posteriormente.

No final da sessão:

```text
🔁 Revisão

Você teve dificuldade nestas:

7 × 8
387 ÷ 19
15% de 300
83 - 47
```

Primeiro o usuário tenta novamente sem receber a resposta.

Se errar novamente, o sistema pode apresentar uma estratégia curta.

---

# 46. Estratégia após erro

Exemplo:

```text
15% de 240
```

Usuário erra.

O sistema não precisa mostrar apenas:

> Resposta: 36.

Pode mostrar:

```text
💡 Dica

10% de 240 = 24
5% de 240 = 12

Então:
15% = 24 + 12 = 36
```

Isso transforma o erro em aprendizado.

---

# 47. Métricas específicas

Não utilizar apenas uma pontuação matemática geral.

Separar:

```text
Recuperação
Velocidade
Precisão
Estimativa
Decomposição
Estratégia
Transferência
Porcentagem
Raciocínio proporcional
```

Assim:

```text
Multiplicação: 91%
Estratégia: 72%
Porcentagem: 58%
Estimativa: 84%
```

é mais informativo que:

```text
Matemática: 78%
```

---

# 48. Evolução de dificuldade

A dificuldade pode aumentar por:

```text
mais números
menos tempo
mais operações
mais etapas
mais distrações
mais regras
representações diferentes
contexto
```

Não aumentar apenas o tamanho dos números.

---

# 49. Exemplo de progressão da porcentagem

```text
Nível 1
10% de 200

↓
Nível 2
5% de 240

↓
Nível 3
15% de 240

↓
Nível 4
35% de 480

↓
Nível 5
45 é quantos % de 180?

↓
Nível 6
45 é 15% de quanto?

↓
Nível 7
R$ 320 com 15% de desconto

↓
Nível 8
R$ 320 + 15% e depois -10%

↓
Nível 9
Estimativa:
17% de 598
```

---

# 50. Exemplo de progressão da divisão

```text
56 ÷ 7
↓
144 ÷ 12
↓
156 ÷ 12
↓
137 ÷ 12
↓
850 ÷ 25
↓
387 ÷ 19 ≈ ?
↓
problema contextual
```

---

# 51. Exemplo de progressão geral

```text
FUNDAMENTOS
    ↓
AUTOMATIZAÇÃO
    ↓
VARIAÇÃO
    ↓
ESTRATÉGIA
    ↓
TRANSFERÊNCIA
    ↓
MISTURA
    ↓
VELOCIDADE
    ↓
APLICAÇÃO
```

---

# 52. Princípio central

O aplicativo não deve tentar fazer o usuário responder milhares de contas.

Ele deve fazer o usuário:

1. aprender a relação;
2. recuperar rapidamente;
3. reconhecer relações equivalentes;
4. escolher estratégias eficientes;
5. aplicar o conhecimento em novos contextos;
6. manter o conhecimento através de revisão espaçada.

O resultado esperado é:

> **Construir, automatizar e aplicar relações matemáticas cada vez mais rapidamente.**

---

# 53. Estrutura final

```text
🧮 MATEMÁTICA
│
├── FUNDAMENTOS
│   ├── ➕ Adição
│   ├── ➖ Subtração
│   ├── ✖️ Multiplicação
│   ├── ➗ Divisão
│   └── % Porcentagem
│
├── ESTRATÉGIAS
│   ├── Decomposição
│   ├── Estimativa
│   ├── Arredondamento
│   ├── Frações
│   ├── Complementos
│   └── Proporção
│
├── RELAÇÕES
│   ├── Famílias matemáticas
│   ├── Operações inversas
│   ├── Equivalências
│   └── Representações
│
├── TREINO
│   ├── Focado
│   ├── Adaptativo
│   ├── Misto
│   ├── Velocidade
│   └── Revisão
│
└── PROGRESSÃO
    ├── Domínio
    ├── Automatização
    ├── Recordes
    ├── Revisão espaçada
    └── Transferência
```

---

# 54. Regra arquitetural mais importante

O sistema deve separar três conceitos:

```text
CONHECIMENTO
    ≠
PERGUNTA
    ≠
RESPOSTA DO USUÁRIO
```

Exemplo:

```text
Conhecimento:
7 × 8 = 56

Perguntas:
7 × 8 = ?
8 × 7 = ?
56 ÷ 7 = ?
? × 8 = 56

Respostas do usuário:
56
56
8
7
```

Isso permite que o aplicativo saiba se o usuário domina a **relação matemática** ou apenas decorou um formato específico.

---

# 55. Resultado final do módulo

O módulo de matemática deixa de ser uma coleção de contas e passa a funcionar como um sistema de treinamento:

```text
       BANCO DE CONHECIMENTO
                 ↓
       DETECÇÃO DE REDUNDÂNCIAS
                 ↓
        FAMÍLIAS MATEMÁTICAS
                 ↓
        GERAÇÃO DE PERGUNTAS
                 ↓
       RESPOSTA DO USUÁRIO
                 ↓
        PRECISÃO + VELOCIDADE
                 ↓
          NÍVEL DE DOMÍNIO
                 ↓
       MOTOR DE REPETIÇÃO
                 ↓
        MOTOR ADAPTATIVO
                 ↓
          NOVO TREINO
```

A principal diferença em relação a um simples jogo de matemática é que o sistema sabe **o que o usuário conhece, o que ainda está fraco, quais conhecimentos são equivalentes, quais estratégias ele utiliza e quando uma habilidade realmente se tornou automática**.
