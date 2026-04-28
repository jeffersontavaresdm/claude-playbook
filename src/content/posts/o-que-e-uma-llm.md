---
title: "O que é uma LLM (e por que isso muda como você usa o Claude)"
description: "Modelo de linguagem grande explicado em linguagem prática: como gera texto, por que erra com confiança, e o que isso muda nas suas decisões usando o Claude."
date: 2026-04-27
category: fundamentos
tags: [fundamentos, llm]
draft: false
---

Por muito tempo achei que entender o que é uma LLM era opcional pra usar Claude bem. Mudei de ideia.

Não que você precise saber a matemática do transformer. Mas existe um mínimo de modelo mental que muda decisões práticas — quando confiar, quando duvidar, como escrever prompts que funcionam, quando dividir uma tarefa em duas. Esse post é esse mínimo.

## O que é uma LLM, em uma frase

Uma **Large Language Model** é uma rede neural treinada em muito texto pra fazer **uma única coisa**: dado um pedaço de texto, prever qual é o próximo pedaço.

É só isso. Toda a aparente "inteligência" — responder perguntas, escrever código, traduzir, resumir — emerge de fazer essa predição muito bem, repetidamente.

## Como funciona em 3 minutos

Quando você manda um prompt, o que acontece por baixo:

1. **Tokenização** — seu texto vira uma lista de "tokens" (pedaços de palavra: `"playbook"` pode virar `["play", "book"]`). O modelo não vê letras nem palavras; vê números que representam tokens.
2. **Embedding** — cada token vira um vetor de centenas de dimensões. Vetores próximos = significados próximos.
3. **Atenção** — o coração do transformer. Pra cada token, o modelo calcula quanto "presta atenção" em cada outro token do contexto. É isso que permite entender que `"ele"` se refere a `"João"` mesmo 30 palavras atrás.
4. **Distribuição de probabilidades** — depois de processar o contexto, o modelo cospe uma distribuição: pra cada token possível no vocabulário, qual a probabilidade de ele ser o próximo. Algo como `{ "casa": 0.12, "carro": 0.08, "livro": 0.04, ... }`.
5. **Sampling** — escolhe um token. Pode ser o mais provável (greedy), ou amostra com alguma randomicidade (temperatura, top-p).
6. **Repete** — adiciona o token escolhido ao contexto, volta pro passo 3, prevê o próximo.

Token a token, até parar (limite, ou token especial de fim).

A resposta inteira é construída uma palavra (ou pedaço dela) por vez. **Não existe "pensar a resposta toda primeiro e depois escrever"** — o modelo se compromete com cada token sem saber o que vai vir depois.

## As duas fases de treinamento (e por que isso importa)

### Pré-treinamento

A LLM "lê" trilhões de tokens da internet, livros, código. Pra cada pedaço, esconde a próxima palavra e tenta prever. Erra. Ajusta os pesos. Repete bilhões de vezes.

Resultado: um modelo que sabe **completar texto** muito bem, mas que não tem ideia de "estar conversando com alguém" ou "seguir instruções". Ele só completa.

Se você desse uma instrução crua a um modelo só pré-treinado — *"Resuma este texto"* — ele talvez completasse com *"em 200 palavras, e depois faça uma análise crítica..."* — porque na internet, instruções costumam ser seguidas de mais instruções.

### Pós-treinamento (onde a "personalidade" entra)

Aqui o modelo aprende a **se comportar como assistente**. Tem várias técnicas, as principais sendo:

- **Instruction tuning** — treina com pares `(instrução, resposta_boa)` curados por humanos. Ensina o formato "alguém pede algo, eu respondo".
- **RLHF** (Reinforcement Learning from Human Feedback) — humanos comparam pares de respostas e escolhem a melhor. Treina-se um "modelo de recompensa" que aprende as preferências; depois o modelo principal é ajustado pra maximizar essa recompensa.

A Anthropic é uma das pioneiras nesse pós-treinamento, e é uma boa parte do que faz o Claude soar útil, honesto e cauteloso.

A consequência prática: o Claude que você usa **não é o pré-treinado** que aprendeu o mundo. É o pré-treinado **alinhado** por humanos a se comportar de jeitos específicos. Esse alinhamento é o que define muito do que parece "personalidade" do modelo.

## O que LLM faz bem (e o que faz mal)

**Faz bem:**
- Reconhecer padrões em texto e replicá-los (escrever no estilo X, gerar código que segue convenção Y)
- Síntese de informação que está no contexto fornecido
- Tradução, resumo, reformulação
- Tarefas de "completar uma estrutura conhecida" (gerar boilerplate, ajustar imports)

**Faz mal:**
- Fatos específicos sobre o mundo real (datas, nomes, números, citações exatas) — não tem mecanismo pra verificar; preenche com o que "soa plausível"
- Cálculos aritméticos com números grandes (não tem calculadora embutida)
- Raciocínio de várias etapas sem guia (vai em frente sem voltar e revisar)
- "Eu não sei" — modelos costumam preferir uma resposta confiante (ainda que errada) a admitir incerteza, a menos que sejam explicitamente alinhados pra fazer isso (Claude tenta, mas não é perfeito)

Esse último ponto é o **mais traiçoeiro**: a LLM erra com a mesma confiança com que acerta. Não há um sinal interno de "isso aqui eu chutei".

## O que isso muda nas minhas decisões usando o Claude

Aqui vai o que importa de verdade — o ponto inteiro de entender LLM é mudar como você usa.

### Prompt é o que mais importa, não o modelo

O modelo só vê o que você dá no contexto. Toda decisão dele é "dado isso, qual é a próxima palavra?". Se o contexto é vago, a saída é vaga. Se é específico, a saída é específica. **Trocar de Sonnet pra Opus quase nunca conserta um prompt ruim.**

### Contexto é caro — cure o que entra

Cada token no contexto custa atenção (literalmente — é um cálculo quadrático em alguns casos). Encher o prompt com "talvez seja útil" envenena a saída: o modelo dá peso pra coisa que era ruído.

Resultado prático: prefiro **menos contexto bem escolhido** a **muito contexto cobrindo todas as bases**. CLAUDE.md de 30 linhas focadas bate CLAUDE.md de 500 linhas genéricas.

### Desconfie de fatos específicos

Se peço pro Claude "qual a versão mais recente do React?", ele vai chutar com confiança baseado no treinamento dele (que tem corte). Pra fatos que mudam, sempre confirmo com fonte externa — ou peço pro modelo usar uma ferramenta que verifica (web search, leitura de docs reais).

### Exemplos > descrições

Como o modelo é, no fundo, um preditor de padrão, **mostrar é mais eficaz que explicar**. Em vez de:

> "Use camelCase pros nomes de variáveis e seja conciso nos comentários"

prefira:

> "Padrão a seguir: `const userName = ...` (camelCase). Comentários assim: `// fetches user from API` (curto, presente)."

Padrões concretos viram peso direto na predição. Descrições abstratas viram instrução vaga.

### Tarefa grande → várias pequenas

LLM não tem "memória de trabalho" pra um plano de 30 etapas. Quando peço uma reforma grande de uma tacada, ele se compromete com decisões iniciais e não revisa.

Quebrar em sessões/turnos menores força o modelo a re-considerar a cada passo. Por isso o Plan Mode funciona: explicita o "pensar antes" que o modelo não faz nativamente.

### "Pensar antes de responder" não é mágico

Modelos novos têm modos de "raciocínio" (chain-of-thought, extended thinking). Por baixo, eles ainda estão prevendo um token por vez — só que primeiro geram tokens de pensamento que se acumulam no contexto, dando mais "pista" pra resposta final.

Funciona porque o modelo se condiciona ao próprio raciocínio, mas **não troca a natureza preditiva por dedução verdadeira**. É melhor que sem, mas ainda erra. E custa mais tokens, então use quando o problema pede.

## Quando ignorar este fundamento

Pra tarefas óbvias e curtas — *"renomeia essa variável"*, *"escreve um regex pra email"*, *"converte esse JSON pra CSV"* — você não precisa pensar em nada disso. Pede e segue.

O fundamento começa a importar quando:

- A tarefa é não-trivial (vai durar mais de 10 minutos de sessão)
- Você está montando uma rotina de uso (CLAUDE.md, hooks, comandos custom)
- Você está debugando "por que o modelo não fez o que pedi"
- Você está decidindo entre modelos (Sonnet vs Opus, etc.)

Nesses casos, ter o modelo mental certo poupa muito ajuste por tentativa e erro.

## Resumindo

LLM é um preditor de próximo token, treinado em duas fases (pré-treino + alinhamento), que erra com confiança e responde sempre baseado **só no que está no contexto**. Internalizar isso muda quase tudo: você cura contexto em vez de despejar, mostra em vez de descrever, divide em vez de pedir tudo de uma vez, e desconfia de fatos específicos.

Não é teoria — é a base das decisões práticas que você toma todo dia usando Claude.

## Fontes

- [Generalized Language Models — Lilian Weng](https://lilianweng.github.io/posts/2019-01-31-lm/) — fundação técnica de LMs e pré-treinamento
- [Why We Think — Lilian Weng](https://lilianweng.github.io/posts/2025-05-01-thinking/) — como modelos "raciocinam" no pós-treinamento moderno
- [Illustrating RLHF — Hugging Face](https://huggingface.co/blog/rlhf) — pós-treinamento explicado com diagramas
- [Introduction to Large Language Models — Google ML Crash Course](https://developers.google.com/machine-learning/crash-course/llm) — visão pedagógica formal
- [RLHF Book — Nathan Lambert](https://rlhfbook.com/c/01-introduction) — referência atualizada e profunda sobre alinhamento
