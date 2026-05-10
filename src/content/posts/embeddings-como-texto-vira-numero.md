---
title: "Embeddings: como texto vira número (e por que isso destrava tudo)"
description: "Como o modelo sabe que 'rei' e 'rainha' são parecidos sem decorar nada? Convertendo palavras em vetores onde significado vira geometria."
date: 2026-05-10
category: fundamentos
tags: [fundamentos, llm]
---

Como o Claude sabe que "rei" e "rainha" são palavras parecidas? E que "feliz" combina mais com "alegre" do que com "carro"?

Ele não decora isso numa tabela. Ele converte cada palavra em uma lista de números — um **vetor** — e palavras parecidas viram vetores próximos no espaço. Significado vira geometria. Esse é o truque mais bonito da IA moderna, e é a peça que destrava praticamente todas as aplicações práticas que você vê hoje: busca semântica, recomendação, RAG, classificação automática.

Se você ainda não leu <a href="/claude-playbook/artigos/attention-mecanismo-central-dos-llms" target="_blank" rel="noopener">Attention: o mecanismo central dos LLMs</a>, começa por lá — esse post explica a representação que o attention compara. Embedding é o que vem **antes** do attention. É o ingrediente.

## O que é um embedding

Um embedding é um **vetor de N dimensões** — uma lista de números — que representa um token (palavra, pedaço de palavra, caractere). N costuma ser algo entre 768 e 4.096 dependendo do modelo.

Tipo isso, simplificado:

```
"rei"     → [0.21, -0.43, 0.78, ..., 0.05]   (768 números)
"rainha"  → [0.19, -0.41, 0.81, ..., 0.07]   (768 números)
"carro"   → [-0.62, 0.33, -0.10, ..., 0.91]  (768 números)
```

Cada token do vocabulário tem o seu vetor. O modelo **aprende** esses vetores durante o treino — eles começam aleatórios e vão sendo ajustados a cada exemplo de texto, em um processo que ninguém programou explicitamente. No fim, palavras com significado parecido têm vetores parecidos.

Resultado: **significado vira geometria**. Distância no espaço = grau de similaridade.

## Mapa 2D da intuição

Imagina que comprimi as 768 dimensões em só 2 pra desenhar num papel. Ficaria mais ou menos assim:

```
                 ↑
          rainha •   • rei
                       
     mulher •     • homem
                       
                       
         alegre •  • feliz
                       
                       
                  • moto
            carro •    
                       →
```

"rei" e "rainha" perto. "carro" e "moto" perto. "feliz" e "alegre" perto. E os grupos longe uns dos outros.

Embeddings reais não cabem em 2D — são centenas ou milhares de dimensões. Mas o conceito é idêntico: **distância pequena = significado próximo**. O modelo não sabe o que "feliz" significa no sentido humano. Ele só sabe que esse vetor mora num bairro do espaço onde também moram "alegre", "contente" e "satisfeito" — e fica longe do bairro de "triste".

## O exemplo que mostra que funciona mesmo

O experimento clássico vem do paper original do **Word2Vec** (Mikolov et al., 2013). Pega os vetores aprendidos e faz aritmética:

```
vetor("rei") - vetor("homem") + vetor("mulher")  ≈  vetor("rainha")
```

Lê assim: pega o vetor de "rei", subtrai o de "homem", soma o de "mulher". O resultado é um vetor novo. Procura no vocabulário qual palavra tem o vetor mais próximo desse resultado. Resposta: **rainha**.

Por quê? Porque o modelo, sem nunca ter sido programado pra isso, capturou **gênero como uma direção** no espaço. A diferença `rei - homem` virou um vetor que aponta na direção "tirar a parte masculina". Aplicar essa direção em "mulher" leva a algo próximo de "rainha".

Funciona com vários eixos:

```
vetor("Paris") - vetor("França") + vetor("Itália") ≈ vetor("Roma")
vetor("andar")  - vetor("andou")  + vetor("comer")  ≈ vetor("comeu")
```

Capital de país. Tempo verbal. Gênero. Tudo isso emergiu **sozinho**, só de o modelo ler texto e ajustar vetores. Ninguém escreveu uma regra dizendo "gênero é uma dimensão importante". A geometria do espaço aprendeu.

> Caveat honesto: o exemplo do "rei − homem + mulher = rainha" é meio teatral. Na prática, o vetor mais próximo do resultado costuma ser o próprio "rei" — implementações famosas excluem as palavras de entrada da resposta pra dar o efeito bonito. A relação geométrica existe; o trecho é só mais ruidoso do que parece em palestra.

## Por que isso destrava aplicação prática

Quase todo produto de IA que você usa hoje depende de embeddings em algum momento. Os principais casos:

**Busca semântica.** Em vez de procurar a palavra-chave exata, você procura por significado. Usuário pesquisa "dor de cabeça" → o sistema encontra um documento que fala de "enxaqueca", mesmo sem a palavra "dor" aparecer ali. Como? Os dois textos têm embeddings próximos.

**Recomendação.** Produtos com descrição parecida têm vetor parecido. "Produto similar" deixa de ser categoria manual e vira "vizinhos no espaço".

**Classificação e clusterização.** Joga 10 mil tickets de suporte num espaço de embeddings, agrupa por proximidade, e os clusters viram categorias naturais — sem ninguém rotular nada.

**RAG (Retrieval-Augmented Generation).** A base de qualquer sistema que "consulta sua base de documentos antes de responder". O documento e a pergunta viram embeddings, o sistema acha os mais próximos, joga eles no contexto do modelo. É assunto pra um post inteiro, mas o fundamento é esse: similaridade de vetor.

A Anthropic, aliás, não tem modelo de embedding próprio — recomenda integrar com **Voyage AI** quando você precisa de vetores pra busca semântica ou RAG. Embedding é um tipo de modelo treinado pra outro objetivo (similaridade) que o de gerar texto, então faz sentido especializar.

## O que isso muda pra como você usa o Claude

Quando você manda um prompt, **a primeira coisa que acontece é cada token virar embedding**. Toda a mecânica de attention que vem depois opera nesses vetores, não nas palavras. Saber disso muda algumas decisões práticas:

**Sinônimos são quase intercambiáveis.** "Obrigado" e "valeu" têm embeddings próximos. "Refatora" e "reorganiza" também. O modelo não vai te tratar muito diferente baseado em qual escolheu — então não fique reescrevendo um prompt 5 vezes trocando palavra por sinônimo achando que vai mudar o resultado. A região do espaço é a mesma.

**Direcionamento positivo bate negativo.** Pede "responda formal" e "responda profissional" — embeddings próximos, ambos puxam o modelo pra mesma direção do espaço de estilo. Agora pede "não seja informal" — esse "não" não cancela o vetor de "informal"; só adiciona ruído. O modelo continua sendo influenciado pela palavra "informal" estar ali, e a região do espaço onde a instrução te leva fica menos definida. Por isso conselho de prompt repetido sempre: **diz o que quer, não o que não quer**.

**Idioma pesa.** Embeddings de palavras em português e inglês não ficam no mesmo lugar exato — modelos modernos alinham bastante, mas não 100%. Misturar idiomas no prompt geralmente custa um pouco de qualidade. Se a tarefa pede precisão técnica, escolhe um e fica.

**Termos raros são instáveis.** Palavras que aparecem pouco no treino têm embedding menos definido — moram em região mais ambígua do espaço. Por isso jargão muito específico de um domínio, ou nome de produto interno da sua empresa, pode confundir o modelo: ele "chuta" o vetor com base nos pedaços (subwords). Quando dá, traduz pra termo comum, ou explica.

## Pra onde isso vai

Ficou de fora aqui o **como** se mede distância entre dois vetores na prática. Spoiler: quase ninguém usa distância euclidiana — o padrão é **similaridade de cosseno**, que mede o ângulo entre os vetores, não a magnitude. Faz sentido quando você lembra que o que importa é a *direção* no espaço, não o *tamanho* do vetor. Esse é assunto do próximo post de fundamentos.

Depois disso, o caminho natural é **RAG**: como tudo que esse post explicou vira um sistema que busca documentos por significado e alimenta o modelo. É onde a teoria de embedding sai do papel e vira aplicação real.

Por enquanto, o modelo mental: **toda palavra que entra no Claude é, primeiro, um vetor**. E vetores próximos no espaço significam coisas próximas pro modelo. Pensar em "região do espaço de embeddings" em vez de "palavra exata" muda como você escreve prompt, e por que algumas escolhas funcionam melhor que outras.

## Fontes

- [The Illustrated Word2vec — Jay Alammar](https://jalammar.github.io/illustrated-word2vec/) — referência visual canônica
- [Efficient Estimation of Word Representations in Vector Space — Mikolov et al., 2013](https://arxiv.org/abs/1301.3781) — paper original do Word2Vec
- [king - man + woman is queen; but why? — Piotr Migdał](https://p.migdal.pl/blog/2017/01/king-man-woman-queen-why/) — análise honesta do exemplo clássico
- [Embeddings — Claude Docs](https://docs.claude.com/en/docs/build-with-claude/embeddings) — recomendação oficial de Voyage AI como provider
- [The hidden algebraic structure of words — School of Informatics, Edinburgh](https://informatics.ed.ac.uk/news-events/news/news-archive/king-man-woman-queen-the-hidden-algebraic-struct) — fundamentação acadêmica
