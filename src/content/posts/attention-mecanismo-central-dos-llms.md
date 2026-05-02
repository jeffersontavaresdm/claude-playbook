---
title: "Attention: o mecanismo central dos LLMs"
description: "A peça que destravou tudo. Uma analogia primeiro, depois Q/K/V sem matemática pesada, e por que isso muda como o Claude responde aos seus prompts."
date: 2026-05-02T01:42:00-03:00
category: fundamentos
tags: [fundamentos, llm]
---

Lê isso em voz alta, devagar:

> *O gato comeu a comida porque **ele** estava com fome.*

Quando bateu em "ele", seu cérebro fez um movimento — voltou pra "gato" e ligou os dois. Você não percebeu que estava fazendo, mas fez. Sem essa ligação, a frase seria nonsense.

Isso é, em essência, **attention**. E é a peça que destravou tudo no mundo dos LLMs.

## Por que isso virou central

Antes do paper [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762) (2017), modelos de linguagem eram **RNNs/LSTMs**. Eles liam o texto palavra por palavra, em ordem, mantendo um único "resumo" do que tinha vindo antes — um vetor que carregava tudo numa memória só.

Dois problemas:

1. **Sequencial.** Não dava pra paralelizar — cada palavra dependia do estado anterior.
2. **Memória que decaía.** Coisas distantes no texto se perdiam no resumo. Ligar "ele" a "gato" funcionava se eles estavam perto. A 30 palavras de distância? Difícil.

Attention resolveu os dois com uma ideia simples: **e se cada palavra pudesse olhar diretamente pra qualquer outra, sem passar por resumo nenhum, todas em paralelo?**

É isso. O resto — Transformer, GPT, Claude — é consequência dessa mudança.

## Q/K/V em linguagem de gente

A mecânica tem três peças. A maneira mais fácil de entender é pensar num **motor de busca interno** que cada palavra faz no resto do texto.

Pra cada palavra, o modelo gera três coisas:

- **Query (Q)** — "o que eu estou procurando?"
- **Key (K)** — "do que eu sou a respeito?"
- **Value (V)** — "se você me escolher, isso é o que eu te entrego"

Voltando pro nosso exemplo. Quando o modelo processa **"ele"**, gera uma Query do tipo *"preciso de algo singular, masculino, que esteja com fome ou possa estar"*.

Cada outra palavra do contexto tem uma Key que diz mais ou menos o que ela é:

- "gato" → *"sou um substantivo singular masculino, agente possível"*
- "comeu" → *"sou um verbo no passado"*
- "comida" → *"sou um substantivo singular feminino, objeto"*
- "fome" → *"sou estado, sensação"*

A Query de "ele" combina forte com a Key de "gato" — e fraco com as outras. Isso vira um **peso**. Aí o modelo pega o Value de cada palavra (que é a representação rica delas) e mistura tudo na proporção desses pesos. O Value de "gato" entra forte na nova representação de "ele". O resto entra fraco.

Pronto: "ele" agora **carrega "gato" dentro de si**. O modelo não precisou do resumo da frase inteira pra fazer essa ligação. Foi direto, em paralelo com todas as outras palavras fazendo o mesmo movimento delas.

```
"ele" pergunta → todos respondem com peso → "ele" mistura values
                                              proporcionalmente
```

É **busca ponderada**. Em vez de retornar o resultado top-1 como o Google, retorna uma combinação de todos, com mais peso pros mais relevantes.

## Por que isso muda como o Claude responde

Internalizar essa mecânica explica vários comportamentos que você sente ao usar Claude:

**Referências cruzadas longas funcionam.** Você pode definir "o cliente X" no topo do prompt e mencionar "o cliente" 2.000 tokens depois — o modelo liga. Antes de attention, isso era um problema de "memória que escapou". Hoje, é uma busca direta.

**Prompts auto-referenciais ficam coerentes.** *"Refatora a função `loadUser` que mencionei antes mantendo o mesmo padrão de erro do exemplo acima"* — funciona porque cada token do "antes" e "acima" pode buscar diretamente as referências, sem reconstruir caminho.

**A ordem importa, mas não tanto quanto parece.** Como cada palavra busca em todas as outras, mover blocos do prompt geralmente não destrói o sentido. O que dói é colocar instrução crítica **no meio** de um prompt enorme — efeito *lost in the middle*: os pesos tendem a concentrar nas bordas.

**Contexto longo é caro mecanicamente, não comercialmente.** Cada palavra fazendo busca em todas → custo cresce com o quadrado do tamanho do contexto. Janela de 1M tokens não é "1.000× mais cara" que 1K — é **1 milhão** de vezes mais cara em comparações de attention. Toda otimização que existe pra long context atrelada a alguma forma de **não fazer atenção total**.

## Onde isso se conecta

No [post sobre arquitetura Transformer](/claude-playbook/artigos/arquitetura-transformer-por-baixo-do-claude) eu mostrei o bloco inteiro: attention + feed-forward + residual + layer norm, empilhado em dezenas de camadas. Esse post zoom-in só na peça attention — porque sem entender ela, o resto da arquitetura não faz sentido.

Em posts futuros vou aprofundar duas coisas que ficam de fora aqui:

- **Q/K/V em mais detalhe** — como esses três vetores são gerados (não nasceram prontos; vêm de matrizes treinadas) e por que isso permite o modelo aprender *o que* é relevante pra cada token.
- **Multi-head attention** — em vez de uma busca, várias buscas em paralelo, cada uma especializada num tipo de relação (sintática, semântica, correferência). É o que faz o modelo lidar com várias dimensões de uma tarefa ao mesmo tempo.

## Quando esse fundamento importa

Pra um *"renomeia essa variável"*, não importa. Mas no momento que você:

- Está montando um prompt longo com referências cruzadas
- Tenta entender por que o Claude "perdeu" uma instrução do meio
- Decide entre encher o contexto ou cortar e curar
- Escreve um CLAUDE.md e está em dúvida sobre ordem das seções

…attention é o modelo mental que evita tentativa e erro. Você sabe **por que** as bordas pesam mais, **por que** repetir uma instrução crítica perto da pergunta funciona, **por que** prompt enorme com 80% de ruído piora o resultado mais do que ajuda.

## Resumindo

Attention é cada palavra fazendo uma busca ponderada em todas as outras — Query pergunta, Keys respondem com pesos, Values são misturados na proporção. Isso destravou os LLMs porque resolveu de uma só vez o problema de paralelizar (treino mais rápido) e o problema de ligar coisas distantes (long-range dependencies).

Quando você sente que o Claude "entendeu o contexto", é attention rodando. Quando sente que ele "perdeu uma instrução do meio", é attention diluindo. É a peça mais central — e a que mais paga internalizar.

## Fontes

- [Attention Is All You Need — Vaswani et al., 2017](https://arxiv.org/abs/1706.03762) — paper original
- [The Illustrated Transformer — Jay Alammar](https://jalammar.github.io/illustrated-transformer/) — referência visual canônica
- [Attention? Attention! — Lilian Weng](https://lilianweng.github.io/posts/2018-06-24-attention/) — fundação pedagógica completa
- [Transformer Explainer — Polo Club](https://poloclub.github.io/transformer-explainer/) — visualização interativa
