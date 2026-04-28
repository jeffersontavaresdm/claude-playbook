---
title: "/add-dir: trabalhando com múltiplos diretórios na mesma sessão"
description: "O slash command que expande o escopo do Claude Code sem reiniciar. Quando vale, quando atrapalha, e por que ele não é o mesmo que additionalDirectories."
date: 2026-04-27
tags: [claude-code, slash-command, add-dir]
draft: false
---

Comecei o Claude Code em `apps/web`. Dez minutos depois, percebi que precisava ler também o `packages/shared` — porque a função que eu estava ajustando consumia tipos definidos lá.

Antigamente eu tinha duas opções, ambas chatas:

1. Encerrar a sessão, fazer `cd ../../packages/shared`, abrir de novo. Perdi todo o contexto construído até ali.
2. Colar o conteúdo dos arquivos no prompt. Funciona pra um arquivo. Não funciona pra entender uma estrutura inteira.

`/add-dir` resolve isso em uma linha.

## O que é

`/add-dir <path>` é um slash command **de sessão** do Claude Code. Ele adiciona um diretório externo ao escopo de leitura e edição da conversa atual — sem reiniciar.

"Sessão" significa exatamente o que parece: vale enquanto a conversa estiver aberta. Encerrou, perdeu.

## Para que serve

Resolve o problema de **trabalho que cruza fronteiras de diretório dentro de uma sessão única**. Os casos típicos:

- Monorepo onde você está num app mas precisa tocar em pacotes compartilhados
- Microservices em diretórios irmãos que precisam mudar juntos
- Projeto principal + documentação que vive em outro repositório
- Git worktrees apontando pra branches diferentes que dividem código comum

## Sintaxe

```bash
# Slash command (dentro da sessão)
/add-dir <path>

# CLI flag (ao iniciar)
claude --add-dir <path>
claude --add-dir ../service-a --add-dir ../service-b
```

Aceita:

- Caminhos relativos: `../sibling`, `./subfolder`
- Caminhos absolutos: `/home/user/project`, `~/shared/libs`
- Symlinks (resolve para o alvo)
- Caminhos com espaços (entre aspas)
- Múltiplos diretórios: execute o comando várias vezes

Não aceita:

- Globs ou wildcards (`../*`)
- Argumento vazio — retorna erro
- Diretório inexistente — rejeita na hora

## 3 cenários onde uso de verdade

### 1. Monorepo: app + pacote compartilhado

Trabalhando em `apps/web`, descobri que preciso adicionar um campo no schema definido em `packages/shared`:

```bash
cd /monorepo/apps/web
claude
```

```
/add-dir ../../packages/shared
```

Agora o Claude lê e edita os dois lados na mesma conversa. Posso pedir: *"adiciona o campo `phone` no schema de `User` em shared, e ajusta o form em web pra usar"*. Ele faz tudo num turno só.

### 2. Microservices que precisam mudar juntos

Estou em `user-service` mas a mudança envolve `auth-service` e `api-gateway` também:

```
/add-dir ../auth-service
/add-dir ../api-gateway
```

Refatoração que tocaria 3 PRs separados (ou 3 sessões separadas) vira uma só. Bônus: o Claude sabe pelo contexto que os três se conversam, então ajusta tipos compartilhados sem eu precisar lembrar.

### 3. Código + documentação em outro repo

Documentação técnica do produto vive em `~/docs/produto`, fora do repo de código:

```
/add-dir ~/docs/produto
```

Quando faço uma mudança de API, peço pro Claude atualizar a doc na mesma leva. Antes, eu sempre esquecia de voltar pra atualizar — e a doc envelhecia.

## Walkthrough passo a passo

Cenário concreto: adicionar autenticação JWT num monorepo.

**Estado inicial:** `cd apps/web && claude`. Sessão começa só enxergando `apps/web/`.

**Passo 1 — descobrir o que precisa mudar:**

```
me mostre a estrutura do app web e onde a autenticação atual entra
```

Claude lê `apps/web`, identifica `src/auth/`. Importante: ele ainda **não** vê `packages/shared` nem `services/auth-api`.

**Passo 2 — ampliar escopo:**

```
/add-dir ../../packages/shared
/add-dir ../../services/auth-api
```

Claude confirma cada adição. Agora os 3 diretórios estão visíveis.

**Passo 3 — pedir o trabalho cruzado:**

```
preciso adicionar JWT.
- tipos vão em packages/shared/auth
- endpoint /token vai em services/auth-api
- consumo vai em apps/web/src/auth
faça os 3 lados de forma consistente.
```

Claude trabalha nos 3, conhecendo as conexões.

**Passo 4 — verificar:**

```
rode os testes dos 3 pacotes
```

Testes rodam, ajustes acontecem, commit. Tudo numa sessão.

Sem `/add-dir`, isso seria 3 sessões com 3 contextos perdidos no meio.

## Quando NÃO usar — os pitfalls reais

### `/add-dir` não persiste entre sessões

Se você fecha o Claude Code e roda `--continue` depois, **os diretórios adicionados desaparecem**. Tem que adicionar de novo.

Se o cenário é permanente (ex: o monorepo sempre precisa de `shared`), use `additionalDirectories` no `.claude/settings.json` em vez do comando ad-hoc:

```json
{
  "additionalDirectories": ["../../packages/shared"]
}
```

Carrega automaticamente toda sessão, sem precisar lembrar do `/add-dir`.

### Configuração `.claude/` do dir adicionado **não** carrega (na maioria)

Esse é o pitfall mais traiçoeiro. Se eu adiciono um diretório que tem o próprio `CLAUDE.md`, hooks ou subagents, **a maioria deles é ignorada**. O Claude Code só herda a config do diretório onde a sessão começou.

Exceções (essas carregam mesmo vindo de dir adicionado):

- `.claude/skills/` — com live reload
- `CLAUDE.md` — apenas se a env var `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` estiver setada
- Plugin settings em `.claude/settings.json`

Tudo o resto (hooks, agents customizados, output styles) fica vinculado ao dir original.

Se você precisa **toda a config** de outro projeto, é melhor reabrir o Claude lá do que adicionar.

### Hooks com paths relativos quebram

Se algum hook usa caminho relativo (`./scripts/build.sh`), ele resolve do `cwd` original — não do dir adicionado. Pode falhar silenciosamente quando o trabalho está acontecendo do "outro lado".

Ajuste: use paths absolutos ou variáveis de ambiente nos hooks que precisam funcionar cross-dir.

### Permissões **não** escalonam automaticamente

Adicionar um dir dá acesso de leitura. **Edição ainda passa pelas regras de permissão** (`allow` rules no settings ou prompts da UI). Não é atalho pra contornar permissão — é atalho pra economizar `cd`.

## `/add-dir` vs alternativas — matriz rápida

| Cenário | Use |
|---|---|
| Acesso permanente, sempre que abrir esse projeto | `additionalDirectories` no `settings.json` |
| Já sabe os dirs ao abrir o Claude Code | `--add-dir` na CLI |
| Descobriu no meio da sessão que precisa de mais um dir | `/add-dir` (slash command) |
| Trabalho 100% isolado em outro dir, sem contexto compartilhado | `cd && claude` (sessão nova) |

A regra mental: **persistência → settings; conhecimento prévio → CLI flag; descoberta ad-hoc → slash command.**

## Comandos e configurações relacionados

- **`additionalDirectories`** em `.claude/settings.json` — versão persistente
- **`--add-dir`** flag na CLI — versão de inicialização (`claude --add-dir ../shared`)
- **`/permissions`** — gerencia o que cada dir pode editar
- **`/clear`** — não remove dirs adicionados (apenas limpa contexto da conversa)
- **`--continue` / `--resume`** — desde a v2.1.117, sessões resumidas reconhecem o `cwd` como dir que foi adicionado em sessão anterior

## O que isso mudou na minha decisão diária

Antes de `/add-dir` (introduzido na v2.1.81, em março/2026), monorepo no Claude Code era exercício de paciência: ou você abria no root e enchia o contexto, ou abria num app e perdia visibilidade do resto.

Hoje meu padrão é:

- Abrir o Claude no diretório **mais focado possível** (`apps/web`, não no root)
- Deixar o contexto inicial enxuto
- Quando precisar de mais um dir, `/add-dir`

Resultado: sessões mais leves, contexto que não infla à toa, e ainda assim a flexibilidade pra atravessar fronteiras quando o trabalho pede.

`/add-dir` não é uma feature glamourosa, mas é uma das que eu mais uso em projetos reais.

## Fontes

- [Slash commands reference (Claude Code Docs)](https://code.claude.com/docs/en/commands)
- [CLI reference (Claude Code Docs)](https://code.claude.com/docs/en/cli-reference)
- [Permissions and working directories](https://code.claude.com/docs/en/permissions)
- [Skills — live reload em diretórios adicionados](https://code.claude.com/docs/en/skills)
- [Changelog — v2.1.81 (intro) e v2.1.117 (continue/resume)](https://code.claude.com/docs/en/changelog)
