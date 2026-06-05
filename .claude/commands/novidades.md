---
description: Atualiza o radar /novidades do claude-playbook. Busca novidades de IA/tech dos últimos 7 dias, dedupe contra o quadro atual, cura com o usuário e publica o top rolante.
---

# /novidades — atualizar o radar de novidades

**Argumentos:** `$ARGUMENTS` (opcional — um foco/escopo pra busca, ex: "só Claude", "modelos open-weight", "dev tools". Vazio = escopo padrão.)

Você mantém o **radar de novidades** do claude-playbook: um quadro rolante das novidades mais relevantes de IA/tech dos últimos dias. **Não é post, não é a sua opinião** — é a notícia mastigada em pt-BR pra o autor ficar por dentro. Siga o fluxo, não pule etapas.

## Regras do quadro

- O quadro vive em `src/data/novidades.json` (array de cards).
- Tamanho máximo = `NOVIDADES_MAX` em `src/consts.ts` (hoje 10). **Cap suave**: se a semana não rende cards realmente notáveis, mostre menos — não encha de filler.
- Card só sai quando é empurrado pra fora por um melhor/mais novo. Ordena por `data` desc (mais recente no topo; "os últimos" = os mais antigos, no fim da lista).
- Escopo padrão: **IA em geral** — Claude/Anthropic, OpenAI, Google/Gemini, Meta, modelos, papers relevantes, ferramentas de dev com IA, **política/regulação de IA e segurança/cibersegurança**. `$ARGUMENTS` pode estreitar ou ampliar.
- **A régua é confirmação, não a categoria.** Boato, rumor e especulação ficam de fora — inclui "leak" não verificado e palpite de comunidade sobre modelo/feature não anunciado. Mas **vazamento confirmado pode entrar**: se de fato aconteceu e foi verificado por fonte confiável (ex: o código-fonte do Claude Code vazou de verdade), virou fato e vale. Nesse caso, reporte o **evento** e linke a **reportagem confiável** — nunca linke nem reproduza o material vazado (IP de terceiro). Na dúvida sobre veracidade/data, verifique na fonte antes de incluir.

## 1 — Ler o quadro atual

Leia `src/data/novidades.json`. Guarde título, `fonteUrl` e `data` de cada card — você vai precisar pra dedupe e pra mostrar o estado atual.

## 2 — Buscar (últimos 7 dias)

Use **WebSearch** e **WebFetch**. Considere a data atual real e busque novidades dos **últimos 7 dias** dentro do escopo. Boas fontes: blogs oficiais (Anthropic, OpenAI, Google DeepMind, Meta AI), changelogs, The Batch (DeepLearning.AI), Simon Willison, Hacker News, TechCrunch/The Verge (seção IA), arXiv (papers que viralizaram).

Priorize por **valor pra quem usa IA pra programar no dia a dia**:
1. Lançamento/atualização de **modelo** ou de **ferramenta** (Claude Code, IDEs, SDKs, APIs)
2. Produtos e features grandes
3. Papers / recursos notáveis
4. Ruído de mercado/hype e especulação não confirmada → peso baixo ou fora (vazamento só entra se confirmado — ver regra acima)

## 3 — Montar candidatos

Para cada novidade que passa a régua:

- **dedupe**: se já existe um card com a mesma `fonteUrl` ou claramente o mesmo fato, não duplique.
- escreva em **pt-BR** (traduza se a fonte for em outra língua):
  - `id` — slug kebab-case derivado do título (ex: `opus-4-8-1m-contexto`)
  - `titulo` — curto, factual, sem clickbait
  - `tldr` — 1-2 frases; o suficiente pra entender o que é
  - `resumo` — 1 parágrafo curto (2-4 frases). **Resumo escrito por você, nunca cópia do texto da fonte** (direito autoral — o blog é público).
  - `fonteNome` — nome da publicação/empresa (ex: "Anthropic", "The Verge")
  - `fonteUrl` — link direto da fonte
  - `data` — `YYYY-MM-DD` da novidade

## 4 — Apresentar e curar

Mostre ao usuário, conciso:

- **Quadro atual** (N cards): lista numerada de títulos + data.
- **Candidatos novos** (já deduplicados): título + 1 linha + por que vale.
- Sua **recomendação**: o que entra, o que sai, e por quê.

Então **pare e espere a decisão dele**:

- `remove X e Y` (nomes ou números) → remove esses e entram os novos.
- `seguir` → remove os **mais antigos** (fim da lista) na quantidade necessária pra caber os novos dentro de `NOVIDADES_MAX`, e entram os novos.
- Se ele ajustar (trocar um título, descartar um candidato), acate.
- Se **não há nada novo relevante**: diga isso e **não faça commit** — o quadro fica como está.

## 5 — Reescrever o quadro

Monte o array final:

- aplica remoções + adições conforme a decisão;
- respeita `NOVIDADES_MAX` (cap suave — pode ter menos);
- ordena por `data` desc;
- escreve `src/data/novidades.json` como JSON válido (indentado com 2 espaços).

## 6 — Validar, commitar, pushar

```bash
pnpm build       # garante que o schema da coleção bate
git add src/data/novidades.json
git commit -m "feat: novidades — <resumo do que entrou>"
git push origin main
```

A Action publica em ~30s. URL: `https://jeffersontavaresdm.github.io/claude-playbook/novidades`.

## 7 — Reportar ao usuário

```
Entraram: <títulos novos>
Saíram:   <títulos removidos>
Quadro:   <N> cards
URL:      https://jeffersontavaresdm.github.io/claude-playbook/novidades

No ar em ~30s.
```
