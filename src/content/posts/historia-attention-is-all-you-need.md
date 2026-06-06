---
title: "Attention Is All You Need: o paper que fundou os LLMs"
description: "Em 2017, oito pesquisadores do Google jogaram fora recorrência e convolução e ficaram só com atenção. O paper de oito páginas que virou a base de todo LLM que você usa hoje."
date: 2026-06-06
category: historia
tags: [historia, llm]
---

O "T" de GPT é de Transformer. O Claude é um Transformer. Praticamente todo modelo de linguagem que você usou nos últimos anos descende de um único paper de 2017 — e entender de onde ele veio ajuda a entender por que o Claude se comporta como se comporta.

## O contexto da época

Antes de 2017, processamento de linguagem era dominado por **redes recorrentes** — RNNs e LSTMs. A ideia era natural: texto é uma sequência, então leia token a token, em ordem, carregando um "estado" que resume o que veio antes.

O problema era duplo. Primeiro, **ordem mata paralelismo**: pra processar o token 100, você precisa ter passado pelos 99 anteriores. Treino vira fila, e GPU odeia fila. Segundo, **dependência longa se perde**: a informação do início da frase ia se diluindo no estado a cada passo, e relacionar a palavra 1 com a palavra 200 ficava difícil.

Tentaram convolução pra paralelizar. Ajudou no primeiro problema, não resolveu o segundo.

## O que mudou

Em junho de 2017 saiu no arXiv um paper com um título provocador: **"Attention Is All You Need"**. A proposta era radical pela subtração — jogar fora recorrência e convolução, e ficar **só com atenção**.

A peça central é o *self-attention*: em vez de carregar um estado sequencial, cada token olha diretamente para todos os outros da sequência de uma vez e decide de quem puxar informação. A palavra "ela" pode olhar direto pra "a engenheira" lá no começo, sem passar por tudo no meio.

Isso destravou as duas coisas ao mesmo tempo:

- **Paralelismo** — sem ordem obrigatória, a sequência inteira é processada de uma vez. Treino que levava semanas passou a caber em horas.
- **Dependência longa** — qualquer token alcança qualquer outro em um passo só, sem diluição.

Os resultados em tradução (inglês↔alemão, inglês↔francês) bateram o estado da arte com **menos tempo de treino**. A arquitetura ganhou o nome de **Transformer**.

## Quem fez

Oito autores, todos creditados como contribuição igual, com a ordem na capa **sorteada de propósito**: Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan Gomez, Łukasz Kaiser e Illia Polosukhin — então no Google Brain e no Google Research. Apresentaram na NeurIPS 2017, em Long Beach.

Dois detalhes que viraram folclore: o título é uma piada com "All You Need Is Love" dos Beatles, e o nome "Transformer" foi escolhido porque Uszkoreit gostava do som da palavra.

## A consequência prática hoje

O paper era sobre tradução. Mas a arquitetura era geral demais pra ficar nisso. Em poucos anos veio o BERT, veio o GPT, veio tudo. O Transformer virou o substrato de todo LLM moderno — incluindo o Claude.

Pra quem usa o Claude no dia a dia, três coisas que você sente vêm direto daquele paper:

- **O modelo vê o prompt inteiro de uma vez**, não palavra por palavra. Por isso reordenar instruções no prompt muda o resultado — o [mecanismo de atenção](/claude-playbook/artigos/attention-mecanismo-central-dos-llms) pesa tudo junto.
- **A janela de contexto tem custo que cresce rápido.** Self-attention compara cada token com todos os outros — o custo escala com o quadrado do tamanho da sequência. É parte de por que contexto não é de graça.
- **Tudo é predição do próximo token** em cima dessa base. A [arquitetura por baixo do Claude](/claude-playbook/artigos/arquitetura-transformer-por-baixo-do-claude) é uma pilha de blocos de atenção fazendo exatamente o que o paper descreveu.

Um paper de oito páginas, escrito pra traduzir frases melhor, acabou definindo a forma de quase toda IA que conversa com a gente hoje. Ler de onde veio é o jeito mais barato de entender o que está por baixo.

## Fontes

- [Attention Is All You Need — Vaswani et al., arXiv 1706.03762](https://arxiv.org/abs/1706.03762) — o paper original
- [Attention Is All You Need — Wikipedia](https://en.wikipedia.org/wiki/Attention_Is_All_You_Need) — autores, contexto e trivia
- [The Illustrated Transformer — Jay Alammar](https://jalammar.github.io/illustrated-transformer/) — explicação visual da arquitetura
