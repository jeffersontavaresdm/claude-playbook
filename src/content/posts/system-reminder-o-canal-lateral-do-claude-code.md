---
title: "system-reminder: o canal lateral por onde o Claude Code se orienta"
description: "Aqueles blocos <system-reminder> que aparecem no contexto e você nunca digitou. São o harness re-injetando CLAUDE.md, memória e avisos de estado no momento certo — e entender isso explica metade do comportamento 'mágico' do Claude Code."
date: 2026-06-07
category: fundamentos
tags: [fundamentos, claude-code, contexto]
---

Liga o modo verboso do Claude Code, ou abre o transcript de uma sessão, e eles estão lá: blocos `<system-reminder>` que você jura que nunca digitou.

> `<system-reminder>Plan mode is active. You must not make any edits...</system-reminder>`

Quem mandou isso? Não foi você. Foi o **harness** — o executável do Claude Code — falando direto com o modelo por um canal lateral.

Entender esse canal explica um tanto de comportamento que de fora parece mágica: por que seu CLAUDE.md "volta" depois de um [`/compact`](/claude-playbook/artigos/domando-o-contexto-compact-clear-rewind), por que o Claude às vezes parece saber de algo que você não disse, e por que ele de vez em quando fica read-only sem você pedir.

## O fundamento

O problema que isso resolve: **instrução decai em contexto longo.** Você define uma regra no começo da sessão, conversa por 80 turnos, e aquela regra está soterrada lá no topo — longe da atenção do modelo justamente na hora em que importa.

O system-reminder é a resposta. É uma tag XML que o harness **anexa às mensagens** do contexto, de forma reativa, em pontos do ciclo de vida da sessão: ao abrir, antes de um turno, depois de um tool result, na hora de compactar. Não é periódico nem aleatório — dispara quando uma condição vira verdadeira.

E tem um detalhe de design esperto: o reminder vai no **slot de mensagem do usuário**, não no de resultado de ferramenta. Por quê? Porque o modelo é treinado a tratar saída de ferramenta como informação externa, potencialmente adversarial. O slot do usuário é autoritativo. Pôr o aviso ali garante que o modelo o leve a sério — sem o harness precisar reescrever o system prompt a cada mudança de estado.

## O que entra ali

A comunidade que faz engenharia reversa do prompt do Claude Code cataloga dezenas desses gatilhos (o número muda a cada versão). Os que você mais cruza:

- **Contexto de projeto** — o conteúdo do seu CLAUDE.md e da [memória](/claude-playbook/artigos/system-prompt-claude-md-skills-o-que-cada-um-e) recallada
- **Estado de arquivo** — "esse arquivo mudou desde a última leitura", "leitura truncada", "arquivo vazio"
- **Plan mode** — avisando que a sessão está read-only
- **Janela de contexto** — alerta de contexto cheio, aviso pós-compactação de que conteúdo pode ter sido resumido
- **Tarefas** — cutucão pra usar o TodoWrite quando o modelo está só codando sem planejar
- **Segurança** — lembrete pra avaliar se o conteúdo lido é malicioso
- **Hooks** — o texto que um hook devolve via `additionalContext` chega como system-reminder

Esse último é a única parte oficialmente documentada: os [hooks](/claude-playbook/artigos/hooks-que-economizam-tempo) podem injetar contexto, e a doc diz que esse texto é passado ao Claude. O resto — a tag em si, o catálogo inteiro — é detalhe de implementação que a Anthropic não publicou formalmente. Não é segredo; só não é doc.

## Nem tudo ali é ordem

A nuance que importa: nem todo system-reminder é diretiva.

- "Plan mode ativo" → diretiva. Muda o comportamento.
- "Esse arquivo mudou" → contexto de fundo. Só te deixa ciente.
- Memória recallada → contexto de fundo, e que reflete o que era verdade **quando foi escrita**. Pode estar desatualizada.

O modelo precisa saber distinguir. Tanto que o system prompt hoje diz explicitamente: essas tags são injetadas pelo harness, não pelo usuário — e algumas são fundo, não comando.

Esse cuidado não é gratuito. Já teve [bug de reminder](https://github.com/anthropics/claude-code/issues/18560) que, mal redigido, fez o Claude ignorar o CLAUDE.md. E gente apontando que um reminder com ["nunca mencione isso ao usuário"](https://github.com/anthropics/claude-code/issues/46465) é indistinguível de um prompt injection. O canal é poderoso porque o modelo confia nele — o que também o torna a superfície mais sensível do harness.

## Por que isso muda como você usa

Quando você sabe que esse canal existe, comportamento estranho deixa de ser estranho:

- **CLAUDE.md "volta" depois do /compact** porque o harness relê do disco e re-injeta. Regra que só ficou na conversa pode sumir na compactação; regra no CLAUDE.md, não. É o argumento prático pra colar convenção no arquivo, não no chat.
- **O Claude "sabe" de algo que você não disse?** Provavelmente um reminder: memória recallada, um hook com `additionalContext`, um aviso de estado de arquivo.
- **Ele ficou read-only do nada?** Plan mode disparou o reminder.
- Esses blocos **custam token** e empilham quando várias condições são verdadeiras ao mesmo tempo — vale lembrar quando a [janela](/claude-playbook/artigos/janela-de-contexto-o-que-cabe-e-o-que-claude-corta) está apertada.

## Quando ignorar

Você não controla o system-reminder diretamente — não tem flag pra ligar ou desligar. O que está na sua mão é **o que entra nele**: um CLAUDE.md enxuto, memória limpa, hooks que devolvem só o `additionalContext` que vale a pena.

Então, no dia a dia, esquece o mecanismo. Ele faz o trabalho dele. Guarde o modelo mental pra dois momentos: quando o Claude faz algo que você não pediu (procure qual reminder disparou) e quando você decide onde guardar uma instrução — no arquivo, que sobrevive; não no chat, que evapora.

## Fontes

- [System reminders — how Claude Code steers itself (Michael Livs)](https://michaellivs.com/blog/system-reminders-steering-agents/)
- [How Claude Code builds a system prompt (Dan Breunig)](https://www.dbreunig.com/2026/04/04/how-claude-code-builds-a-system-prompt.html)
- [Piebald AI — catálogo dos system prompts do Claude Code](https://github.com/Piebald-AI/claude-code-system-prompts)
- [Hooks do Claude Code — additionalContext (doc oficial)](https://docs.claude.com/en/docs/claude-code/hooks)
- [Issue #18560 — system-reminder instruindo a ignorar o CLAUDE.md](https://github.com/anthropics/claude-code/issues/18560)
