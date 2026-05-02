---
title: "/schedule e routines: trabalho do Claude que roda sem você"
description: "O comando /schedule cria 'routines' — agendamentos que rodam na infra da Anthropic, 24/7, sem laptop ligado. Quando vale, quando atrapalha."
date: 2026-05-02T01:07:00-03:00
category: comando
tags: [claude-code, slash-command, automação]
---

Spoiler que vai te economizar 5 minutos de confusão: a feature se chama **routines**, mas o comando é **`/schedule`**. Eu também procurei `/routine` e não achei.

Resolvido isso: routines são tarefas do Claude Code que rodam **na infra da Anthropic** (cloud), sem precisar do seu laptop ligado e sem sessão aberta. É a peça que faltava entre `/loop` (que morre quando o terminal fecha) e Cron + VPS (que ninguém quer manter).

Lançou em **abril de 2026**, ainda em research preview.

## O que é, exatamente

Uma routine é uma **config salva** com:

- Um **prompt** (o que o Claude faz)
- Um ou mais **repos GitHub** (clonados a cada run)
- **Triggers** (schedule cron, GitHub webhook, ou API call)
- **Connectors MCP** opcionais (Slack, Linear, Drive, etc.)

Cada disparo cria uma **sessão isolada** que fica no histórico — você revisa, comenta, pode abrir PR.

Sintaxe básica:

```bash
/schedule daily at 9am, review open PRs and post blockers in Slack
/schedule list
/schedule update
/schedule run <nome>          # dispara imediatamente
```

Ou pelo web em `claude.ai/code/routines` se preferir formulário.

## Quando uso

- **Tarefa que tem que rodar sem mim** — triagem de alerta, daily scan de backlog, smoke test pós-deploy. `/loop` não serve porque exige sessão aberta; GitHub Actions serve mas é overkill quando o trabalho é "ler issues e escrever no Slack".
- **Disparada por evento externo** — webhook do GitHub (`pull_request.opened`), call do Sentry/Datadog. A routine vira um endpoint que faz "trabalho de Claude" em resposta.
- **Lembrete acionável com prazo** — "limpa essa feature flag em 2 semanas". Uma one-off run que se auto-desativa depois. Mais útil que post-it no Notion porque executa, não só lembra.
- **Trabalho noturno que cabe num prompt** — port de mudança pra SDK irmão, atualização de doc que ficou pra trás, sweep mensal de TODOs.

## Quando NÃO uso

- **Polling durante uma sessão ativa** — `/loop` é local, é mais barato, e dá pra interromper na hora.
- **Frequência abaixo de 1h** — o mínimo da routine é 1 hora. Quer rodar a cada 5 min? Não é o caminho.
- **Tarefa que precisa do meu repo local atual** — routine clona sempre da default branch, fresh. Se você está numa branch experimental e quer rodar algo nela, não dá.
- **Coisa que precisa de aprovação no meio** — routines rodam em modo autônomo. Sem `/permissions` interativo. Se o prompt for ambíguo, ela decide sozinha — e nem sempre da forma que você queria.
- **Tarefa simples que GitHub Actions já resolve melhor** — se o trabalho é "rodar testes e abrir PR de fix", workflow de Action é mais previsível e versionado em código. Routine ganha quando o trabalho é semântico (ler, classificar, escrever em linguagem natural).

## O pitfall que vale saber antes

**Tudo o que a routine faz aparece como você.** Commit, PR, mensagem no Slack, comentário no Linear — sai com sua identidade GitHub e suas contas linked. Não tem "claudebot" como proxy. Se a routine fizer alguma besteira em produção, é seu nome no `git blame` e seu avatar na thread.

Implicações que mudaram como configuro:

- **Connectors são all-or-nothing por padrão** — adicionou Slack? A routine pode ler e escrever em **qualquer canal** do workspace. Revisa antes de salvar.
- **Push só em `claude/*` por padrão** — pra empurrar pra outras branches precisa marcar "Allow unrestricted branch pushes". Mantenha desligado se não tiver certeza.
- **Prompt tem que ser explícito** — "limpa o backlog" não é instrução; "leia issues abertas há mais de 30 dias, marque com label `stale`, comente pedindo update e atribua ao reporter original" é.

Limites por plano (no momento da escrita): Pro = 5 runs/dia, Max = 15, Team/Enterprise = 25. One-off runs não contam no cap.

## Resumindo

`/schedule` cria routines — `/loop` que não morre quando seu PC desliga, com triggers de schedule, API ou GitHub webhook. Use quando o trabalho precisa acontecer sem você presente; pra qualquer coisa em sessão, fica no `/loop`.

A pegadinha não é técnica — é de identidade: tudo aparece como você. Configure connectors com a mesma cautela que daria a uma chave de API.

## Fontes

- [Automate work with routines — Claude Code Docs](https://code.claude.com/docs/en/routines)
- [Run prompts on a schedule — Claude Code Docs](https://code.claude.com/docs/en/scheduled-tasks)
- [Introducing routines in Claude Code — Anthropic](https://claude.com/blog/introducing-routines-in-claude-code)
- [Claude Code Routines: How to Run Scheduled AI Agents Without a Server — MindStudio](https://www.mindstudio.ai/blog/claude-code-routines-scheduled-agents)
