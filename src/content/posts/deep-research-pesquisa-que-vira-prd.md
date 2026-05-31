---
title: "/deep-research: a pesquisa que eu jogo dentro de um PRD"
description: "O /deep-research dispara várias buscas em paralelo, cruza as fontes e devolve um relatório com citações. Junto com isso: o que é um PRD e por que ele é o destino natural dessa pesquisa."
date: 2026-05-31
category: comando
tags: [claude-code, slash-command, documentação]
---

Antes de construir qualquer coisa, alguém precisa responder "o que a gente vai fazer, pra quem, e por quê". Esse documento tem nome: **PRD**. E o trabalho mais chato de escrever um PRD não é o texto — é a pesquisa que sustenta as decisões.

O `/deep-research` resolve a parte da pesquisa. Vou falar dos dois.

## O que é o /deep-research

É um comando do Claude Code que faz pesquisa séria, não um `WebSearch` solto. Você dá uma pergunta e ele:

- **abre várias buscas em paralelo**, atacando a pergunta por ângulos diferentes
- **busca e cruza as fontes** umas contra as outras
- **vota em cada afirmação** — o que não sobrevive ao cruzamento é descartado
- devolve **um relatório com as fontes citadas**

A sintaxe é direta:

```bash
/deep-research o que mudou no permission model do Node entre a v20 e a v22?
```

Ele roda em segundo plano — sua sessão continua respondendo. Dá pra acompanhar as fases com `/workflows`. No fim, cai um relatório só com o que passou no crivo, e cada claim vem com a fonte de onde veio.

Um detalhe que importa: se a pergunta está vaga, ele pergunta 2-3 coisas antes de gastar a corrida. "O que é X?" é largo demais. "Como X mudou entre a versão A e a B, pra um caso de uso C" rende um relatório útil e mais barato.

## O que é um PRD

**PRD = Product Requirements Document.** É o doc que define o que um produto (ou feature) precisa ser, antes de codar. Não é especificação técnica — é o "porquê" e o "o quê", não o "como".

O esqueleto típico:

- **Contexto / problema** — que dor isso resolve e por que agora
- **Objetivos e métricas de sucesso** — como você sabe que deu certo
- **Personas e cenários** — quem usa e em que situação
- **Requisitos / user stories** — as features priorizadas
- **Premissas, restrições e riscos** — o que você está assumindo e o que pode dar errado

Cinco a quinze páginas, no geral. O ponto não é tamanho — é alinhar gente técnica e de produto na mesma página antes de gastar semanas construindo a coisa errada.

## Por que os dois juntos

Metade do PRD é afirmação sobre o mundo: "os concorrentes fazem assim", "esse padrão mudou na última versão", "usuários nesse contexto esperam X". Quando essas frases são chute, o PRD inteiro fica em pé numa base mole.

Meu fluxo: rodo `/deep-research` nas perguntas que sustentam as seções de **contexto** e **premissas/riscos**, e colo o relatório citado direto como matéria-prima. Aí o PRD nasce com fonte em cada afirmação, não com achismo.

## Quando uso

- **Pergunta que precisa de várias fontes cruzadas** — não um lookup que uma página resolve.
- **Tema contestado**, onde consenso importa e claim solta engana.
- **Pra alimentar um doc** (PRD, RFC, comparação) que vai pesar numa decisão.

## Quando NÃO uso

- **Fato rápido** — uma busca simples resolve, sem disparar um enxame de agentes.
- **Quando latência importa** — `/deep-research` é mais lento e gasta bem mais token que uma conversa normal.
- **Pergunta vaga** — refina antes; senão você paga caro por um relatório genérico.

## Resumindo

`/deep-research` transforma uma pergunta em relatório com fonte, cruzando buscas em paralelo e jogando fora o que não se confirma. O PRD é onde essa pesquisa vira decisão — use um pra abastecer o outro e pare de escrever "eu acho que" em documento que move time.

## Fontes

- [Workflows (explica o /deep-research) — Claude Code docs](https://code.claude.com/docs/en/workflows)
- [Slash commands reference — Claude Code docs](https://code.claude.com/docs/en/commands)
- [What is a PRD? — Atlassian](https://www.atlassian.com/agile/product-management/requirements)
- [Product Requirements Document — ProductPlan](https://www.productplan.com/glossary/product-requirements-document)
