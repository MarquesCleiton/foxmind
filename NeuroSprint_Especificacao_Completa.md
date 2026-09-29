# NeuroSprint — Especificação Completa do Aplicativo

## 1. Visão do produto

**NeuroSprint** é um aplicativo de treino cognitivo diário focado em:

- velocidade de processamento;
- memória de trabalho;
- memória visual e espacial;
- atenção;
- controle inibitório;
- flexibilidade cognitiva;
- cálculo mental;
- raciocínio lógico;
- percepção e reconhecimento de padrões.

A proposta não é prometer aumento de QI ou uma transformação genérica de "inteligência". O produto deve medir e treinar habilidades específicas, mostrando a evolução do próprio usuário ao longo do tempo.

### Princípios

1. Sessões curtas.
2. Exercícios variados.
3. Dificuldade adaptativa.
4. Erros não interrompem o treino.
5. Exercícios errados retornam no final da sessão.
6. O aplicativo ensina estratégias, não apenas informa certo/errado.
7. Velocidade e precisão são métricas separadas.
8. O treino deve evitar repetição excessiva.
9. O usuário deve perceber evolução sem depender de rankings.
10. O sistema deve priorizar consistência diária em vez de sessões longas.

---

# 2. Público e proposta de valor

## Público principal

Pessoas que querem:

- melhorar agilidade mental;
- praticar cálculo de cabeça;
- melhorar memória;
- treinar concentração;
- manter uma rotina curta de treino cognitivo;
- acompanhar sua evolução.

## Proposta

> **Treine seu cérebro por alguns minutos todos os dias e acompanhe sua evolução em memória, atenção, velocidade, cálculo e raciocínio.**

---

# 3. Estrutura principal do aplicativo

A navegação principal deve ser simples:

```text
Início
Treino
Progresso
Conquistas
Perfil
```

## Início

Exibe:

- treino recomendado do dia;
- duração estimada;
- sequência de dias;
- progresso diário;
- recordes recentes;
- habilidade que está recebendo maior foco;
- botão "Começar".

Exemplo:

```text
Olá!

SEU TREINO DE HOJE
8 minutos

🧠 Memória       2:00
🔢 Cálculo       2:00
🎯 Atenção       1:30
⚡ Velocidade     1:30
🧩 Raciocínio     1:00

🔥 7 dias seguidos

[ COMEÇAR ]
```

---

# 4. Sessão diária

A sessão deve ser composta por blocos curtos.

Uma sessão padrão:

1. Aquecimento — 30 segundos
2. Exercício 1 — 1 a 2 minutos
3. Exercício 2 — 1 a 2 minutos
4. Exercício 3 — 1 a 2 minutos
5. Exercício 4 — 1 a 2 minutos
6. Revisão dos erros
7. Resultado

Duração recomendada:

- mínimo: 3 minutos;
- padrão: 7–10 minutos;
- opcional: 15 minutos.

O usuário não deve precisar realizar sessões longas para manter a sequência diária.

---

# 5. Motor adaptativo

Este é um dos principais diferenciais do produto.

O aplicativo não deve simplesmente aumentar a dificuldade após cada acerto.

A dificuldade deve considerar:

```text
Precisão
+
Tempo de resposta
+
Quantidade de informação
+
Quantidade de regras simultâneas
+
Taxa de erros recentes
+
Consistência
```

## Exemplo

Usuário:

```text
Precisão: 96%
Tempo médio: 1,4s
```

A dificuldade pode subir.

Outro usuário:

```text
Precisão: 64%
Tempo médio: 3,8s
```

A dificuldade deve permanecer ou diminuir.

## Regra geral

O sistema deve buscar uma zona de desafio:

```text
Muito fácil
     ↓
Fácil
     ↓
Desafiador ← objetivo
     ↓
Difícil
     ↓
Frustrante
```

O objetivo é manter o usuário próximo de "desafiador".

---

# 6. Sistema de pontuação

Não utilizar somente acertos.

Cada exercício pode gerar:

```text
Score =
Precisão
+
Velocidade
+
Dificuldade
+
Consistência
```

A fórmula exata pode ser calibrada posteriormente.

## Métricas separadas

O aplicativo deve guardar:

- taxa de acerto;
- tempo médio;
- melhor tempo;
- maior dificuldade atingida;
- sequência máxima;
- erros;
- tipo de erro;
- desempenho por categoria.

Nunca esconder precisão atrás de um único número.

---

# 7. Categorias de treino

# 7.1 Cálculo mental

Operações:

- adição;
- subtração;
- multiplicação;
- divisão;
- porcentagem;
- regra de três simples;
- distância;
- velocidade;
- tempo;
- estimativa;
- conversões simples.

## Progressão

### Nível inicial

```text
7 + 8
15 - 6
4 × 7
24 ÷ 6
```

### Intermediário

```text
37 + 48
92 - 37
17 × 6
144 ÷ 12
```

### Avançado

```text
37 × 24
18% de 350
240 km em 3h20
```

## Estratégias mentais

O aplicativo deve ensinar atalhos.

Exemplo:

```text
37 × 24

37 × 20 = 740
37 × 4  = 148

740 + 148 = 888
```

Outro:

```text
48 × 25

48 × 100 ÷ 4
= 1200
```

Porcentagem:

```text
15% de 240

10% = 24
5%  = 12

15% = 36
```

Após um erro, mostrar uma estratégia simples e reutilizável.

---

# 7.2 Cálculo cumulativo

O usuário mantém mentalmente um valor.

Exemplo:

```text
Comece em 20

+7
×2
-13
÷3
+8
```

Pergunta:

```text
Resultado?
```

A dificuldade aumenta através de:

- mais operações;
- números maiores;
- operações misturadas;
- menor tempo de exposição;
- regras adicionais.

---

# 7.3 Estimativa

Treinar ordem de grandeza.

Exemplo:

```text
19 × 51 ≈ ?
```

Ou:

```text
Um carro percorre 180 km em 2h30.
Qual é aproximadamente a velocidade média?
```

O objetivo não é precisão matemática absoluta, mas rapidez para chegar a uma boa aproximação.

---

# 7.4 Memória de sequências

Modos:

- sequência normal;
- sequência inversa;
- números pares;
- números ímpares;
- ordem crescente;
- ordem decrescente;
- letras;
- letras + números;
- números com cores.

Exemplo:

```text
7 2 9 4 6
```

Perguntas:

```text
Repita:
7 2 9 4 6

Inverta:
6 4 9 2 7
```

---

# 7.5 Memória associativa

Associar elementos.

Exemplo:

```text
🐶 → 47
🚗 → 82
🍎 → 13
🎸 → 65
```

Depois:

> Qual número pertence à 🎸?

Posteriormente:

> Qual objeto pertence ao 82?

A dificuldade aumenta com a quantidade de associações e o intervalo entre memorização e recuperação.

---

# 7.6 Memória de trabalho

Treinar armazenamento + manipulação.

Exemplo:

```text
7 2 9 4 6
```

Tarefa:

> Remova os números pares e diga os restantes ao contrário.

Resposta:

```text
9 7
```

Esse tipo de exercício deve ser uma das categorias avançadas.

---

# 7.7 N-Back

Exibir uma sequência:

```text
3 → 7 → 2 → 7 → 9
```

No 2-back, o usuário identifica quando o item atual é igual ao item de duas posições atrás.

Progressão:

- 1-back;
- 2-back;
- 3-back;
- números;
- letras;
- posições;
- número + posição.

---

# 7.8 Memória espacial

Mostrar rapidamente uma grade:

```text
⬜ 🟦 ⬜ ⬜
⬜ ⬜ 🟦 ⬜
🟦 ⬜ ⬜ ⬜
```

Depois esconder.

O usuário reproduz as posições.

Progressão:

```text
3 posições
↓
5
↓
7
↓
10
↓
mais posições + sequência
```

---

# 7.9 Genius / sequência de cores

Inspirado na lógica de jogos de memória de sequência, sem depender de copiar exatamente um jogo existente.

Exemplo:

```text
🔵 → 🟢 → 🔴 → 🟡
```

O usuário repete.

Variações:

- cores;
- sons;
- posições;
- números;
- combinações de cor + posição.

---

# 7.10 Memória visual

Mostrar uma imagem ou conjunto de objetos durante poucos segundos.

Depois perguntar:

- qual objeto estava presente?
- qual mudou?
- qual desapareceu?
- onde estava determinado objeto?
- quantos objetos havia?

---

# 7.11 "O que mudou?"

Mostrar uma cena.

Depois mostrar uma segunda versão.

Mudanças possíveis:

- posição;
- cor;
- quantidade;
- tamanho;
- orientação;
- objeto removido;
- objeto adicionado.

O usuário identifica a alteração.

---

# 7.12 Atenção e reação

Exemplo:

```text
🔵
🔴
🟢
🔴
🟡
```

Regra:

> Toque somente no vermelho.

Progressão:

- maior velocidade;
- mais estímulos;
- estímulos distratores;
- regras variáveis.

---

# 7.13 Controle inibitório

Criar situações em que a resposta automática está errada.

Exemplo:

```text
🔴
```

Regra:

> Não toque no vermelho.

Ou:

```text
AZUL
```

A palavra é azul, mas aparece em outra cor.

O usuário deve seguir a regra definida, não o impulso visual automático.

---

# 7.14 Stroop

Dois modos:

### Cor

Pergunta:

> Qual é a cor?

### Palavra

Pergunta:

> Qual palavra está escrita?

A dificuldade aumenta conforme palavra e cor entram em conflito.

---

# 7.15 Flexibilidade cognitiva

As regras mudam.

Exemplo:

```text
Rodada 1:
toque no maior.

Rodada 2:
toque no menor.

Rodada 3:
toque no par.

Rodada 4:
toque no ímpar.
```

Posteriormente, as regras podem mudar no meio da sequência.

---

# 7.16 Atenção dividida

Duas informações aparecem simultaneamente.

Exemplo:

```text
Número: 7
Cor: 🔴
```

Regra:

> Some apenas os números azuis.

Depois:

> Memorize os vermelhos e some os azuis.

---

# 7.17 Dupla tarefa

Combinar dois objetivos.

Enquanto números aparecem:

- identificar uma condição;
- memorizar outra informação.

Exemplo:

> Toque nos números vermelhos e memorize os números azuis.

Ao final:

> Quais números azuis apareceram?

---

# 7.18 Ordenação

Exemplo:

```text
73 18 42 91 36
```

Ordenar:

```text
18 36 42 73 91
```

Variações:

- crescente;
- decrescente;
- letras;
- números + letras;
- negativos;
- decimais;
- valores misturados.

---

# 7.19 Sequências e padrões

Exemplos:

```text
2 → 4 → 8 → 16 → ?
```

```text
A → C → F → J → O → ?
```

Também utilizar:

- padrões visuais;
- rotação;
- alternância;
- quantidade;
- posição;
- lógica combinatória simples.

---

# 7.20 Fluência verbal

Exemplo:

> Digite o máximo de animais que conseguir em 30 segundos.

Outros desafios:

- palavras começando com determinada letra;
- frutas;
- profissões;
- objetos;
- palavras que atendam a duas condições.

Métricas:

- quantidade;
- tempo;
- duplicações;
- respostas inválidas.

---

# 7.21 Memória contextual

Mostrar uma pequena informação:

> Marcos saiu de casa às 8:20, pegou o ônibus azul e chegou ao trabalho às 9:05.

Depois perguntar:

- Que horas ele saiu?
- Qual era a cor do ônibus?
- Quanto tempo levou?
- Onde ele chegou?

Isso aproxima o treino de situações cotidianas.

---

# 7.22 Precisão sob pressão

Três modos:

### Precisão

Tempo pouco relevante.

Objetivo:

> máximo de acertos.

### Velocidade

Objetivo:

> menor tempo possível mantendo precisão mínima.

### Equilíbrio

Combina:

```text
precisão + velocidade
```

O aplicativo deve deixar claro qual habilidade está sendo treinada.

---

# 8. Sistema de erros

Erro não deve interromper o exercício.

Exemplo:

```text
Pergunta 1 ✓
Pergunta 2 ✓
Pergunta 3 ✗
Pergunta 4 ✓
Pergunta 5 ✗
Pergunta 6 ✓
```

Depois:

```text
REVISÃO

Pergunta 3
Pergunta 5
```

## Segunda tentativa

Não revelar imediatamente a resposta.

Primeiro:

> Tente novamente.

Se errar:

```text
Resposta correta: 888

Estratégia:
37 × 20 = 740
37 × 4 = 148
740 + 148 = 888
```

O objetivo é transformar o erro em aprendizado.

---

# 9. Sistema de dificuldade

Cada exercício deve possuir parâmetros internos.

Exemplo:

```text
difficulty = 1..100

quantidade_de_itens
tamanho_dos_numeros
tempo_de_exposicao
tempo_limite
quantidade_de_distratores
quantidade_de_regras
complexidade
```

Assim, aumentar a dificuldade não significa apenas:

> "colocar números maiores".

Pode significar:

```text
mais itens
menos tempo
mais interferência
mais regras
maior manipulação mental
```

---

# 10. Perfil cognitivo

O usuário deve possuir um painel de habilidades.

Exemplo:

```text
SEU PERFIL

⚡ Velocidade
████████░░ 82

🧠 Memória
███████░░░ 71

🎯 Atenção
█████████░ 91

🔢 Cálculo
████████░░ 84

🔄 Flexibilidade
██████░░░░ 63

🧩 Raciocínio
███████░░░ 75
```

Esses valores devem representar o desempenho interno do usuário no próprio sistema.

Não devem ser apresentados como diagnóstico ou medida científica de inteligência geral.

---

# 11. Evolução

Mostrar:

- desempenho de hoje;
- média dos últimos 7 dias;
- média dos últimos 30 dias;
- melhor resultado;
- dificuldade máxima;
- precisão;
- velocidade;
- consistência.

Exemplo:

```text
ÚLTIMOS 7 DIAS

Velocidade   +8%
Memória      +5%
Cálculo      +12%
Atenção      +3%
```

Evitar afirmar causalidade científica com base nesses números.

---

# 12. Recordes

Cada categoria possui recordes próprios.

Exemplo:

```text
MEMÓRIA

Maior sequência: 11
Melhor precisão: 97%
Melhor tempo: 1,8s

CÁLCULO

Maior score: 942
Melhor precisão: 100%
Maior dificuldade: 83
```

Também registrar:

> Recorde pessoal

em vez de estimular excessivamente comparação com outras pessoas.

---

# 13. Gamificação

## XP

Cada treino gera XP.

Exemplo:

```text
Exercício concluído: +20 XP
Novo recorde: +50 XP
Treino diário: +100 XP
Revisão dos erros: +30 XP
```

## Níveis

```text
Nível 1 → Iniciante
Nível 2 → ...
...
```

Os nomes podem ser neutros ou temáticos.

---

# 14. Streak

Sistema semelhante ao conceito de sequência diária:

```text
🔥 7 dias seguidos
```

Mas evitar punir excessivamente uma quebra.

Pode existir:

- proteção de sequência;
- dia de descanso;
- recuperação de sequência por esforço acumulado.

O objetivo é criar consistência, não ansiedade.

---

# 15. Metas diárias

O usuário escolhe uma duração:

### Leve

```text
3–5 minutos
```

### Normal

```text
7–10 minutos
```

### Intenso

```text
12–15 minutos
```

A duração escolhida altera a quantidade de exercícios, não necessariamente a dificuldade.

---

# 16. Missões

Exemplos:

```text
✓ Complete seu treino diário
✓ Acerte 20 cálculos
✓ Alcance 90% de precisão
✓ Supere seu recorde de memória
✓ Faça 3 dias consecutivos
✓ Complete 5 exercícios diferentes
```

Missões devem variar.

---

# 17. Recompensas

Recompensas possíveis:

- XP;
- níveis;
- emblemas;
- temas;
- ícones;
- efeitos visuais;
- títulos;
- sequências;
- estatísticas desbloqueadas.

Evitar recompensas que exijam sessões excessivamente longas.

---

# 18. Descanso

O aplicativo deve reconhecer que treino cognitivo não precisa ser infinito.

Após uma sessão:

```text
TREINO CONCLUÍDO

Você completou sua meta de hoje.

🔥 7 dias
+124 XP

Pode parar por aqui.
```

Uma opção:

> Continuar treinando

deve existir, mas não ser necessária.

---

# 19. Tela de resultado

Exemplo:

```text
TREINO CONCLUÍDO

Score
842

Precisão
91%

Velocidade
1,9s

Memória
+6%

Cálculo
+8%

Atenção
+2%

🔥 7 dias seguidos

NOVO RECORDE
Memória: 9 itens
```

Depois:

```text
SEU PONTO DE ATENÇÃO

Você acertou 94% dos cálculos,
mas demorou mais nas multiplicações.

Dica:
quebre multiplicações em dezenas + unidades.
```

---

# 20. Recomendações personalizadas

O sistema pode gerar mensagens como:

> Sua precisão está alta, mas sua velocidade caiu nas últimas sessões. O próximo treino terá mais exercícios rápidos.

Ou:

> Você está errando mais exercícios de memória quando há mais de 7 itens. Vamos trabalhar nessa faixa hoje.

Isso cria a sensação de um treinador pessoal.

---

# 21. Treino adaptativo do dia

A sessão não precisa ser igual para todos.

Exemplo de usuário A:

```text
Cálculo: forte
Memória: fraca
Atenção: forte
```

Treino:

```text
Memória       3 min
Cálculo       1 min
Atenção       1 min
Flexibilidade 2 min
```

Usuário B:

```text
Cálculo: fraco
Memória: forte
```

Treino:

```text
Cálculo       3 min
Estimativa    2 min
Memória       1 min
Atenção       2 min
```

---

# 22. "Desafio do dia"

Uma experiência mais divertida que simplesmente selecionar exercícios.

```text
🧠 DESAFIO DO DIA

Você terá 8 minutos.

01 — Memória
02 — Cálculo
03 — Atenção
04 — Flexibilidade
05 — Velocidade

Sua dificuldade será ajustada durante o desafio.
```

No final:

```text
Seu desempenho de hoje:

Memória       78
Cálculo       84
Atenção       91
Flexibilidade 67
Velocidade    82
```

---

# 23. Design da interface

A interface deve ser:

- limpa;
- rápida;
- visual;
- pouco textual durante exercícios;
- alto contraste;
- poucos elementos simultâneos;
- feedback instantâneo.

Durante um exercício cognitivo, evitar menus, gráficos e informações desnecessárias.

## Exemplo

```text
       37 × 24

        [  ?  ]

      ⏱  2,4s
```

O foco deve estar no problema.

---

# 24. Feedback

Feedback positivo deve ser curto.

```text
✓ Correto
+24 XP
```

Erro:

```text
✗ Incorreto

Próximo
```

Não interromper o ritmo para mostrar explicações longas.

A explicação aparece na revisão.

---

# 25. Sons e vibração

Opcional.

Sons diferentes para:

- acerto;
- erro;
- novo recorde;
- conclusão;
- subida de nível.

Vibração curta pode ser usada em exercícios de reação.

Deve existir opção para desligar tudo.

---

# 26. Acessibilidade

Considerar:

- modo sem cores;
- suporte a daltonismo;
- tamanho de texto ajustável;
- opção sem áudio;
- vibração desligável;
- áreas de toque grandes;
- contraste adequado;
- exercícios que não dependam exclusivamente de cor.

---

# 27. Dados armazenados

Cada tentativa deve registrar algo próximo de:

```text
exercise_id
category
difficulty
started_at
answered_at
response_time_ms
correct
expected_answer
user_answer
attempt_number
session_id
```

Agregados:

```text
daily_accuracy
average_response_time
best_response_time
highest_difficulty
personal_record
streak
xp
level
```

O histórico permite recalcular métricas posteriormente.

---

# 28. Proteção contra métricas enganosas

O aplicativo deve evitar comparar diretamente exercícios diferentes como se fossem a mesma habilidade.

Exemplo:

```text
1,5s em reação
```

não é diretamente comparável com:

```text
1,5s em cálculo
```

Cada categoria deve possuir sua própria métrica.

---

# 29. Anti-repetição

O gerador deve evitar apresentar exatamente o mesmo exercício repetidamente.

Utilizar:

- banco de questões;
- geração procedural;
- sementes aleatórias;
- histórico recente;
- controle de repetição;
- variações de dificuldade.

Exemplo:

Se o usuário respondeu:

```text
37 × 24
```

recentemente, evitar imediatamente:

```text
37 × 24
```

Mas permitir:

```text
38 × 24
```

ou outra estrutura equivalente.

---

# 30. Geração procedural

Grande parte dos exercícios matemáticos pode ser gerada automaticamente.

Exemplo:

```text
a + b
a - b
a × b
a ÷ b
x% de y
distância = velocidade × tempo
```

O gerador deve validar:

- dificuldade;
- resultado;
- existência de divisão inteira quando necessário;
- tempo estimado;
- ausência de ambiguidades.

---

# 31. Fases do produto

## MVP

Começar com:

1. Cálculo mental
2. Sequência de números
3. Genius/cores
4. Memória espacial
5. Atenção/reação
6. Ordenação
7. Sistema de erros
8. Sessão diária
9. XP
10. streak
11. recordes
12. histórico
13. dificuldade adaptativa básica

Isso já é suficiente para validar o produto.

---

# 32. V2

Adicionar:

- N-back;
- memória associativa;
- Stroop;
- flexibilidade cognitiva;
- cálculo cumulativo;
- estimativa;
- padrões;
- memória contextual;
- dupla tarefa;
- fluência verbal.

---

# 33. V3

Adicionar:

- treinador adaptativo avançado;
- recomendações personalizadas;
- desafios especiais;
- períodos de desempenho;
- análise detalhada;
- eventos semanais;
- novos tipos de exercícios;
- geração procedural mais sofisticada.

---

# 34. Arquitetura lógica do treino

O fluxo ideal:

```text
Usuário inicia sessão
        ↓
Carregar perfil cognitivo
        ↓
Calcular necessidades atuais
        ↓
Selecionar categorias
        ↓
Definir dificuldade inicial
        ↓
Executar exercício
        ↓
Registrar resultado
        ↓
Atualizar dificuldade
        ↓
Próximo exercício
        ↓
Repetir erros posteriormente
        ↓
Finalizar sessão
        ↓
Atualizar métricas
        ↓
Atualizar XP / streak / recordes
        ↓
Gerar resumo
        ↓
Definir próximo treino
```

---

# 35. Princípio central do produto

O aplicativo não deve ser apenas:

> "Uma coleção de jogos cerebrais."

Ele deve funcionar como:

> **Um treinador cognitivo adaptativo de sessões curtas.**

A diferença está em:

```text
Exercício
+
Medição
+
Adaptação
+
Revisão
+
Progressão
+
Consistência
```

---

# 36. Exemplo de uma semana

## Segunda

Foco:

- cálculo;
- memória.

## Terça

Foco:

- atenção;
- velocidade.

## Quarta

Foco:

- memória espacial;
- flexibilidade.

## Quinta

Foco:

- cálculo;
- raciocínio.

## Sexta

Foco:

- atenção;
- memória de trabalho.

## Sábado

Desafio misto.

## Domingo

Treino leve ou descanso.

O usuário não precisa saber antecipadamente qual será a combinação exata.

O motor adaptativo decide.

---

# 37. Princípio de dificuldade

Nunca aumentar dificuldade apenas por aumentar números.

Exemplo de evolução de cálculo:

```text
2 + 3

↓

17 + 28

↓

37 × 6

↓

37 × 24

↓

37 × 24 + 18 × 7

↓

problema contextual

↓

problema contextual + limite de tempo
```

A evolução deve aumentar a carga cognitiva de maneira controlada.

---

# 38. Princípio de diversão

O usuário precisa sentir:

> "Quero tentar mais uma vez."

Mas o aplicativo não deve criar um ciclo de sessões intermináveis.

Elementos que ajudam:

- recordes;
- desafios curtos;
- feedback imediato;
- progressão;
- variedade;
- dificuldade adaptativa;
- metas claras;
- recompensas.

---

# 39. O que evitar

Não utilizar:

- promessa de aumento de QI;
- diagnóstico médico;
- afirmações de tratamento;
- ranking como principal motivador;
- sessões obrigatoriamente longas;
- excesso de notificações;
- explicações longas durante o exercício;
- dificuldade aleatória;
- score único tentando representar toda a cognição;
- exercícios repetitivos;
- punições fortes por errar;
- mecânicas que incentivem jogar por horas.

---

# 40. Diferencial competitivo

O diferencial não precisa ser ter 100 minigames.

Pode ser:

> **Cada minuto de treino é escolhido com base no desempenho do usuário.**

Exemplo:

```text
Você está rápido no cálculo.
Você está errando memória acima de 7 itens.
Você está perdendo precisão quando precisa trocar de regra.

Seu treino de hoje foi adaptado para isso.
```

Isso transforma o produto de uma simples coleção de jogos em uma experiência de treinamento personalizada.

---

# 41. MVP recomendado

A primeira versão deve ser deliberadamente pequena.

### Exercícios

- Cálculo mental
- Sequência numérica
- Genius
- Memória espacial
- Atenção/reação
- Ordenação

### Sistema

- perfil;
- sessão diária;
- dificuldade adaptativa;
- erros para revisão;
- XP;
- níveis;
- streak;
- recordes;
- estatísticas;
- metas;
- histórico.

### Tela principal

```text
┌──────────────────────────────┐
│ 🧠 NeuroSprint               │
│                              │
│ 🔥 7 dias                    │
│                              │
│ TREINO DE HOJE               │
│ 8 minutos                    │
│                              │
│ 🧠 Memória        2 min      │
│ 🔢 Cálculo        2 min      │
│ 🎯 Atenção        2 min      │
│ ⚡ Velocidade      2 min      │
│                              │
│       [ COMEÇAR ]            │
│                              │
│ Recorde recente: 942         │
└──────────────────────────────┘
```

---

# 42. Visão final

O produto ideal deve fazer o usuário sentir três coisas:

### Durante o treino

> "Isso está ficando difícil."

### Depois do treino

> "Eu consegui melhorar."

### No dia seguinte

> "Quero ver se consigo superar meu recorde."

A experiência deve ser curta, adaptativa e progressiva.

O verdadeiro núcleo do aplicativo é:

```text
TREINO
  ↓
MEDIÇÃO
  ↓
ANÁLISE
  ↓
ADAPTAÇÃO
  ↓
REVISÃO
  ↓
PROGRESSÃO
  ↓
NOVO TREINO
```

Esse ciclo é mais importante do que a quantidade de minigames disponíveis.
