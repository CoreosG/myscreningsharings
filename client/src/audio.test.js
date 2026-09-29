/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAudio, mesmaConfigAudio } from './audio.js';

class DecoderFalso {
  constructor(init) {
    this.init = init;
    this.state = 'unconfigured';
  }

  configure() {
    this.state = 'configured';
  }

  decode() {}

  close() {
    this.state = 'closed';
  }
}

const contextos = [];

class ContextoFalso {
  constructor(init) {
    this.init = init;
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
    // Quando o navegador recusa o resume, o teste troca isto por uma rejeição.
    this.resume = vi.fn(() => {
      this.state = 'running';
      return Promise.resolve();
    });
    contextos.push(this);
  }

  createGain() {
    return { gain: { value: 1, setTargetAtTime() {} }, connect() {}, context: this };
  }

  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

const config = { codec: 'opus', sampleRate: 48_000, numberOfChannels: 2 };

describe('mesmaConfigAudio', () => {
  it('reconhece a mesma transmissão reenviada', () => {
    expect(mesmaConfigAudio(config, { ...config })).toBe(true);
  });

  it('separa formatos diferentes', () => {
    expect(mesmaConfigAudio(config, { ...config, sampleRate: 44_100 })).toBe(false);
    expect(mesmaConfigAudio(config, { ...config, numberOfChannels: 1 })).toBe(false);
    expect(mesmaConfigAudio(config, { ...config, codec: 'mp4a' })).toBe(false);
  });

  it('não compara o que ainda não existe', () => {
    expect(mesmaConfigAudio(null, config)).toBe(false);
    expect(mesmaConfigAudio(config, null)).toBe(false);
  });
});

describe('audio', () => {
  beforeEach(() => {
    contextos.length = 0;
    window.AudioDecoder = DecoderFalso;
    window.AudioContext = ContextoFalso;
    window.EncodedAudioChunk = class {};
  });

  it('guarda a config em pé para reconhecer o reenvio do relay', () => {
    const audio = createAudio();
    expect(audio.start(config)).toBe(true);

    expect(audio.mesmaConfig({ ...config })).toBe(true);
    expect(audio.mesmaConfig({ ...config, codec: 'mp4a' })).toBe(false);
  });

  it('esquece a config ao parar', () => {
    const audio = createAudio();
    audio.start(config);
    audio.stop();

    expect(audio.mesmaConfig({ ...config })).toBe(false);
  });

  it('não promete som quando o formato não configura', () => {
    window.AudioDecoder = class {
      configure() {
        throw new Error('sem suporte');
      }
      close() {}
    };
    const onError = vi.fn();
    const audio = createAudio({ onError });

    expect(audio.start(config)).toBe(false);
    expect(audio.mesmaConfig({ ...config })).toBe(false);
    expect(onError).toHaveBeenCalled();
  });

  it('retoma o contexto suspenso', async () => {
    const audio = createAudio();
    audio.start(config);
    const ctx = contextos.at(-1);
    ctx.state = 'suspended';

    expect(audio.estaBloqueado()).toBe(true);
    await expect(audio.retomar()).resolves.toBe(true);
    expect(audio.estaBloqueado()).toBe(false);
  });

  it('avisa uma vez só quando o navegador segura o som', async () => {
    const onError = vi.fn();
    const audio = createAudio({ onError });
    audio.start(config);
    const ctx = contextos.at(-1);
    ctx.state = 'suspended';
    ctx.resume = () => Promise.reject(new Error('gesto do usuário'));

    await expect(audio.retomar()).resolves.toBe(false);
    await expect(audio.retomar()).resolves.toBe(false);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(audio.estaBloqueado()).toBe(true);
  });

  it('não tenta retomar o que já está tocando', async () => {
    const audio = createAudio();
    audio.start(config);
    const ctx = contextos.at(-1);

    await expect(audio.retomar()).resolves.toBe(false);
    expect(ctx.resume).not.toHaveBeenCalled();
  });
});
