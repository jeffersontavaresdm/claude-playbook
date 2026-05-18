---
title: "O que do .claude/ vai pro git (e o que não vai)"
description: "Setup mínimo de .gitignore pra um projeto que usa Claude Code: o que compartilhar com o time, o que manter local, e o que nunca deveria sair do seu disco."
date: 2026-05-17
category: setup
tags: [settings, claude-code]
---

A primeira vez que rodei o Claude Code num repo do time, a pasta `.claude/` apareceu cheia de coisa. Skills, agents, settings, um `settings.local.json` que eu não tinha criado. A pergunta óbvia: **comito tudo? nada? só uma parte?**

A resposta certa importa. Comitar demais vaza token do seu shell, paths absolutos com seu user, e configurações pessoais que não fazem sentido pro resto do time. Comitar de menos esconde do time as automações que fazem o Claude trabalhar bem naquele repo.

## O mínimo viável

Coloca isso no `.gitignore` da raiz do projeto:

```gitignore
# Claude Code — local apenas
.claude/settings.local.json
.claude.local.md

# Logs e estado transitório
.claude/logs/
.claude/cache/
```

Pronto. O resto de `.claude/` **vai pro git**.

## Por que esse corte

O `.claude/` mistura duas coisas que parecem iguais mas têm dono diferente:

- **Coisas do projeto** — automações, comandos, regras. Pertencem ao repo. Todo mundo que clonar tem que ter.
- **Coisas suas** — overrides locais, memória pessoal, tokens que você plugou pra testar. Pertencem ao seu disco.

A pegadinha é que os dois grupos moram no mesmo diretório.

## O que comitar

| Arquivo / pasta | O que é |
|---|---|
| `.claude/settings.json` | Permissões, hooks, MCPs do projeto |
| `.claude/commands/` | Slash commands customizados (`/post`, `/review`, etc.) |
| `.claude/agents/` | Subagents definidos pro time |
| `.claude/skills/` | Skills compartilhadas |
| `CLAUDE.md` | Memória do projeto |

Tudo isso responde "como esse projeto quer ser tratado pelo Claude". Se você compartilha o repo, compartilha isso junto.

Se um colega clona o repo e o Claude **não** se comporta igual ao seu, alguma dessas coisas ficou de fora.

## O que NÃO comitar

| Arquivo | Por quê |
|---|---|
| `.claude/settings.local.json` | Override pessoal — seus testes, seus tokens, seus paths |
| `.claude.local.md` | Memória pessoal (alternativa local ao `CLAUDE.md`) |
| Logs, cache, snapshots de sessão | Estado transitório, não configuração |

`settings.local.json` é onde o Claude Code joga as suas permissões aprovadas (`"allow": ["Bash(pnpm:*)", ...]`). Útil pra você, ruído pro time.

## Onde mora a maior cilada

Em `settings.json` (esse, sim, comitado) é fácil escorregar e colocar coisa que não devia:

```json
{
  "env": {
    "OPENAI_API_KEY": "sk-..."        // ❌ não. nunca.
  },
  "hooks": {
    "Stop": [{
      "command": "/Users/jefferson/scripts/notify.sh"   // ❌ path pessoal
    }]
  }
}
```

Duas regras simples:

1. **Segredo nunca em `settings.json`.** Vai pra variável de ambiente do shell ou pra `settings.local.json` (que está no gitignore). Em hook, leia via `$VAR`, não escreva o valor.
2. **Path absoluto pessoal nunca em `settings.json`.** Se um hook precisa rodar um script, o script vai dentro do repo (`./.claude/scripts/notify.sh`) ou usa `~`/relativo.

A revisão de PR pega bug. Ela não pega `OPENAI_API_KEY` que você colou no JSON às 3 da manhã. Defenda-se na origem.

## Decisão prática

Quando você não souber em que coluna um arquivo cai, faz a pergunta:

> "Se um colega novo clonar o repo amanhã, ele **precisa** disso pra trabalhar?"

- **Sim** → comita.
- **Não, é coisa minha** → `.gitignore`.
- **Não, é segredo** → `.gitignore` **e** sai do disco se já vazou (`git rm --cached`, rotaciona o token, segue a vida).

O `.claude/` é como o `.vscode/`: dá pra compartilhar, dá pra deixar individual. A diferença é que aqui dentro mora código que **executa** (hooks, agents). Aí o cuidado dobra.

## Fontes

- [Claude Code — Settings](https://docs.claude.com/en/docs/claude-code/settings)
- [Claude Code — Memory & CLAUDE.md](https://docs.claude.com/en/docs/claude-code/memory)
- [Claude Code — Hooks](https://docs.claude.com/en/docs/claude-code/hooks)
- [Claude Code — Subagents](https://docs.claude.com/en/docs/claude-code/sub-agents)
