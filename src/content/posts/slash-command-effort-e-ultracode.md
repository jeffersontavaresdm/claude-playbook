---
title: "ultracode: a régua do /effort que monta um time"
description: "O ultracode aparece no menu do /effort como se fosse o topo da régua de esforço. Mas faz algo de categoria diferente: põe o Claude a orquestrar workflows de dezenas de subagents sozinho. O que é, como usar, prós e contras."
date: 2026-05-30
category: comando
tags: [claude-code, slash-command]
---

Tem uma opção no fim do menu `/effort` que parece só "o degrau acima do `max`": o `ultracode`. Não é. `max` é *um* Claude pensando mais fundo. `ultracode` é o Claude montando um *time* pra cada tarefa. Régua de pensamento vs. régua de gente — e isso muda como você usa.

## O que é o ultracode

Primeiro o contexto: `/effort` controla quanto o Claude raciocina por mensagem. A régua no Opus 4.8 vai `low` → `medium` → `high` → `xhigh` → `max`, e o default é `high`. Tudo isso é uma só coisa: o quanto ele pensa antes de responder.

O `ultracode` está no mesmo menu, mas **não é um nível de esforço**. É um *setting* do Claude Code que faz duas coisas ao mesmo tempo:

1. manda `xhigh` pro modelo (raciocínio alto por mensagem), e
2. põe o Claude a planejar e rodar **dynamic workflows** sozinho — pra *cada* tarefa substantiva da sessão.

Um dynamic workflow é um script JavaScript que o próprio Claude escreve pra orquestrar subagents em escala. O runtime roda esse script em background enquanto sua sessão continua livre. Dá pra ter até **16 agents em paralelo** e **1000 no total** por run. É o mesmo motor por trás do `/deep-research`.

A sacada é essa: com `ultracode` ligado, um pedido seu pode virar vários workflows em sequência — um pra *entender* o código, um pra *mudar*, um pra *validar* — sem você pedir cada etapa.

## Como ligar

```bash
/effort ultracode
```

Vale **só na sessão atual** e zera quando você abre uma nova. Pra voltar ao normal:

```bash
/effort high
```

Dois detalhes que evitam dor de cabeça:

- O `ultracode` só aparece no menu em modelos que suportam `xhigh` — Opus 4.8 e 4.7. Em outros, nem é oferecido.
- Dynamic workflows estão em **research preview** e exigem Claude Code v2.1.154+. No **Pro** você precisa ligar a linha *Dynamic workflows* no `/config` primeiro; nos planos Max/Team/Enterprise e na API já vem disponível. Se workflows estiverem desligados, o `ultracode` some do menu.

Ele também não é o mesmo que os outros níveis por baixo: não entra em `effortLevel`, no flag `--effort` nem no `CLAUDE_CODE_EFFORT_LEVEL`. Fora do menu, só dá pra ligar via `"ultracode": true` no `--settings` ou num control request do Agent SDK.

## Prós

- **Escala real.** Resolve trabalho que uma conversa só não coordena — auditoria do codebase inteiro, migração de centenas de arquivos, varredura de bug em tudo.
- **Qualidade, não só volume.** Como o plano vira código, o workflow pode fazer agents revisarem o resultado uns dos outros de forma adversarial antes de reportar. É mais confiável que um passo único.
- **Contexto da sessão fica limpo.** Os resultados intermediários ficam em variáveis do script, não na janela do Claude. Só a resposta final volta pra você.
- **Você não precisa orquestrar.** Diferente de pedir subagents na mão, aqui o Claude decide sozinho quando a tarefa merece um time.

## Contras

- **Queima muito mais token (e tempo).** Cada tarefa substantiva vira um workflow de vários agents. Uma run sozinha pode gastar bem mais que resolver o mesmo na conversa — e conta no seu limite de uso normalmente.
- **Ele aplica isso a *tudo*.** Pergunta rápida também ganha um batalhão. Pra tarefa pequena, é desperdício puro.
- **Session-only é fácil de esquecer.** Deixou ligado, abriu uma tarefa boba depois → torrou token à toa. Eu desligo com `/effort high` assim que saio do trabalho grande.
- **Research preview.** Ainda está amadurecendo; trate como ferramenta de força, não default.

## Não precisa ligar o setting pra tudo

Duas saídas pontuais, sem mexer no esforço da sessão:

- **Um workflow só, pra uma tarefa:** escreva a palavra `workflow` em qualquer lugar do prompt. O Claude Code destaca a palavra e escreve um workflow só pra aquilo. Bom pra rodar a auditoria de hoje sem deixar `ultracode` ligado a sessão toda.
- **Raciocínio profundo num turno, sem time:** escreva `ultrathink` no prompt. É keyword de verdade — injeta a instrução só naquele turno. (`think`, `think hard`, `think more` **não** são keywords; vão como texto comum.)

## Quando vale

- **`high`** — 95% do dia. Não mexo.
- **`max`** — problema isolado e difícil onde quero profundidade num turno só: bug cabeludo, decisão de design espinhosa. Mas teste antes: a própria doc avisa retornos decrescentes e tendência a "pensar demais".
- **`ultracode`** — trabalho grande que se quebra em frentes e que valeria virar um time. Antes de uma run dessas, confere o `/model` (se você costuma cair pra um modelo menor em tarefa rotineira, todo agent vai herdar ele).

## Resumindo

`/effort` é o quanto o Claude pensa; `ultracode` é o quanto ele se multiplica. Deixa no `high`, sobe pro `max` quando um problema isolado pede profundidade, e liga o `ultracode` só quando a tarefa é grande o bastante pra virar um time — paga em token e tempo, então lembra de desligar depois.

## Fontes

- [Adjust effort level — Claude Code docs](https://code.claude.com/docs/en/model-config#adjust-effort-level)
- [Orchestrate subagents at scale with dynamic workflows — Claude Code docs](https://code.claude.com/docs/en/workflows)
- [Effort — Claude docs](https://platform.claude.com/docs/en/build-with-claude/effort)
