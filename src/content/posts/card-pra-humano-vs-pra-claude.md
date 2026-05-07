---
title: "Card pra humano vs card pra Claude: o que falta"
description: "Por que o mesmo card de Jira que um sênior implementa em uma hora deixa o Claude meio perdido — e o que adicionar pra ele acertar de primeira."
date: 2026-05-07
category: pratica
tags: [claude-code, prompts, contexto]
---

Card aberto, copio e colo no Claude com Plan Mode ligado. O plano que sai é coerente, bem estruturado, e resolve **metade** do problema certo. A outra metade é uma interpretação razoável do texto do card que não bate com o que a gente queria. Não é alucinação — é o card sendo ambíguo num lugar que pra mim era óbvio.

Esse foi o ponto onde caiu a ficha: card escrito pra humano não é card escrito pra Claude.

## Por que isso acontece

Quando um sênior abre o card *"ajustar lógica de cobrança recorrente — algumas faturas estão sendo cobradas duas vezes"*, ele já sabe:

- Qual arquivo provavelmente é (`BillingScheduler.kt`)
- Que tem aquele bug similar do PR de janeiro
- Que a discussão no Slack semana passada apontou pra status `PARTIAL_REFUNDED`
- Que retry e dispatch são separados, e o problema mora no dispatch
- Que o time não toca em `RetryPolicy` sem alinhar antes

Quando o Claude abre o mesmo card, ele tem **zero** disso. O contexto que mora na cabeça do sênior, no histórico do Slack, no PR review fora do código — tudo invisível. O Claude lê só as palavras do card + o que ele consegue inferir lendo o código.

Resultado: o plano que ele monta é a média ponderada de todas as interpretações plausíveis daquelas palavras. Coerente, mas vacilante exatamente onde o card é vago.

## O que precisa estar explícito

Quatro coisas que o card pra humano omite e o card pra Claude precisa ter:

**1. Ponteiros de arquivo.** Em vez de "lógica de cobrança recorrente", `BillingScheduler.kt:scheduleRecurring()`. Não é só pra ele encontrar mais rápido — é pra eliminar a fase de "vou explorar o código adivinhando onde isso mora", que custa tokens e às vezes erra de arquivo.

**2. Invariantes que vivem fora do código.** Regras tipo "fatura com status `PARTIAL_REFUNDED` nunca recobra" — se isso não tá num teste, num enum, num comentário no código, ele não tem como saber. Se a regra é importante e não está expressa em lugar nenhum verificável, ela vai num bullet do card.

**3. Critério de aceite testável.** "Deve cobrar certo" é checkpoint humano. "`BillingSchedulerTest.shouldNotRechargePartiallyRefunded` deve passar" é checkpoint que ele consegue verificar sozinho. Quando o critério é testável, ele para de implementar quando passa, em vez de "achar que tá bom".

**4. Escopo do que NÃO fazer.** Pra um sênior, "não mexe na `RetryPolicy`" é redundante — ele sabe que não é ali. Pra o Claude, sem essa instrução, tem chance dele propor uma "melhoria" no retry de quebra, achando que ajuda. Card explícito sobre o que está fora poupa essa rodada.

## Antes / depois

**Card pra humano:**

> Cobrança recorrente está duplicando algumas faturas. Investigar e corrigir.

**Mesmo card, reescrito pro Claude:**

> Cobrança recorrente cobra 2x quando fatura tem status `PARTIAL_REFUNDED`.
>
> - **Local:** `BillingScheduler.kt:scheduleRecurring()` (rodado pelo cron diário).
> - **Invariante:** `Invoice` com status `PARTIAL_REFUNDED` ou `REFUNDED` não deve gerar nova cobrança.
> - **Critério de aceite:** `BillingSchedulerTest` cobrindo cenário `PARTIAL_REFUNDED` + retry no mesmo dia, passando verde.
> - **Não tocar:** `RetryPolicy` (problema é dispatch inicial, não retry).

Plano que sai do primeiro: vacilante, lista três hipóteses, propõe explorar cinco arquivos, pede pra eu confirmar onde mora a lógica.

Plano que sai do segundo: vai direto no método citado, propõe um guard antes do dispatch, descreve o teste novo, lista o que vai e o que não vai mudar. Implementa em uma rodada.

A diferença não é o Claude estar "mais inteligente" no segundo. É ele estar com **menos espaço pra errar**.

## Quando não vale o esforço

Card explícito custa tempo de quem escreve. Tem caso que não compensa:

- **Fix trivial** (typo, copy, renomear constante) — card de uma linha basta
- **Tarefa que vai pra um sênior do time, não pro Claude** — ele já tem o contexto, spec extensa vira redundância
- **Spike exploratório** em que você nem sabe o que quer — o Claude entrega caos, mas é o caos que você pediu

A regra de bolso que adotei: se a tarefa toca **mais de um arquivo** ou **tem regra de negócio que não está num teste ou tipo**, vale escrever explícito. Abaixo disso, card cru funciona.

## Resumindo

Você não está sendo redundante quando explicita ponteiro, invariante, critério e escopo no card. Está nivelando o campo — dando ao Claude a informação que você tem na cabeça e ele não tem em lugar nenhum. O esforço é proporcional ao tamanho da tarefa e o ganho aparece já no primeiro plano: ele para de chutar e começa a executar.

## Fontes

- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Anthropic engineering
- [Context Engineering for Coding Agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html) — Martin Fowler
- [Intent Engineering: How to Brief AI Agents Without Guessing](https://pathmode.io/glossary/intent-engineering) — Pathmode
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) — Anthropic
