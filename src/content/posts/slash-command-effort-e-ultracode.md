---
title: "/effort e ultracode: o botão de esforço (e o que o ultracode faz diferente)"
description: "O /effort controla quanto o Claude pensa por mensagem. O ultracode parece só o topo da régua — mas faz algo de categoria diferente: monta um time."
date: 2026-05-30
category: comando
tags: [claude-code, slash-command]
---

Quase todo mundo deixa o `/effort` no default e nunca mexe. Faz sentido — o default é bom. Mas tem um degrau no fim da régua que não é "pensar mais": é "trabalhar com um time". Esse é o `ultracode`, e ele merece atenção separada.

## O que é

`/effort` controla quanto o Claude raciocina por mensagem. A régua vai `low` → `medium` → `high` → `xhigh` → `max`. No Opus 4.8 o default é `high`. Você muda com `/effort <nível>`, `/effort` (abre slider) ou `/effort auto` pra voltar ao default do modelo.

`max` é o teto de raciocínio: pensa o máximo, sem limite de tokens, só na sessão atual.

`ultracode` parece "o degrau acima do max", mas não é. Ele **não é um nível de esforço** — é um setting do Claude Code que faz duas coisas: manda `xhigh` pro modelo **e** põe o Claude a orquestrar dynamic workflows (vários subagents em paralelo) sozinho, pra cada tarefa que valha a pena.

```bash
/effort ultracode
```

A diferença que importa: `max` é *um* Claude pensando mais fundo. `ultracode` é o Claude montando um *time* pra cada tarefa. Régua de pensamento vs. régua de gente.

## Quando eu uso

- **`high` (default)** — 95% do dia. Não mexo.
- **`max`** — problema isolado e difícil onde quero profundidade num turno só: bug cabeludo, decisão de design espinhosa.
- **`ultracode`** — trabalho grande que se quebra em frentes: auditoria do codebase inteiro, migração de muitos arquivos, "entende → muda → valida" onde cada etapa vira um workflow. Aí o paralelismo paga.

## Quando NÃO uso

- **`ultracode` pra tarefa pequena** — ele planeja workflow pra *cada* tarefa substantiva da sessão. Pergunta rápida vira um batalhão. Queima token e tempo à toa.
- **`max` no geral** — rende menos do que parece. A própria doc avisa: retornos decrescentes e tendência a "pensar demais". Teste antes de adotar.
- Deixar ligado e esquecer: `ultracode` e `max` valem só na sessão. Mas se sobrou ligado e você abriu tarefa boba, é desperdício. Volto com `/effort high`.

## Um detalhe que evita confusão

Pra raciocínio profundo pontual, sem mexer no setting da sessão, escreve `ultrathink` no prompt. É keyword de verdade — o Claude Code reconhece e injeta a instrução só naquele turno.

`think`, `think hard`, `think more`? **Não são keywords.** Vão como texto comum. Se você escrevia "think hard" achando que ligava algo, não ligava nada.

E `ultracode` só aparece no menu `/effort` em modelo que suporta `xhigh` (Opus 4.8/4.7) e com dynamic workflows habilitado. No Pro, liga os workflows no `/config` primeiro.

## Resumindo

`/effort` é o quanto o Claude pensa; `ultracode` é o quanto ele se multiplica. Deixa no `high`, sobe pro `max` quando um problema isolado pede profundidade, e liga o `ultracode` só quando a tarefa é grande o bastante pra virar um time — e lembra de desligar depois.

## Fontes

- [Effort levels — Claude Code docs](https://code.claude.com/docs/en/model-config#adjust-effort-level)
- [Dynamic workflows — Claude Code docs](https://code.claude.com/docs/en/workflows)
- [Effort — Claude docs](https://platform.claude.com/docs/en/build-with-claude/effort)
