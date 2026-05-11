---
title: "Janela de contexto: o que cabe e o que o Claude corta"
description: "Por que aquele prompt enorme falhou e por que o Claude esquece o começo da conversa. A janela é um orçamento — e tem mais gente disputando ele do que parece."
date: 2026-05-11
category: fundamentos
tags: [fundamentos, claude-code, contexto]
---

Você cola um arquivo grande no Claude e ele responde que não consegue processar. Ou ele esquece um detalhe que vocês combinaram 30 turnos atrás. Ou aquele prompt cuidadoso, com 5 anexos e 3 referências, erra de um jeito que não erraria com metade do material.

Os três acontecem pela mesma razão: você bateu na **janela de contexto**.

Esse post fecha a trinca com <a href="/claude-playbook/artigos/o-que-e-um-token" target="_blank" rel="noopener">O que é um token</a> e <a href="/claude-playbook/artigos/tokenizacao-bpe-por-que-palavras-viram-pedacos" target="_blank" rel="noopener">Tokenização BPE</a> — agora você sabe **como** texto vira número. Aqui vai o limite prático: quantos desses números cabem na cabeça do modelo de uma vez, e o que disputa esse espaço.

## A "memória de trabalho" do modelo

Janela de contexto é todo texto que o modelo enxerga **enquanto está gerando uma resposta**. Inclui o que você mandou, o histórico inteiro da conversa, e a própria resposta que ele tá produzindo agora.

Não é memória de longo prazo. Não tem nada a ver com o que o modelo aprendeu durante o treino. É **bolha temporária**, do tamanho de uma sessão. Termine a sessão, abra outra, e a bolha começa do zero.

A unidade que enche a bolha é token. Por isso interessa entender BPE antes — porque é o tokenizer que define quanto cabe.

## Números (maio/2026)

Janelas atuais nos modelos da família 4, conforme a doc oficial:

| Modelo | Janela | Output máximo |
|---|---|---|
| **Opus 4.7** | 1M tokens | 128k tokens |
| **Sonnet 4.6** | 1M tokens | 64k tokens |
| **Haiku 4.5** | 200k tokens | 64k tokens |

Repara que **output tem limite próprio**, separado da janela total. Você pode ter 900k tokens livres na janela e ainda assim o Opus 4.7 recusar gerar 200k de resposta — porque o teto de output dele é 128k. Input e output são duas contas, e ambas precisam caber.

Nos planos Claude.ai: Max, Team e Enterprise dão 1M de Opus por default. No Pro, Opus fica em 200k e o 1M sai por `/extra-usage`. Na API, modelos com 1M cobram o preço padrão, sem prêmio em cima dos 200k.

## O orçamento: quem disputa o espaço

A pegadinha maior é achar que janela é "só o seu prompt". Tudo isso entra na mesma conta:

- **System prompt** do produto (Claude Code, Claude.ai). Invisível, mas tá lá.
- **CLAUDE.md** do projeto — carregado a cada início de sessão. Se você inflou ele, paga toda vez. <a href="/claude-playbook/artigos/claude-md-minimo-viavel" target="_blank" rel="noopener">CLAUDE.md mínimo viável</a> entra aqui.
- **Memória persistente** (`MEMORY.md` no Claude Code) — bate em todo turno.
- **Histórico da conversa** — cresce a cada par de mensagens.
- **Saídas de ferramenta** — cada `Read`, `Bash`, `Grep` que o agente roda devolve resultado pra dentro da janela. Em sessão longa, isso domina.
- **Definições de tool e MCP** — schemas das ferramentas disponíveis. Claude Code adia o schema completo até o uso, mas os nomes ficam carregados.
- **Skills** — descrição na entrada, conteúdo só quando invocada.
- **Anexos** — arquivos, PDFs, imagens. Imagem custa token também, em função da resolução.
- **Thinking tokens** (modelos com extended ou adaptive thinking) — contam como output e ocupam a janela do turno. Cobri o trade-off em <a href="/claude-playbook/artigos/effort-extended-thinking-quando-vale-a-pena" target="_blank" rel="noopener">/effort: quando vale a pena thinking</a>.
- **A própria resposta** sendo gerada agora.

Soma isso e a "janela de 1M" começa a fazer mais sentido. Em uma sessão típica de Claude Code, o startup já consome alguns milhares de tokens antes de você digitar a primeira coisa.

## Context rot: mais não é melhor

Aqui mora a parte desconfortável. Janela maior não significa qualidade proporcional. A Anthropic documenta o efeito: à medida que a janela enche, **a precisão e o recall do modelo degradam**. Tem nome — *context rot*.

O modelo continua vendo tudo, mas presta menos atenção em cada pedaço. Detalhe importante enterrado no meio de 800k de texto fica mais difícil de recuperar do que o mesmo detalhe em 50k. Os benchmarks de long-context que a própria Anthropic publica mostram queda mensurável quando você usa toda a janela, mesmo nos modelos que aguentam 1M.

Tradução prática: **o que está na janela importa mais do que quanto cabe**. Curadoria > capacidade.

## O que muda na operação

Saber disso muda decisões reais no fluxo do Claude Code:

**Use `/context` pra ver quem está consumindo.** Mostra um grid colorido com cada categoria (system, CLAUDE.md, histórico, tools…). Antes de reclamar que o Claude tá lento ou esquecendo, olha quanto da janela já foi.

**`/clear` ≠ `/compact`.** O `/clear` apaga o histórico inteiro e começa sessão nova — mantém CLAUDE.md, memória e MCP, mas zera a conversa. Use ao trocar de tarefa. O `/compact` resume a sessão atual em si própria — mantém o fio, só comprime. Use quando a conversa ainda importa mas tá pesada.

**Auto-compact existe e é silencioso.** Quando a janela aperta, o Claude Code limpa sozinho — começa pelas saídas de ferramenta mais antigas, depois resume o histórico. Você não nota até reparar que detalhe do começo sumiu. Por isso o que precisa sobreviver não pode ficar enterrado no chat — sobe pro CLAUDE.md ou pra memória.

**`/add-dir` grande envenena cedo.** Adicionar um diretório enorme já no início faz o Claude Code carregar muito arquivo antes de você fazer qualquer pergunta. A janela enche de coisa irrelevante e a relevância depois disputa espaço com lixo. Adicione só o que vai usar; abra novo diretório quando precisar.

**Prompt longo em etapas.** Em vez de mandar 50k tokens de contexto + pergunta em um turno só, parta em dois: turno 1 só o material + "leu? resume em 5 linhas". Turno 2, a pergunta real. Você gasta um turno a mais, mas força o modelo a destilar antes — e a destilação ocupa menos espaço pra frente.

## Quando ignorar

Sessão curta de 10-20 turnos, 1 arquivo médio, pergunta direta? Esquece janela. Não vai bater no teto, auto-compact nunca vai disparar. Otimizar janela em uso casual é gastar atenção em problema que não existe.

Janela vira métrica quando:

- Sessões longas com agente em loop
- Repo grande ou múltiplos diretórios abertos
- Anexos pesados (PDF, base de docs, transcript)
- Pipeline que reusa contexto entre rodadas
- Custo importa de fato (uso na API, planos pagando por consumo)

## O limite que abre a porta pro RAG

Janela é finita. Esse é o ponto. Mesmo com 1M, você não vai colocar a base inteira da sua empresa, ou um livro completo, ou 5 anos de tickets, em todo prompt.

Quando o conhecimento não cabe na janela, a resposta deixa de ser "aumenta a janela" e vira **não carrega tudo — busca o relevante e carrega só isso**. Esse é o coração do RAG: o que vimos de embedding (texto vira vetor, vetores próximos têm significado próximo) é o motor que faz essa busca acontecer. Próxima parada da trilha de fundamentos.

Por enquanto, o modelo mental que basta: **janela é orçamento, e tem mais gente disputando ele do que parece**. Curadoria do que entra rende mais do que esperar que o modelo desconte sozinho. E quando o conhecimento que você quer expor não cabe, a solução não é forçar — é buscar.

## Fontes

- [Models overview — Claude Docs](https://platform.claude.com/docs/en/about-claude/models) — janelas e output máximo por modelo
- [Context windows — Claude Docs](https://platform.claude.com/docs/en/build-with-claude/context-windows) — definição, context rot, context awareness em 4.5+
- [Effective context engineering for AI agents — Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — degradação em janelas grandes e como engenheirar contexto
- [How Claude Code works — Claude Code Docs](https://code.claude.com/docs/en/how-claude-code-works) — composição da janela em sessão
- [Model configuration — Claude Code Docs](https://code.claude.com/docs/en/model-config) — 1M de Opus por default em Max, Team e Enterprise
