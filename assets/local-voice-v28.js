(() => {
  'use strict';

  const BUILD_ID = document.querySelector('meta[name="dokohilf-build"]')?.content || 'unknown';
  const error = () => Promise.reject(new Error('on_device_voice_retired_static_supertonic_only'));

  // v29+ voice policy: no browser/device-side TTS generation. Every spoken response
  // is served from pre-generated Supertonic-F1 WAV files in the release catalog.
  window.DokoHilfLocalVoiceV28 = {
    arm: () => false,
    armAndPrepare: error,
    prepare: error,
    synthesize: error,
    getState: () => ({
      buildId: BUILD_ID,
      state: 'retired',
      backend: 'none',
      lastError: '',
      armed: false,
      model: 'Supertonic 3 static build',
      voice: 'F1',
      language: 'de',
      inferenceSteps: 0,
    }),
  };
  window.__DOKOHILF_LOCAL_VOICE_V28__ = false;
  window.__DOKOHILF_LOCAL_VOICE_RETIRED_V29__ = true;
})();
