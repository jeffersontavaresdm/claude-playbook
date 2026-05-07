---
title: "Hooks que economizam tempo (e os que aprendi a remover)"
description: "Três hooks que rodo em todos os projetos com Claude Code, mais dois que parecem boa ideia mas viram ruído. O que automatizar e o que deixar manual."
date: 2026-04-22
category: pratica
tags: [claude-code, hooks, automação, settings]
---

Hooks no Claude Code são gatilhos que rodam em eventos específicos (`PostToolUse`, `Stop`, etc.) e executam um comando shell. Em teoria, automatizam tudo. Na prática, é fácil cair no anti-padrão de "automatizar coisa que era melhor manual".

Aqui está minha curadoria depois de seis meses ajustando.

## Os 3 que eu mantenho

### 1. Auto-format depois de editar

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "ktlint -F $CLAUDE_FILE_PATHS 2>/dev/null || true" }
        ]
      }
    ]
  }
}
```

Por quê: o modelo erra indentação ocasionalmente. Format on edit elimina o ruído sem custo. O `|| true` evita falha em arquivos não-Kotlin (markdown, json, configs) que o ktlint não processa.

### 2. Notificação quando termina

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": "notify-send 'Claude' 'Pronto.' " }] }
    ]
  }
}
```

Por quê: deixo tarefas longas rodando e volto. Sem notificação, ou eu fico vigiando (perda de foco) ou descubro tarde (perda de tempo).

### 3. Lint silencioso depois de edits

```json
{
  "matcher": "Edit|Write",
  "hooks": [
    { "type": "command", "command": "./gradlew compileKotlin 2>&1 | tail -5" }
  ]
}
```

Por quê: erros de tipo aparecem na hora pra mim e pro modelo. Em vez de descobrir no build final que algo quebrou três arquivos atrás, o feedback é imediato.

## Os 2 que removi

### Auto-commit a cada edit

Parece organizado. Na prática, polui o histórico com 50 commits "wip" por sessão. **Commit ainda é decisão humana** — não dá pra delegar sem perder a granularidade certa.

### Push automático no `Stop`

Já fiz isso. Errei. Push para `main` sem revisão é o tipo de coisa que parece útil até o dia que não é. Hoje, push é sempre comando explícito.

## A heurística

Antes de adicionar um hook, pergunto:

1. Esse passo sempre acontece, sem exceção?
2. Se errar, o custo de desfazer é baixo?

Se as duas respostas forem **sim**, automatize. Se qualquer uma for **não**, deixe manual — o atrito que parece desperdício é, na verdade, ponto de decisão.

## Bônus: debug

Quando um hook não dispara, rodo `claude --debug` e procuro por `hook:`. Costuma ser:

- Matcher errado (`Bash` vs `Bash:.*`)
- Comando que retorna stderr e o Claude trata como erro silencioso

Mantenha simples e revise mensalmente.
