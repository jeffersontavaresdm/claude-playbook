---
title: "/ultrareview: code review multi-agente que roda na nuvem"
description: "Um esquadrão de agents reviewer corre em paralelo na infra da Anthropic e cada bug é independentemente reproduzido antes de virar relatório. Quando vale trocar pelo /review."
date: 2026-05-02
category: comando
tags: [claude-code, slash-command]
---

Diferente do `/review` — que é single-pass, local, devolve em segundos — o `/ultrareview` dispara um **esquadrão** de agents reviewer numa sandbox remota. Cada bug que aparece passa por um segundo agent que tenta reproduzir antes de virar relatório. O que sobra no final tende a ser real, não palpite.

Lançou em **abril de 2026**, ainda em research preview.

## O que é, exatamente

Um pipeline cloud que:

- Empacota seu diff (ou PR) e manda pra um sandbox da Anthropic
- Sobe vários reviewer agents em paralelo
- Cada finding passa por um agent de verificação que reproduz o bug
- Volta com relatório no CLI quando termina (5–10 min típico)

Sintaxe:

```bash
/ultrareview                  # diff atual vs branch default
/ultrareview 1234             # PR #1234 do GitHub
/ultrareview origin/main      # diff vs branch específica
```

Subcomando CLI não-interativo, pra CI ou script:

```bash
claude ultrareview 1234 --json --timeout 30
```

Cobra como **extra usage** do plano. As primeiras runs em research preview são gratuitas (cota e prazo mudam — confira a doc antes de assumir).

## Quando uso

- **Pré-merge de mudança grande ou crítica** — refactor de algo load-bearing, migration, mudança em fluxo de pagamento. `/review` olha rápido; `/ultrareview` gasta 10 minutos mas a chance de pegar race condition e edge case sobe muito.
- **PR aberto por outra pessoa que parece OK** — review humano cansado deixa passar. Disparo `/ultrareview <PR#>` antes de aprovar e leio os findings primeiro.
- **Diff grande demais pra eu reler com atenção** — mexi em 30 arquivos? Não confio na minha própria revisão. `/ultrareview` escala onde minha atenção não escala.
- **Sweep antes de release ou tag** — passada final no que vai subir. Custo cabe porque é evento raro.

## Quando NÃO uso

- **Iteração enquanto codo** — `/review` responde em segundos e não tem custo. `/ultrareview` é overkill pra "isso aqui tá certo?".
- **Diff pequenininho** — fix de typo, ajuste de copy, mudança de config. `/review` basta.
- **Draft WIP** — review de código que eu ainda vou trocar é desperdício. Metade dos findings cai junto com o rewrite.
- **Substituto de CI mecânico** — `/ultrareview` pega bugs lógicos. Não substitui `tsc`, `eslint`, `pytest`. É camada extra, não única.
- **Bedrock, Vertex AI, Foundry ou orgs com Zero Data Retention** — só roda na Anthropic API direta.

## O pitfall que vale saber

**Start = billing.** Se você dispara e mata a run no meio (PC reiniciou, mudou de ideia, internet caiu), ela conta como uma run consumida. Não tem resultado parcial e não tem refund. Trata o disparo como você trataria um build longo de CI: confere o input duas vezes antes de mandar.

Implicações que mudaram como uso:

- **Não disparo em diff que ainda vou continuar mexendo.** Espero a feature fechar pra rodar uma vez só.
- **Repo grande pode estourar limite da sandbox.** O CLI sugere o caminho alternativo: empurra um draft PR e roda `/ultrareview <PR#>`. Mais previsível que tentar bundlar tudo.
- **Auth web é obrigatória.** Não roda só com API key — precisa estar logado com sua conta `claude.ai`.

## Resumindo

`/ultrareview` é o "esforço alto" do code review automatizado: multi-agente, na nuvem, cada finding verificado, 5–10 min e custo de extra usage por run. Use pré-merge em mudança que importa, antes de release, ou quando o diff cresceu além do que sua atenção cobre.

Pra qualquer coisa do dia a dia, `/review` continua sendo o caminho.

## Fontes

- [Find bugs with ultrareview — Claude Code Docs](https://code.claude.com/docs/en/ultrareview)
- [Claude Code Changelog](https://code.claude.com/docs/en/changelog)
- [Ultrareview for Claude Code: Multi-Agent Cloud Code Review — Claude Directory](https://www.claudedirectory.org/blog/ultrareview-claude-code-guide)
- [Claude Code Introduces /ultrareview — How AI Works](https://howaiworks.ai/blog/claude-code-ultrareview-agentic-code-analysis)
