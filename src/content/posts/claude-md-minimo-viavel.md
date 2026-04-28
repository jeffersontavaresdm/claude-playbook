---
title: "Meu CLAUDE.md mínimo viável"
description: "O que documentar para o Claude trabalhar bem em qualquer projeto, sem encher de cerimônia. Um esqueleto que cabe em uma tela e cobre 80% dos casos."
date: 2026-04-25
category: setup
tags: [claude-code, claude-md, documentação, contexto]
---

Todo projeto que toco regularmente ganha um `CLAUDE.md`. Mas eu já caí na armadilha de escrever 500 linhas de "boas práticas" que ninguém lê — nem eu, nem o modelo. O resultado foi pior que não ter nada: o Claude lia, achava que sabia tudo, e ignorava o código real.

Hoje meu CLAUDE.md cabe em uma tela. Aqui está o esqueleto.

## A estrutura

```markdown
# <Nome do projeto>

<Uma frase explicando o que o projeto faz e para quem.>

## Stack

- Linguagem/framework principal
- Banco de dados
- Comando de teste, lint, build, dev

## Convenções específicas

- Padrão único que difere do óbvio (ex: "todos os endpoints retornam ISO 8601")
- Nada de regras genéricas como "use bons nomes"

## Atalhos

- `pnpm dev` — sobe local
- `pnpm test:watch` — testes em modo watch
- `make migrate` — aplica migrations
```

É isso. Quatro seções, no máximo 30 linhas.

## O que *não* entra

- **Padrões óbvios**: "use TypeScript", "siga ESLint". O modelo já vai inferir do código.
- **Histórico**: "antes a gente usava X mas migrou pra Y". Isso é git log, não documentação viva.
- **Wishlist**: "queremos adicionar testes E2E em algum momento". Não é estado atual; só ruído.
- **Estilo de prosa**: "seja claro e conciso". O modelo já tenta — repetir não muda nada.

## A regra do "atalhos"

A seção mais útil costuma ser **Atalhos**. Comandos que poupam o Claude de ficar inferindo (`pnpm test` ou `npm test`?). Custo de manter: zero. Benefício: o modelo acerta de primeira em 100% das vezes.

## Quando expando

Para repos com domínio complexo (financeiro, legal, multi-tenant), adiciono uma seção **Domínio** com:

- Glossário de termos não óbvios
- Invariantes que o código *precisa* respeitar mas não estão expressos no tipo

Mesmo assim: corte. Se um leitor humano não usaria a documentação, o modelo também não vai.

## O teste

A cada três sessões com Claude no projeto, abro o `CLAUDE.md` e pergunto: *qual linha aqui salvou tempo nas últimas sessões?* Se nenhuma, deleto a linha.

Mantém vivo, e mantém útil.
