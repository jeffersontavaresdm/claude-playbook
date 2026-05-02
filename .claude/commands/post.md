---
description: Cria um novo post do claude-playbook sobre o assunto fornecido. Detecta o tipo, pesquisa fontes, escreve em pt-BR no tom da casa, salva, commita e pusha direto pra produção.
---

# /post — escrever um novo post do claude-playbook

**Argumentos:** `$ARGUMENTS` (assunto / título do post — qualquer tipo)

Você é o autor do `claude-playbook`. Crie um post novo sobre o assunto acima seguindo este fluxo. Não pule etapas.

---

## 1 — Detectar o tipo de post

Leia o título e classifique em **uma** das 8 categorias. Se ficar entre duas, escolha a que melhor responda à pergunta "o que o leitor leva embora?". Se nenhuma encaixar, use a estrutura mais próxima como base e ajuste.

| Tipo (`category` no frontmatter) | Quando usar | Tag base | Estrutura |
|---|---|---|---|
| **`fundamentos`** | Teoria/conceito que ajuda a usar Claude (transformer, tokenização, contexto, atenção, embeddings, RAG, fine-tuning) | `fundamentos` + tag específica (`llm`, `tokenização`, etc.) | Por que importa pra usar Claude → fundamento → implicação prática → quando ignorar |
| **`pratica`** | Fluxos, hooks, técnicas, rotinas que você aplica no dia a dia | `claude-code` + tag específica (`hooks`, `plan-mode`, `skills`, `fluxo`, `automação`) | Problema → como resolvi → trade-offs → o que removi/ajustei |
| **`comparacao`** | A vs B (skills vs commands, plan mode vs direto, sonnet vs opus, etc.) | tag de cada lado da comparação | Critério de escolha → opção A → opção B (→ C) → quando cada uma → meu default |
| **`setup`** | Configurações, templates, arquivos de partida (CLAUDE.md, settings.json, hooks.json, .gitignore, etc.) | `settings` ou `claude-md` ou `documentação` | O que precisa cobrir → meu mínimo viável → opcional → exemplo completo |
| **`comando`** | Slash command ou feature do Claude Code (`/clear`, `/compact`, `/init`, `/agents`, `/mcp`, hooks, MCPs, etc.) | `claude-code` + `slash-command` | Abertura curta (gancho + tese) → o que é (1-2 frases, com sintaxe inline) → **quando uso** (bullets em negrito + 1 frase cada) → **quando NÃO uso** (bullets) → 1 pitfall ou insight pessoal (opcional, só se acrescenta) → resumindo (2 frases punchy) |
| **`historia`** | Linha do tempo, evolução, contexto histórico, marcos da IA, papers fundadores (Turing, attention is all you need, surgimento do RAG) | `historia` + tag específica (`llm`, `transformer`, `ia-classica`) | Contexto da época → problema que existia → o que mudou → quem fez → consequência prática hoje |
| **`caso`** | Case study real, post-mortem, análise de aplicação concreta (levelsio, ChatGPT por dentro, falha de produto baseado em IA) | `caso` + tag de domínio (`micro-saas`, `produto`) | Situação inicial → decisões tomadas → resultado → o que dá pra copiar → o que NÃO dá pra copiar |
| **`projeto`** | Tutorial de construção end-to-end onde o leitor sai com algo funcionando (primeiro RAG, agente, MCP server, fine-tuning) | `projeto` + tag de tema (`rag`, `agente`, `mcp`) | O que vamos construir → pré-requisitos → passos com código → como testar → variações possíveis → próximos passos |

**Importante:** o valor exato listado em `category` (em `**negrito monoespaçado**`) é o que vai no frontmatter. Categorias usam nomes sem acento e singular (`pratica`, não `prática`; `comparacao`, não `comparação`; `historia`, não `história`) — o Zod valida e a build quebra se errar.

Reporte ao usuário (1 linha) qual tipo escolheu e siga.

---

## 2 — Pesquisar (3-5 fontes confiáveis)

Use **WebSearch** e **WebFetch**. Adapte a pesquisa ao tipo:

- **fundamentos** → papers no arXiv, Lilian Weng, Jay Alammar, Distill, blogs de research (Anthropic, DeepMind, OpenAI)
- **pratica** → docs oficiais Claude Code, Anthropic engineering blog, posts de Simon Willison e da comunidade, repos de exemplo no GitHub
- **comparacao** → docs oficiais de cada lado, threads de comparação (HN, Reddit r/ClaudeAI, blogs)
- **setup** → docs oficiais, exemplos de configs em repos populares, templates da própria Anthropic
- **comando** → **use o subagent `claude-code-guide` (Agent tool) como primeira fonte** — ele tem conhecimento estruturado sobre features do Claude Code. Complemente com docs oficiais (`docs.claude.com/en/docs/claude-code`), changelog do Claude Code, posts/threads da comunidade
- **historia** → papers originais (arXiv, Google Scholar), Wikipedia (linhas do tempo), entrevistas dos pesquisadores envolvidos, livros de referência (Russell & Norvig, Goodfellow)
- **caso** → blogs/posts dos protagonistas, threads no Twitter/HN, entrevistas em podcasts, post-mortems públicos, números reportados em fontes confiáveis
- **projeto** → docs oficiais das libs/APIs que vão ser usadas, repos de exemplo no GitHub (com stars), tutoriais validados (vide número de stars/comentários)

Anote 3-5 URLs concretas. Vão pra seção final **"Fontes"** do post.

Se WebSearch falhar/estiver indisponível, use WebFetch direto em URLs canônicas conhecidas.

---

## 3 — Decidir o framing

**Sempre ancorar em uso prático com Claude.** O leitor é alguém que já usa Claude e quer usar melhor.

Em qualquer tipo:
- Comece com **gancho concreto** — uma pergunta, problema ou fricção real
- Termine numa **decisão prática** — o leitor sai sabendo o que fazer diferente

Não é tutorial puro. Não é academia. É notebook de quem aplica.

---

## 4 — Escrever (tamanho varia por tipo)

**Tamanho-alvo:**

| Tipo | Palavras | Tempo de leitura |
|---|---|---|
| fundamentos | 800-1200 | ~4-6 min |
| pratica | 800-1200 | ~4-6 min |
| comparacao | 800-1200 | ~4-6 min |
| setup | 600-1000 | ~3-5 min |
| comando | 400-700 | ~2-4 min |
| historia | 600-900 | ~3-5 min |
| caso | 600-900 | ~3-5 min |
| projeto | 1000-1500 | ~5-7 min |

**Mais curto bate mais longo.** Densidade > volume. Posts devem ler como o post `plan-mode-no-dia-a-dia` (~430 palavras): leitura fluida, decisão ("quando uso / não uso") como espinha dorsal, sem cerimônia.

Posts de `projeto` são os únicos com licença pra ser maiores — código toma espaço. Mas mesmo neles: corte explicação que repete o que o código já mostra.

Se o post chegou perto do teto, releia procurando o que pode cortar.

### Regra anti-redundância (importante)

Se um exemplo, cenário ou bloco de código **já comunicou** uma ideia, **não escreva uma seção de walkthrough/passo a passo do mesmo padrão**. Isso vira cerimônia e cansa o leitor.

Walkthrough só vale a pena quando mostra algo que o exemplo simples não consegue:
- Decisões intermediárias do usuário (não-óbvias)
- Troubleshooting de um caso específico
- Fluxo com saída de comando real (output observável)

Se o tema cabe em "aqui está o comando, aqui está quando usar" — fique nisso. Não infle.

**Tom da casa (igual em todos os tipos):**
- 1ª pessoa, pt-BR informal mas técnico — conversa entre devs
- Frases curtas. Parágrafos de 1-3 frases
- Bullets quando ficar mais legível que prosa
- Evite jargão de marketing ("revolucionário", "incrível", "game-changer")
- Códigos com linguagem (` ```ts `, ` ```py `, ` ```bash `, ` ```json `)
- Diagramas em ASCII art ou mermaid (combina com tema terminal)
- Honestidade sobre incerteza > falsa confiança ("ainda testando", "funciona pra mim, talvez não pra você")

**Use a estrutura da tabela §1** correspondente ao tipo escolhido. Adapte se o assunto pedir, mas não invente estrutura genérica.

---

## 5 — Slug e tags

**Slug:** kebab-case, sem acentos, descritivo, em pt-BR.
- ✅ `fundamentos-llm-arquitetura-transformer.md`
- ✅ `hooks-de-notificacao-que-uso.md`
- ✅ `skills-vs-slash-commands-quando-cada-um.md`
- ✅ `slash-command-clear-quando-vale-a-pena.md`
- ✅ `historia-attention-is-all-you-need.md`
- ✅ `caso-levelsio-microsaas-100k-mes.md`
- ✅ `projeto-primeiro-rag-com-postgres.md`
- ❌ `transformer.md` (genérico)
- ❌ `meu-novo-post.md` (vazio)

**Tags:** combine a tag base do tipo (tabela §1) com 1-2 tags específicas. **Reuse tags existentes** antes de criar novas — lista atualizada em `CLAUDE.md` §"Padrões de tags".

---

## 6 — Frontmatter

```yaml
---
title: "<título humano>"
description: "<subtítulo de 1-2 frases — aparece em listagens e meta tags>"
date: <YYYY-MM-DD da execução — use a data atual real>
category: <fundamentos | comando | pratica | setup | comparacao | historia | caso | projeto>
tags: [<tag-base>, <tag-específica>]
---
```

Sem campo `draft` — todo `/post` publica direto. Se o usuário não gostar depois da leitura, ele pede pra remover ou ajustar.

---

## 7 — Salvar

Caminho: `src/content/posts/<slug>.md`

---

## 8 — Validar, commitar, pushar

```bash
pnpm build       # garante que o schema bate
git add src/content/posts/<slug>.md
git commit -m "feat: post — <título>"
git push origin main
```

A Action publica em ~30s. URL final: `https://jeffersontavaresdm.github.io/claude-playbook/artigos/<slug>`.

---

## 9 — Reportar ao usuário

Mensagem final no chat (concisa):

```
Tipo: <fundamentos | pratica | comparacao | setup | comando | historia | caso | projeto>
Publicado: src/content/posts/<slug>.md
URL: https://jeffersontavaresdm.github.io/claude-playbook/artigos/<slug>
Fontes: <3-5 links>

No ar em ~30s. Lê e me avisa se quiser ajustar ou remover.
```
