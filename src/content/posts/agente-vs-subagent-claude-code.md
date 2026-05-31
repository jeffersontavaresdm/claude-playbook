---
title: "Agente e subagent: quem faz a tarefa e quem você manda fazer"
description: "O agente é a sessão com quem você conversa. O subagent é um worker que ele dispara num contexto separado e te devolve só o resumo. Entender a diferença muda como você organiza o trabalho."
date: 2026-05-31
category: comando
tags: [claude-code, slash-command, contexto]
---

Toda vez que você roda `claude` e começa a conversar, está falando com um **agente**: o loop que lê arquivos, roda comando, edita código e repete até terminar. Tudo o que ele faz fica naquela conversa — o contexto cresce a cada busca, cada `git diff`, cada log.

O **subagent** é outra coisa. É um worker que o agente principal dispara para uma tarefa específica, **num contexto próprio e isolado**, e que devolve só a mensagem final. O barulho fica lá; pra você volta o resumo.

Essa é a diferença inteira. O resto é consequência dela.

## O que muda na prática

| | Agente principal | Subagent |
|---|---|---|
| Contexto | acumula a sessão toda | começa limpo, descartado no fim |
| O que volta | tudo (cada tool call, cada output) | só a mensagem final |
| Ferramentas | todas | dá pra restringir (ex: read-only) |
| Modelo | o da sessão | pode ser outro (Haiku barato, p.ex.) |
| System prompt | Claude Code + seu CLAUDE.md | customizável por subagent |

O ponto que mais importa é o contexto isolado. Se o agente precisa varrer 50 arquivos pra responder uma pergunta, esses 50 arquivos entopem a conversa principal — e você paga por eles em todo turno seguinte. Um subagent faz a varredura no canto dele e te entrega duas frases.

## Os que já vêm prontos

Você usa subagent sem perceber. O Claude Code traz alguns built-in:

- **Explore** — read-only, roda em Haiku, pra buscar e mapear codebase sem mexer em nada
- **Plan** — read-only, pesquisa antes de montar um plano
- **general-purpose** — acesso total, pra tarefas que misturam exploração e ação

Quando você pede "procura onde isso é usado no projeto", o agente principal costuma delegar pro Explore em vez de sujar a própria conversa.

## Criando o seu

Um subagent custom é um Markdown em `.claude/agents/` (projeto) ou `~/.claude/agents/` (pessoal). O jeito guiado é o comando `/agents`, que monta o arquivo pra você. Por baixo é só frontmatter + system prompt:

```markdown
---
name: revisor-kotlin
description: Revisa mudanças Kotlin focando em null-safety e ktlint. Use após edições em .kt.
tools: Read, Grep, Glob, Bash
model: sonnet
---

Você é um revisor sênior de Kotlin. Rode git diff,
foque nos arquivos alterados e aponte problemas por prioridade.
```

O campo `description` é o que o agente principal lê pra decidir **sozinho** quando delegar. Se quiser garantir, chama explícito: `@agent-revisor-kotlin olha o auth`.

## Quando vale e quando atrapalha

**Vale** quando a tarefa é self-contained e gera barulho que você não vai reler: pesquisa ampla, análise de logs, revisão read-only, qualquer coisa que cabe num "vai lá, faz, me traz o resumo".

**Atrapalha** quando a tarefa precisa de ida e volta com você ou compartilha contexto entre fases (planejar → codificar → testar). O subagent começa do zero e **não vê** o histórico da conversa nem o resultado de outras ferramentas. Esse isolamento corta dos dois lados.

Dois detalhes que pegam: subagent **não dispara outro subagent** (sem aninhamento), e o que ele não colocar na mensagem final **se perde** — o contexto dele é descartado.

## Resumindo

Agente é com quem você conversa; subagent é quem ele manda fazer o trabalho sujo num contexto que não volta pra te incomodar. Use subagent pra proteger seu contexto principal de tarefas verbosas e independentes — e deixe no loop principal tudo que precisa de memória compartilhada ou da sua mão no meio.

## Fontes

- [Create custom subagents — Claude Code docs](https://code.claude.com/docs/en/sub-agents)
- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- [Context window visualization](https://code.claude.com/docs/en/context-window)
- [Subagents no Agent SDK](https://code.claude.com/docs/en/agent-sdk/subagents)
