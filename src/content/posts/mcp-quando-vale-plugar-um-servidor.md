---
title: "MCP: quando vale plugar um servidor no Claude Code"
description: "MCP conecta o Claude Code direto ao GitHub, ao Sentry, a um banco. Mas conectar tudo que existe é armadilha — quando o servidor compensa e quando um curl resolve."
date: 2026-06-06
category: comando
tags: [claude-code, slash-command, mcp]
---

Toda vez que eu colava o mesmo stack trace do Sentry no chat, ou descrevia de novo o schema de uma tabela, dava pra sentir o desperdício. MCP é a forma de o Claude Code falar direto com essas ferramentas — sem eu virar o cano de dados no meio do caminho.

Mas conectar tudo que existe é cair numa outra armadilha. MCP vale quando o dado é vivo e recorrente. Fora disso, ele pesa mais do que ajuda.

## O que é

MCP (Model Context Protocol) é um padrão aberto pra conectar o Claude a ferramentas e fontes externas — GitHub, Sentry, um banco, o Figma. Pense num plugue universal: cada servidor MCP expõe três coisas pro Claude.

- **tools** — ações que ele pode executar (abrir PR, rodar query, tirar screenshot)
- **resources** — dados que ele pode ler e você referencia com `@`
- **prompts** — comandos prontos que aparecem no menu de `/`

Dentro da sessão, `/mcp` lista os servidores conectados, mostra o status de cada um e resolve a autenticação (OAuth abre o navegador, o token fica no keychain).

Adicionar é uma linha:

```bash
# servidor remoto (HTTP)
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# servidor local (stdio, roda como processo na sua máquina)
claude mcp add playwright -- npx -y @playwright/mcp@latest
```

E tem três **escopos**, que é onde mora a decisão de time:

- **local** (padrão) — só você, só neste projeto. Fica no seu `~/.claude.json`.
- **project** — vai pro `.mcp.json` na raiz do repo, versionado. O time todo herda. Na primeira vez o Claude pede aprovação antes de rodar — por segurança.
- **user** — só você, em todos os projetos.

## Quando uso

- **O dado é vivo e eu consulto várias vezes.** Issues do GitHub, erros do Sentry, schema de um banco que muda. Colar uma vez é ok; colar toda hora é sintoma de que falta um servidor.
- **Quero que o Claude aja no sistema, não só leia.** Abrir PR, criar issue, rodar uma query — ida e volta, não só leitura.
- **Existe servidor oficial.** GitHub, Sentry, Playwright. Prefiro o oficial à fork da comunidade: é código de terceiro rodando com o meu token.

## Quando *não* uso

- **Documentação estática.** Web search ou colar o trecho resolve, sem custo de contexto.
- **Chamada única a uma API.** `curl` no Bash é mais simples e não infla a sessão.
- **Script meu, pessoal.** Vira uma [skill](/claude-playbook/artigos/skills-vs-slash-commands-quando-cada-um) — mais flexível, sem overhead de protocolo.
- **Dado pequeno, uma vez.** Colar no chat e seguir.

## O pitfall

Cada servidor conectado tem custo, e demorei a enxergar isso. As definições de tool ocupam contexto, e cada servidor é uma superfície de confiança — um servidor malicioso pode devolver dado com instrução escondida (prompt injection) e influenciar o Claude. Nos modelos novos o tool search adia o carregamento: só os nomes das tools entram no contexto, e o schema completo só é puxado quando o Claude precisa. Ajuda, mas não zera o risco.

A regra de ouro continua sendo trust: conecte só o que você confia, e nunca comite token estático no `.mcp.json` de um repo público.

## Resumindo

MCP é pra dado vivo e recorrente que você quer que o Claude leia ou manipule direto. Se é estático, único ou cabe num `curl`, a sessão fica mais leve sem ele.

## Fontes

- [MCP quickstart — Claude Code Docs](https://code.claude.com/docs/en/mcp-quickstart)
- [MCP (referência completa) — Claude Code Docs](https://code.claude.com/docs/en/mcp)
- [Architecture overview — Model Context Protocol](https://modelcontextprotocol.io/docs/learn/architecture)
- [Servidores de referência oficiais — modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
