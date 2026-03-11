(function () {
  function hasAnyElement(selectors) {
    return selectors.some(function (sel) {
      return document.querySelector(sel);
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.defer = true;
      s.src = src;
      s.onload = function () { resolve(true); };
      s.onerror = function () {
        console.warn('[legacy-loader] failed to load', src);
        resolve(false);
      };
      document.body.appendChild(s);
    });
  }

  async function run() {
    // Always load QR scanner global first (used by some legacy scripts)
    await loadScript('/assets/js/qr-scanner.umd.min.js');

    // Always load app helpers / sidebar behavior
    await loadScript('/assets/js/main.js');
    await loadScript('/assets/js/profil.js');

    // Load the rest globally, but keep the riskiest ones conditional.
    // - service-worker.js must NOT be loaded as a page script.
    // - scan.js is ESM and imports non-module deps; don't auto-load globally.

    var globalScripts = [
      '/assets/js/admin.js',
      '/assets/js/adminhub_sidebar.js',
      '/assets/js/badge-scanner.js',
      '/assets/js/badge.js',
      '/assets/js/calendar-admin-custom.js',
      '/assets/js/calendar-admin.js',
      '/assets/js/calendar-employe.js',
      '/assets/js/calendrier.js',
      '/assets/js/employe.js',
      '/assets/js/justification-modal.js',
      '/assets/js/settings.js'
    ];

    for (var i = 0; i < globalScripts.length; i++) {
      await loadScript(globalScripts[i]);
    }

    // script.js: includes QR scanning flow and assumes scan page DOM exists.
    // We made it safe to load globally, but still keep it conditional.
    if (hasAnyElement(['#qr-video', '#feedback-message', '#historique', '#journal'])) {
      await loadScript('/assets/js/script.js');
    }

    // Optional: include worker/min libs only if something requests them.
    // Loading them globally is harmless but noisy.
    if (hasAnyElement(['#qr-video'])) {
      await loadScript('/assets/js/qr-scanner.min.js');
      await loadScript('/assets/js/qr-scanner-worker.min.js');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
