function showPage(id, btn) {
  // Masque toutes les pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Désactive tous les boutons nav
  document.querySelectorAll('.nav-btn, .nav-dropdown-item').forEach(button => {
    button.classList.remove('active');
  });

  // Affiche la page ciblée
  const targetPage = document.getElementById('page-' + id);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Active le bouton cliqué
  if (btn) {
    btn.classList.add('active');
  }

  // Garde le trigger "Stages" actif sur ses sous-pages
  if (id === 'stage1' || id === 'stage2' || id === 'parcours') {
    const trigger = document.querySelector('#nav-dropdown-stages .nav-dropdown-trigger');
    if (trigger) trigger.classList.add('active');
  }

  // Garde le trigger "Projet" actif sur ses sous-pages
  if (id === 'projet-scolaire' || id === 'projet-perso' || id === 'projet') {
    const trigger = document.querySelector('#nav-dropdown-projet .nav-dropdown-trigger');
    if (trigger) trigger.classList.add('active');
  }

  // Sidebar visible uniquement sur accueil et profil
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.style.display = (id === 'accueil' || id === 'profil' || id === 'contact') ? 'flex' : 'none';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const activePage = document.querySelector('.page.active');
  if (sidebar && activePage) {
    const activeId = activePage.id.replace('page-', '');
    sidebar.style.display = (activeId === 'accueil' || activeId === 'profil') ? 'flex' : 'none';
  }
});

/* ── Modale de visualisation des attestations ── */
function openCertifModal(fileUrl) {
  const overlay = document.getElementById('certif-modal-overlay');
  const frame = document.getElementById('certif-modal-frame');
  if (!overlay || !frame) return;
  frame.src = fileUrl;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCertifModal(event) {
  // Ne ferme pas si le clic vient du contenu (géré par stopPropagation dans le HTML)
  const overlay = document.getElementById('certif-modal-overlay');
  const frame = document.getElementById('certif-modal-frame');
  if (!overlay || !frame) return;
  overlay.classList.remove('active');
  frame.src = ''; // stoppe le chargement du PDF en arrière-plan
  document.body.style.overflow = '';
}

// Fermeture avec la touche Échap
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCertifModal();
});

/* ── Animation canvas BTS SIO ── */
(function() {
  function initBtsCanvas() {
    const canvas = document.getElementById('bts-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      const section = document.getElementById('page-bts');
      canvas.width  = section.offsetWidth  || window.innerWidth;
      canvas.height = section.offsetHeight || window.innerHeight;
      if (canvas.height < 100) canvas.height = window.innerHeight - 50;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particules binaires + symboles code
    const SYMBOLS = ['0','1','</>','{}','[]','//','&&','||','01','10','::'];
    const COUNT = 70;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vy: 0.4 + Math.random() * 0.9,
      vx: (Math.random() - 0.5) * 0.4,
      size: 13 + Math.floor(Math.random() * 14),
      alpha: 0.25 + Math.random() * 0.45,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      color: Math.random() > 0.5 ? '#8b0000' : '#cc0000',
      blinkSpeed: 0.01 + Math.random() * 0.03,
      blinkOffset: Math.random() * Math.PI * 2,
    }));

    // Lignes de scan horizontales
    const scanLines = Array.from({ length: 4 }, (_, i) => ({
      y: (canvas.height / 4) * i + Math.random() * 60,
      vy: 0.5 + Math.random() * 0.6,
      alpha: 0.12 + Math.random() * 0.1,
    }));

    let frame = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scan lines
      scanLines.forEach(sl => {
        sl.y += sl.vy;
        if (sl.y > canvas.height) sl.y = -2;
        const grad = ctx.createLinearGradient(0, sl.y, canvas.width, sl.y);
        grad.addColorStop(0,   'transparent');
        grad.addColorStop(0.3, `rgba(139,0,0,${sl.alpha})`);
        grad.addColorStop(0.7, `rgba(180,0,0,${sl.alpha})`);
        grad.addColorStop(1,   'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, sl.y, canvas.width, 2.5);
      });

      // Particules
      particles.forEach(p => {
        const blink = 0.5 + 0.5 * Math.sin(frame * p.blinkSpeed + p.blinkOffset);
        ctx.globalAlpha = p.alpha * blink;
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px 'Barlow Condensed', monospace`;
        ctx.fillText(p.symbol, p.x, p.y);

        p.x += p.vx;
        p.y += p.vy;
        if (p.y > canvas.height + 20)  p.y = -20;
        if (p.x < -30)                 p.x = canvas.width + 10;
        if (p.x > canvas.width + 30)   p.x = -10;
      });

      ctx.globalAlpha = 1;
      frame++;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // Relancer resize à chaque fois que la page BTS devient active
  const btsMutObs = new MutationObserver(() => {
    const section = document.getElementById('page-bts');
    if (section && section.classList.contains('active')) {
      setTimeout(() => {
        const c = document.getElementById('bts-canvas');
        if (c) {
          c.width  = section.offsetWidth  || window.innerWidth;
          c.height = section.offsetHeight || window.innerHeight;
        }
      }, 50);
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('page-bts');
    if (section) {
      btsMutObs.observe(section, { attributes: true, attributeFilter: ['class'] });
      if (section.classList.contains('active')) initBtsCanvas();
      else {
        const once = new MutationObserver(() => { initBtsCanvas(); once.disconnect(); });
        once.observe(section, { attributes: true, attributeFilter: ['class'] });
      }
    }
  });
})();