---
title: "Opus 4.8: quando vale trocar de modelo"
description: "O Opus 4.8 saiu dia 28 de maio. Em vez de decorar benchmark, o que importa no editor é: quando eu troco do default, e pra qual modelo."
date: 2026-05-30
category: comparacao
tags: [claude-code, modelos]
---

Dia 28 de maio saiu o Opus 4.8. Toda vez que cai um modelo novo eu travo na mesma pergunta: vale trocar o que tá rodando como default? E se vale, pra qual?

Decorar benchmark não ajuda no editor. O que ajuda é um critério de "quando cada um". Esse é o meu.

## O que mudou no 4.8

Rápido, porque o detalhe importa menos que a decisão:

- A Anthropic diz que ele é ~4x menos propenso a deixar passar uma falha no próprio código que o 4.7. É claim deles, não medi — mas bate com a sensação de que ele questiona mais o plano antes de sair codando.
- Tool calling mais enxuto: menos passos pra mesma tarefa.
- Mesmo preço do antecessor.
- O controle de esforço (quanto ele "pensa") agora começa em `high` por padrão — tem post separado sobre isso.

Resumo honesto: não é salto de geração. É o mesmo Opus com julgamento melhor e menos desperdício de passo.

## O critério: capacidade vs. velocidade vs. custo

Três modelos vivos, três papéis:

- **Opus** — decisão de arquitetura, refactor que cruza vários arquivos, bug sutil, trabalho agêntico de horizonte longo. É onde "julgamento melhor" paga.
- **Sonnet** — o feijão com arroz. Implementar feature já planejada, edição localizada, velocidade boa. É o default da maioria dos planos por um motivo.
- **Haiku** — mecânico. Renomear, boilerplate, pergunta rápida, varredura.

## Quando eu mando no Opus 4.8

- Quando o problema é **decidir, não digitar** — desenho de solução, "esse plano tá de pé?".
- Quando o **bug já me derrubou duas vezes** no Sonnet. Trocar pro Opus costuma valer mais que insistir.
- **Refactor multi-arquivo** onde errar o contrato quebra três lugares.

## Quando não mando

- Tarefa já planejada e escopada — Sonnet entrega igual, mais rápido e mais barato.
- Coisa mecânica — Haiku.
- Quando não preciso da resposta agora-agora e o custo importa.

Truque que uso: `opusplan`. Opus no plan mode (onde o julgamento conta), Sonnet na execução (onde é só digitar o plano). Pega os dois mundos sem eu ficar trocando na mão.

```bash
/model opusplan
```

## A pegadinha do "default"

Aqui mora a confusão que vale qualificar. "Usar Opus 4.8" não significa a mesma coisa pra todo mundo:

- Em **Max, Team Premium e Enterprise pay-as-you-go**, o default já é Opus 4.8.
- Em **Pro, Team Standard e seats de Enterprise por assinatura**, o default é Sonnet 4.6 — você troca na mão com `/model opus`.
- Na **API**, o alias `opus` resolve pra 4.8; em Bedrock/Vertex/Foundry ele pode apontar pra uma versão mais antiga (aí precisa fixar o nome cheio, tipo `claude-opus-4-8`).

O contexto de 1M também varia: em Max/Team/Enterprise o Opus já sobe pra 1M incluso; no Pro precisa de usage credits; na API é acesso direto. (E precisa do Claude Code v2.1.154+ pra ver o 4.8 no picker.)

Detalhe operacional: desde a v2.1.153 o `/model` salva sua escolha como default das próximas sessões — antes valia só pra sessão atual. Então se você trocou uma vez e "ficou", é por isso.

## Meu default

Sonnet pro grosso do dia. Opus 4.8 (ou `opusplan`) quando o trabalho é pensar, não digitar. Haiku pro mecânico.

A régua não é "qual é o melhor modelo" — é "essa tarefa é limitada por inteligência ou por velocidade?". Se for inteligência, Opus. Se for velocidade, desce a escada.

## Fontes

- [Claude Opus 4.8 — anúncio](https://www.anthropic.com/news/claude-opus-4-8)
- [Model configuration — Claude Code docs](https://code.claude.com/docs/en/model-config)
- [Effort levels](https://platform.claude.com/docs/en/build-with-claude/effort)
- [Pricing — Claude](https://platform.claude.com/docs/en/about-claude/pricing)
