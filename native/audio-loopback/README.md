# Captura de áudio por processo

`audio-loopback.exe` captura somente o áudio produzido por `firefox.exe` e seus
processos filhos usando WASAPI Process Loopback. Ele escreve PCM `s16le`, 48 kHz,
estéreo no stdout e não abre rede, arquivos ou microfone.

O executável versionado em `bin/` é x64 e não exige instalação. Para recompilar:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File native/audio-loopback/build.ps1
```

O desenho é derivado do exemplo ApplicationLoopback da Microsoft, distribuído
sob licença MIT. Consulte `THIRD-PARTY-NOTICES.txt` na raiz do projeto.
