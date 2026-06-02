// ══════════════════════════════════════════════
//   Employee Management System - Frontend JS
// ══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // ── SIDEBAR TOGGLE ───────────────────────────
  const toggleBtn = document.getElementById('toggleSidebar');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const wrapper = document.querySelector('.wrapper');
      if (window.innerWidth <= 768) {
        wrapper?.classList.toggle('sidebar-open');
        return;
      }

      wrapper.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebar_collapsed', wrapper.classList.contains('sidebar-collapsed'));
    });
  }

  // Restore sidebar state
  if (localStorage.getItem('sidebar_collapsed') === 'true') {
    document.querySelector('.wrapper')?.classList.add('sidebar-collapsed');
  }

  document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.wrapper');
    if (window.innerWidth <= 768 && wrapper?.classList.contains('sidebar-open')) {
      if (!e.target.closest('.sidebar') && !e.target.closest('#toggleSidebar')) {
        wrapper.classList.remove('sidebar-open');
      }
    }
  });

  const adminDropdown = document.getElementById('adminDropdown');
  const adminMenu = document.getElementById('adminMenu');
  if (adminDropdown && adminMenu) {
    adminDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      adminMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) adminMenu.classList.remove('show');
    });
  }

  // ── AUTO DISMISS FLASH MESSAGES ──────────────
  const flashMsgs = document.querySelectorAll('.flash-msg');
  flashMsgs.forEach(msg => {
    setTimeout(() => dismissFlash(msg), 4500);
    const closeBtn = msg.querySelector('.flash-close');
    if (closeBtn) closeBtn.addEventListener('click', () => dismissFlash(msg));
  });

  function dismissFlash(el) {
    el.style.transition = 'all 0.35s ease';
    el.style.transform = 'translateX(120%)';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 350);
  }

  // ── DELETE CONFIRM ────────────────────────────
  document.querySelectorAll('.delete-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.dataset.name || 'this employee';
      if (confirm(`Are you sure you want to delete ${name}?\n\nYe action undo nahi ho sakta!`)) {
        form.submit();
      }
    });
  });

  // ── TOGGLE STATUS ─────────────────────────────
  document.querySelectorAll('.status-pill[data-id]').forEach(pill => {
    pill.addEventListener('click', async () => {
      const id = pill.dataset.id;
      const name = pill.dataset.name;
      if (!confirm(`${name} ka status change karna chahte ho?`)) return;

      try {
        const res = await fetch(`/employees/toggle-status/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          pill.className = `status-pill ${data.status}`;
          pill.textContent = data.status.charAt(0).toUpperCase() + data.status.slice(1);
          pill.dataset.id = id;
          pill.dataset.name = name;
          showToast(`Status updated to ${data.status}!`, 'success');
        }
      } catch (err) {
        showToast('Error updating status!', 'error');
      }
    });
  });

  // ── LIVE SEARCH (optional enhancement) ───────
  const searchInput = document.getElementById('liveSearch');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const form = searchInput.closest('form');
        if (form) form.submit();
      }, 600);
    });
  }

  // ── SALARY FORMAT ─────────────────────────────
  const salaryInput = document.getElementById('salaryInput');
  if (salaryInput) {
    salaryInput.addEventListener('input', () => {
      const val = salaryInput.value.replace(/[^0-9]/g, '');
      salaryInput.value = val;
    });
  }

  // ── TOAST NOTIFICATION ────────────────────────
  window.showToast = function(message, type = 'success') {
    let container = document.querySelector('.flash-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'flash-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `flash-msg ${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
      <button class="flash-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'all 0.35s';
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  };

  // ── TABLE ROW CLICK TO VIEW ───────────────────
  document.querySelectorAll('.emp-row-link').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', (e) => {
      if (e.target.closest('.action-btns, .status-pill, .delete-form, .btn')) return;
      const href = row.dataset.href;
      if (href) window.location.href = href;
    });
  });

});

// ── GENERATE AVATAR COLOR ─────────────────────
function getAvatarColor(name) {
  const colors = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#f97316','#14b8a6'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// Apply avatar colors
document.querySelectorAll('.emp-avatar[data-name]').forEach(el => {
  const name = el.dataset.name || 'U';
  el.style.background = getAvatarColor(name);
  el.textContent = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
});
