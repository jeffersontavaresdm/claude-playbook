---
title: "Temperatura e sampling: como o Claude escolhe o próximo token"
description: "O modelo não 'sabe' a resposta — ele gera uma distribuição de probabilidade sobre o vocabulário e sorteia de dentro dela. Temperatura, top-p, e o que isso muda nas suas decisões."
date: 2026-06-06
category: fundamentos
tags: [fundamentos, llm]
---

Por que o mesmo prompt às vezes dá respostas diferentes? E por que, de vez em quando, o modelo "viaja" com toda a confiança do mundo? As duas coisas se explicam no último passo de tudo: como o Claude escolhe o próximo token.

## O fundamento

A cada passo, o modelo não cospe uma palavra. Ele produz uma **distribuição de probabilidade sobre o vocabulário inteiro** — cada um dos ~65 mil [tokens possíveis](/claude-playbook/artigos/o-que-e-um-token) recebe um score (o *logit*). Uma função chamada softmax transforma esses scores em probabilidades que somam 1. Só então uma estratégia de *decoding* escolhe um token, ele entra no texto, e o ciclo recomeça.

A escolha dentro dessa distribuição é onde mora o comportamento que você observa.

**Greedy** (temperatura 0): pega sempre o token mais provável. É determinístico — mesmo prompt, mesma saída. Mas tende ao repetitivo e às vezes trava em loop, porque os mesmos tokens de alta probabilidade vencem toda vez.

**Sampling**: sorteia da distribuição. O mais provável tem mais chance, mas os de baixo também têm uma fresta. É o que dá variedade — e o que faz o mesmo prompt render textos diferentes.

## Temperatura: afia ou achata a curva

Temperatura reescala a distribuição **antes** do sorteio. Em Kotlin, o softmax com temperatura é só uma divisão antes de exponenciar:

```kotlin
fun softmax(logits: DoubleArray, temperatura: Double): DoubleArray {
    val escalados = logits.map { it / temperatura }
    val max = escalados.max()                       // estabilidade numérica
    val exps = escalados.map { kotlin.math.exp(it - max) }
    val soma = exps.sum()
    return exps.map { it / soma }.toDoubleArray()
}
```

O efeito da divisão:

- **Temperatura baixa** (perto de 0) amplia as diferenças entre os scores. O pico domina, os outros somem — vira quase greedy. Saída conservadora e previsível.
- **Temperatura alta** (acima de 1) comprime as diferenças. A curva achata, os tokens improváveis ganham chance real. Saída mais criativa — e mais caótica.

## Top-p: corta a cauda em vez de mexer na forma

Top-p (ou *nucleus sampling*) ataca por outro lado. Ele ordena os tokens por probabilidade, vai somando, e só deixa no sorteio os que juntos formam os top `p` da probabilidade total. Com `p = 0.9`, os 10% menos prováveis no acumulado nunca são escolhidos — não importa a temperatura.

Top-k é a prima: corta nos `k` tokens mais prováveis, ponto.

A diferença que vale guardar: **temperatura muda como as probabilidades são geradas** (a forma da curva); **top-p e top-k mudam quais entram na disputa** (o tamanho do leque). Por isso o conselho comum é mexer em um de cada vez, não nos dois.

## A implicação prática

A régua é o tipo de tarefa:

- **Código, extração, resposta factual** → você quer determinismo e pouca invenção. Temperatura baixa.
- **Brainstorm, naming, rascunho criativo** → você quer leque. Temperatura mais alta.

Mas tem um asterisco importante: na API do Claude dá pra girar `temperature` e `top_p`. No Claude Code e no app do Claude, **você não toca nesse botão** — ele vem ajustado pra um equilíbrio de uso geral. Então, no dia a dia do editor, "a resposta variou" não é um knob que você esqueceu de travar; é o sampling fazendo o trabalho dele.

E o mito mais comum: **temperatura baixa não conserta alucinação**. Um modelo confiantemente errado tem uma distribuição *afiada* em cima da resposta errada. Baixar a temperatura só faz ele errar de forma consistente. Determinismo não é o mesmo que correção.

## Quando ignorar isso

Se você usa o Claude no terminal e no chat pra programar, ler, debugar — esquece os números. Vêm ajustados, e variação pequena entre respostas raramente muda a sua decisão.

Sampling vira conhecimento que paga quando você **constrói em cima da API**: aí `temperature` e `top_p` são alavancas reais, e saber que o modelo sempre sorteia de uma distribuição — em vez de "saber" a resposta — é o que te impede de tratar a saída como verdade fixa quando ela é, por construção, um sorteio.

## Fontes

- [How do temperature, top-k, and top-p sampling differ? — Sebastian Raschka](https://sebastianraschka.com/faq/docs/temperature-topk-topp-sampling.html)
- [LLM temperature, top-p, top-k explained — Machine Learning Plus](https://machinelearningplus.com/gen-ai/llm-temperature-top-p-top-k-explained/)
- [Generation parameters — Anthropic API Docs](https://docs.claude.com/en/api/messages)
