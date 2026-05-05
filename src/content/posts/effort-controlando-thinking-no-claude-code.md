---
title: "/effort: controlando o thinking no Claude Code"
description: "O slash command que define quanto o Claude pensa antes de responder. Sintaxe, magic word ultrathink e os ajustes em settings.json — sem teoria, só o controle prático."
date: 2026-05-05
category: comando
tags: [claude-code, slash-command]
---

`/effort <nível>` define quanto raciocínio interno o modelo aloca antes de responder, na sessão atual do Claude Code. Níveis aceitos: `low`, `medium`, `high`, `xhigh` (só Opus 4.7) e `max`. Default: Opus 4.7 começa em `xhigh`; Sonnet 4.6 e Opus 4.6, em `high`.

O conceito por trás (o que é thinking, como cobra, quando vale a pena) está em [outro post de fundamentos](/claude-playbook/artigos/effort-extended-thinking-quando-vale-a-pena). Esse aqui é só o controle.

## Quando uso `/effort`

- **Bati a parede com effort baixo** — Sonnet rodando `medium` que não consegue fechar o bug. `/effort high` mantém a sessão e dá mais músculo sem recomeçar nada.
- **Plan Mode pra coisa séria** — `/effort high` antes de entrar no plano. O plano sai mais sólido; na execução, dá pra voltar pra `medium` se quiser.
- **Tarefa simples no meio de sessão pesada** — `/effort low` pra renomear variáveis sem queimar token de raciocínio, depois volto pro nível anterior com `/effort high` ou `/effort medium`.

## Quando *não* uso

- **Quero o efeito só naquele turno** — escrevo `ultrathink` no prompt. É magic word: empurra o thinking pra cima naquela mensagem sem mudar a sessão.
- **Default global da máquina** — `/config` → `alwaysThinkingEnabled` define o padrão. `Alt+T` (Linux/Win) / `Option+T` (macOS) também alterna o display de thinking.
- **Quero desligar thinking** — `MAX_THINKING_TOKENS=0` no ambiente. Latência mínima, zero raciocínio interno.
- **Quero o modo legado (manual, com `budget_tokens`)** — só Opus 4.6 e Sonnet 4.6: `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1`. Em Opus 4.7 isso é ignorado — só adaptive existe.

## Pitfall que vale lembrar

`/effort` afeta **só a sessão atual**. Fechou o terminal, o nível volta pro default do modelo. Pra persistir, vai em `alwaysThinkingEnabled` no settings ou na env var. Já me peguei achando que tinha "deixado em high" depois de reabrir o Claude — não tinha.

E `ultrathink` só funciona na mensagem onde aparece. Se a sessão tá em `low` e você quer um turno bom, é literal: "ultrathink, [resto do prompt]". Não basta achar que pediu — a palavra precisa estar lá.

## Resumindo

`/effort` é controle de sessão. `ultrathink` é boost de um turno. `alwaysThinkingEnabled` no settings é o default global. Os três se sobrepõem nessa ordem — global, depois sessão, depois turno. Default sensato: global em `medium`, escala pra `high` com `/effort` quando o trabalho pedir.

## Fontes

- [Model configuration (Claude Code Docs)](https://code.claude.com/docs/en/model-config)
- [Effort parameter (Anthropic Docs)](https://docs.claude.com/en/docs/build-with-claude/effort)
- [Adaptive thinking (Anthropic Docs)](https://docs.claude.com/en/docs/build-with-claude/adaptive-thinking)
