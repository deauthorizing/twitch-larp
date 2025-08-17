// ==UserScript==
// @name         pro twitch larper
// @namespace    http://tampermonkey.net/
// @version      2.8
// @description  i love twitch!
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const LS_KEYS = {
    realName: 'twitch_real_username',
    fakeName: 'twitch_fake_username',
    fakeNameEnabled: 'twitch_fake_username_enabled',
    verifiedEnabled: 'twitch_verified_enabled',
    fakeFollowers: 'twitch_fake_followers',
    fakeFollowersEnabled: 'twitch_fake_followers_enabled'
  };

  let REAL_NAME = localStorage.getItem(LS_KEYS.realName) || '';
  let FAKE_NAME = localStorage.getItem(LS_KEYS.fakeName) || '';
  let FAKE_NAME_ENABLED = localStorage.getItem(LS_KEYS.fakeNameEnabled) === 'true';
  let VERIFIED_ENABLED = localStorage.getItem(LS_KEYS.verifiedEnabled) === 'true';
  let FAKE_FOLLOWERS = localStorage.getItem(LS_KEYS.fakeFollowers) || '';
  let FAKE_FOLLOWERS_ENABLED = localStorage.getItem(LS_KEYS.fakeFollowersEnabled) === 'true';

  const scheduleApply = (() => {
    let rafId = null;
    return () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        applyAll();
      });
    };
  })();

  function setTextIfDifferent(el, txt) {
    if (!el) return;
    if ('value' in el) {
      if (el.value !== txt) el.value = txt;
    } else if (typeof txt === 'string' && el.textContent !== txt) {
      el.textContent = txt;
    }
  }

  function formatFollowers(numStr) {
    const num = parseInt(numStr, 10);
    if (isNaN(num) || num === 0) return '';

    let formatted;
    if (num >= 1_000_000) {
      formatted = (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1_000) {
      formatted = (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      formatted = String(num);
    }
    const label = num === 1 ? 'follower' : 'followers';
    return `${formatted} ${label}`;
  }

  function applyHeaderNameAndBadge() {
    const header = document.querySelector('h1.CoreText-sc-1txzju1-0.ScTitleText-sc-d9mj2s-0');
    if (header) {
      if (FAKE_NAME_ENABLED && FAKE_NAME) {
        setTextIfDifferent(header, FAKE_NAME);
      } else if (REAL_NAME) {
        setTextIfDifferent(header, REAL_NAME);
      }

      const parent = header.parentElement;
      if (parent) {
        let badge = parent.querySelector('[data-tw-badge]');
        if (VERIFIED_ENABLED) {
          if (!badge) {
            const badgeHTML = `
              <span data-tw-badge style="display:inline-flex;align-items:center;margin-left:3px;">
                <div class="ScSvgWrapper-sc-wkgzod-0 tw-svg" style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
                  <svg width="20" height="20" viewBox="0 0 16 16" aria-label="Verified Badge" fill="currentColor" style="color:#A970FF;display:block;">
                    <path fill-rule="evenodd" d="M12.5 3.5 8 2 3.5 3.5 2 8l1.5 4.5L8 14l4.5-1.5L14 8l-1.5-4.5ZM7 11l4.5-4.5L10 5 7 8 5.5 6.5 4 8l3 3Z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </span>`;
            header.insertAdjacentHTML('afterend', badgeHTML);
            badge = parent.querySelector('[data-tw-badge]');
          }
          if (badge) {
            badge.style.display = 'inline-flex';
            badge.style.alignItems = 'center';
            badge.style.marginLeft = '3px';
          }
        } else if (badge) {
          badge.remove();
        }
      }
    }
  }

  function applyDropdownName() {
    const dropdown = document.querySelector('h6[data-a-target="user-display-name"][data-test-selector="user-menu-dropdown__display-name"], h6[data-a-target="user-display-name"]');
    if (!dropdown) return;

    if (FAKE_NAME_ENABLED && FAKE_NAME) {
      setTextIfDifferent(dropdown, FAKE_NAME);
    } else if (REAL_NAME) {
      setTextIfDifferent(dropdown, REAL_NAME);
    }
  }

  function applyFollowers() {
    const followersEl = document.querySelector('p.CoreText-sc-1txzju1-0.gtJaaB');
    if (!followersEl) return;

    if (FAKE_FOLLOWERS_ENABLED && FAKE_FOLLOWERS !== '') {
      const formatted = formatFollowers(FAKE_FOLLOWERS);
      setTextIfDifferent(followersEl, formatted);
    }
  }

  function applyOfflineBanner() {
    const offlineEl = document.querySelector('h2.CoreText-sc-1txzju1-0.ScTitleText-sc-d9mj2s-0 span');
    if (!offlineEl) return;

    if (FAKE_NAME_ENABLED && FAKE_NAME) {
      setTextIfDifferent(offlineEl, FAKE_NAME);
    } else if (REAL_NAME) {
      setTextIfDifferent(offlineEl, REAL_NAME);
    }
  }

  function applySettingsInputs() {
    const usernameInput = document.querySelector('input#username[data-a-target="tw-input"]');
    const displayNameInput = document.querySelector('input#display-name[data-a-target="tw-input"]');

    if (FAKE_NAME_ENABLED && FAKE_NAME) {
      setTextIfDifferent(usernameInput, FAKE_NAME.toLowerCase());
      setTextIfDifferent(displayNameInput, FAKE_NAME);
    } else if (REAL_NAME) {
      setTextIfDifferent(usernameInput, REAL_NAME.toLowerCase());
      setTextIfDifferent(displayNameInput, REAL_NAME);
    }
  }

  function applyOwnStreamHeader() {
    const ownStreamHeader = document.querySelector('a[href] > h1.tw-title');
    if (!ownStreamHeader) return;

    if (FAKE_NAME_ENABLED && FAKE_NAME) {
      setTextIfDifferent(ownStreamHeader, FAKE_NAME);
    } else if (REAL_NAME) {
      setTextIfDifferent(ownStreamHeader, REAL_NAME);
    }
  }

  function applyChatUsernames() {
    const chatNames = document.querySelectorAll('span.chat-author__display-name[data-a-target="chat-message-username"]');
    chatNames.forEach(span => {
      if (FAKE_NAME_ENABLED && FAKE_NAME) {
        setTextIfDifferent(span, FAKE_NAME);
        span.setAttribute('data-a-user', FAKE_NAME.toLowerCase());
      } else if (REAL_NAME) {
        setTextIfDifferent(span, REAL_NAME);
        span.setAttribute('data-a-user', REAL_NAME.toLowerCase());
      }
    });
  }

  function applyAll() {
    try {
      applyHeaderNameAndBadge();
      applyDropdownName();
      applyFollowers();
      applyOfflineBanner();
      applySettingsInputs();
      applyOwnStreamHeader();
      applyChatUsernames();
    } catch (err) {
      console.error('applyAll error:', err);
    }
  }

  function buildSettingsModal() {
    const existing = document.getElementById('twitch-username-settings');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'twitch-username-settings';
    Object.assign(backdrop.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,.6)',
      zIndex: 2147483647,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    const modal = document.createElement('div');
    Object.assign(modal.style, {
      background: '#18181b',
      color: '#efeff1',
      width: 'min(720px, 92vw)',
      borderRadius: '12px',
      boxShadow: '0 12px 32px rgba(0,0,0,.45)',
      padding: '16px',
      fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Arial'
    });

    const inputStyle = 'width:100%;box-sizing:border-box;background:#0e0e10;color:#efeff1;border:1px solid #3a3a3d;border-radius:8px;padding:10px;outline:none;';
    const labelStyle = 'display:flex;gap:8px;align-items:center;font-size:13px;opacity:.95;';
    const grid2 = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;';

    modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="font-weight:700;font-size:18px;">Twitch Spoofer</div>
        <button id="tw-close" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="${grid2}">
          <div>
            <div style="font-size:12px;margin-bottom:6px;opacity:.8;">Real Username</div>
            <input id="tw-real" type="text" value="${REAL_NAME}" style="${inputStyle}" placeholder="yourusername">
          </div>
          <div>
            <div style="font-size:12px;margin-bottom:6px;opacity:.8;">Fake Username</div>
            <input id="tw-fake" type="text" value="${FAKE_NAME}" style="${inputStyle}" placeholder="fakeusername">
          </div>
        </div>
        <label style="${labelStyle}"><input id="tw-toggle-fake" type="checkbox" ${FAKE_NAME_ENABLED ? 'checked' : ''}> Enable Fake Username</label>
        <label style="${labelStyle}"><input id="tw-toggle-verified" type="checkbox" ${VERIFIED_ENABLED ? 'checked' : ''}> Show Verified Badge</label>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:2px 0;">
        <div style="${grid2}">
          <div>
            <div style="font-size:12px;margin-bottom:6px;opacity:.8;">Fake Followers</div>
            <input id="tw-followers" type="number" min="0" step="1" value="${FAKE_FOLLOWERS}" style="${inputStyle}" placeholder="e.g. 2500">
          </div>
          <div style="display:flex;align-items:flex-end;">
            <label style="${labelStyle}"><input id="tw-toggle-followers" type="checkbox" ${FAKE_FOLLOWERS_ENABLED ? 'checked' : ''}> Enable Fake Followers</label>
          </div>
        </div>
        <div id="tw-error" style="color:#ff6b6b;font-size:12px;height:16px;"></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px;">
          <button id="tw-cancel" style="background:#1f1f1f;border:1px solid #2a2a2a;color:#efeff1;border-radius:8px;padding:10px 14px;cursor:pointer;">Cancel</button>
          <button id="tw-save" style="background:#9146FF;border:0;color:white;border-radius:8px;padding:10px 14px;cursor:pointer;">Save</button>
        </div>
      </div>
      <div style="margin-top:14px;font-size:11px;color:#888;text-align:center;">
        made by fusi and wish, join <a href="https://t.me/larpforfree" target="_blank" style="color:#9146FF;text-decoration:none;">t.me/larpforfree</a>.
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const close = () => backdrop.remove();
    modal.querySelector('#tw-close').onclick = close;
    modal.querySelector('#tw-cancel').onclick = close;

    modal.querySelector('#tw-save').onclick = () => {
      try {
        REAL_NAME = modal.querySelector('#tw-real').value.trim();
        FAKE_NAME = modal.querySelector('#tw-fake').value.trim();
        FAKE_NAME_ENABLED = modal.querySelector('#tw-toggle-fake').checked;
        VERIFIED_ENABLED = modal.querySelector('#tw-toggle-verified').checked;
        FAKE_FOLLOWERS = modal.querySelector('#tw-followers').value.trim();
        FAKE_FOLLOWERS_ENABLED = modal.querySelector('#tw-toggle-followers').checked;

        localStorage.setItem(LS_KEYS.realName, REAL_NAME);
        localStorage.setItem(LS_KEYS.fakeName, FAKE_NAME);
        localStorage.setItem(LS_KEYS.fakeNameEnabled, String(FAKE_NAME_ENABLED));
        localStorage.setItem(LS_KEYS.verifiedEnabled, String(VERIFIED_ENABLED));
        localStorage.setItem(LS_KEYS.fakeFollowers, FAKE_FOLLOWERS);
        localStorage.setItem(LS_KEYS.fakeFollowersEnabled, String(FAKE_FOLLOWERS_ENABLED));

        applyAll();
        close();
      } catch (e) {
        modal.querySelector('#tw-error').textContent = 'Save failed: ' + (e && e.message ? e.message : String(e));
      }
    };
  }

  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      buildSettingsModal();
    }
  });

  window.addEventListener('load', () => {
    applyAll();
    console.log('[Twitch Larp] Loaded — press Shift+S to open settings');
  });

  let lastUrl = location.href;
  const mo = new MutationObserver((mutations) => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      scheduleApply();
      return;
    }
    for (const m of mutations) {
      if (m.type === 'childList') {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (
            node.matches?.('h6[data-a-target="user-display-name"], p.CoreText-sc-1txzju1-0.gtJaaB, h2.CoreText-sc-1txzju1-0.ScTitleText-sc-d9mj2s-0 span, input#username[data-a-target="tw-input"], input#display-name[data-a-target="tw-input"], a[href] > h1.tw-title, span.chat-author__display-name[data-a-target="chat-message-username"]') ||
            node.querySelector?.('h6[data-a-target="user-display-name"], p.CoreText-sc-1txzju1-0.gtJaaB, h2.CoreText-sc-1txzju1-0.ScTitleText-sc-d9mj2s-0 span, input#username[data-a-target="tw-input"], input#display-name[data-a-target="tw-input"], a[href] > h1.tw-title, span.chat-author__display-name[data-a-target="chat-message-username"]')
          ) {
            scheduleApply();
            return;
          }
        }
      }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();
