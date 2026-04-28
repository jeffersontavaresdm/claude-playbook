---
title: "/add-dir: trabalhando com múltiplos diretórios na mesma sessão"
description: "O slash command que expande o escopo do Claude Code sem reiniciar. Quando vale, quando atrapalha."
date: 2026-04-27
category: comando
tags: [claude-code, slash-command]
---

`/add-dir <path>` adiciona um diretório externo ao escopo de leitura e edição da **sessão atual** do Claude Code — sem reiniciar. Aceita caminhos relativos, absolutos e `~/`. "Sessão" é literal: vale enquanto a conversa estiver aberta. Encerrou, perdeu.

Aqui está como decido, na prática.

## Quando uso `/add-dir`

- **Monorepo: mexendo num app, preciso ler um pacote shared** — `/add-dir ../../packages/shared` e o Claude já consegue ajustar os dois lados num turno só.
- **Microservices que precisam mudar juntos** — `/add-dir ../auth-service` evita 3 sessões separadas pra refatorar uma coisa que cruza serviços.
- **Código + documentação em outro repo** — `/add-dir ~/docs/produto` pra atualizar a doc na mesma leva da mudança de API. Antes eu sempre esquecia de voltar.
- **Descobri no meio da sessão que precisava de mais um dir** — o trunfo do `/add-dir` em vez de reabrir o Claude Code: não perde o contexto já construído.

## Quando *não* uso

- **Acesso permanente nesse projeto** — vai pra `additionalDirectories` no `.claude/settings.json`. Carrega sozinho toda sessão; não preciso lembrar do comando.
- **Já sei os dirs ao abrir o Claude Code** — uso `--add-dir` na CLI direto: `claude --add-dir ../shared --add-dir ../api`.
- **Trabalho 100% isolado em outro dir** — `cd && claude` numa sessão nova é mais limpo.
- **Precisava da config `.claude/` do outro projeto** — `/add-dir` **ignora** quase tudo: hooks, subagents, output styles, e até o `CLAUDE.md` (a menos que `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`). Só `.claude/skills/` carrega de verdade.

## O pitfall que me pegou uma vez

Hooks com paths relativos (`./scripts/build.sh`) resolvem do `cwd` original — não do dir adicionado. Tive um hook silenciosamente quebrado por dias antes de descobrir. Hoje, qualquer hook que precise rodar cross-dir usa caminho absoluto ou variável de ambiente.

## Resumindo

`/add-dir` é descoberta ad-hoc; `additionalDirectories` é persistência; `--add-dir` na CLI é conhecimento prévio. Use o slash command quando perceber, no meio da sessão, que precisa de um dir a mais — e reabra o Claude se for trabalho isolado de verdade.

## Fontes

- [Slash commands reference](https://code.claude.com/docs/en/commands)
- [CLI reference (`--add-dir`)](https://code.claude.com/docs/en/cli-reference)
- [Permissions and working directories](https://code.claude.com/docs/en/permissions)
