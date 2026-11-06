(() => {
 document.querySelectorAll('[data-video]').forEach(button => button.addEventListener('click', () => {
  const player = document.createElement('video');
  player.src = button.dataset.video;
  player.controls = true;
  player.playsInline = true;
  player.preload = 'metadata';
  player.setAttribute('aria-label', button.getAttribute('aria-label').replace(/^Play /, ''));
  player.addEventListener('play', () => document.querySelectorAll('.video-player video').forEach(other => { if (other !== player) other.pause(); }));
  button.replaceWith(player);
  player.focus();
  player.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
 }));
 const boxes = [...document.querySelectorAll('[data-check]')];
 const key = 'lsa-setup-checklist-v1';
 const status = document.querySelector('#save-status');
 let saved = {};
 try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) {}
 boxes.forEach(box => { box.checked = saved[box.dataset.check] === true; });
 function render(save) {
  const total = boxes.filter(box => box.checked).length;
  document.querySelector('#progress').value = total;
  document.querySelector('#progress-label').textContent = `${total} of ${boxes.length} complete`;
  if (save) {
   try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(boxes.map(box => [box.dataset.check,box.checked])))); status.textContent = total === boxes.length ? 'Checklist complete. Your progress is saved in this browser.' : `${total} of ${boxes.length} complete. Saved in this browser.`; }
   catch (_) { status.textContent = 'Browser storage is unavailable. Your checks will last only for this visit.'; }
  }
 }
 boxes.forEach(box => box.addEventListener('change', () => render(true)));
 document.querySelector('#reset').addEventListener('click', () => { boxes.forEach(box => box.checked = false); render(true); });
 render(false);
 let timer;
 document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const toast = document.querySelector('#toast');
  try { await navigator.clipboard.writeText(button.dataset.copy); toast.textContent = 'Copied to clipboard'; }
  catch (_) { toast.textContent = 'Select and copy the value shown beside this button.'; }
  toast.classList.add('show'); clearTimeout(timer); timer = setTimeout(() => toast.classList.remove('show'), 3000);
 }));
 const referral = new URLSearchParams(location.search).get('fpr');
 if (referral && /^[a-zA-Z0-9_-]{1,128}$/.test(referral)) document.querySelectorAll('a[href="/affiliate/signup"]').forEach(link => link.href = '/affiliate/signup?fpr=' + encodeURIComponent(referral));
})();
