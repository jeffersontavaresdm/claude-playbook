---
title: "O que é RAG (e por que ele virou a saída quando a janela não cabe)"
description: "Você tem 800 páginas de manual que o Claude precisa consultar. Não cabe no prompt. RAG é o ciclo que resolve — recuperar, aumentar, gerar — e o gargalo mora no passo que ninguém quer fazer."
date: 2026-05-11
category: fundamentos
tags: [fundamentos, llm, contexto]
---

O <a href="/claude-playbook/artigos/janela-de-contexto-o-que-cabe-e-o-que-claude-corta" target="_blank" rel="noopener">post anterior sobre janela de contexto</a> terminou apontando pra cá: a janela é finita, e quando o conhecimento que você quer expor não cabe, a saída não é forçar — é buscar. Esse "buscar" tem nome. **RAG: Retrieval-Augmented Generation**.

Cenário típico que abre essa conversa: você tem um manual de produto de 800 páginas. O Claude precisa responder dúvidas dos usuários, fundamentado nesse manual. Joga tudo no prompt? Não cabe (e mesmo cabendo, *context rot* já avisou que não ia ajudar). Fine-tuna o modelo no manual? Cada atualização obriga retreinar. Como então?

A resposta é: **não carrega tudo. Busca o pedaço relevante na hora, joga só ele no prompt, gera a resposta**. Esse ciclo é RAG.

## O ciclo de 3 passos

A sigla esconde uma sequência fixa que se repete a cada pergunta:

```
1. Retrieve  →  busca pedaços relevantes na sua base
2. Augment   →  monta um prompt com a pergunta + pedaços encontrados
3. Generate  →  Claude gera a resposta usando esse contexto
```

A engenharia toda do RAG mora no passo 1. O 2 é construção de string. O 3 é o modelo fazendo o que ele já faz. Mas se o 1 entrega lixo, os outros dois colocam selo de qualidade em cima do lixo.

## Por que recuperação semântica, não keyword

Em motor de busca tradicional, "dor de cabeça" só encontra documento com as palavras "dor" e "cabeça". RAG sobe acima disso usando o que vimos em <a href="/claude-playbook/artigos/embeddings-como-texto-vira-numero" target="_blank" rel="noopener">embeddings</a>: cada pedaço da base vira vetor; a pergunta também; busca os vetores mais próximos.

Resultado: "dor de cabeça" recupera um doc que fala de "enxaqueca" — sem ter palavra em comum. Significado vira geometria, geometria vira ranking. Esse é o motor que faz o **R** do RAG escalar. Sem embedding, RAG seria caça-palavras com prompt enfeitado em cima.

## A pergunta mais importante: como você corta a base

Antes de recuperar, você precisa cortar a base em **chunks** — pedaços do tamanho certo pra serem indexados. Aqui mora a parte difícil:

- **Chunk grande demais** — joga 5 páginas no prompt pra responder uma pergunta de 1 linha. Dilui contexto, gasta <a href="/claude-playbook/artigos/o-que-e-um-token" target="_blank" rel="noopener">token</a> à toa, traz ruído junto com a resposta.
- **Chunk pequeno demais** — perde contexto. "Ele anunciou em janeiro" não responde nada se você cortou fora quem é "ele".
- **Chunk no meio de uma frase** — sentido vai pelo ralo. Embedding fica ambíguo.

Não tem chunk size mágico. Depende da base. Documentação técnica costuma se sair bem em 300-500 tokens; código pede separar por função. Vale testar — e cada chunk recuperado entra na sua janela, então "recuperar 20 chunks pra garantir" tem custo direto.

## Garbage in, garbage out

O calcanhar de Aquiles do RAG é simples: **se a recuperação trouxe os chunks errados, o modelo responde errado com confiança**. O LLM não sabe que aquele chunk é irrelevante — ele assume que tudo no prompt é relevante e responde com base nisso.

Modos clássicos de falhar:

- A pergunta usa termo ambíguo e o retrieval trouxe o sentido errado
- O chunk certo existe mas ficou em 6º lugar no ranking, e o sistema só pega os top 3
- A base tem duas versões do mesmo doc, uma desatualizada, e o RAG não sabe qual escolher
- Termo raro (jargão interno, nome de produto) tokeniza estranho, embedding fica fraco, recuperação erra

Por isso a parte "boring" do RAG — avaliar qualidade do retrieval, medir hit rate, comparar chunking — costuma render mais ganho do que trocar o modelo gerador.

## Contextual Retrieval: a evolução recente

A Anthropic publicou em set/2024 uma técnica chamada **Contextual Retrieval**. Ideia: antes de indexar cada chunk, gerar um contexto curto pra ele usando o doc inteiro como referência. Em vez de embedar `"a receita cresceu 3%"`, você embeda `"Trecho do relatório financeiro Q3 da Empresa X: a receita cresceu 3%"`.

Chunk isolado perde contexto. "A receita cresceu 3%" sozinho não diz nada — qual empresa? quando? Re-injetar o contexto antes do embed deixa o vetor mais informativo e a busca acerta mais.

Os números que eles publicaram (redução em taxa de falha de retrieval):

- Embedding sozinho com contexto: **−35%**
- Embedding + BM25 (busca lexical clássica) com contexto: **−49%**
- Os dois acima + reranking: **−67%**

A lição abstrata é maior que a técnica: **o que você embeda importa mais que qual modelo de embed você usa**. Cuidar do input do embedding rende mais que trocar de provider.

## Quando RAG NÃO é a resposta

RAG vira reflexo automático em qualquer projeto com "base de conhecimento". Mas tem sinais de que você não precisa dele:

**A base toda cabe na janela.** A própria Anthropic recomenda: abaixo de ~200k tokens (algo como 500 páginas), prompt caching + long context bate RAG em precisão e simplicidade. Não tem retrieval pra dar errado.

**A pergunta exige raciocínio sobre o documento inteiro.** RAG é bom em "responda usando estes 3 trechos". É ruim em "compare a evolução do produto entre os capítulos 2, 5 e 10". Quando a resposta exige varredura, recuperação por similaridade não cobre.

**Latência importa demais.** RAG adiciona uma rodada de busca antes da geração. Em chat humano é invisível. Em pipeline com SLO apertado, custa.

**O conhecimento muda a cada minuto.** Manter índice em dia com base que atualiza o tempo todo é trabalho de verdade. Se o caso aceita "informação de algumas horas atrás", ok; se exige tempo real, é call direto, não retrieval.

## O que isso muda pra como você usa Claude

No uso do Claude no terminal, em dia normal, você não monta RAG. O agente lê arquivos do repo via `Read`, faz `Grep` pelo que precisa, mantém contexto na janela. É RAG manual, mediado por você e por decisões de "abre esse, lê aquele".

A decisão de montar RAG aparece quando o conhecimento sai do repo e vira **base externa que precisa entrar no prompt sob demanda** — wiki de produto, doc que não está local, histórico de tickets, jurisprudência. Aí o ciclo recuperar → aumentar → gerar deixa de ser implícito e vira sistema explícito.

O modelo mental que basta por agora: **janela cara o pedido. Embedding viabiliza buscar por significado. RAG é o sistema que junta as duas pontas** — e como tudo em IA, o gargalo costuma estar na parte chata (chunking, ranking, avaliação), não na parte sexy (qual modelo gerador).

Construir um RAG ponta-a-ponta com banco vetorial, ingestion e avaliação é assunto pra um post de projeto, não desse aqui.

## Fontes

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks — Lewis et al., 2020](https://arxiv.org/abs/2005.11401) — paper original que cunhou o termo
- [Contextual Retrieval — Anthropic Engineering](https://www.anthropic.com/news/contextual-retrieval) — evolução com embed + BM25 + reranking e os números de redução de falha
- [Embeddings — Claude Docs](https://platform.claude.com/docs/en/build-with-claude/embeddings) — Voyage AI como provider recomendado e guia básico
- [Effective context engineering for AI agents — Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — quando long context bate RAG e por quê
