---
title: "O que é um token (e por que não é uma palavra)"
description: "Token é a unidade que o modelo processa, e a unidade que você paga. Não é palavra. Essa diferença muda como você pensa em prompt, contexto e custo."
date: 2026-05-03
category: fundamentos
tags: [fundamentos, llm]
---

Você paga pela API por **token**, não por palavra. Se acha que sabe quantos tokens tem seu prompt, provavelmente está errado.

A confusão "token = palavra" é a primeira pedra no caminho de quem começa a levar uso de Claude um pouco mais a sério — escrevendo prompts grandes, montando agente em loop, debugando custo no fim do mês. E a diferença não é cosmética; ela muda decisão.

## Token não é palavra

Um **token** é a unidade que o modelo processa por dentro. Pode ser uma palavra inteira, um pedaço de palavra, um espaço, uma pontuação, ou até um único caractere. Não tem mapeamento 1:1 com palavra.

A regra de bolso da Anthropic: **1 token ≈ 4 caracteres ou 0.75 palavras** em inglês. Em português, a conta sai pior — falo disso já já.

O ponto estranho de aceitar: o modelo não vê "palavras" no sentido linguístico. Ele vê uma sequência de IDs numéricos, e cada ID corresponde a um token do vocabulário dele.

## Vendo na prática

Cola essa frase no [tokenizer da OpenAI](https://platform.openai.com/tokenizer):

> tokenização não é tão simples quanto parece

Em palavras, são 7. Em tokens, dá uns 12-15, dependendo do tokenizer. A quebra mais ou menos assim:

```
"tok" "en" "ização" " não" " é" " tão" " simples" " quanto" " parece"
```

Duas coisas pra notar:

- **Palavras comuns viram 1 token.** "não", "é", "simples", "quanto", "parece" — cada uma vira um token (geralmente já vem com o espaço da frente embutido).
- **Palavras raras quebram em pedaços.** "tokenização" não está pronta no vocabulário do tokenizer, então virou três pedaços: `tok` + `en` + `ização`. Em inglês, "tokenization" costuma virar 2 tokens.

Cada modelo tem o seu tokenizer. O da OpenAI (`cl100k_base`, `o200k_base`) e o do Claude não são idênticos, mas se comportam parecido na prática: palavras comuns viram 1 token, palavras raras se desfazem.

## Português é mais caro que inglês

Aqui está a parte que dói no bolso. A maioria dos tokenizers foi otimizada com inglês como fatia dominante do treino. Resultado:

- **1.000 palavras em inglês** ≈ ~1.300 tokens
- **1.000 palavras em português** ≈ ~1.500-2.000 tokens

A mesma informação, nas duas línguas, custa mais em pt-BR. Não é discriminação; é que o tokenizer não tem subwords prontos pros padrões da nossa língua. Acentos, plurais, conjugações verbais — tudo isso fragmenta.

(Já vi gente sugerir: traduzir o prompt grande pro inglês, mandar pro modelo, traduzir a resposta de volta. Cabe? Sim. Vale o trabalho? Quase nunca, e a perda na qualidade do prompt costuma comer a economia.)

## Por que isso muda decisão

Token é a unidade de conta de quase tudo que importa quando você usa Claude.

### Cobrança é por token

Os preços da Anthropic — `X` dólares por milhão de input, `Y` por milhão de output — são por **token**. E output costuma custar 4-5× mais caro que input.

Implicação prática: prompt curto + resposta longa = você paga muito output. É comum a resposta custar mais que o prompt inteiro, mesmo que o prompt fosse "longo". Pedir "explica em detalhes" é decisão de custo.

### Janela de contexto é em token (e varia por modelo)

A janela de contexto é medida em **tokens**, e depende do modelo. Hoje (mai/2026):

- **Opus 4.7** e **Sonnet 4.6**: 1M tokens
- **Haiku 4.5** e modelos legados (Sonnet 4.5, Opus 4.5, etc.): 200k tokens

1M de tokens em português dá ~500-700 mil palavras (4-5 livros médios). 200k vira ~100-130 mil palavras (um livro). Em palavra "cabe um livro" parece muito; em token a conta encurta rápido se o documento tem código, JSON ou trecho técnico — coisas que tokenizam pior que prosa.

E como atenção é quadrática ([detalhe no post sobre arquitetura](/claude-playbook/artigos/arquitetura-transformer-por-baixo-do-claude)), encher a janela inteira custa caro pelo `n²` independente do modelo. Você quase nunca quer chegar perto.

### Estimar token de cabeça é furada

A regra "4 caracteres = 1 token" só vale como aproximação grosseira em inglês. Em português, conta de cabeça:

- Pega o número de caracteres
- Divide por 3 (não 4)
- Soma ~20% por conta de acentos e flexão

Pra produção, não estima — **conta de verdade**. A API da Anthropic tem um endpoint `count_tokens` que faz isso sem cobrar nada. Pra prompts que rodam em loop, saber o número exato evita surpresa de fatura.

## Quando ignorar isso

Pra uso pessoal, esporádico, prompts curtos no chat — não pensa nisso. Pede e segue. A ordem de grandeza é "alguns centavos por interação" e o estresse de contar token não compensa.

Onde token virou métrica crítica:

- **Aplicação em produção** com chamadas via API — você precisa estimar custo por usuário ativo, e palavra te dá número errado
- **Agente em loop** — modelo se chama várias vezes, contexto cresce a cada turno, custo escala bem rápido se você não viu
- **Pipeline com texto longo** — RAG, sumarização de documento grande, processamento em lote
- **Prompt cache** — saber onde quebrar o prompt em pedaços cacheáveis exige saber o tamanho real em tokens

Nesses casos, "palavra" não é a unidade certa. **Token é.**

## Pra onde isso vai

Ficou de fora aqui o **como** o modelo aprende a quebrar palavras em pedaços do jeito que quebra. Existe um algoritmo pra isso, **BPE (Byte-Pair Encoding)**, que é o que faz "tokenização" virar `tok + en + ização` e não `t + o + k + e + n + ização` ou qualquer outra decomposição. É o próximo post da trilha de fundamentos.

Por enquanto fica o modelo mental: **token é a unidade de tudo — preço, contexto, decisão**. Pensar em palavra dá um número que parece próximo, mas erra o suficiente pra sair caro.

## Fontes

- [Token counting — Anthropic Docs](https://platform.claude.com/docs/en/build-with-claude/token-counting) — documentação oficial e endpoint de contagem
- [Pricing — Anthropic Docs](https://platform.claude.com/docs/en/about-claude/pricing) — tabela de preços por token (input/output)
- [The Technical User's Introduction to LLM Tokenization — Christopher Gs](https://christophergs.com/blog/understanding-llm-tokenization) — visão técnica do que é tokenização
- [OpenAI Tokenizer](https://platform.openai.com/tokenizer) — playground pra ver tokens na prática
- [Tokenization efficiency for non-English languages — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12380774/) — paper sobre eficiência de tokenização em outras línguas
