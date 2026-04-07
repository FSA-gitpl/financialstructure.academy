(function() {
  'use strict';

  const CONFIG = {
    defaultLang: 'pl',
    supportedLangs: ['pl', 'en', 'de'],
    paths: {
      'pl': '/',
      'en': '/en/',
      'de': '/de/'
    },
    storageKey: 'fsa_lang_pref',
    cookieName: 'fsa_lang',
    maxAge: 365 * 24 * 60 * 60
  };

  function getStoredLang() {
    const stored = localStorage.getItem(CONFIG.storageKey);
    if (stored && CONFIG.supportedLangs.includes(stored)) return stored;
    
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === CONFIG.cookieName && CONFIG.supportedLangs.includes(value)) {
        return value;
      }
    }
    return null;
  }

  function setLangPref(lang) {
    localStorage.setItem(CONFIG.storageKey, lang);
    document.cookie = `${CONFIG.cookieName}=${lang}; max-age=${CONFIG.maxAge}; path=/; SameSite=Lax`;
  }

  function getBrowserLang() {
    const navLang = (navigator.language || navigator.userLanguage).toLowerCase();
    const langCode = navLang.split('-')[0];
    return CONFIG.supportedLangs.includes(langCode) ? langCode : CONFIG.defaultLang;
  }

  function getCurrentPath() {
    return window.location.pathname.replace(/\/+$/, '') || '/';
  }

  function isCurrentLangCorrect(targetLang) {
    const expected = CONFIG.paths[targetLang].replace(/\/+$/, '') || '/';
    return getCurrentPath() === expected;
  }

  function redirect(lang) {
    const target = CONFIG.paths[lang];
    const url = window.location.origin + target + window.location.search + window.location.hash;
    window.location.replace(url);
  }

  function init() {
    if (/bot|crawl|spider|slurp|mediapartners/i.test(navigator.userAgent)) return;
    
    const params = new URLSearchParams(window.location.search);
    if (params.has('lang')) {
      const forced = params.get('lang');
      if (CONFIG.supportedLangs.includes(forced)) {
        setLangPref(forced);
        params.delete('lang');
        const clean = window.location.pathname + (params.toString() ? '?' + params : '') + window.location.hash;
        window.history.replaceState({}, '', clean);
      }
      return;
    }

    const stored = getStoredLang();
    const target = stored || getBrowserLang();
    
    if (!isCurrentLangCorrect(target)) {
      redirect(target);
    }
  }

  window.FSA = window.FSA || {};
  window.FSA.setLanguage = function(lang) {
    if (!CONFIG.supportedLangs.includes(lang)) return;
    setLangPref(lang);
    window.location.href = window.location.origin + CONFIG.paths[lang];
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
