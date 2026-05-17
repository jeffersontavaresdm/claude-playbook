---
title: "Agent teams: quando vale ter um time de Claudes ao invés de um só"
description: "Feature experimental do Claude Code que coordena várias sessões em paralelo, com lista de tasks e mensagens entre os agentes. Útil em poucos cenários — fora deles, queima token à toa."
date: 2026-05-17
category: comando
tags: [claude-code, fluxo]
---

Tem um modo experimental do Claude Code que coordena **várias sessões** trabalhando juntas: uma é o líder, as outras são os teammates, cada um com seu próprio contexto, conversando entre si. Chama-se **agent teams**.

Não é subagent. Subagent reporta de volta pro pai e morre. Em agent team os colegas falam entre si, dividem uma lista de tasks compartilhada, e você consegue mandar mensagem direto pra qualquer um deles sem passar pelo líder.

Bonito no papel. Na prática, queima muito token. Vale a pena em poucos cenários — abaixo o que aprendi.

## Como ligar

Precisa do Claude Code `2.1.32+` e da flag experimental:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Depois é só pedir em linguagem natural: *"cria um time de 3 teammates pra revisar esse PR — um pra segurança, um pra performance, um pra cobertura de teste"*. O líder spawna, distribui tasks, sintetiza no final.

Por padrão tudo roda no mesmo terminal e você cicla com `Shift+Down`. Se tiver tmux ou iTerm2, dá pra usar split panes (`teammateMode: "tmux"`) — cada um na sua janela.

## Quando uso

- **Revisão paralela com lentes diferentes.** Um único revisor tende a achar um tipo de problema e parar. Três teammates com critérios separados (segurança, performance, testes) varrem três dimensões ao mesmo tempo, sem se sobrepor.
- **Debug com hipóteses concorrentes.** Quando não sei a causa raiz, monto 3-4 teammates, cada um defendendo uma teoria, com instrução explícita de *"tentem refutar uns aos outros"*. Sobrevive a hipótese que aguenta o debate.
- **Features em camadas independentes.** Um teammate no backend, outro no frontend, outro nos testes — desde que mexam em arquivos distintos.

A regra implícita: **só vale se os teammates puderem trabalhar de verdade em paralelo**. Se um precisa esperar o outro, é fluxo sequencial fantasiado de time.

## Quando NÃO uso

- **Tarefa sequencial.** Se a próxima etapa depende da anterior, um time não acelera nada — só multiplica a coordenação.
- **Arquivo compartilhado.** Dois teammates editando o mesmo arquivo é overwrite garantido. A doc avisa, e mesmo assim acontece.
- **Trabalho rotineiro.** Renomear símbolo, adicionar um endpoint, ajustar um teste — sessão única resolve mais rápido e mais barato.
- **Tarefas curtas em geral.** O custo de spawn + coordenação só compensa quando cada teammate tem trabalho real pela frente (a doc sugere 5-6 tasks por teammate como referência).

## Pitfall que peguei na marra

O líder às vezes se anima e começa a implementar ele mesmo ao invés de esperar os teammates. Quando vejo isso, mando: *"espera os teammates terminarem antes de continuar"*. Resolve.

Outro detalhe que machuca: `/resume` não restaura teammates in-process. Se você fecha e abre depois, o líder tenta falar com gente que não existe mais. Tem que pedir pra ele spawnar de novo.

E no fim, sempre limpar com *"limpa o time"* — caso contrário sessão de tmux fica órfã.

## Resumindo

Agent teams é uma ferramenta cara que só rende em trabalho genuinamente paralelo com lentes ou hipóteses concorrentes. Pra 90% do dia a dia, subagent ou sessão única ganha — mas pra revisão multi-dimensional e debate de hipóteses, é o único formato que evita o viés do "primeiro palpite que pareceu bom".

## Fontes

- [Orchestrate teams of Claude Code sessions — docs oficiais](https://code.claude.com/docs/en/agent-teams)
- [Subagents — docs oficiais](https://code.claude.com/docs/en/sub-agents)
- [Hooks (TeammateIdle, TaskCreated, TaskCompleted)](https://code.claude.com/docs/en/hooks)
