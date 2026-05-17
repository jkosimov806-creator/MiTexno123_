
// ── AC SWIPE SLIDER ──────────────────────────────────────────
(function() {
  const track = document.getElementById('acTrack');
  const dots  = document.querySelectorAll('.ac-dot');
  if (!track) return;

  let current = 0;
  let startX = 0;
  let isDragging = false;
  let dragDelta = 0;
  const cards = track.querySelectorAll('.ac-card');
  const total = cards.length;

  function getCardWidth() {
    return cards[0].offsetWidth + 16; // 16 = gap
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  // Touch
  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
  }, { passive: true });

  // Mouse drag
  track.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX;
    track.classList.add('dragging');
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    dragDelta = startX - e.clientX;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
    if (Math.abs(dragDelta) > 50) {
      goTo(dragDelta > 0 ? current + 1 : current - 1);
    }
    dragDelta = 0;
  });

  // Dots click
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  goTo(0);
})();
