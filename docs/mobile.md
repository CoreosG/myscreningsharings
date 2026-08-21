# Plano de execução para Android e iOS

## O que já é possível

[Discord Activities são executadas no desktop, web, Android e iOS](https://docs.discord.com/developers/activities/development-guides/mobile).
No Developer Portal, em **Activities → Settings**, marque Android e iOS para
que a Activity apareça nessas plataformas.

A interface atual já é responsiva, respeita as áreas seguras do Discord e
permite assistir transmissões no celular. A câmera também pode transmitir em
aparelhos que forneçam `getUserMedia` e WebCodecs. O servidor não precisa rodar
no celular: todos entram pelo mesmo endereço público hospedado no PC/VPS.

O limite atual é transmitir a tela do próprio telefone. A própria referência do
[`getDisplayMedia()` marca a API como disponibilidade limitada](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
e exige permissão iniciada por gesto toda vez. Termux consegue executar Node em
alguns Androids, mas isso só hospedaria o relay; não concede ao navegador
acesso à tela ou ao áudio de outros aplicativos e o sistema pode encerrar o
processo em segundo plano. Por isso Termux não é tratado como solução de
captura.

## Fase 1 — Activity móvel para assistir e câmera

Objetivo: tornar Android/iOS clientes de primeira classe sem tocar no protocolo.

1. habilitar Android e iOS no Developer Portal;
2. testar entrada OAuth, sala, assistir, volume, câmera e reconexão em aparelhos
   físicos;
3. usar perfil Leve como recomendação para câmera móvel;
4. reagir aos eventos de estado térmico do Embedded App SDK, reduzindo para
   30 fps quando o aparelho aquecer;
5. validar áreas seguras, rotação, teclado virtual, retorno do segundo plano e
   troca entre Wi-Fi/dados móveis.

Critério de conclusão: entrar, assistir e usar câmera por 30 minutos em Android
e iOS sem vazamento de áudio, crescimento contínuo de memória ou tela fora da
área segura.

## Fase 2 — transmissor nativo Android

Um aplicativo Android é o caminho técnico correto para capturar a tela:

1. aplicativo Kotlin com [`MediaProjectionManager`](https://developer.android.com/reference/android/media/projection/MediaProjectionManager)
   e serviço em primeiro plano do tipo `mediaProjection`;
2. `MediaCodec` para H.264 com perfil inicial de 720p30/1,5 Mb/s;
3. [`AudioPlaybackCapture`](https://developer.android.com/media/platform/av-capture)
   no Android 10+ para áudio de aplicativos que permitem captura; conteúdo
   protegido ou apps que recusam captura continuará mudo;
4. empacotamento no protocolo binário já usado pelo relay
   (`slot`, tipo, timestamp e payload);
5. ingresso seguro por link/QR efêmero emitido pela Activity, sem colocar Client
   Secret ou token permanente no APK;
6. notificação permanente, botão Parar e reação imediata à revogação da
   permissão do sistema;
7. no [Android 14 QPR2+](https://developer.android.com/about/versions/14/features/app-screen-sharing),
   oferecer compartilhamento de um único aplicativo;
8. reduzir resolução/bitrate com calor, perda de rede e congestionamento do
   relay.

Critério de conclusão: Android 10, 12, 14 e versão atual; tela inteira, app
individual quando suportado, rotação, áudio permitido/bloqueado, revogação,
Wi-Fi/dados e chamada Discord simultânea.

## Fase 3 — transmissor nativo iOS

iOS exige [ReplayKit](https://developer.apple.com/documentation/replaykit) e uma
**Broadcast Upload Extension**. Essa extensão recebe
amostras de vídeo/áudio e precisa codificá-las e enviá-las ao relay com orçamento
de memória bem menor que um aplicativo comum.

O trabalho inclui assinatura Apple, App Group para transferir o ingresso
efêmero, tratamento do seletor de broadcast do sistema, H.264/áudio, encerramento
seguro e testes de conteúdo protegido. A distribuição exige conta Apple
Developer e revisão da App Store; não existe equivalente confiável entregue
somente por ZIP.

## Decisão de arquitetura

O relay, autenticação, salas e player permanecem neste repositório. Os clientes
nativos devem ser projetos separados que implementam o protocolo existente.
Isso evita transformar a aplicação web estável em um monorepo Android/iOS e
permite publicar correções do servidor sem depender das lojas.

Antes de começar o APK, o protocolo deve ganhar versão explícita, teste de
contrato com vetores binários e endpoint para ingresso efêmero do dispositivo.
Nenhuma fase deve expor o Client Secret no celular.
