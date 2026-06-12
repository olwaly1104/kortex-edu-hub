## Diagnóstico

O envio de mensagens e as chamadas (voz/vídeo) já estão implementados no código actual (`src/pages/student/Chat.tsx`):
- **Send** adiciona a mensagem à conversa imediatamente.
- **Call/Video** abre um ecrã de chamada com "A chamar…", contador de tempo, botões de mute/câmara e desligar.

O site publicado (`upra-kortex-teste.lovable.app`) está com uma **versão antiga**, anterior a estas alterações — por isso clicar em Send ou Call não faz nada lá.

## Plano

1. **Melhorar a experiência de chamada** para parecer mesmo que está a chamar:
   - Estado "A chamar…" com animação (avatar a pulsar) durante ~6 segundos de toque.
   - Depois passa a "Em curso" com o contador de tempo (ninguém atende de verdade, mas o toque acontece).
2. **Verificar o envio de mensagens** no preview (clique no botão Send e tecla Enter).
3. **Republicar o site** para que a versão publicada fique com todas estas funcionalidades.

## Detalhe técnico

- Ficheiro único: `src/pages/student/Chat.tsx` — adicionar fase `ringing` ao estado da chamada com transição automática para `ongoing` após alguns segundos.
- Publicação feita no final para actualizar o site live.
