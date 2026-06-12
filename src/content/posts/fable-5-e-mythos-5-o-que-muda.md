---
title: "Fable 5 e Mythos 5: o que muda (e qual deles eu de fato uso)"
description: "A Anthropic soltou dois modelos no mesmo dia. A diferença entre eles, como o Fable se compara ao Opus 4.8, o que melhora em código — e se dá pra usar no Pro/Max ou só pagando por token na API."
date: 2026-06-12
category: comparacao
tags: [modelos, claude-code]
---

No dia 9 a Anthropic anunciou dois modelos de uma vez: **Claude Fable 5** e **Claude Mythos 5**. E o Opus 4.8, que era o melhor da casa até então, continua aí.

Três nomes. A pergunta prática que me fiz, do lado de quem usa no plano, foi simples: **qual desses três eu de fato consigo usar, e vale trocar?**

Esse post é a resposta longa — porque aqui o detalhe muda a decisão.

## Primeiro: Fable e Mythos são o mesmo modelo

Esse é o ponto que quase todo mundo erra. Fable 5 e Mythos 5 não são dois modelos de tamanhos diferentes. **É o mesmo modelo por baixo.** A única coisa que separa os dois são os *safeguards*.

- **Mythos 5** é a versão crua, com as travas levantadas em algumas áreas. Acesso restrito — parceiros do Project Glasswing e alguns pesquisadores de biologia, por enquanto. Você e eu não vamos tocar nele tão cedo.
- **Fable 5** é o mesmo cérebro, com os guardrails ligados pra ser "seguro pra uso geral". Esse é o que ficou disponível pra todo mundo.

A própria Anthropic brinca com isso no anúncio: *fable* vem do latim *fabula*, "aquilo que é contado", primo do grego *mythos*. Os safeguards é que separam os dois.

Então, daqui pra frente, esquece o Mythos. O modelo que importa pra mim — e provavelmente pra você — é o **Fable 5**.

## Como os safeguards funcionam (e por que te afeta)

O Fable não recusa pedido sensível com um "desculpa, não posso". Ele faz outra coisa: **classificadores detectam o pedido problemático e mandam aquela query pro Opus 4.8 responder no lugar.**

As três áreas que disparam o desvio:

- **Cyber ofensivo** — exploração, hacking, esse tipo de coisa
- **Bio/química** — armas biológicas, pesquisa dual-use
- **Destilação** — tentar extrair as capacidades do modelo pra treinar outro

A Anthropic diz que isso dispara em **menos de 5% das sessões**, e calibrou conservador de propósito — então às vezes pega pedido inofensivo junto. (Medição independente, tipo a da Artificial Analysis, viu algo mais perto de 8–9% no conjunto de benchmarks deles. Fica a ressalva.)

O detalhe prático: **se você faz trabalho de segurança, o Fable silenciosamente te rebaixa pro Opus 4.8 naquelas queries.** Pra cyber, você está usando Opus de qualquer jeito — não espere o ganho do Fable ali.

## Fable 5 vs Opus 4.8: o que de fato mudou

Aqui é o que interessa pra quem programa. O Fable bate o Opus 4.8 em praticamente todo benchmark publicado, e a distância é maior justamente nas tarefas longas e agênticas — as que mais doem no dia a dia.

| Benchmark | Fable 5 | Opus 4.8 |
|---|---|---|
| SWE-bench Pro (agêntico longo) | 80,3% | 69,2% |
| SWE-bench Verified | 95,0% | 88,6% |
| Terminal-Bench 2.1 | 88,0% | 82,7% |
| FrontierCode Diamond | 29,3% | 13,4% |
| HLE (sem ferramentas) | 59,0% | 49,8% |
| GraphWalks BFS 1M (contexto longo) | 80,0% | 68,1% |
| USAMO 2026 (matemática) | — | 96,7% |

Leitura rápida:

- **Tarefa longa e multi-arquivo é onde o Fable abre vantagem.** +11 pontos no SWE-bench Pro, e mais que **dobra** o Opus no FrontierCode (29,3% vs 13,4%) — o eval que mede decompor problema de produção do zero.
- **Em tarefa curta e bem-escopada, os dois ficam perto.** Bug pequeno, função isolada: não espere milagre.
- **Em matemática de competição, a tabela ainda dá o Opus na frente** (USAMO). Curioso, mas é o que os números dizem.

Dois ganhos que não aparecem na tabela, mas mudam o uso:

- **Eficiência de token.** Anthropic e GitHub relatam que o Fable resolve a mesma tarefa autônoma com **menos tool calls e menos token** que os modelos tier-Opus. Isso importa porque ele é mais caro por token — parte do custo extra volta em ser mais direto.
- **Memória persistente.** Dar ao Fable acesso a memória em arquivo melhorou a performance dele **3x mais** do que o mesmo truque no Opus 4.8, em tarefas longas. Se você usa `CLAUDE.md` / memória de projeto, o Fable aproveita melhor.

### A pegadinha: ele sabe mais, mas alucina mais

Esse é o trade-off honesto que não pode passar batido. Em conhecimento bruto, o Fable acerta bem mais (AA-Omniscience: 61% vs 46,6% do Opus). Mas a **taxa de alucinação dele é maior** — o Opus 4.8 é mais calibrado sobre o que não sabe.

A frase que resume e achei certeira: **o Fable sabe mais, mas mente mais; o Opus sabe menos, mas tem mais noção da própria incerteza.**

Pra agente rodando sozinho, sem ninguém olhando, onde um erro silencioso custa caro — isso pesa a favor do Opus.

## O que melhora no dia a dia

Tirando os números, o que muda na prática:

- **Migração e refactor grande.** A Anthropic cita a Stripe comprimindo "cinco meses de engenharia em dias" — uma migração de codebase Ruby que levaria um time mais de dois meses, feita num dia. Caso de marketing? É. Mas a direção bate com os benchmarks de tarefa longa.
- **Agente que não descarrila no meio.** O ganho em SWE-bench Pro e Terminal-Bench é exatamente "aguentar a tarefa longa sem se perder".
- **Visão.** O Fable virou state-of-the-art em tarefas de visão — se você joga screenshot, diagrama ou PDF no Claude, deve sentir.
- **Menos ida e volta.** Menos tool calls = menos "deixa eu checar de novo" no loop agêntico.

Onde eu **não** trocaria por Fable:

- Trabalho de segurança (ele rebaixa pro Opus mesmo).
- Pipeline de alto volume sensível a custo (o dobro do preço pesa).
- Agente *unattended* onde alucinação quebra deploy (a calibração do Opus vale mais).
- Tarefa curta e simples (empate técnico, não justifica o custo).

## A pergunta que mais importa: dá pra usar no Pro/Max ou só na API?

Essa é a parte com data marcada, então repara no calendário. (Escrevo isto em **12/jun**.)

**Via API:** disponível desde o lançamento, model id `claude-fable-5`, pagando por token — **US$ 10 / milhão de entrada e US$ 50 / milhão de saída**. É o dobro do Opus 4.8 (US$ 5 / US$ 25). Batch corta pela metade; cache de prompt dá 90% de desconto na leitura. (A Anthropic frisa que ainda é menos da metade do que custava o Mythos Preview.)

**Nos planos (Pro, Max, Team, Enterprise por assento):** aqui tem janela.

- **De 9 a 22 de junho:** o Fable 5 entra **sem custo extra** no seu plano. Ou seja, agora (até dia 22) dá pra puxar ele no Claude Code e nos apps do plano sem pagar nada além da assinatura.
- **Porém:** dentro do plano, o Fable conta **~2x** mais pro seu limite de uso do que o Opus. Mesmo de graça, ele queima sua cota cerca de duas vezes mais rápido.
- **De 23 de junho em diante:** o Fable **sai do limite do plano**. Continuar usando vai exigir **créditos de uso, cobrados a preço de API** (os mesmos US$ 10 / US$ 50).
- A Anthropic diz que pretende **recolocar o Fable como parte padrão dos planos quando tiver capacidade** — mas não cravou data.

Traduzindo pra decisão: **enquanto escrevo, você tem ~10 dias pra testar o Fable no plano sem pagar a mais.** Depois disso, ou ele volta pro plano (sem data), ou vira pago por crédito. Quem só usa assinatura e não quer mexer com cobrança por token: aproveita a janela agora e reavalia passado o dia 22.

Detalhe técnico: a Anthropic **não cravou o tamanho da janela de contexto** do Fable no anúncio. Mas os benchmarks de contexto longo rodam em 1M tokens, mesma faixa do Opus 4.8 — então provavelmente é 1M também.

## Meu default depois de tudo isso

- **Tarefa longa, migração, refactor multi-arquivo, agente que precisa aguentar o tranco:** Fable 5, enquanto está de graça no plano. É onde a vantagem é real e grande.
- **Visão / análise de imagem:** Fable.
- **Cyber/segurança:** tanto faz pedir Fable — ele rebaixa pro Opus. Fico no Opus direto.
- **Agente *unattended*, alto volume, ou tarefa curta:** Opus 4.8. Mais calibrado, metade do preço, e o empate em tarefa simples não paga o dobro.
- **Passado o dia 22:** se o Fable não voltar pro plano, volto pro Opus como padrão e puxo o Fable só pra tarefa que justifique gastar crédito.

Resumo de uma linha: **Fable 5 é o Mythos domado, é melhor que o Opus 4.8 onde a tarefa é longa e difícil, mas custa o dobro, alucina um tiquinho mais e, no plano, só está de graça até 22 de junho.** Testa agora, decide depois.

## Fontes

- [Claude Fable 5 and Claude Mythos 5 — Anthropic](https://www.anthropic.com/news/claude-fable-5-mythos-5)
- [Anthropic's Claude Fable 5 is a version of Mythos the public can access today — TechCrunch](https://techcrunch.com/2026/06/09/anthropics-claude-fable-5-is-a-version-of-mythos-the-public-can-access-today/)
- [Anthropic releases Claude Fable 5 and Mythos 5 with major gains in coding and science — The Decoder](https://the-decoder.com/anthropic-releases-claude-fable-5-and-mythos-5-with-major-gains-in-coding-and-science/)
- [Claude Fable 5 vs Claude Opus 4.8: Full Benchmark Comparison — CodingFleet](https://codingfleet.com/blog/claude-fable-5-vs-claude-opus-4-8/)
- [Claude Fable 5 Pricing & Usage Credits Explained — ClaudeFast](https://claudefa.st/blog/guide/development/fable-5-usage-credits)
