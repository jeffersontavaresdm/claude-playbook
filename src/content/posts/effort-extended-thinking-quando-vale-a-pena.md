---
title: "Effort no Claude: o que é extended thinking e quando vale a pena"
description: "Achei que aumentar effort fazia o modelo ficar 'mais inteligente'. Faz, mas com asterisco — custa tokens, tempo e dinheiro. Como funciona, quando ativar, quando deixar quieto."
date: 2026-05-05
category: fundamentos
tags: [fundamentos, claude-code]
---

Por um tempo eu achava que aumentar o effort fazia o modelo ficar "mais inteligente". Tipo um botão de "esforça mais" que você liga e a resposta sai melhor. Faz — mas com asterisco. E o asterisco é o que esse post quer explicar.

Antes de começar: **escolha de modelo (Opus vs Sonnet) é outro eixo, com outra decisão**. Cobri isso no [post anterior](/claude-playbook/artigos/opus-vs-sonnet-quando-cada-um-faz-sentido). Effort é independente disso — você pode rodar Sonnet com effort alto e Opus com effort baixo, e nenhuma das duas combinações é "errada".

## O que é extended thinking

Mecanismo onde o modelo gera **tokens internos de raciocínio** antes de responder. Você pede uma coisa, o modelo "pensa" em voz baixa por N tokens, e só então gera a resposta visível.

Esses tokens internos não fazem parte da resposta — em alguns modos você nem vê. Mas eles existem, são gerados, e **você paga por eles** como output tokens.

Pense num colega que, antes de responder uma pergunta difícil, rabisca num papel pra organizar o raciocínio. Ele pode te entregar só a resposta final, ou te mostrar os rabiscos. Em ambos os casos, ele gastou tempo (e cobra por isso).

## Como funciona, na prática

Há dois modos hoje:

- **Manual** (`type: "enabled"`, com `budget_tokens: N`): você define quantos tokens o modelo pode usar pensando. Modo legado, sendo descontinuado.
- **Adaptive** (`type: "adaptive"`): o modelo decide sozinho quando e quanto pensar, baseado na complexidade do pedido. É o **default moderno** em Opus 4.7, Opus 4.6 e Sonnet 4.6 — e o único modo aceito em Opus 4.7.

Em adaptive, você guia com o parâmetro **effort**:

| Effort | Comportamento |
|---|---|
| `low` | Pula thinking em tarefas simples; pensa pouco no resto |
| `medium` | Pensa moderadamente; pode pular em queries triviais |
| `high` (default) | Sempre pensa, raciocínio profundo |
| `xhigh` | Sempre pensa profundamente, exploração estendida (só Opus 4.7) |
| `max` | Sempre pensa, sem limite de profundidade |

Importante: thinking não é "deixar Opus mais Opus". É um eixo ortogonal. Sonnet 4.6 com effort `high` resolve coisas que Opus 4.7 com effort `low` ignora. E vice-versa.

## Como ativar

### Na API

```python
from anthropic import Anthropic

client = Anthropic()

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    thinking={"type": "adaptive"},
    output_config={"effort": "medium"},
    messages=[{"role": "user", "content": "..."}]
)
```

A resposta vem com blocos `thinking` (raciocínio) e `text` (resposta final). Você itera os blocos e exibe o que precisar.

### Na claude.ai

Toggle em **Search and tools** (canto inferior esquerdo do chat) → **Extended thinking**. Ligar isso inicia uma nova conversa.

### No Claude Code

Três opções:

- **`/effort <nível>`** — define pra sessão atual (ex: `/effort medium`)
- **Palavra mágica `ultrathink`** no prompt — empurra effort pra cima só naquela mensagem
- **`Alt+T` (Linux/Win) / `Option+T` (macOS)** — toggle de exibição do thinking

Em Opus 4.7 o default é `xhigh`; em Sonnet 4.6 e Opus 4.6, é `high`.

## Quando vale a pena

- **Raciocínio multi-step** — derivações, provas, lógica encadeada
- **Código que precisa planejamento** — refactor de módulo, design de API, arquitetura de feature
- **Análise de trade-off** — comparar duas abordagens com critério explícito
- **Debug em sistema novo** — quando o modelo precisa "passear" pelos arquivos antes de chutar
- **Plan Mode no Claude Code** — pra plano, effort alto rende; pra execução, effort baixo costuma bastar
- **Tarefas onde a resposta errada é cara** — produção, decisão técnica que vai pra documento

## Quando NÃO vale

- **Perguntas factuais** — "qual flag faz X em git?" Effort alto não muda a resposta, só atrasa
- **Formatação** — converter JSON pra YAML não precisa de raciocínio
- **Edição pontual** — "renomeia variável", "remove esse import"
- **Tarefas curtas e diretas** — se a resposta cabe em 2 linhas, thinking é overhead
- **Conversas exploratórias** — onde você quer iterar rápido e refinar; effort alto torna o loop pesado

A regra prática: **se você lê a pergunta e já sabe a forma da resposta, effort `low` basta** — ou nem isso: dá pra desligar thinking de vez (`MAX_THINKING_TOKENS=0` no Claude Code, `thinking: {type: "disabled"}` na API, toggle em Search and tools na claude.ai).

## A matriz que uso na cabeça

|  | Sonnet 4.6 | Opus 4.7 |
|---|---|---|
| **Effort low** | Default rotineiro: rápido, barato, suficiente | Raro — pagar Opus pra pensar pouco é desperdício |
| **Effort medium** | Bom equilíbrio em tarefas médias | Quando quer Opus mas com latência menor |
| **Effort high** | Tarefa difícil que não precisa de Opus | Default pra trabalho sério; o "modo padrão" do dia a dia complexo |
| **Effort xhigh/max** | Não disponível (xhigh é só Opus 4.7) | Casos extremos: análise de incidente, debug de bug profundo, RFC longa |

Duas combinações que merecem atenção:

- **Sonnet + high** — meu default pra Plan Mode quando a tarefa não justifica Opus. Custa mais que Sonnet padrão, mas resolve mais.
- **Opus + low** — pouco usado. Faz sentido quando você quer a "personalidade" de Opus em algo simples (escrita técnica longa, por exemplo) sem pagar pelo overhead de thinking.

## O custo invisível

Thinking tokens são billados como output tokens. Output é o lado caro do preço:

- Sonnet 4.6: $15 / MTok output
- Opus 4.7: $25 / MTok output

Numa pergunta onde adaptive decide pensar 8k tokens antes de responder mais 2k de texto, você pagou por **10k de output**, não 2k. Se você liga effort `max` pra perguntar "quanto é 2+2?", literalmente queimou dinheiro.

Detalhe sutil: mesmo com display omitido (default em Opus 4.7), **você ainda paga pelos tokens de pensamento**. Omitir só reduz latência e tamanho da resposta — não reduz fatura.

## Meu default

- **Claude Code, dia a dia em Sonnet**: effort `medium`. Equilibra velocidade e qualidade. Se a tarefa endurece, eu mudo pra `high` no meio da sessão com `/effort high`
- **Claude Code, Plan Mode**: effort `high`, sempre. Plano vale o token extra
- **Claude Code, Opus 4.7**: deixo o default (`xhigh`). Quando uso Opus, é porque o problema pede — não faz sentido segurar
- **claude.ai**: thinking ligado pra conversa que já começou difícil; desligado pra exploração rápida
- **API em produção**: effort `low` ou `medium` por padrão; `high` só nos endpoints que sei que precisam (análise complexa, geração de relatório)

E uma palavra mágica que vale lembrar: **`ultrathink`**. Quando estou no Claude Code com effort `medium` mas bati num problema que precisa de mais raciocínio, escrevo "ultrathink, [pergunta]" — empurra só naquele turno, sem mudar a sessão.

## Resumindo

Effort é o quanto o modelo pensa antes de responder, e custa tokens reais. Opus + Sonnet decidem capacidade; effort decide profundidade. Os dois eixos são independentes — Sonnet com effort alto bate Opus com effort baixo em muita tarefa difícil. Default sensato: `medium` no Claude Code com Sonnet, escala pra `high` quando a tarefa pedir, deixa `xhigh` no Opus quando precisar do canhão.

## Fontes

- [Adaptive thinking (Anthropic Docs)](https://docs.claude.com/en/docs/build-with-claude/adaptive-thinking)
- [Extended thinking (Anthropic Docs)](https://docs.claude.com/en/docs/build-with-claude/extended-thinking)
- [Effort parameter (Anthropic Docs)](https://docs.claude.com/en/docs/build-with-claude/effort)
- [Model configuration — Claude Code Docs](https://code.claude.com/docs/en/model-config)
- [Using extended thinking (Claude Help Center)](https://support.claude.com/en/articles/10574485-using-extended-thinking)
