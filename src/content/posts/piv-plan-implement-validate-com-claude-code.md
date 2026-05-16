---
title: "PIV: Plan, Implement, Validate — o ciclo que falta quando o Claude erra"
description: "Plan-Implement-Validate é um mnemônico do mundo agentic coding em cima do Explore-Plan-Code-Commit da Anthropic. O que muda na prática é a fase Validate."
date: 2026-05-15
category: pratica
tags: [claude-code, fluxo, plan-mode]
---

A maior parte das vezes que o Claude erra um patch, o erro não está no plano nem no código. Está na ausência de uma fase explícita pra **conferir** se o que saiu bate com o que eu pedi.

PIV — **Plan, Implement, Validate** — é um mnemônico que circulou no fim de 2025 / início de 2026 na comunidade de agentic coding (Cole Medin, MindStudio). Não é framework novo: é uma releitura do **Explore → Plan → Code → Commit** que a Anthropic já recomenda, com um detalhe importante — Validate vira fase de primeira classe, não rodapé.

Vou explicar o que muda no meu uso.

## As três fases

**Plan.** Antes de qualquer código, três perguntas: qual é o output exato, quais são as restrições, como vou saber que terminou. O output desta fase é um "spec" — resumo da tarefa, entradas/saídas, edge cases, critérios de aceitação. Toda suposição que o agente faz aqui vira ponto potencial de falha.

**Implement.** O agente executa o spec com contexto limitado (não o repo inteiro), com exemplos concretos dos padrões que já existem no projeto, e com escopo travado. Supervisão escala com complexidade: tarefa pequena roda direto, tarefa média checa em milestones, tarefa grande quebra em ciclos menores de PIV.

**Validate.** Confere contra os critérios da fase Plan. Automatizado primeiro (testes, lint, typecheck, regressão) e manual depois (estrutura, segurança, lógica de negócio, edge case que o teste não pegou). Se falhar: volta pro Implement se for bug, ou pro Plan se o requisito foi entendido errado.

Ciclo típico: 15-30 minutos. Feature coerente costuma pedir 3-5 ciclos.

## Como mapeia no Explore-Plan-Code-Commit

Lado a lado:

```
Anthropic (oficial):  Explore → Plan → Code → Commit
PIV (Cole/MindStudio):         Plan → Implement → Validate
```

Explore + Plan colapsam em Plan. Code vira Implement. Commit sai e entra Validate. A diferença prática é onde o ciclo termina: no oficial, termina no commit; no PIV, termina num gate de verificação que pode te jogar de volta pro começo. É o mesmo conselho que aparece no próprio doc da Anthropic — "dê ao Claude uma forma de verificar o trabalho dele" — só que promovido a etapa nomeada.

## O que mudou no meu uso

Eu já usava Plan Mode (`Shift+Tab` duas vezes) pra fazer a fase Plan funcionar. O que faltava era disciplina na Validate. Sem ela, eu lia o diff, achava bonito, commitava e descobria o bug rodando manualmente meia hora depois.

Agora a Validate tem **camada automática obrigatória** antes de eu olhar o diff:

```bash
./gradlew ktlintCheck
./gradlew test
./gradlew detekt
```

Só depois eu reviso. Se algo falhou, o feedback volta pro Claude no mesmo turno — não acumula em backlog mental.

Pra projetos onde o Validate automático é fraco (sem teste, sem lint), o jeito é ser mais explícito no Plan: "ao terminar, mostre como testar manualmente, comando por comando". Aí a fase Validate vira um checklist que eu executo.

## O detalhe que faz diferença: ciclos curtos

A tentação é fazer **um** PIV gigante: planejar a feature inteira, implementar tudo, validar no final. Não funciona. O contexto enche, o agente perde o fio, e quando o Validate falha você não sabe em qual das 12 decisões intermediárias o desvio começou.

Ciclos de 15-30 minutos. Entre ciclos, `/clear` se a próxima etapa não precisa do contexto da anterior. O ciclo curto é o que torna o Validate barato de rodar — porque se algo quebra, você só desfaz os últimos 30 minutos, não o dia inteiro.

## Quando é cerimônia

PIV não vale a pena pra tudo:

- **Edição de uma linha** (renomear variável, ajustar typo) — direto no Edit, sem plano.
- **Exploração** ("o que esse módulo faz?") — Plan Mode pra ler, sem Implement nem Validate.
- **Spike descartável** — código que vai pro lixo não precisa de gate de validação.

A regra prática: se a tarefa cabe numa frase **e** o resultado é óbvio na leitura, pula direto. Se eu precisar de mais de duas frases pra descrever o que quero, vale o ciclo completo.

## Resumindo

PIV não é framework, é lembrete. O conteúdo está no Explore-Plan-Code-Commit da Anthropic. O que ele adiciona é a promoção da Validate a etapa nomeada — e isso, na prática, foi o que reduziu meus retrabalhos. Plan Mode resolve a fase Plan. `./gradlew test` (ou equivalente no seu stack) resolve metade da fase Validate. A outra metade é não pular o olho no diff.

## Fontes

- [MindStudio — Agentic Coding Workflow: The PIV Loop Explained](https://www.mindstudio.ai/blog/agentic-coding-workflow-piv-loop-explained)
- [Cole Medin — AI Transformation Workshop (repo)](https://github.com/coleam00/ai-transformation-workshop)
- [Anthropic — Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)
- [galando/piv-speckit (variante TDD)](https://github.com/galando/piv-speckit)
