(() => {
  'use strict';

  const BUILD_ID = document.querySelector('meta[name="dokohilf-build"]')?.content || 'unknown';
  const retired = () => Promise.reject(new Error('on_device_voice_retired_static_supertonic_only'));

  // Compatibility guard only: old UI layers use this marker to disable legacy
  // cloud/system voice paths. No model is loaded and no speech is generated here.
  window.DokoHilfLocalVoiceV28 = {
    arm: () => false,
    armAndPrepare: retired,
    prepare: retired,
    synthesize: retired,
    getState: () => ({
      buildId: BUILD_ID,
      state: 'retired',
      backend: 'none',
      lastError: '',
      armed: false,
      model: 'Supertonic 3 static release audio',
      voice: 'F1',
      language: 'de',
      inferenceSteps: 0,
    }),
  };
  window.__DOKOHILF_LOCAL_VOICE_V28__ = true;
  window.__DOKOHILF_LOCAL_VOICE_RETIRED_V29__ = true;
  window.__DOKOHILF_STATIC_SUPERTONIC_ONLY_V29__ = true;
})();
