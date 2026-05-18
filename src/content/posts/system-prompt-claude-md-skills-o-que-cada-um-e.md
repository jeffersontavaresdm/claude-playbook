---
title: "System prompt, CLAUDE.md e skills: o que cada um é"
description: "Tem gente dizendo que 'editou o system prompt do Claude Code'. Não editou — o CLI monta o system prompt sozinho. Esse post separa as peças: o que entra como system prompt, o que entra como contexto, o que só configura o CLI."
date: 2026-05-17
category: fundamentos
tags: [fundamentos, claude-md, skills]
---

"Editei o system prompt do Claude Code." Ouço isso em conversa e a frase me incomoda — porque no Claude Code (CLI, planos Pro/Max) **não existe esse botão**. Você não digita o system prompt, não abre um arquivo `system.md`, não cola um bloco "Você é um assistente que...". O CLI monta o system prompt sozinho, juntando peças. O que você edita são as peças.

Esse post separa as peças. Espinha simples: tenho uma regra que quero que o Claude siga sempre. **Onde coloco?**

## O que é system prompt

System prompt é o slot da conversa que define como o modelo deve se comportar nessa sessão. Não é mensagem do usuário, não é resposta do modelo. É o "manual" que vem antes de qualquer turno — identidade, regras, ferramentas disponíveis, contexto persistente.

No Claude Code, esse slot é populado pelo próprio CLI: a Anthropic envia um system prompt base (instruções do Claude Code — como usar tools, como escrever código, como se comunicar) e injeta o que você configurou em volta. Você não vê esse bloco diretamente. Você influencia ele indiretamente, mexendo nas peças certas.

## As peças

```
┌─────────────────────────────────────────────────┐
│  System prompt (montado pelo Claude Code)       │
│  ├─ instruções base do CLI (você não edita)     │
│  ├─ descrição das tools disponíveis             │
│  └─ descrição das skills/commands carregáveis   │
├─────────────────────────────────────────────────┤
│  Contexto inicial (user messages injetadas)     │
│  ├─ CLAUDE.md (projeto + user + local)          │
│  └─ memórias auto-carregadas                    │
├─────────────────────────────────────────────────┤
│  Sob demanda                                    │
│  ├─ corpo de skill quando invocada              │
│  └─ slash command customizado quando chamado    │
└─────────────────────────────────────────────────┘
```

Cada peça tem regra diferente de carregamento. Vamos uma por uma.

### CLAUDE.md — não é system prompt, é contexto

Surpresa pra muita gente: a doc da Anthropic é explícita que `CLAUDE.md` entra como **user message logo depois do system prompt**, não como parte do system prompt em si. Funciona quase igual na prática — o modelo lê antes de qualquer pedido seu — mas tecnicamente é contexto, não regra de identidade.

Implicação prática: tudo que está no `CLAUDE.md` ocupa **janela de contexto da sessão**. Quanto mais inflado, mais token gasto antes do primeiro prompt seu, e mais o modelo começa a ignorar partes. Esse é o argumento central do <a href="/claude-playbook/artigos/claude-md-minimo-viavel" target="_blank" rel="noopener">CLAUDE.md mínimo viável</a>: enxuto é mais efetivo que completo.

CLAUDE.md é carregado **automaticamente, sempre, no início da sessão**. Vale pra todo prompt daquela sessão.

### Skills — descrição sempre visível, corpo sob demanda

Skills (`.claude/skills/<nome>/SKILL.md`) seguem uma lógica diferente: a **descrição** da skill (uma linha do frontmatter) fica visível no system prompt, então o Claude sabe que ela existe e pra quê. O **corpo** (o markdown inteiro com instruções, exemplos, código) só é carregado quando a skill é invocada — manualmente pelo usuário ou automaticamente quando o pedido bate com a descrição.

Isso muda o cálculo. Você pode ter 30 skills no projeto sem inflar contexto — só as descrições ocupam espaço, e descrição é uma linha. O corpo entra na hora, só quando precisa.

Se a skill tem `disable-model-invocation: true` no frontmatter, nem a descrição aparece — vira slash command puro, invocação só manual.

### Slash commands customizados — quase iguais a skills

Slash commands em `.claude/commands/*.md` se comportam de jeito muito parecido com skills hoje (a arquitetura foi sendo fundida): descrição visível, corpo carregado quando invocado. A diferença prática é o gesto — slash command você chama com `/nome`, skill o modelo decide invocar quando bate.

Pra escolher entre os dois, o <a href="/claude-playbook/artigos/skills-vs-slash-commands-quando-cada-um" target="_blank" rel="noopener">post sobre skills vs slash commands</a> tem a heurística completa.

### settings.json — não compõe system prompt

`settings.json` configura **comportamento do CLI**, não conteúdo de prompt. Permissões, hooks, env vars, MCPs, modelo padrão. Nada disso aparece como texto que o modelo lê. Mexer em settings muda o que o CLI **executa**, não como o Claude **pensa**.

Mistura comum: alguém quer que o Claude "sempre faça X" e tenta colocar em settings.json. Settings.json não tem esse canal. Regra de comportamento vai pra CLAUDE.md ou skill.

### E o AGENTS.md?

Convenção que outros tools (Cursor, Continue, alguns plugins) usam. Claude Code **não lê** AGENTS.md nativamente. Se seu repo já tem um, a saída é importar pelo CLAUDE.md:

```markdown
@AGENTS.md
```

A linha `@arquivo` no CLAUDE.md inclui o conteúdo do outro arquivo como se estivesse ali.

## Onde colocar a regra X

Heurística que uso:

| Quando vale a regra | Onde colocar |
|---|---|
| Sempre nessa sessão, em qualquer tarefa | `CLAUDE.md` |
| Só em certas tarefas (descrevíveis) | Skill |
| Quero invocar manualmente quando lembrar | Slash command |
| É comportamento do CLI (permissão, hook, env) | `settings.json` |
| Vale só pra mim, não pro time | `CLAUDE.local.md` ou `settings.local.json` |

O erro mais comum é jogar tudo no `CLAUDE.md`. Funciona — até começar a falhar silenciosamente. Quando o CLAUDE.md passa dos 300-400 tokens densos, o modelo começa a tratar partes dele como ruído. <a href="/claude-playbook/artigos/card-pra-humano-vs-pra-claude" target="_blank" rel="noopener">A mesma lógica do card pra humano vs pra Claude</a>: contexto que você não dá explicitamente não existe pra ele — mas contexto que você dá em excesso também não.

## Decisão prática

Próxima vez que você for "configurar uma regra pro Claude":

1. Pergunte se ela vale **sempre**. Se sim, CLAUDE.md — curto.
2. Se vale só em casos específicos com gatilho claro ("quando o usuário pedir post", "quando for revisar PR"), skill.
3. Se quer um gesto manual ("digito `/foo` e ele segue um roteiro"), slash command.
4. Se é comportamento do CLI (permitir comando, rodar hook, setar env), settings.json.

E pare de tentar editar o system prompt. Você não edita — você compõe ele, escolhendo bem em qual slot cada regra mora.

## Fontes

- [Claude Code — Memory & CLAUDE.md](https://docs.claude.com/en/docs/claude-code/memory)
- [Claude Code — Skills](https://docs.claude.com/en/docs/claude-code/skills)
- [Claude Code — Slash commands](https://docs.claude.com/en/docs/claude-code/slash-commands)
- [Claude Code — Settings](https://docs.claude.com/en/docs/claude-code/settings)
- [Claude Code — CLI reference (`--append-system-prompt`)](https://docs.claude.com/en/docs/claude-code/cli-reference)
