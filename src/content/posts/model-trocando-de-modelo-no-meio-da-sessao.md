---
title: "/model: trocando de modelo no meio da sessão"
description: "Comecei no Sonnet, a task virou Opus. Como trocar sem reiniciar — e quando não vale a pena."
date: 2026-05-06
category: comando
tags: [claude-code, slash-command]
---

Abri sessão no Sonnet pra mexer numa configuração simples. Cinco mensagens depois, virou refatoração de uma função que cruza três módulos. Não preciso reiniciar pra subir pra Opus — `/model` resolve.

Esse post é a execução prática dos posts sobre [Opus vs Sonnet](/claude-playbook/artigos/opus-vs-sonnet-quando-cada-um-faz-sentido) e [effort no thinking](/claude-playbook/artigos/effort-controlando-thinking-no-claude-code). Você já sabe quando quer trocar; aqui está o como.

## O que é

`/model` troca o modelo ativo da **sessão atual** do Claude Code. O contexto inteiro é preservado — o novo modelo vê tudo que aconteceu até ali. A troca vale dali pra frente: nada é re-rodado.

Duas formas:

- `/model` — abre o seletor com a lista de aliases disponíveis
- `/model <alias>` — troca direto, sem passar pelo seletor

A lista que aparece **varia por plano**. O conjunto que aparece pra todo mundo (Pro, Max, Team, Enterprise, API): `sonnet`, `opus`, `haiku`, `default`, `opusplan`. Pra ver o que está habilitado pra você, roda `/model` sem args.

As variantes de janela 1M (`sonnet[1m]`, `opus[1m]`) só aparecem se o seu plano dá acesso — Max/Team/Enterprise inclusos, Pro/API pagam usage extra.

Os **IDs canônicos** (`claude-opus-4-7`, `claude-sonnet-4-6`) **não aparecem no seletor** em nenhum plano. Pra fixar um ID específico, vai pelo `--model <id>` na CLI, pela env `ANTHROPIC_MODEL`, ou pelo campo `model` no `settings.json`.

## Quando uso

- **Comecei com modelo errado pra task** — `/model opus` na hora que percebo que a task pediu mais músculo. Não perco o setup que já fiz com o Sonnet.
- **Task simples virou complexa** — bug que parecia óbvio escala pra investigação cruzando arquivos. Subir pra Opus a partir daquele turno custa bem menos que descartar tudo e abrir sessão nova.
- **Trecho trivial dentro de sessão Opus** — quando vou só renomear variável ou rodar comando repetitivo, `/model sonnet` durante o trecho. Volto pro Opus quando o trabalho pesado retoma.
- **`opusplan` em sessão de plan-heavy** — Opus durante o `/plan`, Sonnet na execução. Bom default quando a sessão alterna planejamento e execução.

## Quando *não* uso

- **Task curta de cabo a rabo** — se já sei o modelo certo ao abrir, prefiro `claude --model opus` na CLI. Não dependo de lembrar de trocar.
- **"Vou testar se o outro modelo é melhor"** — virou hábito ruim. Decide upfront pelo que a task pede, não fica alternando esperando que o problema se resolva sozinho.
- **Default permanente do projeto** — vai pro `model` no `.claude/settings.json`. Carrega sozinho toda sessão.
- **Sessão já longa com muitas trocas** — em algum ponto o ruído de "qual modelo respondeu o quê" supera o ganho. Reabro limpo.

## O pitfall

Trocar modelo **invalida o cache de prompt na próxima resposta**. O novo modelo precisa relê o histórico inteiro sem hit no cache, e isso aparece na conta. O próprio CLI hoje pede confirmação antes da troca quando já tem output prévio na sessão — exatamente por isso.

Em sessão curta, irrelevante. Em sessão de duas horas com 50k tokens de contexto, é uma releitura cara. Decisão prática: troco quando o ganho de capacidade compensa um turno mais lento e mais caro. Pra trocas frequentes em sessão longa, é sinal de que devia ter aberto sessão nova.

## `/model` vs settings.json vs `--model`

Os três fazem coisas parecidas em momentos diferentes:

- `/model` — durante a sessão, ad-hoc, quando você percebe no meio
- `model` no `settings.json` — default ao abrir o CLI naquele projeto
- `--model <alias>` — flag de startup, sessão única, sem persistir

Uso o settings pra projeto que tem perfil claro (sempre Opus pro repo crítico, sempre Sonnet pro de tooling). Uso `--model` quando sei exatamente o que aquela sessão é. Uso `/model` quando a sessão me surpreende.

## Resumindo

`/model` é pra sessão que mudou de cara no meio. Use o seletor quando perceber a fricção, ajuste settings quando o padrão se repetir — e prefira sessão nova quando estiver alternando demais.

## Fontes

- [Slash commands — Claude Code Docs](https://code.claude.com/docs/en/slash-commands)
- [Model configuration — Claude Code Docs](https://code.claude.com/docs/en/model-config)
- [CLI reference (`--model`)](https://code.claude.com/docs/en/cli-reference)
