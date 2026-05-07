---
title: "Tokenização: BPE e por que palavras viram pedaços"
date: 2026-05-06
description: "Por que 'tokenizer' vira 1 token e 'tokenização' vira 3? O algoritmo por trás da quebra — e por que ele cobra mais caro de quem escreve em português."
category: fundamentos
tags: [fundamentos, llm]
---

Cola "tokenizer" no [tokenizer da OpenAI](https://platform.openai.com/tokenizer): 1 token. Cola "tokenização": 3 tokens. Não é aleatório. Tem algoritmo por trás dessa decisão, e ele tem nome: **BPE — Byte-Pair Encoding**.

Se você ainda não leu [O que é um token](/claude-playbook/artigos/o-que-e-um-token), começa por lá — esse aqui assume que você já sabe que token ≠ palavra. O post anterior respondeu **o que** é um token. Esse responde **como** o modelo decide onde cortar.

## O problema

O modelo precisa de um vocabulário fixo. Quando ele gera texto, ele escolhe um próximo token entre todos os tokens conhecidos. Se o vocabulário fosse "todas as palavras do português + todas as do inglês + todas as do código", o número explodia — e ainda assim faltaria espaço pra `kubernets`, `levelsio`, `vibecoding`, `tokenização`, e qualquer coisa nova que aparece todo dia.

A saída ingênua seria treinar o modelo nos caracteres individuais. Mas aí cada palavra vira 5-10 tokens, sequência fica gigante, e o modelo gasta capacidade aprendendo que `c` + `a` + `s` + `a` é "casa" toda vez.

BPE é o meio do caminho: vocabulário com tamanho fechado (~50-100k entradas), onde palavras comuns ocupam 1 token e palavras raras se decompõem em pedaços. Cada pedaço é um "subword" — uma unidade que aparece em várias palavras.

## Como BPE funciona

A intuição é compressão por frequência. O algoritmo:

1. Começa com vocabulário formado pelos caracteres individuais do corpus
2. Conta todos os pares de tokens vizinhos no texto
3. Pega o par mais frequente, junta numa unidade só, adiciona ao vocabulário
4. Repete: re-conta os pares (já com a unidade nova), pega o próximo mais frequente, junta
5. Para quando o vocabulário atinge o tamanho-alvo

No fim, palavras que apareciam muito no corpus de treino (`the`, `function`, `return`, `é`, `não`, `the`) viraram 1 token cada — porque todos os pares dentro delas foram fundidos cedo. Palavras raras, ou compostas de pedaços que não se uniram, ficam quebradas.

`tokenizer` é palavra suficientemente comum em texto técnico em inglês pra ter sido fundida inteira em algum momento do treino. `tokenização` não — virou `tok` + `en` + `ização`. Os pedaços individuais também são bons subwords (aparecem em outras palavras), só não foram unidos entre si.

Isso explica também por que **acentos custam caro**: caracteres como `á`, `é`, `ç` aparecem pouco no corpus dominado pelo inglês, então quase nunca foram fundidos com seus vizinhos. Cada acento tende a virar quebra de token.

## Por que isso muda como você usa Claude

O tokenizer do Claude também usa BPE — variante otimizada pra XML, markdown e código. Vocabulário em torno de 65k tokens. O treino do tokenizer foi pesado em código (~57%) e inglês (~39%); outras línguas, somadas, ficaram em ~4%.

Resultado prático em três frentes:

### Português gasta mais tokens

A regra de bolso confirmada: **português consome ~30% mais tokens que inglês** pra dizer a mesma coisa. A explicação mecânica é o que descrevi acima — palavras comuns em PT não foram fundidas o suficiente, acentos viram quebra, conjugações verbais (`fizemos`, `farão`, `fizeste`) raramente sobrevivem inteiras no vocabulário.

Em casos piores (texto literário com vocabulário rico, ou jargão específico), a inflação chega a 50%. Em código com identifier em inglês e comentário em PT, fica mais perto de 20%.

### Código gasta menos tokens

Identifier comum (`fun`, `return`, `val`, `import`, `null`, `true`) é 1 token. Estruturas frequentes (`: `, ` = `, `()`, `->`) também viram tokens próprios. JSON, YAML e markdown se beneficiam: tags de fechamento, chaves, brackets — tudo já fundido.

Por isso pedir pra um modelo "explicar esse código em prosa" às vezes custa **mais output** que o input do código original. Prosa tokeniza pior.

### Texto técnico raro tokeniza pior

Nomes próprios pouco comuns (`Hashicorp`, `Kubernetes`, `Anthropic`), siglas (`OAuth2`, `JWT`, `gRPC`), jargão de domínio (`refeed`, `idempotência`) tendem a quebrar em pedaços. Não é porque são "estranhos" pro modelo entender — ele entende muito bem. É só que cada ocorrência cobra 2-4 tokens em vez de 1.

## A consequência prática

Pra prompt curto, isso não importa. Pra prompt grande, agente em loop, ou pipeline batendo na API o dia inteiro, **traduzir o prompt pra inglês reduz custo em ~25-30%**. Cabe? Sim. Vale o trabalho? Quase nunca, e a perda em precisão do prompt costuma comer a economia. Mas é decisão a fazer com número, não com chute.

A decisão mais comum, mais barata e menos lossy é outra: **usar identifier e estrutura em inglês, prosa explicativa em português**. É o que código já faz por convenção, e tokeniza bem.

## Outros algoritmos existem (e são parecidos)

BPE não é o único. **WordPiece** (BERT) e **SentencePiece** (T5, Llama, modelos da Google) usam variações da mesma ideia — começar pequeno, fundir pares frequentes, parar num tamanho-alvo. As diferenças são técnicas (qual métrica de "frequência", como tratar espaços, suporte direto a multi-língua sem pré-tokenização). Pro modelo mental de quem usa Claude no dia a dia, BPE basta.

## Quando ignorar isso

Se você usa Claude pra rascunhar e-mail, ler README, debugar bug pontual — esquece. A diferença entre 800 e 1.100 tokens num prompt é centavos.

A tokenização vira métrica importante quando:

- **Produção via API** — custo por mil chamadas escala rápido, e 30% de inflação multiplica
- **Agente em loop** — contexto cresce a cada turno, e a fatura cresce com ele
- **Processamento em lote** — sumarização de PDF, RAG sobre base grande, classificação de documentos
- **Prompt cache** — saber onde a quebra natural acontece exige ler o tokenizer com algum cuidado

Nesses cenários, ler o tokenizer do seu próprio prompt é exercício barato e revela coisa. Pro resto, fica o modelo mental: **palavras viram pedaços porque um algoritmo de 1994 encontrou esses pedaços úteis no corpus de treino, e seu texto está sendo cortado por eles agora**.

## Fontes

- [Byte-Pair Encoding tokenization — Hugging Face](https://huggingface.co/learn/llm-course/en/chapter6/5) — explicação técnica do algoritmo passo a passo
- [Anthropic tokenizer (aproximação) — javirandor](https://github.com/javirandor/anthropic-tokenizer) — tamanho de vocabulário (~65k) e overlap com cl100k_base
- [Whole words and Claude tokenization — Sander Land](https://tokencontributions.substack.com/p/whole-words-and-claude-tokenization) — análise do mix de treino do tokenizer Claude (57% código, 38% inglês)
- [Tokenization efficiency for non-English languages — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12380774/) — paper sobre custo extra em línguas sub-representadas
- [Implementing a BPE Tokenizer From Scratch — Sebastian Raschka](https://sebastianraschka.com/blog/2025/bpe-from-scratch.html) — referência pra quem quiser implementar
