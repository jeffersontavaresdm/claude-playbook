---
title: "Prompts que funcionam no Claude Code: o que aprendi parando de inventar"
description: "Por meses inventei prompts criativos achando que Claude ia 'pegar a ideia'. Errei feio. Quatro técnicas básicas, com antes/depois, que viraram a chave."
date: 2026-05-02T18:00:00-03:00
category: pratica
tags: [claude-code, prompts]
---

Por muito tempo eu escrevia prompt criativo. Achava que se eu falasse de um jeito interessante, o Claude ia "pegar a ideia" — afinal, ele é esperto. Resultado: Claude esperto fazendo a coisa errada com confiança.

Parei de inventar. Adotei quatro técnicas que estão escritas, literalmente, na doc oficial da Anthropic. O delta no output foi descarado. Aqui vão elas, em ordem de impacto.

## 1. Diga o que fazer, não o que NÃO fazer

A mais impactante, e a que eu mais errava.

Claude lê a frase inteira. Ele não tem filtro especial pra ignorar a parte negada — se você escreve "não use markdown", o token `markdown` entra na atenção e influencia o output. A doc da Anthropic recomenda inverter:

```text
❌ Não use markdown na resposta
✅ Responda em prosa fluida, em parágrafos completos
```

Antes/depois de um trecho real do meu CLAUDE.md:

```text
# Antes
- Não use bullet points pra explicações
- Evite emojis
- Não escreva frases tipo "vou fazer X agora"

# Depois
- Explique em prosa; reserve bullets pra listas de passos
- Use texto plano, sem emojis
- Vá direto pro resultado
```

A versão "depois" funciona melhor porque cada linha descreve o estado-alvo. Claude não precisa traduzir "não X" em "Y" — você já fez a tradução.

## 2. Defina o critério de sucesso antes de escrever o prompt

Virou regra antes de apertar enter: paro 30 segundos e respondo "como vou saber que ele acertou?". Se eu não sei, ele também não sabe.

```text
# Antes
Refatora esse arquivo pra ficar melhor

# Depois
Refatora esse arquivo. Critério de sucesso:
- Funções públicas mantêm a mesma assinatura
- Cobertura de testes não cai
- Linhas reduzem em pelo menos 20%
- Sem mudança de comportamento observável
```

A doc oficial chama isso de **success criteria** e fala explicitamente em "definir o que constitui uma resposta correta". O ganho é dobrado: Claude tem alvo claro, e eu tenho checklist pra revisar a saída.

Serve também como freio. "Refatora pra ficar melhor" abre porta pra renomear coisa, mover arquivo, criar abstração nova. "Sem mudança de comportamento observável" fecha essa porta.

## 3. Estrutura com seções quando o prompt cresce

Pra prompt curto, uma frase resolve. Pra prompt longo (digamos, mais de uns 200 tokens), Claude começa a embaralhar contexto, instrução e dado. Separa.

Uso heading markdown porque já tô digitando markdown:

````text
## Contexto
Estou no projeto X que faz Y. A função `processOrder` está dando timeout em produção.

## Tarefa
Olha o código abaixo e identifica gargalos de performance.

## Critério
- Foco em I/O bloqueante e queries N+1
- Ignore micro-otimizações de CPU
- Formato da resposta: <linha> | <problema> | <fix sugerido>

## Código
```kt
[...]
```
````

Com quatro seções, Claude para de tratar o código como instrução e o "ignore micro-otimizações" como contexto. Os papéis ficam claros e o output fica mais previsível.

A doc oficial recomenda **tags XML** (`<context>`, `<instructions>`, `<example>`) pra esse mesmo propósito. Pra prompt no terminal acho heading mais leve; XML cabe melhor em system prompt longo de API. Vai virar post próprio nessa trilha.

## 4. Mostre 1–2 exemplos quando o formato importa

Se a saída precisa de formato específico — JSON com campos certos, commit message num padrão, comentário num style — exemplo sai mais barato que descrição.

```text
# Antes
Escreve uma commit message no padrão conventional commits, escopo opcional,
footer com Co-Authored-By se aplicável.

# Depois
Escreve uma commit message no padrão dos exemplos:

<exemplo>
feat(auth): adiciona refresh token rotation

Co-Authored-By: Alice <alice@example.com>
</exemplo>

<exemplo>
fix: corrige race condition no cache de sessão
</exemplo>
```

Dois exemplos eliminam ambiguidade que três parágrafos não eliminam. A doc recomenda 3–5 exemplos pra performance ótima, mas pra Claude Code 1–2 costuma bastar — o modelo é forte e contexto custa.

Cuidado com viés: se os dois exemplos têm escopo (`feat(auth)`, `fix:`), Claude vai assumir que escopo é obrigatório mesmo que a descrição diga "opcional". **Varie** entre os exemplos pra cobrir os casos.

## O resto é ruído (por enquanto)

Tem técnicas mais cirúrgicas — chain-of-thought explícito, prefill, XML aninhado, multishot estruturado, role assignment forte. Cada uma vira post próprio dessa trilha.

Mas se você ainda escreve "não faça X" e nunca parou pra escrever um critério de sucesso, essas quatro pagam mais conta. Sem comparação.

Faça o teste no próximo prompt longo: reescreva os "não" em afirmação, adicione um critério, separe em duas ou três seções, e cole um exemplo se o formato importa. Custa 30 segundos. O delta no output é imediato.

## Fontes

- [Prompting best practices — Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct)
- [Use examples (multishot prompting) — Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting)
- [Use XML tags — Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags)
