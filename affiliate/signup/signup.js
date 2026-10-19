(() => {
  'use strict';
  const key = 'lsa-affiliate-referral';
  const lifetime = 60 * 24 * 60 * 60 * 1000;
  const valid = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,160}$/.test(value);
  const query = new URLSearchParams(window.location.search).get('fpr');
  let referral = valid(query) ? query : null;
  try {
    if (referral) localStorage.setItem(key, JSON.stringify({ token: referral, expires: Date.now() + lifetime }));
    else {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved && saved.expires > Date.now() && valid(saved.token)) referral = saved.token;
    }
  } catch (_) { /* The current link still works if browser storage is disabled. */ }
  document.getElementById('referral-note').hidden = !referral;
  const form = document.getElementById('signup-form');
  const error = document.getElementById('form-error');
  const submit = document.getElementById('submit-button');
  let busy = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    busy = true; submit.disabled = true; submit.textContent = 'Creating your account…'; error.hidden = true;
    const fields = new FormData(form);
    const payload = { company_type: 'agency', affiliate_ref: referral };
    ['first_name', 'last_name', 'company_name', 'email', 'phone'].forEach(name => { payload[name] = fields.get(name).trim(); });
    payload.password = fields.get('password');
    try {
      const response = await fetch('https://lsaapi.revulsab.com/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'omit', body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        const messages = result.errors ? Object.values(result.errors).flat().join(' ') : result.message;
        throw new Error(messages || 'We couldn’t create your account. Please try again.');
      }
      // Never store or transfer the returned login token across domains.
      form.reset(); form.hidden = true;
      try { localStorage.removeItem(key); } catch (_) {}
      const success = document.getElementById('signup-success'); success.hidden = false; success.focus();
    } catch (failure) {
      error.textContent = failure instanceof TypeError ? 'We couldn’t reach the signup service. Please try again. If you already submitted, try signing in before creating another account.' : failure.message;
      error.hidden = false; error.focus();
    } finally { busy = false; submit.disabled = false; submit.textContent = 'Create my account ↗'; }
  });
})();
