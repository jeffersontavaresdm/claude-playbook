---
title: "Edição manual e o snapshot defasado do Claude"
description: "Editar arquivo por fora durante uma sessão deixa o Claude operando em cima de um snapshot defasado. Quando isso vira bug fantasma, e o que faço pra realinhar o contexto."
date: 2026-05-07
category: pratica
tags: [claude-code, fluxo, contexto]
---

Aconteceu num teste E2E real. O Claude implementou o fluxo, eu rodei, identifiquei um bug num trecho — abri no editor, ajustei na mão, segui. Algumas mensagens depois ele tentou "consertar" o mesmo trecho, com o mesmo bug que eu já tinha tirado. Foi aí que parei pra mapear como ele "vê" os arquivos.

## O modelo mental certo

O Claude Code não tem visão ao vivo do disco. Ele trabalha em cima de um **snapshot** do que leu via `Read`. Tudo que ele "sabe" sobre um arquivo é a última versão que passou pelo contexto da conversa — não o que está gravado agora.

Quando você edita por fora (IDE, vim, qualquer coisa), o disco muda mas o snapshot não. Os dois universos divergem em silêncio.

## A proteção parcial

Existe uma trava, mas só dispara num momento específico. Se o Claude tenta `Edit` ou `Write` num arquivo modificado externamente desde o último `Read`, o harness barra com:

```
File has been modified since read, either by the user or by a linter.
```

Aí ele é forçado a reler antes de editar. Bom — protege contra sobrescrever sua correção.

O problema é o que essa trava **não cobre**: raciocínio. Se o Claude está planejando, debugando, explicando ou rodando ferramenta que não seja edição (Bash, Grep, etc.), ele segue usando o snapshot antigo. Sem aviso. Sem checagem.

## Onde isso quebra na prática

O modo de falha mais comum não é "ele sobrescreveu minha correção" — é mais sutil:

- **Bug fantasma.** O teste falha por outro motivo, ele lê o stack trace, cruza com o código *que tem na cabeça* (versão antiga, ainda com o bug que você já corrigiu) e diagnostica errado.
- **"Vou consertar isso aqui".** Ele propõe edição num trecho que já não existe mais como ele lembra. A trava de freshness pega no momento do `Edit`, mas só depois dele já ter gasto contexto explicando uma fix desnecessária.
- **Plano em cima de premissa errada.** Em sessão com Plan Mode, o plano sai coerente com o snapshot, não com o disco. Você implementa um plano resolvendo um problema que não existe mais.

## Manual vs pedir pro Claude

A diferença que importa é onde mora o registro do diff:

| | Você edita | Claude edita |
|---|---|---|
| Conhecimento da mudança | só você sabe | linha por linha no contexto |
| Risco de divergência | alto se não avisar | praticamente zero |
| O que reconcilia | você contar / ele reler | a própria edição |

Não é que editar na mão seja "errado" — em correção rápida de uma linha óbvia é mais barato que descrever a mudança. Só que o custo se desloca: economiza no momento da edição, paga depois quando o contexto dele desencontra do disco.

## O que faço hoje

Quatro hábitos que resolvem 90% dos casos:

**Avisar explicitamente.** "Alterei `auth.ts:42` — o `if (!user)` virou `if (!user?.active)`. Releia antes de continuar." Uma frase curta substitui dez minutos de diagnóstico errado depois.

**Forçar releitura quando a alteração é não-trivial.** Em vez de descrever, peço: *"Releia `src/services/billing.ts`, mudei coisa lá."* Mais barato em tokens que escrever o diff inteiro, e elimina ambiguidade.

**Pedir pra ele rodar `git diff` em sessões E2E longas.** Quando o teste rodou dez vezes e eu fiz três ajustes manuais entre rodadas, em vez de listar cada um, mando: *"Roda `git diff` e considera o estado atual a partir daí."* Mais barato em tokens do que descrever as mudanças, e ele puxa direto do disco sem eu virar intermediário.

**`/clear` quando o desencontro é grande.** Se eu refiz metade da implementação manualmente, o contexto antigo virou ruído. Limpar e começar com um *brief* curto + `Read` dos arquivos relevantes sai mais barato que tentar "atualizar" um contexto inteiro.

## A regra que ficou

Antes de assumir que o Claude tem um bug ou alucinou, pergunto duas coisas:

1. Quando foi o último `Read` desse arquivo na sessão?
2. Eu mexi nele depois?

Se sim pra (2), o "bug dele" provavelmente é o snapshot defasado batendo de frente com o disco. Reler resolve. Brigar com o diagnóstico dele sem reler é jogar conversa fora.

Resumindo: ele não perdeu o contexto — ele nunca teve. Quando o Claude edita, o registro nasce no ato. Quando você edita, o registro só existe se você criar.

## Fontes

- [Issue #28383 — Edit tool blocked when external process modifies file after read](https://github.com/anthropics/claude-code/issues/28383)
- [Issue #3513 — Edit/MultiEdit fail com 'File has been modified since read'](https://github.com/anthropics/claude-code/issues/3513)
- [Issue #5981 — Excessive 'file modified' notifications](https://github.com/anthropics/claude-code/issues/5981)
- [How Claude Code works (docs oficiais)](https://docs.claude.com/en/docs/claude-code/overview)
