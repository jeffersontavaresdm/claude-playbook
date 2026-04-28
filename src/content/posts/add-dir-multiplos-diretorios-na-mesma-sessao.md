---
title: "/add-dir: trabalhando com múltiplos diretórios na mesma sessão"
description: "O slash command que expande o escopo do Claude Code sem reiniciar. Quando vale, quando atrapalha, e por que ele não é o mesmo que additionalDirectories."
date: 2026-04-27
tags: [claude-code, slash-command, add-dir]
draft: false
---

Comecei o Claude Code em `apps/web`. Dez minutos depois, percebi que precisava ler também o `packages/shared` — porque a função que eu estava ajustando consumia tipos definidos lá.

Antigamente, duas opções chatas: encerrar a sessão e reabrir em `packages/shared` (perdendo todo contexto), ou colar arquivos no prompt à mão. `/add-dir` resolve isso em uma linha.

## O que é

`/add-dir <path>` adiciona um diretório externo ao escopo de leitura e edição da **sessão atual** — sem reiniciar o Claude Code.

"Sessão" é literal: vale enquanto a conversa estiver aberta. Encerrou, perdeu.

## Sintaxe

```bash
# Slash command (dentro da sessão)
/add-dir <path>

# CLI flag (ao iniciar)
claude --add-dir <path>
claude --add-dir ../service-a --add-dir ../service-b
```

Aceita caminhos relativos (`../sibling`), absolutos (`/home/user/x`), `~/`, symlinks e caminhos com espaços (entre aspas). Múltiplos diretórios = executar o comando várias vezes.

Não aceita globs (`../*`), argumento vazio, ou diretório inexistente.

## 3 cenários onde uso de verdade

**Monorepo: app + pacote compartilhado.** Trabalhando em `apps/web`, descubro que preciso adicionar um campo no schema definido em `packages/shared`:

```
/add-dir ../../packages/shared
```

Posso pedir: *"adiciona o campo `phone` no schema de `User` em shared, e ajusta o form em web"*. Claude faz os dois lados num turno só.

**Microservices que precisam mudar juntos.** Estou em `user-service` mas a refatoração toca `auth-service` e `api-gateway`:

```
/add-dir ../auth-service
/add-dir ../api-gateway
```

Mudança que viraria 3 sessões separadas (ou 3 PRs descoordenados) cabe em uma só. Claude entende as conexões e ajusta tipos compartilhados sem eu precisar lembrar.

**Código + documentação em outro repo.** Documentação técnica vive em `~/docs/produto`:

```
/add-dir ~/docs/produto
```

Quando faço uma mudança de API, peço pro Claude atualizar a doc na mesma leva. Antes eu sempre esquecia — e a doc envelhecia.

## Quando NÃO usar — pitfalls reais

**Não persiste entre sessões.** Se fechar e rodar `--continue`, os dirs adicionados desaparecem. Se o cenário é permanente (o monorepo *sempre* precisa do `shared`), use `additionalDirectories` no `.claude/settings.json`:

```json
{
  "additionalDirectories": ["../../packages/shared"]
}
```

Carrega automaticamente toda sessão.

**Configuração `.claude/` do dir adicionado *não* carrega (na maioria).** Se o dir tem `CLAUDE.md`, hooks, ou subagents próprios, eles são **ignorados** — Claude Code só herda a config do dir onde a sessão começou. Exceções: `.claude/skills/` (com live reload), `CLAUDE.md` se a env var `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` estiver setada, e plugin settings. Se você precisa **toda a config** do outro projeto, melhor reabrir nele.

**Hooks com paths relativos quebram.** Hook que usa `./scripts/build.sh` resolve do `cwd` original — não do dir adicionado. Use paths absolutos em hooks que precisam funcionar cross-dir.

**Permissões não escalonam automaticamente.** Adicionar um dir dá leitura. Edição ainda passa pelas regras de permissão. Não é atalho pra contornar permissão — é atalho pra economizar `cd`.

## `/add-dir` vs alternativas

| Cenário | Use |
|---|---|
| Acesso permanente nesse projeto | `additionalDirectories` no `settings.json` |
| Já sabe os dirs ao abrir o Claude Code | `--add-dir` na CLI |
| Descobriu no meio da sessão que precisa de mais um dir | `/add-dir` (slash command) |
| Trabalho 100% isolado em outro dir | `cd && claude` (sessão nova) |

Regra mental: **persistência → settings; conhecimento prévio → CLI flag; descoberta ad-hoc → slash command.**

## Comandos relacionados

- **`additionalDirectories`** em `.claude/settings.json` — versão persistente
- **`--add-dir`** flag na CLI — versão de inicialização
- **`/permissions`** — gerencia o que cada dir pode editar
- **`--continue` / `--resume`** — desde a v2.1.117, sessões resumidas reconhecem o `cwd` como dir adicionado anteriormente

Hoje meu padrão é abrir o Claude Code no diretório **mais focado possível** (`apps/web`, não no root) e adicionar dirs com `/add-dir` quando precisar. Sessões mais leves, contexto enxuto, mas com a flexibilidade de atravessar fronteiras quando o trabalho pede.

## Fontes

- [Slash commands reference (Claude Code Docs)](https://code.claude.com/docs/en/commands)
- [CLI reference (Claude Code Docs)](https://code.claude.com/docs/en/cli-reference)
- [Permissions and working directories](https://code.claude.com/docs/en/permissions)
- [Skills — live reload em diretórios adicionados](https://code.claude.com/docs/en/skills)
- [Changelog — v2.1.81 (intro) e v2.1.117 (continue/resume)](https://code.claude.com/docs/en/changelog)
