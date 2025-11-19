// Attach cursor/touch handlers to #work .img-box to update CSS vars --mx / --my
(function () {
  const boxes = document.querySelectorAll('#work .img-box');
  if (!boxes.length) return;

  const MAX_ROT = 6; // max degrees of rotation
  const SMOOTH = 0.15; // smoothing for rAF (0..1) — lower = smoother

  boxes.forEach(box => {
    let rafId = null;
    let lastX = 0, lastY = 0;
    let targetMx = 0, targetMy = 0;

    const updateVars = () => {
      // lerp current -> target for a slightly smoother movement
      lastX += (targetMx - lastX) * SMOOTH;
      lastY += (targetMy - lastY) * SMOOTH;
      box.style.setProperty('--mx', lastX.toFixed(3));
      box.style.setProperty('--my', lastY.toFixed(3));
      rafId = requestAnimationFrame(updateVars);
    };

    const onMove = (e) => {
      const rect = box.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY);
      if (clientX == null || clientY == null) return;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const nx = (x - rect.width / 2) / (rect.width / 2); // -1 .. 1
      const ny = (y - rect.height / 2) / (rect.height / 2); // -1 .. 1

      // invert/scale to taste
      targetMx = Number((-nx * MAX_ROT).toFixed(3));
      targetMy = Number((ny * MAX_ROT).toFixed(3));
      // start rAF loop if not already running
      if (!rafId) rafId = requestAnimationFrame(updateVars);
    };

    // Start following on enter / touchstart
    const start = (e) => {
      box.classList.add('is-hover');
      onMove(e);
    };

    const clear = () => {
      box.classList.remove('is-hover');
      targetMx = 0;
      targetMy = 0;
      // let loop finish lerping back to 0 then cancel
      if (!rafId) rafId = requestAnimationFrame(updateVars);
      // cancel after short delay to save CPU
      setTimeout(() => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        // ensure final reset
        box.style.setProperty('--mx', 0);
        box.style.setProperty('--my', 0);
        lastX = lastY = 0;
        targetMx = targetMy = 0;
      }, 300);
    };

    box.addEventListener('mousemove', onMove, { passive: true });
    box.addEventListener('touchmove', onMove, { passive: true });

    box.addEventListener('mouseenter', start);
    box.addEventListener('touchstart', start, { passive: true });

    box.addEventListener('mouseleave', clear);
    box.addEventListener('touchend', clear);
    box.addEventListener('touchcancel', clear);
  });
})();