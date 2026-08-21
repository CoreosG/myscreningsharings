# Sala de Tela — compartilhamento fácil no Discord

Compartilhe tela e áudio por uma Activity do Discord sem pedir que cada pessoa instale Node.js, npm ou Cloudflare. No Windows use `INICIAR.bat`; no Ubuntu, Debian, Kali e outras distribuições Linux use `INICIAR.sh`.

Este é um projeto independente de **DevilNine**, criado como evolução e inspirado no [Sala de Tela original, de Jc007zZ](https://github.com/Jc007zZ/discord-screen). Esta versão possui identidade, manutenção e distribuição próprias, com bootstrap portátil para Windows e Linux, supervisão do túnel, áudio isolado, compatibilidade ampliada, perfis de qualidade e documentação voltada a quem só quer usar.

## Início rápido no Windows 10/11

1. Baixe o ZIP deste repositório e use **Extrair tudo**. Não execute de dentro do ZIP.
2. Abra a pasta extraída.
3. Dê dois cliques em **`INICIAR.bat`**.
4. Na primeira vez, cole o Client ID e o Client Secret quando o assistente pedir.
5. Deixe a janela aberta enquanto usar a Activity. `Ctrl+C` encerra servidor e túnel juntos.

O primeiro início demora mais porque baixa o Node.js 22 LTS do site oficial, confere o SHA-256 publicado pelo Node.js, instala as versões travadas no `package-lock.json`, compila o site e baixa o `cloudflared` oficial. Tudo fica dentro da pasta do projeto:

- `.runtime/`: Node.js portátil;
- `.cache/`: downloads/cache do npm e `cloudflared`;
- `.bootstrap/`: marca da instalação já concluída;
- `.env`: sua configuração e seus segredos.

Nas próximas vezes, o iniciador reutiliza tudo. Ele não exige administrador, não altera o `PATH` permanente, não muda o Registro e não desativa Defender, SmartScreen ou política de execução.

> O Windows pode mostrar o aviso do SmartScreen porque um `.bat` baixado não possui assinatura comercial. Confira se o ZIP veio deste repositório. Não desative o SmartScreen globalmente.

## Início rápido no Linux

1. Baixe e extraia o ZIP em uma pasta do seu usuário.
2. Abra um terminal nessa pasta.
3. Execute `sh INICIAR.sh`.
4. Se faltarem somente ferramentas básicas (`curl`, `tar`, `xz` ou SHA-256), o script identifica a distribuição e pede `sudo` para instalá-las.
5. Cole o Client ID e o Client Secret no assistente e mantenha o terminal aberto.

Node.js 22, npm, dependências e `cloudflared` ficam locais no projeto, como no Windows. O launcher reconhece `apt` (Ubuntu, Debian, Kali, Mint), `dnf`/`yum` (Fedora, RHEL e derivados), `pacman` (Arch/Manjaro) e `zypper` (openSUSE). Ele não altera `PATH` permanente nem instala Node globalmente. Consulte [instalação e diagnóstico no Linux](docs/linux.md).

## Configuração única no Discord

O Discord não oferece uma API pública para criar uma aplicação em seu nome ou editar todos os campos do Developer Portal. Por segurança, estes passos continuam manuais uma vez:

1. Abra o [Discord Developer Portal](https://discord.com/developers/applications) e escolha **New Application**.
2. Em **OAuth2**, copie o **Client ID** e gere/copie o **Client Secret**. Cole apenas na janela local do assistente.
3. Em **Activities → Settings**, habilite Activities e marque Desktop. Para assistir pelo celular, marque também Android e iOS.
4. Em **Activities → URL Mappings**, crie o prefixo `/` e cole no Target somente o domínio mostrado pelo iniciador, sem `https://`.
5. Em **OAuth2 → Redirects**, cole o endereço completo mostrado pelo iniciador, terminado em `/auth/callback`.
6. Instale a aplicação pelo link que o próprio iniciador imprime e abra um canal de voz. A Activity aparece no botão de foguete/Apps.

O programa usa o Client Secret somente no servidor local para trocar o código OAuth por um token. Ele nunca é enviado ao navegador nem deve ser publicado no GitHub. O `.gitignore` já exclui `.env`.

O assistente também verifica e cria o comando de entrada da Activity via API quando ele estiver ausente. Criação da aplicação, habilitação de Activities e URL Mapping permanecem no portal porque dependem do consentimento da conta.

## Endereço público e Cloudflare

### Sem domínio: modo rápido

Se nenhum túnel fixo estiver configurado, o programa cria um endereço `trycloudflare.com`. Ele é gratuito e não exige conta, mas é de desenvolvimento: muda quando o processo inteiro do Cloudflare reinicia. Quando isso acontecer, o supervisor cria outro túnel, atualiza `.env` e reinicia somente o servidor local para gerar links corretos. Você ainda terá de trocar o Target e o Redirect no portal do Discord.

### Com domínio: recomendado para tutorial e uso contínuo

Execute uma vez, em um terminal aberto na pasta:

```text
Windows:
.\.runtime\node\npm.cmd run tunel:criar

Linux:
sh INICIAR.sh --tunel-criar
```

Ou, se já tiver Node.js 22+ instalado:

```text
npm run tunel:criar
```

O assistente abre o login oficial da Cloudflare, cria um Named Tunnel, configura o DNS do domínio escolhido e grava o caminho da configuração no `.env`. A partir daí `INICIAR.bat` e `INICIAR.sh` respeitam esse túnel e o endereço permanece estável. O `cloudflared` já reconecta conexões transitórias internamente; se o processo encerrar, o aplicativo o inicia novamente com espera progressiva de 2 a 30 segundos.

Quick Tunnels são destinados a testes e têm limites próprios. Para publicar de forma estável, use Named Tunnel ou hospedagem. Veja a [documentação oficial da Cloudflare](https://developers.cloudflare.com/tunnel/setup/).

## Terminal limpo ou detalhado

Por padrão, os dois iniciadores limpam as mensagens de instalação depois de subir e deixam visíveis somente os endereços local/público, o Redirect do Discord e avisos que exigem ação. Isso facilita copiar exatamente o que precisa ser colado no portal.

Para desenvolvimento, abra `.env` e troque `TERMINAL_LIMPO=1` por `TERMINAL_LIMPO=0`. A próxima inicialização mostrará os logs detalhados de servidor, salas, codec, áudio e Cloudflare. Erros críticos continuam aparecendo nos dois modos.

## Compartilhar tela, áudio e 60 fps

Na Activity, clique em **Compartilhar tela**. Se o Discord não permitir captura dentro do iframe, ele abre a página externa de captura — isso é esperado. Mantenha essa aba aberta.

No Chrome, Edge, Brave e Opera, para áudio de uma única guia:

1. escolha **uma guia/aba** no seletor do navegador;
2. marque **Compartilhar áudio da guia**;
3. confirme a captura.

Para mostrar a tela inteira com todo o som do computador, marque **Compartilhar áudio do sistema** quando essa opção aparecer. Esse modo também pode incluir o Discord e causar eco. Para evitar isso, inicie o vídeo da tela e use **Escolher áudio separado** na página de captura; o vídeo continua vindo da tela, mas o som vem apenas da aba ou janela escolhida.

No **Firefox para Windows**, não existe áudio em `getDisplayMedia()`. Por isso esta edição liga automaticamente uma captura nativa WASAPI do processo `firefox.exe` e de seus filhos. Ela envia o áudio do Firefox sem misturar Discord, jogos ou outros aplicativos e não exige OBS, cabo virtual nem driver. Se várias janelas do Firefox pertencerem à mesma árvore de processos, o Windows entrega o áudio delas em conjunto; a API do navegador não informa qual PID corresponde à janela escolhida.

O botão de engrenagem oferece quatro perfis:

| Perfil      |             Vídeo | Indicado para                     |
| ----------- | ----------------: | --------------------------------- |
| Leve        | 1,5 Mb/s · 30 fps | PC ou upload limitado             |
| Equilibrado | 2,5 Mb/s · 30 fps | uso normal, padrão                |
| Nítido      |   5 Mb/s · 60 fps | movimento/jogos com bom hardware  |
| Máximo      |   8 Mb/s · 60 fps | rede rápida e poucos espectadores |

A resolução máxima é 1080p. A captura já pede ao navegador o redimensionamento antes de os quadros entrarem no JavaScript, evitando copiar uma tela 4K inteira 60 vezes por segundo. O transmissor negocia o nível H.264 adequado, prefere codificação por hardware e volta automaticamente ao modo compatível. No Firefox, abas individuais usam um relógio independente de 60 fps para não herdar a limitação de pintura da aba em segundo plano; janelas e telas continuam descartando quadros realmente duplicados para poupar CPU. Se o encoder ainda não sustentar o perfil, a resolução desce para 1600×900 e depois 1280×720, preservando a fluidez; uma rede congestionada deixa de acumular quadros antigos. “60 fps” é o alvo: o navegador ainda controla a frequência com que a fonte produz imagens novas. Cada espectador recebe o fluxo inteiro; 5 espectadores em 5 Mb/s podem consumir aproximadamente 25 Mb/s de upload do transmissor.

### Compatibilidade real dos navegadores

| Navegador desktop             |                                      Assistir |                            Compartilhar vídeo |                                                            Áudio de guia |
| ----------------------------- | --------------------------------------------: | --------------------------------------------: | -----------------------------------------------------------------------: |
| Chrome / Edge / Brave / Opera |                                           Sim |                   Sim, caminho mais eficiente |                                        Sim, quando a fonte oferece áudio |
| Firefox recente no Windows    |                                           Sim |                     Sim, modo compatibilidade |                                 Sim, captura nativa isolada por processo |
| Firefox recente no Linux      |                                           Sim |                     Sim, modo compatibilidade | Não; o Firefox não fornece áudio de tela e WASAPI é exclusivo do Windows |
| Safari                        |                                Pode funcionar |        Depende de WebCodecs/captura da versão |                                                                 Limitado |
| Navegador móvel               | Sim para assistir; câmera depende do aparelho | Captura da tela não disponível pelo fluxo web |                                                 Não para captura de tela |

Firefox era bloqueado artificialmente pelo projeto, embora já existisse um caminho de vídeo via elemento `<video>`. Esta edição libera esse caminho, usa um relógio em Web Worker para a captura não congelar quando a aba fica em segundo plano e contorna a ausência de áudio do Firefox com o capturador nativo do Windows. Consulte o [`getDisplayMedia()` no MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia).

Para navegar entre abas no Firefox, escolha **Janela** e selecione a janela inteira do Firefox; para mostrar tudo, escolha **Tela inteira**. O aplicativo pede “janela” como preferência e evita sugerir a própria aba, mas não existe API web que permita ao site remover opções ou escolher silenciosamente um programa. O usuário sempre precisa escolher a fonte e a permissão não pode ser lembrada. O aplicativo também bloqueia áudio de tela inteira quando ele poderia retransmitir a própria call e causar eco.

## Diagnóstico e problemas comuns

Execute sem iniciar serviços:

```text
Windows: INICIAR.bat -Diagnostico
Linux:   sh INICIAR.sh --diagnostico
```

O diagnóstico mostra sistema, arquitetura, pasta, runtime local e presença do `.env`, sem revelar segredos nem instalar nada.

**A Activity abre em branco**

Confirme o Target atual em Activities → URL Mappings. No modo rápido ele muda quando o túnel é recriado. Feche e abra a Activity para descartar bundle antigo do cliente Discord.

**Apareceu “O site não compilou”**

Baixe o ZIP mais recente. O iniciador atual detecta essa falha, reinstala automaticamente as dependências travadas no `package-lock.json` e tenta compilar uma segunda vez. Se o reparo também falhar, a janela mostra o erro real; envie essas linhas ao relatar o problema. Não é necessário instalar Node.js nem executar `npm run build` manualmente.

**A porta 3001 está ocupada**

Feche outra janela deste projeto. Não finalize um processo desconhecido: no Windows descubra o dono com `Get-NetTCPConnection -LocalPort 3001`; no Linux use `ss -ltnp 'sport = :3001'`.

**Não sai áudio**

No Firefox para Windows, aguarde o status **Áudio isolado do Firefox ligado**; ele é iniciado automaticamente. Nos navegadores Chromium, escolha uma aba ou janela compatível, marque o áudio no seletor e veja o status da página de captura. Se o executável nativo tiver sido removido pelo antivírus, extraia o ZIP oficial novamente e confira `native/audio-loopback/bin/audio-loopback.exe`.

**A transmissão de outra pessoa fica carregando para sempre**

Atualize todos para a versão mais recente. O transmissor agora espera o servidor atribuir seu canal antes de enviar mídia — a falha anterior podia fazer o primeiro participante funcionar e descartar os quadros dos seguintes, sobretudo com VPN ou latência alta. O relay também informa congestionamento ao emissor, que reduz o bitrate automaticamente. Se ainda ocorrer, teste o perfil **Leve**, uma transmissão por vez e, apenas como diagnóstico, sem VPN; o túnel e o WebSocket precisam aceitar tráfego contínuo nos dois sentidos.

**Ao entrar na Activity, deixo de falar ou ouvir no Discord**

A Activity solicita somente a identidade da conta: ela não pede microfone, não muda o dispositivo de áudio e não controla mudo/ensurdecido. Tela e áudio transmitido trafegam pelo relay e podem disputar rede, CPU e GPU com a chamada. Use o perfil **Leve**, feche transmissões que não está assistindo, saia e entre novamente no canal de voz e teste sem VPN ou com o Discord fora do túnel da VPN. Se a voz falhar antes de alguém iniciar uma transmissão, confira o dispositivo de entrada/saída no próprio Discord: nesse caso o relay de tela ainda não está transportando mídia.

**O Cloudflare caiu**

Aguarde a mensagem de nova tentativa. O supervisor reinicia com backoff. Em redes que bloqueiam QUIC/UDP, o próprio `cloudflared` tenta HTTP/2. Túnel rápido recriado gera outro domínio; túnel nomeado mantém o endereço.

**O ZIP está em Program Files ou pasta protegida**

Mova para Documentos/Downloads e extraia novamente. O programa precisa gravar o runtime e `.env` dentro da própria pasta, mas não precisa de administrador.

**Quero reinstalar somente o runtime local**

Feche o programa e apague `.runtime`, `.bootstrap` e `node_modules`. No próximo iniciador tudo será baixado novamente. Seus dados ficam no `.env`; não o apague se quiser preservar a configuração.

Veja os guias detalhados de [Windows](docs/windows.md), [Linux](docs/linux.md) e o [plano para Android/iOS](docs/mobile.md).

## Privacidade e segurança

- Tela, câmera e áudio seguem diretamente do navegador ao relay deste servidor por WebSocket; o projeto não grava mídia em disco.
- O relay repassa pacotes codificados somente a espectadores autorizados da sala.
- Senhas de sala são derivadas com `scrypt`; segredos ficam em `.env`.
- Não publique `.env`, token de bot, Client Secret, credenciais do túnel ou pasta `.cloudflared`.
- Quick Tunnel expõe seu servidor à internet enquanto a janela estiver aberta. Use senhas de sala e encerre com `Ctrl+C` quando terminar.
- O painel administrativo é opcional e só é habilitado com `DISCORD_ADMIN_ID`.

## Desenvolvimento e hospedagem

Pré-requisito para desenvolvimento: Node.js 22 ou 24.

```powershell
npm ci
npm run build
npm test
npm run lint
npm run smoke:admin
```

Comandos principais:

| Comando                  | Função                                               |
| ------------------------ | ---------------------------------------------------- |
| `INICIAR.bat`            | instala/reutiliza runtime portátil e inicia tudo     |
| `sh INICIAR.sh`          | equivalente Linux, também a partir do ZIP            |
| `npm run start:fast`     | configura, compila, abre túnel e servidor            |
| `npm run configurar`     | altera a configuração local                          |
| `npm run tunel:criar`    | cria Named Tunnel com domínio estável                |
| `npm run dev`            | cliente, servidor e túnel em modo de desenvolvimento |
| `npm test`               | testes automatizados                                 |
| `npm run smoke`          | smoke do relay em servidor já iniciado               |
| `npm run smoke:audio`    | smoke real do capturador WASAPI e do relay           |
| `npm run smoke:controle` | smoke do canal da aba de captura                     |
| `npm run smoke:admin`    | sobe e valida painel/API localmente                  |

Para VPS/Docker, consulte [docs/vps.md](docs/vps.md). A arquitetura, protocolo e decisões de desempenho estão em [docs/como-funciona.md](docs/como-funciona.md). O que já funciona no celular e o caminho para transmissão nativa estão em [docs/mobile.md](docs/mobile.md).

## Limites que o programa não pode remover

- O Discord executa Activities em iframe/proxy e sua documentação atual declara WebRTC não suportado nesse ambiente; este projeto usa WebSocket relay e, quando necessário, uma aba externa.
- Navegadores exigem gesto e escolha do usuário em toda captura de tela.
- Áudio isolado de aplicativo/janela não está disponível da mesma forma em todos os navegadores e sistemas.
- Celulares não oferecem captura de tela web adequada para transmitir.
- O relay multiplica banda por espectador; não substitui uma SFU/serviço de streaming para grandes públicos.
- Quick Tunnel não é hospedagem de produção e seu endereço não é permanente.

Esses limites são documentados para evitar promessas que o Windows, Discord, navegador ou Cloudflare não permitem cumprir.

## Autoria e inspiração

Esta edição é mantida e publicada por [DevilNine](https://github.com/DevilNine). Ela é uma evolução independente inspirada no projeto original citado no início deste README; não é uma publicação oficial nem uma cópia visual dele. Componentes de terceiros e suas licenças estão registrados em [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt).
