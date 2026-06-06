---
title: "Domando o contexto: /compact, /clear, /rewind e /context"
description: "A janela de contexto é um orçamento. Os quatro comandos que uso pra medir, comprimir, zerar e desfazer — sem estourar no meio de uma sessão longa."
date: 2026-06-06
category: comando
tags: [claude-code, slash-command, contexto]
---

A [janela de contexto é um orçamento](/claude-playbook/artigos/janela-de-contexto-o-que-cabe-e-o-que-claude-corta) — já escrevi sobre o que cabe e o que o Claude corta. Este aqui é o lado operacional: os quatro comandos que uso pra não estourar esse orçamento no meio de uma sessão longa.

## `/context` — o raio-x

Mostra um grid do que está ocupando a janela **agora**: system prompt, CLAUDE.md, memória, tools de MCP, skills, arquivos lidos, mensagens. É a primeira coisa que rodo quando a sessão começa a pesar. Sem medir, eu só chutava qual era o vilão — quase sempre errado.

## `/compact` — comprime

Resume a conversa até ali e troca as mensagens antigas por um resumo estruturado: o que pedi, decisões técnicas, arquivos e trechos importantes, erros e correções, tarefas pendentes. O que se perde é o literal — outputs de tool inteiros, raciocínio intermediário.

Roda sozinho perto do limite (auto-compact), mas prefiro chamar antes, com foco:

```bash
/compact foca nas mudanças da API e nos testes que ainda falham
```

Aí eu escolho o que sobrevive, em vez de deixar o resumo decidir por mim.

## `/clear` — zera

Não resume: descarta. Começa do zero, com o CLAUDE.md e a memória recarregados do disco. A conversa antiga continua acessível no `/resume` se eu precisar. Uso quando vou pra uma tarefa **sem relação** com a anterior — aí resumir não adianta, o contexto velho só atrapalha.

A diferença que importa: `/compact` mantém o fio do trabalho; `/clear` corta o fio de propósito.

## `/rewind` — volta no tempo

`Esc Esc` (com o input vazio) abre o menu de checkpoints, um por prompt enviado. Dá pra restaurar conversa, código, ou os dois — ou "resumir até aqui / a partir daqui" pra comprimir só um pedaço. É minha rede de segurança quando o Claude foi numa direção errada e eu quero desfazer rápido sem reabrir tudo.

## A régua que sigo

- Sessão pesada, mesma tarefa → `/context` pra medir, `/compact` pra aliviar.
- Tarefa nova e sem relação → `/clear`.
- Errou o rumo, quero desfazer → `/rewind`.
- Uma discussão lateral inchou → `/rewind` → "resumir a partir daqui".

## O pitfall do /rewind

Ele rastreia edições de arquivo feitas pelas **ferramentas do Claude** — não rastreia efeito de comando bash (`rm`, `mv`, `cp`). E é local da sessão. Não é git: pra histórico permanente, commit. O checkpoint é desfazer rápido, não controle de versão.

Um detalhe que muda a régua: o limite padrão é 200K tokens, mas o Opus 4.8 e o Sonnet 4.6 rodam com janela de 1M na variante `[1m]` (acesso depende do plano). Mais espaço adia o aperto — não elimina. Conversa longa o suficiente enche qualquer janela, e aí é compactar ou limpar.

## Resumindo

`/context` mede, `/compact` comprime mantendo o fio, `/clear` zera pra começar limpo, `/rewind` desfaz. Aprender a alternar entre os quatro é o que separa uma sessão longa produtiva de uma que vira sopa de contexto.

## Fontes

- [Slash commands — Claude Code Docs](https://code.claude.com/docs/en/slash-commands)
- [Checkpointing — Claude Code Docs](https://code.claude.com/docs/en/checkpointing)
- [Context window — Claude Code Docs](https://code.claude.com/docs/en/context-window)
- [Costs e gerência de contexto — Claude Code Docs](https://code.claude.com/docs/en/costs)
