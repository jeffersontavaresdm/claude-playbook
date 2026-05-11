---
title: "Advisor tool: quando vale Sonnet executando com Opus dando palpite"
description: "Pattern beta da Anthropic — Sonnet ou Haiku faz a tarefa, Opus dá conselho em pontos críticos. Quando isso bate Opus solo e quando vira gasto à toa."
date: 2026-05-11
category: comparacao
tags: [opus, sonnet]
---

Pattern novo que a Anthropic lançou em beta em [9/4/2026](https://claude.com/blog/the-advisor-strategy): rodar **dois modelos ao mesmo tempo** numa única requisição. Um executa a tarefa (Sonnet ou Haiku), outro aconselha em pontos críticos (Opus). Em vez de escolher entre o modelo bom e o modelo barato, você combina os dois.

A pergunta interessante não é "como configurar" (a doc resolve isso). É: **por que rodar dois modelos juntos é diferente de só usar o melhor dos dois? E quando o setup extra paga?**

Quem leu o <a href="/claude-playbook/artigos/opus-vs-sonnet-quando-cada-um-faz-sentido" target="_blank" rel="noopener">post sobre Opus vs Sonnet</a> sabe que a decisão tradicional é binária: tarefa difícil → Opus, tarefa rotineira → Sonnet. Advisor tool quebra essa binariedade.

## Como funciona (sem código)

Conceitualmente, em três peças:

- **Executor** roda a tarefa de ponta a ponta. Chama ferramentas, lê resultados, itera. Pode ser Haiku 4.5, Sonnet 4.6 ou Opus 4.6.
- **Advisor** (Opus 4.7) entra como "ferramenta" no toolset do executor. Quando o executor decide chamar essa ferramenta, a Anthropic faz uma inferência separada do Opus, server-side, passando todo o transcript da conversa.
- Opus **não chama ferramentas, não produz output pro usuário final**. Devolve só um plano curto — 400-700 tokens de texto típicos, 1.4k-1.8k contando thinking — que entra de volta no contexto do executor.
- Executor continua a tarefa informado pelo conselho.

Tudo dentro de **uma única requisição** da Messages API. Não é orquestração no lado do cliente, não é dois agents conversando, não é hand-off explícito. É um executor que tem acesso a um "consultor" como tool call.

A diferença pra montar isso na mão (rodar Sonnet, em algum ponto chamar Opus separado, costurar tudo) é três coisas:

1. **O advisor vê o transcript inteiro** automaticamente. Sem passar contexto manualmente.
2. **O executor decide quando consultar**, baseado na descrição embutida da ferramenta.
3. **Billing separado por modelo**, sem precisar gerenciar duas chaves nem dois clientes.

## Os números que a Anthropic publicou

Em benchmarks do anúncio:

**SWE-bench Multilingual** (coding agentic):
- Sonnet + Opus advisor: **+2.7 pp** vs Sonnet sozinho, com custo por task **−11.9%**

**BrowseComp** (research na web):
- Haiku + Opus advisor: **41.2%** vs **19.7%** de Haiku sozinho — mais que dobra a pontuação
- Haiku + Opus advisor custa **85% menos** por task que Sonnet sozinho, e fica 29% atrás em score

A linha de fundo: a combinação fica **perto do score de rodar só Opus, mas paga próximo do executor menor**. Funciona porque a maior parte dos tokens é gerada pelo executor (barato) e o advisor entra com poucos tokens em pontos certos.

Caveat que a doc explicita: ganhos são *task-dependent*. Em prompt de turno único ou tarefa que Sonnet já acerta sozinho, não tem o que aconselhar.

## Quando vale

A doc oficial lista o sweet spot:

- **Você usa Sonnet em tarefas complexas hoje.** Adiciona Opus como advisor → ganho de qualidade com custo similar ou menor.
- **Você usa Haiku e quer um degrau a mais de inteligência.** Adiciona Opus como advisor → custa mais que Haiku sozinho, mas bem menos do que migrar executor pra Sonnet ou Opus.

O cenário operacional onde brilha é **agentic workload longo** — coding agent que faz dezenas de tool calls, pipeline de pesquisa multi-passo, computer use. Tarefa em que a maior parte do trabalho é mecânica (ler arquivo, rodar comando, ler resultado), mas em que **um plano ruim no começo custa 30 minutos de retrabalho**. Aí faz sentido pagar Opus em 2-3 pontos críticos pra evitar o retrabalho.

## Quando NÃO vale

- **Tarefa curta** — uma pergunta, uma resposta. Não tem o que planejar. Advisor adiciona latência e custo sem retorno.
- **Pass-through onde o usuário final escolhe o modelo.** Se o produto já oferece "escolha Sonnet ou Opus", advisor não encaixa — o trade-off já é do usuário.
- **Tarefa que Sonnet sozinho acerta consistentemente.** Pagar Opus de advisor em coisa simples é queimar dinheiro à toa.
- **Latência crítica.** Cada chamada do advisor pausa o stream enquanto a sub-inferência roda. Em chat humano, ok. Em SLO apertado, dói.

A heurística honesta: **se você não tinha plano de pagar Opus em pelo menos algum pedaço da task, não força advisor**. O pattern não é "Opus de graça". É "Opus em pontos certos em vez de Opus em tudo".

## Detalhe que custa caro errar

Output do advisor é o maior driver de custo do pattern (Opus é o mais caro por token). A doc recomenda explicitamente trimar o output do advisor — colocar no system prompt algo como "advisor responde em menos de 100 palavras, em passos enumerados". Eles reportam 35-45% de redução em tokens do advisor sem mudar a frequência das chamadas.

E `max_uses` no tool definition. Sem isso, o executor pode chamar o advisor 20x na mesma task. Ponha teto. 2-3 chamadas em coding agentic é o número saudável pelo blog.

## E pra quem não usa API?

Esse é o ponto: **advisor tool é beta na API da Anthropic, exclusivo dali**. Não tem chave equivalente no Claude.ai (Pro, Max, Team, Enterprise) nem no Claude Code. Quem usa Claude no terminal não toggla isso — pra esse perfil, a decisão de modelo segue sendo a do <a href="/claude-playbook/artigos/opus-4-7-o-que-mudou-e-quando-o-salto-compensa" target="_blank" rel="noopener">post sobre Opus 4.7</a>: defaults do Claude Code já são bons, salto pra Opus 4.7 reservado pra coding agentic difícil.

Quem **constrói pipeline em cima da API** e tem volume agentic — chatbot de produto, agente processando tickets em background, scraper inteligente — aí entra a conversa. Paga quando essas duas condições casam: (1) volume, (2) cada task tem decisões críticas que mudam o resto do fluxo.

E o pattern combina com effort: <a href="/claude-playbook/artigos/effort-extended-thinking-quando-vale-a-pena" target="_blank" rel="noopener">Sonnet executor em effort médio + Opus advisor</a> entrega inteligência comparável a Sonnet em effort default com custo menor. Outro grau de liberdade na regulagem fina.

## Beta: o que ficar de olho

Header atual: `anthropic-beta: advisor-tool-2026-03-01`. Tool type: `advisor_20260301`. Ambos podem mudar antes do GA — a doc avisa. Quem vai construir em cima checa a [doc oficial](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool) antes de codar e mantém pin de versão. Beta não é estável, e o nome do header (`2026-03-01`) já entrega isso.

## Resumindo

Advisor tool é o primeiro pattern multi-modelo nativo da Anthropic. Não substitui a decisão de qual modelo usar — adiciona uma terceira opção: **executor barato com consultor caro em pontos críticos**. Vale onde a task é longa e o plano importa. Não vale onde o executor já dá conta. Beta, API-only, evolui — e por enquanto fica fora do dia a dia de quem trabalha em Claude.ai ou Claude Code.

## Fontes

- [The advisor strategy — Anthropic](https://claude.com/blog/the-advisor-strategy) — anúncio com benchmarks (SWE-bench Multilingual, BrowseComp, Terminal-Bench)
- [Advisor tool — Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool) — referência oficial: header, parâmetros, pares válidos de modelo, prompting recomendado
