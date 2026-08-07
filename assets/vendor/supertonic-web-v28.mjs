/*
 * DokoHilf local TTS adapter based on the MIT-licensed Supertonic browser
 * inference example by Supertone Inc. Model weights are NOT redistributed.
 * Upstream: https://github.com/supertone-inc/supertonic/tree/main/web
 */
import * as ort from 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/ort.all.min.mjs';

const AVAILABLE_LANGS = new Set(['en','ko','ja','ar','bg','cs','da','de','el','es','et','fi','fr','hi','hr','hu','id','it','lt','lv','nl','pl','pt','ro','ru','sk','sl','sv','tr','uk','vi','na']);

class UnicodeProcessor {
  constructor(indexer) { this.indexer = indexer; }

  preprocessText(value, lang) {
    if (!AVAILABLE_LANGS.has(lang)) throw new Error(`unsupported_language_${lang}`);
    let text = String(value || '').normalize('NFKD');
    text = text.replace(/[\u{1F1E6}-\u{1FAFF}\u{2600}-\u{27BF}]+/gu, '');
    const replacements = {
      '–':'-','‑':'-','—':'-','_':' ','“':'"','”':'"','‘':"'",'’':"'",'´':"'",'`':"'",
      '[':' ',']':' ','|':' ','/':' ','#':' ','→':' ','←':' ','♥':'','☆':'','♡':'','©':'',
    };
    for (const [from, to] of Object.entries(replacements)) text = text.replaceAll(from, to);
    text = text.replace(/\s+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
    if (!/[.!?;:,'"')\]}…。」』】〉》›»]$/.test(text)) text += '.';
    return `<${lang}>${text}</${lang}>`;
  }

  call(textList, langList) {
    const processed = textList.map((text, index) => this.preprocessText(text, langList[index]));
    const lengths = processed.map(text => [...text].length);
    const maxLen = Math.max(...lengths);
    const ids = processed.map(text => {
      const row = new Array(maxLen).fill(0);
      [...text].forEach((char, index) => {
        const cp = char.codePointAt(0);
        row[index] = cp < this.indexer.length ? this.indexer[cp] : -1;
      });
      return row;
    });
    const mask = lengths.map(length => [Array.from({ length: maxLen }, (_, index) => index < length ? 1 : 0)]);
    return { ids, mask };
  }
}

class Style {
  constructor(ttl, dp) { this.ttl = ttl; this.dp = dp; }
}

function chunkText(text, maxLen = 300) {
  const clean = String(text || '').trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    if (!current || current.length + sentence.length + 1 <= maxLen) {
      current += `${current ? ' ' : ''}${sentence}`;
    } else {
      chunks.push(current);
      current = sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

class TextToSpeech {
  constructor(cfgs, textProcessor, dpOrt, textEncOrt, vectorEstOrt, vocoderOrt) {
    this.cfgs = cfgs;
    this.textProcessor = textProcessor;
    this.dpOrt = dpOrt;
    this.textEncOrt = textEncOrt;
    this.vectorEstOrt = vectorEstOrt;
    this.vocoderOrt = vocoderOrt;
    this.sampleRate = cfgs.ae.sample_rate;
  }

  lengthToMask(lengths, maxLen = null) {
    const actualMaxLen = maxLen || Math.max(...lengths);
    return lengths.map(length => [Array.from({ length: actualMaxLen }, (_, index) => index < length ? 1 : 0)]);
  }

  sampleNoisyLatent(duration) {
    const sampleRate = this.sampleRate;
    const baseChunkSize = this.cfgs.ae.base_chunk_size;
    const chunkCompress = this.cfgs.ttl.chunk_compress_factor;
    const latentDim = this.cfgs.ttl.latent_dim;
    const maxDur = Math.max(...duration);
    const wavLengths = duration.map(value => Math.floor(value * sampleRate));
    const chunkSize = baseChunkSize * chunkCompress;
    const latentLen = Math.floor((Math.floor(maxDur * sampleRate) + chunkSize - 1) / chunkSize);
    const latentDimValue = latentDim * chunkCompress;
    const latentLengths = wavLengths.map(length => Math.floor((length + chunkSize - 1) / chunkSize));
    const latentMask = this.lengthToMask(latentLengths, latentLen);
    const xt = duration.map((_, batchIndex) => Array.from({ length: latentDimValue }, () => Array.from({ length: latentLen }, (_, timeIndex) => {
      const u1 = Math.max(0.0001, Math.random());
      const u2 = Math.random();
      const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return gaussian * latentMask[batchIndex][0][timeIndex];
    })));
    return { xt, latentMask };
  }

  async infer(textList, langList, style, totalSteps, speed, progressCallback) {
    const batch = textList.length;
    const { ids, mask } = this.textProcessor.call(textList, langList);
    const idsTensor = new ort.Tensor('int64', BigInt64Array.from(ids.flat(), value => BigInt(value)), [batch, ids[0].length]);
    const maskTensor = new ort.Tensor('float32', Float32Array.from(mask.flat(2)), [batch, 1, mask[0][0].length]);

    const durationOutput = await this.dpOrt.run({ text_ids: idsTensor, style_dp: style.dp, text_mask: maskTensor });
    const duration = Array.from(durationOutput.duration.data, value => Number(value) / speed);
    const textOutput = await this.textEncOrt.run({ text_ids: idsTensor, style_ttl: style.ttl, text_mask: maskTensor });
    const textEmb = textOutput.text_emb;

    let { xt, latentMask } = this.sampleNoisyLatent(duration);
    const latentMaskTensor = new ort.Tensor('float32', Float32Array.from(latentMask.flat(2)), [batch, 1, latentMask[0][0].length]);
    const totalStepTensor = new ort.Tensor('float32', new Float32Array(batch).fill(totalSteps), [batch]);

    for (let step = 0; step < totalSteps; step += 1) {
      progressCallback?.(step + 1, totalSteps);
      const currentStepTensor = new ort.Tensor('float32', new Float32Array(batch).fill(step), [batch]);
      const latentDim = xt[0].length;
      const latentLen = xt[0][0].length;
      const xtTensor = new ort.Tensor('float32', Float32Array.from(xt.flat(2)), [batch, latentDim, latentLen]);
      const output = await this.vectorEstOrt.run({
        noisy_latent: xtTensor,
        text_emb: textEmb,
        style_ttl: style.ttl,
        latent_mask: latentMaskTensor,
        text_mask: maskTensor,
        current_step: currentStepTensor,
        total_step: totalStepTensor,
      });
      const flat = output.denoised_latent.data;
      let offset = 0;
      xt = Array.from({ length: batch }, () => Array.from({ length: latentDim }, () => {
        const row = Array.from(flat.slice(offset, offset + latentLen));
        offset += latentLen;
        return row;
      }));
    }

    const finalTensor = new ort.Tensor('float32', Float32Array.from(xt.flat(2)), [batch, xt[0].length, xt[0][0].length]);
    const vocoderOutput = await this.vocoderOrt.run({ latent: finalTensor });
    return { wav: Array.from(vocoderOutput.wav_tts.data), duration };
  }

  async call(text, lang, style, totalSteps = 5, speed = 1.05, silenceDuration = 0.22, progressCallback = null) {
    if (style.ttl.dims[0] !== 1) throw new Error('single_voice_required');
    const chunks = chunkText(text, (lang === 'ko' || lang === 'ja') ? 120 : 260);
    if (!chunks.length) throw new Error('empty_text');
    const parts = [];
    let totalDuration = 0;
    for (let index = 0; index < chunks.length; index += 1) {
      const result = await this.infer([chunks[index]], [lang], style, totalSteps, speed, progressCallback);
      parts.push(...result.wav);
      totalDuration += Number(result.duration[0] || 0);
      if (index < chunks.length - 1) {
        const silence = Math.floor(silenceDuration * this.sampleRate);
        parts.push(...new Array(silence).fill(0));
        totalDuration += silenceDuration;
      }
    }
    return { wav: parts, duration: [totalDuration] };
  }
}

export function configureRuntime({ wasmBaseUrl, wasmThreads = 1 } = {}) {
  ort.env.wasm.numThreads = Math.max(1, Number(wasmThreads) || 1);
  if (wasmBaseUrl) ort.env.wasm.wasmPaths = wasmBaseUrl;
}

export async function loadVoiceStyle(url) {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`voice_style_${response.status}`);
  const voice = await response.json();
  const ttlDims = voice.style_ttl.dims;
  const dpDims = voice.style_dp.dims;
  const ttl = new ort.Tensor('float32', Float32Array.from(voice.style_ttl.data.flat(Infinity)), ttlDims);
  const dp = new ort.Tensor('float32', Float32Array.from(voice.style_dp.data.flat(Infinity)), dpDims);
  return new Style(ttl, dp);
}

async function loadJson(url) {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`model_json_${response.status}`);
  return response.json();
}

export async function loadTextToSpeech(onnxDir, sessionOptions, progressCallback = null) {
  const cfgs = await loadJson(`${onnxDir}/tts.json`);
  const indexer = await loadJson(`${onnxDir}/unicode_indexer.json`);
  const models = [
    ['Duration', `${onnxDir}/duration_predictor.onnx`],
    ['Text', `${onnxDir}/text_encoder.onnx`],
    ['Voice', `${onnxDir}/vector_estimator.onnx`],
    ['Audio', `${onnxDir}/vocoder.onnx`],
  ];
  const sessions = [];
  for (let index = 0; index < models.length; index += 1) {
    progressCallback?.(models[index][0], index + 1, models.length);
    sessions.push(await ort.InferenceSession.create(models[index][1], sessionOptions));
  }
  return {
    textToSpeech: new TextToSpeech(cfgs, new UnicodeProcessor(indexer), ...sessions),
    cfgs,
  };
}

export function writeWavFile(audioData, sampleRate) {
  const buffer = new ArrayBuffer(44 + audioData.length * 2);
  const view = new DataView(buffer);
  const writeAscii = (offset, text) => [...text].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + audioData.length * 2, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(36, 'data');
  view.setUint32(40, audioData.length * 2, true);
  const pcm = new Int16Array(audioData.length);
  for (let index = 0; index < audioData.length; index += 1) {
    const value = Math.max(-1, Math.min(1, Number(audioData[index]) || 0));
    pcm[index] = Math.round(value * 32767);
  }
  new Uint8Array(buffer, 44).set(new Uint8Array(pcm.buffer));
  return buffer;
}
