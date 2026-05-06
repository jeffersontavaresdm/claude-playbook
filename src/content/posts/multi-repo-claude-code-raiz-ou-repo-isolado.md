---
title: "Multi-repo no Claude Code: abrir num repo só ou na raiz do workspace?"
description: "Trabalho que cruza 3-5 repositórios o tempo todo me obrigou a escolher entre abrir o Claude Code dentro de um repo (e usar /add-dir nas exceções) ou na raiz que contém todos. Aqui estão as 5 diferenças que pesaram."
date: 2026-05-06
category: pratica
tags: [claude-code, fluxo, claude-md]
---

Stack distribuída tem um padrão chato: uma feature pequena toca 3, 4, 5 repositórios. Um evento sai de `service-A`, é consumido por `service-B`, atualiza `service-C` e dispara um job em `service-D`. Pra arrumar um bug, você precisa ler tudo isso junto.

Eu venho dessa rotina há um tempo. Demorei pra perceber que a decisão de **onde abrir o Claude Code** mudava mais do trabalho do que qualquer prompt ou hook que eu configurasse depois.

## O problema

Comecei abrindo o Claude Code dentro do repo da vez. Sempre que precisava ler outro, [`/add-dir`](/claude-playbook/artigos/add-dir-multiplos-diretorios-na-mesma-sessao) — mais um, e mais um, e mais um. Virou ritual diário. E pior: meus slash commands custom só funcionavam no repo onde a sessão tinha começado, então eu vivia colando os mesmos prompts à mão nos outros.

Testei a alternativa: abrir o Claude Code **na raiz do workspace** que contém todos os repos. Em ~3 dias parou de doer. Vou listar o que mudou, na ordem que senti.

## 1. Carregamento de CLAUDE.md em cascata

Esse é o mais importante. O Claude Code [percorre os ancestrais do `cwd`](https://code.claude.com/docs/en/claude-md) carregando `CLAUDE.md` de cada um, do root até o `cwd`, **concatenando** o conteúdo.

Pra subdiretórios o carregamento é diferente: é **lazy**. O `CLAUDE.md` de uma subpasta só entra no contexto quando o Claude lê algum arquivo lá dentro.

Implicação prática:

- **Abrir num repo só:** carrega o `CLAUDE.md` daquele repo + dos ancestrais. O `CLAUDE.md` dos repos vizinhos nunca entra, mesmo via `/add-dir` (ele ignora `CLAUDE.md` por padrão — só carrega se você setar `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`).
- **Abrir na raiz do workspace:** carrega o `CLAUDE.md` da raiz na hora; o de cada repo entra automaticamente conforme você toca arquivos lá.

Isso virou desbloqueio: regras universais (padrão de commit, política de PR, fluxo de release) num `CLAUDE.md` na raiz; regras locais (stack, convenções, paths) no `CLAUDE.md` de cada repo. Sem duplicação, sem drift.

## 2. Escopo de skills e slash commands

Skills (`.claude/skills/`) e slash commands custom (`.claude/commands/`) têm regras parecidas mas não idênticas. O resumo do que importa:

- Skills da raiz da sessão são carregadas no início; skills de subdiretórios são [auto-descobertas sob demanda](https://code.claude.com/docs/en/skills) quando o Claude trabalha em arquivos daquela subpasta.
- Skills via `/add-dir` carregam (com live reload).
- `.claude/commands/` da raiz carregam; **commands de subdiretórios não auto-carregam** com a mesma certeza que skills (no meu teste, quem auto-discoverer é o sistema de skills; a doc não detalha o mesmo comportamento pra commands legados).
- Skills/commands em `~/.claude/` valem globalmente, independentemente de onde a sessão começou.

Tradução: se sua bateria de comandos vive em `~/.claude/`, dá no mesmo. Se vive em `.claude/` por repo, abrir na raiz do workspace deixa **todos os comandos disponíveis em qualquer turno**.

## 3. `/add-dir` é tool de exceção, não de fluxo

Eu já tinha escrito sobre `/add-dir` antes, mas só fui sentir o limite quando ele virou meu ritual.

`/add-dir` é session-scoped (some quando a sessão fecha), **não carrega CLAUDE.md** do dir adicionado por padrão, **não carrega commands**, **não carrega hooks**, e os hooks que existem podem [resolver paths relativos errado](https://code.claude.com/docs/en/permissions) — porque o `cwd` não muda.

Isso resolve "preciso ver uma coisa específica fora do meu escopo normal". Não resolve "trabalho cruza repos toda hora". Se você está digitando `/add-dir` mais de duas vezes por sessão, é sinal pra mudar de raiz.

> Se você só precisa de acesso pontual a outro diretório, `/add-dir` resolve — esse post compara o **setup base**, não o uso pontual.

## 4. Análise cross-repo

Comandos do tipo "rastreia esse evento entre o producer e os consumers" ou "lista todos os lugares que chamam esse endpoint" só funcionam se o Claude tem acesso a tudo. Abrir num repo só limita visibilidade — análise fica parcial e o modelo às vezes nem percebe que está cega.

Abrir na raiz permite `grep` amplo e busca por arquivo cobrindo todos os repos. Pra debug em sistemas distribuídos, isso muda completamente a qualidade da resposta.

## 5. Performance / contexto

A preocupação razoável: workspace com muitos repos = mais código indexado.

Na prática, o Claude lê **sob demanda** via grep/glob, não pré-indexa tudo no contexto. O custo extra existe (a busca varre mais arquivos), mas só vira dor real em monorepos gigantes — centenas de milhares de arquivos.

Pra um workspace típico de 5-10 repos de tamanho normal, não senti diferença.

## Quando cada um faz sentido

- **Trabalho >80% num repo só** → abre nele. Cascade de ancestrais ainda te dá o `CLAUDE.md` da raiz.
- **Trabalho cruza repos com frequência** → abre na raiz do workspace.
- **Caso intermediário (cruzamento ocasional)** → mantém a sessão no repo principal e usa `/add-dir` quando o assunto sobe.

## Como organizei meu CLAUDE.md

```
workspace/
├── CLAUDE.md                ← regras universais (commit, fluxo, PR)
├── service-a/
│   ├── CLAUDE.md            ← stack, convenções locais, paths
│   └── ...
├── service-b/
│   ├── CLAUDE.md
│   └── ...
└── service-c/
    ├── CLAUDE.md
    └── ...
```

A regra de hierarquia é simples: o CLAUDE.md específico **complementa** o universal (a doc descreve concatenação, não override). Quando há conflito real, escrevo a regra específica como "no repo X, ignore a regra universal de Y porque Z" — explícito é melhor que implícito.

## Resumindo

Troquei pra abrir na raiz do workspace e foi melhor. Cascade do CLAUDE.md fez o trabalho dobrado de manter regras virar "escreva uma vez no lugar certo". Comandos compartilhados pararam de ser drama. `/add-dir` virou exceção honesta — pra quando preciso espiar fora do workspace, não pra cruzar repos que eu já sabia que ia cruzar.

Se você ainda está usando `/add-dir` como fluxo, vale testar uma semana com a sessão na raiz. Eu não voltei.

## Fontes

- [Memory & CLAUDE.md (cascade, ancestrais, lazy load)](https://code.claude.com/docs/en/claude-md)
- [Skills (auto-descoberta, additional directories)](https://code.claude.com/docs/en/skills)
- [Permissions & working directories (`/add-dir`, escopo)](https://code.claude.com/docs/en/permissions)
- [Slash commands reference](https://code.claude.com/docs/en/commands)
