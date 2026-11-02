console.log('%cPsst... 👀 toi qui fouilles dans la console...', 'color:#ff4d4d; font-size:16px; font-weight:bold;');
console.log('%cTape "sudo" n\'importe où sur la page (en dehors d\'un champ de texte) pour voir ce qui se passe...', 'color:#999; font-size:12px;');

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

/* ── Animation canvas Veille : schéma de neurones discret ── */
(function() {
  function initVeilleCanvas() {
    const canvas = document.getElementById('veille-neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      const section = document.getElementById('page-veille');
      canvas.width  = section.offsetWidth  || window.innerWidth;
      canvas.height = section.offsetHeight || window.innerHeight;
      if (canvas.height < 100) canvas.height = window.innerHeight - 50;
    }
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 55;
    const LINK_DIST = 190;
    const nodes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 2 + Math.random() * 1.8,
      pulseSpeed: 0.008 + Math.random() * 0.018,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connexions entre neurones proches
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.35;
            ctx.strokeStyle = `rgba(180, 0, 0, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Neurones (points)
      nodes.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(frame * n.pulseSpeed + n.pulseOffset);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 20, 20, ${0.4 + pulse * 0.4})`;
        ctx.fill();

        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      frame++;
      requestAnimationFrame(draw);
    }
    draw();
  }

  const veilleMutObs = new MutationObserver(() => {
    const section = document.getElementById('page-veille');
    if (section && section.classList.contains('active')) {
      setTimeout(() => {
        const c = document.getElementById('veille-neural-canvas');
        if (c) {
          c.width  = section.offsetWidth  || window.innerWidth;
          c.height = section.offsetHeight || window.innerHeight;
        }
      }, 50);
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('page-veille');
    if (section) {
      veilleMutObs.observe(section, { attributes: true, attributeFilter: ['class'] });
      if (section.classList.contains('active')) initVeilleCanvas();
      else {
        const once = new MutationObserver(() => { initVeilleCanvas(); once.disconnect(); });
        once.observe(section, { attributes: true, attributeFilter: ['class'] });
      }
    }
  });
})();

/* ── Easter egg : terminal caché, déclenché en tapant "sudo" ── */
(function() {
  const TRIGGER = 'sudo';
  let buffer = '';

  const COMMANDS = {
    help: () => [
      'Commandes disponibles :',
      '  whoami    - qui je suis',
      '  skills    - mes compétences principales',
      '  projects  - mes projets récents',
      '  contact   - me contacter',
      '  clear     - vider le terminal',
      '  exit      - fermer ce terminal',
    ],
    whoami: () => [
      'mylan-patisson',
      'Étudiant BTS SIO SLAM — ENC Bessières.',
      "Passionné de développement depuis un petit jeu en Python au lycée.",
    ],
    skills: () => [
      'Back-End   : Python, PHP, Java, C#, Kotlin',
      'Front-End  : HTML5, CSS3, JavaScript',
      'Outils/BDD : SQL/MySQL, Git, Docker',
      'Réseau     : VLAN, Cisco IOS, configuration switch/routeur',
    ],
    projects: () => [
      '- Jeu en Python (lycée, POO)',
      '- Système de gestion de stock (C#/.NET, ENC Bessières)',
      '- Calculator Tips (Kotlin, Android)',
      '- Dice Roller (Kotlin, Android)',
    ],
    contact: () => {
      closeTerminal();
      showPage('contact', document.querySelector('[onclick*="contact"]'));
      return ["Direction la page contact..."];
    },
    clear: () => { renderLines([], true); return null; },
    exit: () => { closeTerminal(); return null; },
  };

  function renderLines(lines, replace) {
    const body = document.getElementById('terminal-body');
    if (!body) return;
    if (replace) body.innerHTML = '';
    lines.forEach(text => {
      const div = document.createElement('div');
      div.className = 'terminal-line ok';
      div.textContent = text;
      body.appendChild(div);
    });
    body.scrollTop = body.scrollHeight;
  }

  function printCommand(cmd) {
    const body = document.getElementById('terminal-body');
    if (!body) return;
    const div = document.createElement('div');
    div.className = 'terminal-line cmd';
    div.textContent = 'visiteur@portfolio:~$ ' + cmd;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    printCommand(cmd);

    if (cmd in COMMANDS) {
      const out = COMMANDS[cmd]();
      if (out) renderLines(out, false);
      return;
    }
    renderLines([`commande introuvable : ${cmd} (tape "help")`], false);
  }

  window.closeTerminal = function(event) {
    if (event && event.target !== event.currentTarget) return;
    const overlay = document.getElementById('terminal-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  function openTerminal() {
    const overlay = document.getElementById('terminal-overlay');
    const input = document.getElementById('terminal-input');
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderLines([
      'Accès root accordé. Bienvenue.',
      'Tape "help" pour voir les commandes disponibles.',
    ], true);
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 50);
    }
  }

  document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('terminal-overlay');
    const isOpen = overlay && overlay.classList.contains('active');

    if (isOpen) {
      if (e.key === 'Escape') closeTerminal();
      return;
    }

    // Ignore si on tape déjà dans un champ de formulaire
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    if (e.key.length === 1) {
      buffer = (buffer + e.key.toLowerCase()).slice(-TRIGGER.length);
      if (buffer === TRIGGER) {
        buffer = '';
        openTerminal();
      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('terminal-input');
    if (!input) return;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        runCommand(input.value);
        input.value = '';
      }
    });
  });
})();