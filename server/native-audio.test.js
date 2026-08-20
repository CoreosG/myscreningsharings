import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { createNativeAudioBridge, packNativeAudio } from './native-audio.js';

function dependencies(platform = 'win32') {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = vi.fn();

  const encoded = [];
  const encoder = {
    encode: vi.fn((pcm, frames) => {
      encoded.push(Buffer.from(pcm));
      return Buffer.from([frames & 0xff, encoded.length]);
    }),
    delete: vi.fn(),
  };

  return {
    child,
    encoder,
    spawnProcess: vi.fn(() => child),
    encoderFactory: vi.fn(() => encoder),
    options: { platform, helperPath: 'audio-loopback.exe' },
  };
}

describe('captura nativa de áudio', () => {
  it('empacota o Opus no mesmo protocolo binário da transmissão', () => {
    const packet = packNativeAudio(2, Buffer.from([7, 8, 9]), 40_000, 1234);

    expect(packet[0]).toBe(2);
    expect(packet[1]).toBe(3);
    expect(packet.readDoubleBE(2)).toBe(40_000);
    expect(packet.readDoubleBE(10)).toBe(1234);
    expect([...packet.subarray(18)]).toEqual([7, 8, 9]);
  });

  it('captura somente a árvore do Firefox e produz Opus em quadros de 20 ms', () => {
    const d = dependencies();
    const onConfig = vi.fn();
    const onPacket = vi.fn();
    const bridge = createNativeAudioBridge({
      ...d.options,
      spawnProcess: d.spawnProcess,
      encoderFactory: d.encoderFactory,
      onConfig,
      onPacket,
    });

    bridge.start('firefox');
    expect(d.spawnProcess).toHaveBeenCalledWith(
      'audio-loopback.exe',
      ['firefox.exe'],
      expect.objectContaining({ windowsHide: true }),
    );

    d.child.stderr.write('READY 3940 48000 2 s16le\n');
    d.child.stdout.write(Buffer.alloc(1000, 1));
    d.child.stdout.write(Buffer.alloc(6680, 2));

    expect(onConfig).toHaveBeenCalledOnce();
    expect(onConfig).toHaveBeenCalledWith({
      codec: 'opus',
      sampleRate: 48_000,
      numberOfChannels: 2,
    });
    expect(d.encoder.encode).toHaveBeenCalledTimes(2);
    expect(d.encoder.encode).toHaveBeenNthCalledWith(1, expect.any(Buffer), 960);
    expect(onPacket.mock.calls.map(([, timestamp]) => timestamp)).toEqual([0, 20_000]);
  });

  it('encerra o processo e libera o encoder sem deixar captura órfã', () => {
    const d = dependencies();
    const bridge = createNativeAudioBridge({
      ...d.options,
      spawnProcess: d.spawnProcess,
      encoderFactory: d.encoderFactory,
    });

    bridge.start('firefox');
    bridge.stop();

    expect(d.child.kill).toHaveBeenCalledOnce();
    expect(d.encoder.delete).toHaveBeenCalledOnce();
    expect(bridge.active()).toBe(false);
  });

  it('recusa captura nativa fora do Windows', () => {
    const d = dependencies('linux');
    const bridge = createNativeAudioBridge({
      ...d.options,
      spawnProcess: d.spawnProcess,
      encoderFactory: d.encoderFactory,
    });

    expect(() => bridge.start('firefox')).toThrow(/Windows 10 ou 11/);
    expect(d.spawnProcess).not.toHaveBeenCalled();
  });

  it('não aceita nomes arbitrários de processo vindos da rede', () => {
    const d = dependencies();
    const bridge = createNativeAudioBridge({
      ...d.options,
      spawnProcess: d.spawnProcess,
      encoderFactory: d.encoderFactory,
    });

    expect(() => bridge.start('discord')).toThrow(/Firefox/);
    expect(d.spawnProcess).not.toHaveBeenCalled();
  });
});
