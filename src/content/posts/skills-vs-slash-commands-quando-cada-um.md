---
title: "Skills vs slash commands no Claude Code: quando usar cada um"
description: "Dois mecanismos de extensão que parecem fazer a mesma coisa — mas não fazem. A diferença real, e por que tudo que eu crio hoje começa como skill."
date: 2026-04-27
category: comparacao
tags: [claude-code, skills, slash-command]
---

Na minha cabeça, skills e slash commands eram a mesma coisa. Acabei criando o `/post` deste blog como command — funciona, mas não seria a escolha de hoje.

A versão curta:

> **Skills é o padrão moderno.** Commands existem por backward-compat. Tudo que command faz, skill faz — e mais.

Mas tem nuance que vale a pena entender pra decidir caso a caso.

## Skills, em uma frase

Arquivo `SKILL.md` dentro de `.claude/skills/<nome>/`, com frontmatter YAML + corpo Markdown. Pode ter arquivos auxiliares no mesmo diretório (templates, exemplos, scripts).

Invocação: `/<nome>` manual, **OU** automática pelo Claude quando ele vê algo relevante (a menos que você desligue com `disable-model-invocation: true`).

## Slash commands custom, em uma frase

Arquivo `.claude/commands/<nome>.md`, mesmo formato (frontmatter + Markdown). Único arquivo, sem suporte oficial a auxiliares. Invocação: só `/<nome>` manual.

Em 2025, commands foram **merged** com skills internamente — continuam funcionando, mas não ganham features novas.

## O que é "frontmatter" — e o que o Claude lê quando

Frontmatter é o bloco de metadados no topo do arquivo `.md`, delimitado por duas linhas de `---`. Dentro dele, pares `chave: valor` em **YAML** (formato de configuração comum, mesmo do `docker-compose.yml` ou GitHub Actions). Pra skill, os dois campos que importam são `name` e `description`.

Um `SKILL.md` mínimo se parece com isso:

```markdown
---
name: commit-style
description: Padrões de mensagem de commit deste projeto.
  Use quando o usuário pedir pra commitar mudanças.
---

Use prefixos `feat:`, `fix:`, `chore:`, `refactor:`.
Primeira linha em até 70 caracteres, modo imperativo.
Body opcional explica o "porquê", não o "o quê".
Inclua `#123` quando houver issue relacionada.
(+ instruções específicas do projeto)
```

Outros campos opcionais (`disable-model-invocation: true`, `allowed-tools: [Read, Grep]`, etc.) vão no mesmo bloco, entre os dois `---`. É lá que mora todo o controle de comportamento da skill.

Quando você abre o Claude Code numa pasta, **só o frontmatter entra no contexto inicial** — o Claude vê que existe uma skill chamada `commit-style` e sabe pra que serve, pela `description`. O corpo (tudo abaixo do segundo `---`) **só carrega quando a skill é invocada** — manualmente com `/commit-style` ou quando o próprio modelo decide chamar, ao detectar que o assunto bate com a description.

Implicação prática: você pode ter 30 skills no projeto sem pagar 30× o custo de contexto inicial. Paga só pelas descriptions; o conteúdo entra sob demanda. É por isso que **a description é a parte que mais importa**: descrição mal escrita = Claude não puxa quando deveria, ou puxa quando não devia.

Commands seguem a mesma estrutura (frontmatter + corpo, com as mesmas regras de carregamento), só que sem o passo de "Claude decide invocar sozinho".

## A diferença que mais importa

**Iniciativa de quem invoca.**

| | Skills | Commands |
|---|---|---|
| Invocação manual (`/<nome>`) | ✓ | ✓ |
| Invocação automática pelo Claude | ✓ (default) | ✗ |
| Posso desligar a auto-invocação | ✓ | n/a |

Tudo o resto — frontmatter, argumentos, escopo enterprise/personal/project — é praticamente igual. A questão real é: **você quer que o Claude possa decidir invocar isso sem você pedir?**

## Quando uso skill

- **Conhecimento ou procedimento que o Claude usaria sozinho se soubesse que existe** — "como eu escrevo testes neste projeto", "padrões de commit", "estrutura de PR". Skill com auto-invocation deixa o modelo puxar quando relevante.
- **Procedimento com auxiliares** — templates, exemplos, scripts no mesmo diretório. Só skills suportam essa estrutura.
- **Compartilhamento via plugin** — distribuição organizada (plugin marketplace) é só skills.
- **Monorepo** — skills descobrem `.claude/skills/` em subdiretórios automaticamente; commands não.

## Quando uso command

- **Procedimento que eu *sempre* invoco manualmente** — tipo `/post` deste blog. Não quero que o Claude decida criar post sem eu pedir.
- **Side effects que precisam ser explícitos** — deploy, commit, push. Auto-invocação aqui é perigoso por princípio.
- **Procedimento simples sem auxiliares** — se cabe em um `.md`, é mais leve manter como command.

Tecnicamente, hoje uma skill com `disable-model-invocation: true` faz o mesmo. Mas como commands são default-manual, eu prefiro pra esses casos pelo princípio da menor surpresa: o nome do mecanismo já diz "isso só roda quando você manda".

## O custo de contexto

Ambos cobram igual:

- **Description sempre carregada** (~1% da janela, fallback ~8K caracteres no total entre todas as skills/commands)
- **Corpo carregado só ao invocar**
- Múltiplas invocações dividem um budget de ~25K tokens; as mais antigas caem primeiro em compaction

Implicação prática: **a description é o que mais importa pra economia**. Descrição vaga = Claude não invoca quando deveria, ou invoca quando não deveria. Uma boa description é a diferença entre skill útil e skill morta.

## Pitfall que aprendi

Skills com auto-invocação são ótimas até o dia que o Claude resolve invocar uma quando você não queria. Aconteceu comigo: uma skill `deploy-staging` foi puxada no meio de uma sessão de refactor — porque o título *parecia* relevante. Ela não rodou deploy (`allowed-tools` não incluía `Bash`), mas carregou o conteúdo todo no contexto, gastando tokens à toa.

Lição: pra qualquer coisa com side effect real, use `disable-model-invocation: true` na skill — ou, mais honesto, guarde como command. O nome `/<nome>` deixa claro pra você (e pra mim, em sessão futura) que isso não é coisa que o Claude decide sozinho.

## Meu default

- **Skill** quando o conteúdo é referência ou procedimento que o Claude pode aplicar sozinho com benefício
- **Command** quando eu sou sempre o trigger e quero zero ambiguidade

Em código novo, tudo começa como skill — exceto quando for explicitamente "eu mando, o Claude faz". O `/post` é command porque eu sempre invoco; o `CLAUDE.md` editorial deste projeto poderia ter virado skill se fosse mais procedimental, mas como é referência ambiente, ficou onde está.

## Resumindo

Skills é o padrão; commands é o legado bem-vivo pra casos onde controle manual é o ponto. Tudo que eu construo novo nasce como skill, com `disable-model-invocation` ligado quando preciso de explicitude — e ainda assim, pra hábitos manuais de longo prazo, command é mais honesto sobre a intenção.

## Fontes

- [Extend Claude with skills (Claude Code Docs)](https://code.claude.com/docs/en/skills)
- [Slash commands](https://code.claude.com/docs/en/slash-commands)
- [How Claude Code Works — context lifecycle](https://code.claude.com/docs/en/how-claude-code-works)
- [Commands reference (built-in + bundled)](https://code.claude.com/docs/en/commands)
