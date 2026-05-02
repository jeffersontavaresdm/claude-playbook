---
title: "Arquitetura Transformer: o mínimo que importa pra usar Claude melhor"
description: "O preditor de token tem uma arquitetura bem específica por baixo. Atenção, Q/K/V, multi-head, posicional, decoder-only — e por que cada um disso muda decisões reais no dia a dia."
date: 2026-05-01
category: fundamentos
tags: [fundamentos, llm]
---

No [post sobre LLM](/claude-playbook/artigos/o-que-e-uma-llm) eu disse que você não precisa saber a matemática do transformer pra usar Claude bem. Continuo concordando comigo mesmo. Mas existe um nível acima do "preditor de token" que muda mais decisões do que parece — e cabe num post.

Esse aqui é sobre a **arquitetura** por baixo. Não como construir uma do zero; como ela explica os limites e os pontos fortes que você sente todo dia conversando com Claude.

## Por que importa pra quem só usa

Toda vez que você se pergunta:

- *Por que contexto longo é tão caro?*
- *Por que a ordem das coisas no prompt importa?*
- *Por que o modelo "esquece" o que está no meio de um prompt enorme?*
- *Por que ele acerta linkagem entre arquivos distantes mas erra contas simples?*

A resposta tá na arquitetura. Não em "o modelo é assim". É no **como** ele processa.

## O ponto de partida: o que tinha antes

Antes do transformer (2017), modelos de linguagem usavam **RNNs** e **LSTMs**. Eles processavam texto uma palavra por vez, em ordem, mantendo um "estado escondido" que era o resumo do que veio antes.

Dois problemas:

1. **Sequencial por construção** — não dava pra paralelizar. Treino lento.
2. **Memória que decai** — o estado escondido era um único vetor que tinha que segurar tudo. Coisas distantes no texto se perdiam.

O transformer resolveu os dois com uma ideia: **e se cada palavra pudesse olhar diretamente pra qualquer outra, em paralelo, sem passar por estado nenhum?**

Esse mecanismo se chama **atenção**.

## O bloco fundamental

Um transformer é uma pilha de **blocos** idênticos empilhados (Claude tem dezenas ou centenas — número exato não é público). Cada bloco faz duas coisas:

```
input
  │
  ├── self-attention   ← tokens conversam entre si
  │
  ├── feed-forward     ← cada token "pensa" sozinho
  │
output
```

Mais residual connection e layer norm em volta de cada um (mais sobre isso adiante). É só isso. A "magia" é repetir esse bloco várias vezes.

## Q/K/V: atenção em três vetores

A peça central. Pra cada token, o modelo cria **três vetores** a partir do embedding:

- **Query** (Q): "o que eu estou procurando?"
- **Key** (K): "o que eu tenho a oferecer?"
- **Value** (V): "se você me escolher, o que eu te entrego?"

O cálculo, em pseudocódigo grosso:

```python
# para cada token i no contexto:
scores = Q[i] · K[todos]          # quanto i "combina" com cada outro
weights = softmax(scores)         # vira distribuição de atenção
output[i] = weights · V[todos]    # combinação ponderada dos values
```

Tradução: cada token pergunta "quem aqui é relevante pra mim?", recebe um peso pra cada outro token, e mistura os values deles na proporção desses pesos.

Por isso o modelo consegue resolver `"João disse que ele estava cansado"` — quando processa `"ele"`, a query dele dá score alto pra key de `"João"`, e o value de `"João"` entra forte na representação de `"ele"`.

**É isso.** Atenção é um mecanismo de "busca ponderada" que cada token faz no resto do contexto.

## Multi-head: vários ângulos ao mesmo tempo

Uma única atenção captura **um tipo** de relação. Mas linguagem tem várias relações simultâneas — sintática, semântica, correferência, dependência de longo alcance.

Solução: rodar várias atenções em paralelo, cada uma com Q/K/V próprios. Cada uma se especializa num tipo de relação. Depois concatena tudo.

```
[head 1] [head 2] [head 3] ... [head N]   →  concat  →  saída
```

Modelos grandes têm dezenas de cabeças. Pesquisa que já desmontou modelos abertos viu coisas como: uma cabeça especializada em "concordância sujeito-verbo", outra em "qual artigo se liga a qual substantivo", outra em "fechar parênteses".

Pra você, isso explica por que Claude consegue lidar com múltiplas dimensões de uma tarefa ao mesmo tempo — *"refatora isso, mantém o estilo, sem quebrar os imports, e responde em pt-BR"* — sem se confundir entre os critérios. Cada um deles ressoa com cabeças diferentes.

## Positional encoding: ordem que o modelo precisa receber de fora

Aqui tem uma sutileza importante: **atenção pura não tem noção de ordem**. Pra ela, `"o gato comeu o peixe"` e `"o peixe comeu o gato"` têm o mesmo conjunto de tokens, então o mesmo resultado.

Como ordem importa muito em linguagem, é preciso **injetar** essa informação. O truque é somar um vetor de posição ao embedding de cada token, antes de entrar no primeiro bloco. Existem várias variações (sinusoidal, RoPE, ALiBi); o efeito é o mesmo: o modelo passa a saber "esse token está na posição 47".

Isso explica um efeito que você sente mas talvez não tenha nomeado: **a ordem das coisas no prompt importa mais do que parece**. System prompt no topo pesa diferente de instrução no meio. Exemplos antes da pergunta pesam diferente de exemplos depois. Não é misticismo — é que cada token carrega sua posição como parte da identidade.

## Feed-forward: onde o "conhecimento" mora

Depois da atenção, cada token passa por uma rede feed-forward (MLP) — independente, token por token. Atenção mistura informação **entre** tokens; FFN refina cada um.

Pesquisa interpretabilidade indica que a maior parte do **conhecimento factual** ("Paris é capital da França") fica nas FFNs, não na atenção. A atenção decide *o quê* misturar; a FFN é onde "saber coisas" parece morar.

Você não precisa saber disso pra usar Claude. Mas ajuda a entender por que modelos maiores (mais parâmetros, principalmente em FFN) são melhores em conhecimento — e por que aumentar contexto não substitui isso.

## Residual + layer norm: o que faz pilhas profundas funcionarem

Cada sub-camada (atenção, FFN) é envolvida assim:

```
saída = LayerNorm(entrada + sub_camada(entrada))
```

O `entrada +` é a **conexão residual**: a saída original passa direto, somada com o que a sub-camada calculou. Sem isso, empilhar 100 blocos faria os gradientes desaparecerem no treino. Com isso, dá pra empilhar muito.

Detalhe técnico — pra você, o que importa é: **modelos grandes são profundos**, e essa profundidade é o que permite raciocínio progressivo (cada bloco refina um pouco a representação). Não é uma "etapa de pensamento"; é um refinamento contínuo de representação.

## Encoder-decoder vs decoder-only

O paper original tinha **encoder + decoder** (pra tradução). Quase todos os LLMs modernos — GPT, Claude, Llama, etc. — são **decoder-only**.

A diferença: decoder-only só tem a pilha de baixo, com uma restrição chamada **causal mask**. Cada token só pode atender a tokens **anteriores**, nunca aos futuros.

```
token 1: vê {1}
token 2: vê {1, 2}
token 3: vê {1, 2, 3}
...
```

Isso é o que torna o modelo **autoregressivo**: durante a geração, ele realmente não pode "olhar pra frente" porque na arquitetura não existe pra frente. Cada token é gerado vendo só o passado.

Implicação prática: o modelo se compromete com cada token sem revisão. É por isso que Plan Mode, chain-of-thought e extended thinking funcionam — eles geram tokens "intermediários" que viram passado, e o modelo se condiciona a eles antes de gerar a resposta final.

## O custo quadrático: o elefante na sala

Atenção é **O(n²)** no tamanho do contexto. Cada token compara com cada outro.

Contexto de 1.000 tokens → 1 milhão de comparações por cabeça por bloco.
Contexto de 100.000 tokens → 10 bilhões.
Contexto de 1 milhão → 1 trilhão.

É **isso** que faz contexto longo ser caro e mais lento. Não é decisão comercial; é a matemática.

Existem otimizações (FlashAttention, atenção esparsa, sliding window) que mitigam mas não eliminam. Por isso, em 2026, mesmo com janelas de 1M de tokens disponíveis:

- **Tokens iniciais e finais pesam mais** — o modelo costuma "atender" mais bordas. O meio de um contexto enorme costuma sumir (efeito *lost in the middle*).
- **Encher o contexto degrada qualidade** — não só custa mais; dispersa a atenção.
- **Prompt cache importa** — reaproveitar prefixo evita recomputar atenção sobre ele.

Tudo isso é consequência direta do `n²`.

## O que muda nas minhas decisões

Pegando os pontos da arquitetura e mapeando pra prática:

### Curo o contexto, não despejo

Cada token novo dispersa atenção pelos demais. CLAUDE.md de 30 linhas focadas continua batendo CLAUDE.md de 500 genéricas — agora você sabe o **porquê mecânico**: cada linha extra rouba peso da atenção que ia pras linhas que importavam.

### Coloco o que é crítico no começo ou fim

Pelo *lost in the middle*, instruções fundamentais ou exemplos-chave eu coloco no topo (system prompt, primeiras linhas do CLAUDE.md) ou no fim (próximo da pergunta). Meio de prompt longo é onde coisas se perdem.

### Aceito que o modelo não revisa

Causal mask = sem revisão nativa. Se quero revisão, peço explicitamente, ou uso um turno separado. Esperar que o modelo "volte e corrija" sozinho é esperar contra a arquitetura.

### Modelos maiores ≠ contextos maiores

Mais parâmetros (FFN profunda) = mais conhecimento factual e melhor raciocínio. Mais contexto = mais coisa pra olhar. São coisas diferentes. Trocar Sonnet por Opus em uma tarefa pequena e bem prompted raramente ajuda; trocar pra um modelo com mais contexto quando você só tem 5 mil tokens também não.

### Plan Mode / extended thinking não são truque

São jeitos de **gerar contexto intermediário** que o modelo subsequentemente usa. Funciona porque a arquitetura é causal: tudo que está antes é input. Pensar antes vira input pra resposta final. Não é mágico, mas é coerente com a mecânica.

## Quando ignorar tudo isso

Se a tarefa é curta e óbvia, não pensa nisso. Pede e segue. A arquitetura ajuda a tomar **decisões de fluxo** — quando o prompt vai ficar longo, quando você está debugando comportamento, quando está montando rotinas que vão rodar centenas de vezes.

Pra um *"ajeita esse if-else"*, basta saber que o modelo prevê tokens.

## Resumindo

O transformer empilha blocos com duas operações: **atenção** (tokens olham uns pros outros via Q/K/V, em várias cabeças), e **feed-forward** (cada token refina sozinho). Posição é injetada por fora, ordem importa. Decoder-only com causal mask = modelo só vê o passado, nunca revisa nativamente. Atenção é quadrática — contexto longo é caro pela matemática, não pela engenharia.

Internalizar essas peças muda como você prompta, organiza CLAUDE.md, decide entre modelos, e usa modos de pensamento. É a diferença entre achar que o modelo "se distraiu no meio do prompt" e saber que ele *literalmente* atende menos a tokens do meio.

## Fontes

- [Attention Is All You Need — Vaswani et al., 2017](https://arxiv.org/abs/1706.03762) — paper original
- [The Illustrated Transformer — Jay Alammar](https://jalammar.github.io/illustrated-transformer/) — referência visual canônica
- [Transformer Explainer — Polo Club](https://poloclub.github.io/transformer-explainer/) — visualização interativa de decoder-only (GPT-2)
- [Generalized Language Models — Lilian Weng](https://lilianweng.github.io/posts/2019-01-31-lm/) — fundação técnica
- [Lost in the Middle — Liu et al., 2023](https://arxiv.org/abs/2307.03172) — efeito de posição em contextos longos
