---
title: "Opus 4.7: o que mudou (e quando o salto compensa)"
description: "Revisita a decisão Opus vs Sonnet à luz do release de 4.7 e das mudanças de capacidade de maio/2026. Spoiler: mexe a operação mais que o modelo."
date: 2026-05-10
category: comparacao
tags: [claude-code, opus, sonnet]
---

Se você leu o <a href="/claude-playbook/artigos/opus-vs-sonnet-quando-cada-um-faz-sentido" target="_blank" rel="noopener">post anterior sobre Opus vs Sonnet</a> e ficou com Sonnet como default, faz sentido perguntar: rolou release de Opus 4.7 e mudança grande de limites em maio. **Algo disso reabre a decisão?**

Resposta curta: o release do modelo, por si só, mexe pouco. O que muda mais o cálculo é o lado **operacional** — limites dobrados e peak cap removido. Vou separar os dois eixos.

## O que o release do Opus 4.7 trouxe

Saiu em [16/04/2026](https://www.anthropic.com/news/claude-opus-4-7). Filtrando o que importa pra decisão (não release notes inteiro):

- **Adaptive thinking, não extended.** Opus 4.7 não tem mais o `extended_thinking` clássico — tem **adaptive thinking**, que decide internamente quanto pensar. Aparece pra você como um novo nível de effort: `xhigh`, único do Opus 4.7. O modelo já entra em `xhigh` por default no Claude Code. Cobri o controle no <a href="/claude-playbook/artigos/effort-controlando-thinking-no-claude-code" target="_blank" rel="noopener">post sobre /effort</a> e o conceito no <a href="/claude-playbook/artigos/effort-extended-thinking-quando-vale-a-pena" target="_blank" rel="noopener">post de fundamentos</a>.
- **Coding agentic difícil melhorou de verdade.** No CursorBench, [70% contra 58% do Opus 4.6](https://www.anthropic.com/news/claude-opus-4-7). Em segurança/exploração (XBOW), o salto é grotesco — 98.5% vs 54.5%. Esses dois benchmarks medem coisas que se parecem mais com fluxo agentic real (várias tool calls, decisões encadeadas) do que SWE-bench tradicional.
- **Vision em alta resolução.** Aceita imagem com até 2.576px no lado maior — ~3× mais resolução. Importa quem usa pra ler screenshot detalhado, diagrama denso ou interface de computer-use.
- **Instruction following mais literal.** A Anthropic avisa explicitamente que pode precisar **re-tunar prompts** que vinham de versões anteriores. O modelo segue instrução mais ao pé da letra. Bom pra pipeline; chato se você herdou prompt vago de antes.
- **Preço segue igual.** $5 input / $25 output por MTok, mesmo do 4.6. Comparado ao Sonnet 4.6 ($3/$15), a relação é a mesma de antes — Opus continua ~67% mais caro por token.

O que **não** veio: redução de preço, queda de latência, contexto maior. Janela continua 1M tokens (igual Sonnet 4.6 na API).

## O que mudou na operação (e isso pesa mais)

Em [06/05/2026](https://www.anthropic.com/news/higher-limits-spacex), a Anthropic anunciou três coisas em uma só nota:

- **Limites de 5h do Claude Code dobrados** nos planos Pro, Max, Team e Enterprise.
- **Peak hour cap removido** no Claude Code pra Pro e Max — antes, em horário de pico, sua quota efetiva caía. Agora não cai mais.
- **Capacidade nova via SpaceX/Colossus 1**: 300+ MW e 220k+ GPUs NVIDIA, dentro do mês.

Pro leitor de planos Pro/Max, isso é o que de fato muda o cálculo. Quem evitava Opus por **medo de queimar a quota** antes do fim das 5h — especialmente em horário de pico — acabou de ganhar bastante folga. Em uso pessoal, isso pode ser mais relevante que qualquer ganho de benchmark.

Atenção: é mudança operacional, não filosófica. Continua certo escolher modelo pelo problema, não pela quota disponível. Mas quem estava forçado a usar Sonnet em situações onde Opus seria a escolha melhor pode parar de se segurar.

## O que isso muda na decisão

Volto à pergunta do início. Pra cada perfil de leitor:

**Você ficou com Sonnet por custo na API.** Decisão segue. $5/$25 contra $3/$15 não mudou. Routing manual (classificador → Sonnet pra fácil, Opus pra difícil) continua sendo a otimização que mais rende.

**Você ficou com Sonnet por medo de bater limite no Claude Code.** Vale reconsiderar. Limite dobrou, peak cap saiu. Em sessão pessoal/Pro/Max, dá pra usar Opus mais à vontade nas tarefas onde ele realmente tira diferença. Mas é "à vontade", não "à toa": Sonnet ainda termina tarefa fácil na metade do tempo.

**Você ficou com Sonnet por achar que Opus 4.6 não justificava em coding agentic.** Esse é o caso onde 4.7 mais mexe. Os ganhos de CursorBench/XBOW indicam melhora real em fluxo com muitas tool calls — exatamente onde Opus já era o "seguro contra o passo 4". Se você roda agente com 30+ tool calls, vale testar de novo. Se você usa Claude Code em modo conversa-curta, não muda nada.

**Você ficou com Sonnet pra escrita técnica, Q&A, refactor pontual.** Decisão segue intocada. Nada do que veio em 4.7 te ajuda nessas tarefas mais do que Sonnet 4.6 já ajudava.

## Onde 4.7 me decepcionou (ou não percebi diferença)

Em sessão de pair programming pontual — abrir arquivo, ajustar uma função, rodar teste — não notei diferença pro 4.6. O ganho é real, mas mora em fluxos longos e complexos. Em tarefa curta, dois modelos competentes dão a mesma resposta.

A coisa do "instruction following mais literal" também tem dois lados. Em prompt curto e direto, é ótimo. Em CLAUDE.md herdado de versão anterior — com regras meio ambíguas, contraditórias entre si, ou implícitas — começa a aparecer comportamento estranho. Tive que cortar regras vagas que o 4.6 aplicava com bom senso e o 4.7 levou ao pé da letra.

Honestidade total: não tenho jeito de testar de forma controlada o ganho em XBOW (98.5% é número impressionante, mas não é o tipo de tarefa que rodo). Pego com cuidado os benchmarks que vêm da própria Anthropic — dão sinal, não verdade absoluta. **Ganho em benchmark X ≠ ganho no fluxo do leitor.**

## Meu default atualizado

Mudou pouco em relação ao post anterior:

- **Sonnet 4.6** segue como default no Claude Code pra maioria do dia a dia.
- **Opus 4.7** entra em duas situações: Plan Mode pra problema sério, ou quando bati a cabeça duas vezes com Sonnet no mesmo problema.
- **Diferença prática do 4.7:** em sessão agentic longa (refactor multi-arquivo, debug através de camadas), agora penso menos antes de subir pra Opus. Antes era uma decisão consciente sobre custo-quota; hoje é só "isso é difícil, vai pra Opus".

A regra-mãe continua: **Opus é seguro contra a tarefa subir de dificuldade no meio do caminho.** O que 4.7 fez foi tornar esse seguro mais barato em termos de capacidade — não em termos de dinheiro.

## Resumindo

O release do Opus 4.7 é incremental sólido em coding agentic e vision. Não revoluciona a decisão Opus vs Sonnet — mas reabre uma porta pra quem evitava Opus por medo de quota, agora que limites dobraram e peak cap saiu. Se sua decisão era custo da API, segue tudo igual. Se era operação no plano Pro/Max, dá pra ser menos avaro com Opus.

## Fontes

- [Introducing Claude Opus 4.7 — Anthropic](https://www.anthropic.com/news/claude-opus-4-7) — release oficial e benchmarks
- [Higher usage limits and a compute deal with SpaceX — Anthropic](https://www.anthropic.com/news/higher-limits-spacex) — mudanças operacionais de 06/05/2026
- [Models overview — Anthropic Docs](https://platform.claude.com/docs/en/about-claude/models) — specs e preços atualizados
- [Pricing — Anthropic Docs](https://platform.claude.com/docs/en/about-claude/pricing) — tabela de preços completa
