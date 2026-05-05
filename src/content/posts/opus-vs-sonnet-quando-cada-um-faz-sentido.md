---
title: "Opus vs Sonnet: quando cada um faz sentido"
description: "Por meses usei Opus achando que era 'Sonnet, mas melhor em tudo'. Não é tão simples. O que muda de fato entre os dois — e quando o extra compensa o preço."
date: 2026-05-05
category: comparacao
tags: [claude-code, opus, sonnet]
---

Por meses eu usei Opus achando que era "Sonnet, mas melhor em tudo". Aí olhei a fatura, comparei outputs lado a lado, e fui entender onde a diferença aparece mesmo. Resposta curta: aparece menos do que eu imaginava — e o que pesa não é o benchmark.

Esse post é o que eu queria ter lido antes. Comparação prática entre **Claude Opus 4.7** e **Claude Sonnet 4.6**, sem floreio. Vale igual em claude.ai, Claude Code ou API — a decisão é a mesma.

> Não vou cobrir extended/adaptive thinking aqui. Fica pra outro post. Essa é a comparação dos modelos "puros".

## Os números, em uma tabela

| | Opus 4.7 | Sonnet 4.6 |
|---|---|---|
| Input | $5 / MTok | $3 / MTok |
| Output | $25 / MTok | $15 / MTok |
| Janela de contexto | 1M tokens | 1M tokens (200k default no Claude Code) |
| Output máximo | 128k tokens | 64k tokens |
| Latência (Anthropic) | Moderada | Rápida |
| SWE-bench Verified | 87.6% | 79.6% |
| SWE-bench Pro | 64.3% | menor |

Opus custa **~67% mais** que Sonnet por token. A capacidade nativa de janela é igual (1M nos dois), mas no Claude Code o Sonnet roda em 200k por default — precisa do variant `sonnet[1m]` em `/model` pra abrir o restante. Output máximo é o dobro em Opus, mas raramente é o gargalo.

A diferença que mais me chamou atenção foi o SWE-bench Pro — benchmark mais difícil que o Verified, focado em tasks de produção. Foi onde Opus 4.7 deu o salto maior da geração: ~3x mais tasks resolvidas em cenários complexos comparado a Opus 4.6.

## Onde a diferença aparece

Tarefas onde o modelo precisa **manter intenção por muitos passos**:

- Refactor que toca 8 arquivos, mantém contratos e não quebra teste
- Bug em sistema com várias camadas (HTTP → service → repo → migration)
- Implementação from scratch envolvendo frontend + backend + schema
- Análise de arquitetura ("o que muda se eu trocar essa fila por um worker?")
- Sessão longa de Plan Mode com revisão crítica do plano

Em tudo isso Opus erra menos no "passo 4" — quando Sonnet começa a misturar contexto ou simplificar demais sem avisar. É o tipo de erro que **só aparece no resultado final**, e cada retry custa mais que o token a mais que Opus cobraria.

## Onde a diferença NÃO aparece

Esse é o ponto que demorei a aceitar:

- "Renomeia essa variável em todos os arquivos"
- "Escreve um teste pra essa função"
- "Por que esse erro tá acontecendo?" (com stack trace)
- "Formata esse JSON em YAML"
- "Resume esse arquivo de log"
- Perguntas factuais ("qual flag faz X em git?")
- Edição pontual em arquivo conhecido

Em todas, Sonnet entrega resposta indistinguível do Opus — em menos tempo e ~40% do custo. Pagar Opus aqui é queimar dinheiro.

A regra que uso: **se a tarefa cabe em uma frase E a resposta cabe em uma tela, é Sonnet.**

## Quando vale Opus

- **Código complexo de longa duração** — refactor multi-arquivo, debug em sistema com camadas, agentic coding com 50+ tool calls
- **Decisões arquiteturais** — onde "quase certo" sai caro
- **Saídas longas estruturadas** — RFC, design doc, relatório técnico (output máximo de 128k ajuda)
- **Tarefas onde o retry custa mais que o token** — produção, batch crítico, análise de incidente
- **Sessões longas em Plan Mode** — onde Sonnet começa a "esquecer" o objetivo original

## Quando vale Sonnet

Maioria do dia a dia:

- Código rotineiro (CRUD, boilerplate, glue)
- Debug com pista clara (stack trace, log)
- Escrita técnica (README, commit, comentário)
- Q&A de documentação
- Pair programming pontual
- Qualquer fluxo onde você itera rápido — 2 segundos a menos por turno somam no fim do dia

Sonnet 4.6 é substancialmente melhor que Sonnet 4.5 em código. O gap pra Opus é menor do que costumava ser, principalmente em tarefas curtas.

## Meu default

No Claude Code: **Sonnet por padrão**, com Opus em duas situações:

1. Entrei em Plan Mode pra um problema sério → switch pra Opus, faço o plano lá, executo com Sonnet
2. Bati a cabeça duas vezes com Sonnet no mesmo problema → switch pra Opus, normalmente resolve no primeiro tiro

Na claude.ai, mesma lógica: começo em Sonnet, escalo pra Opus se a resposta ficou genérica.

Em apps que rodam na API, faço **routing manual**: classificador simples na frente decide qual modelo. Tarefa rotineira → Sonnet. Tarefa complexa → Opus. Não é elegante, mas reduz custo em ~60% sem perder qualidade perceptível.

## A intuição que demorei a calibrar

Por muito tempo eu pensava: "se Opus é melhor em tudo, por que não usar sempre?". A resposta é: **a diferença só aparece no topo da curva de dificuldade**. Pra tarefa fácil, dois modelos competentes dão a mesma resposta — você tá pagando por capacidade que não foi exercida.

A heurística que ficou pra mim: **Opus é seguro contra a tarefa subir de dificuldade no meio do caminho**. Sonnet é ótimo até a tarefa ficar mais complicada que parecia — aí você descobre tarde demais.

Se você sabe a dificuldade upfront e ela é média/baixa: Sonnet. Se é alta ou desconhecida e o custo de erro é real: Opus.

## Resumindo

Sonnet é o cavalo de batalha; Opus é o seguro contra incidentes. Pago Opus quando errar custa caro — refactor multi-arquivo, decisão arquitetural, sessão agentic longa. Resto é Sonnet, que entrega ~90% do trabalho em ~40% do custo.

## Fontes

- [Models overview (Anthropic Docs)](https://docs.claude.com/en/docs/about-claude/models/overview)
- [Introducing Claude Opus 4.7 (Anthropic)](https://www.anthropic.com/news/claude-opus-4-7)
- [Pricing (Anthropic Docs)](https://docs.claude.com/en/docs/about-claude/pricing)
- [Claude Opus 4.7 Benchmarks Explained (Vellum)](https://www.vellum.ai/blog/claude-opus-4-7-benchmarks-explained)
