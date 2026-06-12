export const prebuiltStyles = `
  :root {
    --color-primary: #a51c30;
    --color-bg: #ffffff;
    --color-bg-hover: #f5f5f4;
    --color-border: #d6d3d1;
    --color-border-muted: #e7e5e4;
    --font-family: 'Space Grotesk', sans-serif;
  }
  
  html, body {
    overflow: hidden;
    scrollbar-width: none;
  }
  html::-webkit-scrollbar, body::-webkit-scrollbar {
    display: none;
  }
  body {
    margin: 0;
    padding: 1rem;
    background: transparent;
    font-family: var(--font-family);
    color: #1c1917;
    box-sizing: border-box;
  }
  
  * { box-sizing: border-box; }

  /* Containers & Layouts */
  .rune-card {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    max-width: 100%;
  }
  .rune-flex { display: flex; }
  .rune-row { display: flex; flex-direction: row; align-items: center; }
  .rune-col { display: flex; flex-direction: column; }
  .rune-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .rune-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  
  /* Gaps */
  .rune-gap-sm { gap: 6px; }
  .rune-gap-md { gap: 12px; }
  .rune-gap-lg { gap: 20px; }

  /* Typography */
  .rune-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-primary);
    margin: 0 0 0.5rem 0;
  }
  .rune-subtitle {
    font-size: 1rem;
    font-weight: 600;
    color: #44403c;
    margin: 0 0 0.5rem 0;
  }
  .rune-text {
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0 0 1rem 0;
    color: #57534e;
  }

  /* Interactive Inputs & Sliders */
  .rune-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-bg);
    font-size: 0.875rem;
    outline: none;
    font-family: inherit;
    transition: border-color 0.15s ease;
  }
  .rune-input:focus {
    border-color: var(--color-primary);
  }
  
  .rune-select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-bg);
    font-size: 0.875rem;
    outline: none;
    font-family: inherit;
    cursor: pointer;
  }

  .rune-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--color-border-muted);
    outline: none;
    margin: 8px 0;
  }
  .rune-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
    border: none;
    transition: transform 0.1s ease;
  }
  .rune-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  /* Buttons */
  .rune-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 6px;
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    color: #292524;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }
  .rune-btn:hover {
    background: var(--color-bg-hover);
  }
  .rune-btn:active {
    transform: scale(0.97);
  }
  .rune-btn-primary {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
  .rune-btn-primary:hover {
    background: #861626;
    border-color: #861626;
    color: white;
    opacity: 1;
  }
  .rune-btn-secondary {
    background: transparent;
    border-color: transparent;
    color: var(--color-primary);
  }
  .rune-btn-secondary:hover {
    background: rgba(165, 28, 48, 0.05);
  }

  /* Dynamic Tabs Component */
  .rune-tabs {
    display: flex;
    border-bottom: 2px solid var(--color-border-muted);
    margin-bottom: 1rem;
    gap: 4px;
  }
  .rune-tab-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    background: transparent;
    border: none;
    color: #78716c;
    cursor: pointer;
    position: relative;
    transition: color 0.15s ease;
    font-family: inherit;
  }
  .rune-tab-btn:hover {
    color: var(--color-primary);
  }
  .rune-tab-btn.active {
    color: var(--color-primary);
  }
  .rune-tab-btn.active::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-primary);
    border-radius: 2px;
  }
  .rune-tab-content {
    display: none;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .rune-tab-content.active {
    display: block;
    opacity: 1;
    transform: translateY(0);
  }

  /* Custom Dropdowns & Popups with micro-animations */
  .rune-dropdown {
    position: relative;
    display: inline-block;
  }
  .rune-dropdown-content {
    display: block;
    position: absolute;
    background-color: var(--color-bg);
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    z-index: 100;
    padding: 4px 0;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px) scale(0.95);
    transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.15s;
  }
  .rune-dropdown-content a {
    color: #292524;
    padding: 8px 12px;
    text-decoration: none;
    display: block;
    font-size: 0.875rem;
    transition: background-color 0.15s ease;
  }
  .rune-dropdown-content a:hover {
    background-color: var(--color-bg-hover);
  }
  .rune-dropdown:hover .rune-dropdown-content {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }

  /* Collapsible Accordions using HTML details summary */
  .rune-accordion {
    border: 1px solid var(--color-border-muted);
    border-radius: 6px;
    background: var(--color-bg);
    margin: 8px 0;
    overflow: hidden;
    transition: border-color 0.15s ease;
  }
  .rune-accordion:hover {
    border-color: var(--color-border);
  }
  .rune-accordion-summary {
    padding: 0.75rem 1rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    user-select: none;
    background: var(--color-bg-hover);
    outline: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.15s ease;
  }
  .rune-accordion-summary:hover {
    background: #e7e5e4;
  }
  .rune-accordion-summary::-webkit-details-marker {
    display: none;
  }
  .rune-accordion-content {
    padding: 1rem;
    border-top: 1px solid var(--color-border-muted);
    font-size: 0.875rem;
    color: #57534e;
    animation: rune-fade-in 0.2s ease-out;
  }
  @keyframes rune-fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Status Badges */
  .rune-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9999px;
    background-color: #f5f5f4;
    color: #57534e;
    border: 1px solid var(--color-border-muted);
    line-height: 1;
  }
  .rune-badge-success {
    background-color: #d1fae5;
    color: #065f46;
    border-color: #a7f3d0;
  }
  .rune-badge-warning {
    background-color: #fef3c7;
    color: #92400e;
    border-color: #fde68a;
  }
  .rune-badge-danger {
    background-color: #fee2e2;
    color: #991b1b;
    border-color: #fca5a5;
  }

  /* Data Tables */
  .rune-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 0.875rem;
    text-align: left;
  }
  .rune-table th {
    background-color: var(--color-bg-hover);
    color: #292524;
    font-weight: 600;
    padding: 10px 12px;
    border-bottom: 2px solid var(--color-border);
  }
  .rune-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-border-muted);
    color: #57534e;
  }
  .rune-table tr:hover {
    background-color: rgba(245, 245, 244, 0.5);
  }

  /* Progress Bars */
  .rune-progress {
    width: 100%;
    height: 8px;
    background-color: var(--color-border-muted);
    border-radius: 4px;
    overflow: hidden;
    margin: 10px 0;
  }
  .rune-progress-bar {
    height: 100%;
    background-color: var(--color-primary);
    border-radius: 4px;
    transition: width 0.3s ease-out;
    width: 0%;
  }

  /* Toggle Switches */
  .rune-switch {
    position: relative;
    display: inline-flex;
    width: 38px;
    height: 20px;
    flex-shrink: 0;
  }
  .rune-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .rune-switch-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: var(--color-border-muted);
    transition: 0.2s ease;
    border-radius: 20px;
  }
  .rune-switch-slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.2s ease;
    border-radius: 50%;
  }
  .rune-switch input:checked + .rune-switch-slider {
    background-color: var(--color-primary);
  }
  .rune-switch input:checked + .rune-switch-slider:before {
    transform: translateX(18px);
  }

  /* Alert Blocks */
  .rune-alert {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    border-left: 4px solid #78716c;
    background-color: #f5f5f4;
    font-size: 0.875rem;
    margin: 12px 0;
    color: #57534e;
  }
  .rune-alert-success {
    border-left-color: #10b981;
    background-color: #ecfdf5;
    color: #065f46;
  }
  .rune-alert-warning {
    border-left-color: #f59e0b;
    background-color: #fffbeb;
    color: #92400e;
  }
  .rune-alert-danger {
    border-left-color: #ef4444;
    background-color: #fef2f2;
    color: #991b1b;
  }
  .rune-alert-info {
    border-left-color: #3b82f6;
    background-color: #eff6ff;
    color: #1e3a8a;
  }

  /* Glassmorphism Panel */
  .rune-glass {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }

  /* Avatars */
  .rune-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--color-border-muted);
  }

  /* Modal / Dialog Primitives */
  .rune-modal {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s;
  }
  .rune-modal.active {
    opacity: 1;
    visibility: visible;
  }
  .rune-modal-content {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 90%;
    width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    transform: scale(0.95);
    transition: transform 0.2s ease;
  }
  .rune-modal.active .rune-modal-content {
    transform: scale(1);
  }

  /* Toast Keyframes & Styles */
  @keyframes rune-slide-in {
    from { transform: translateY(-1rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes rune-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  /* Added bottom spacing padding to wrap */
  #rune-wrapper {
    padding-bottom: 2.5rem;
  }
`;

export const runeScript = `
  window.runeState = {};
  
  window.rune = {
    state: new Proxy(window.runeState, {
      set(target, key, value) {
        target[key] = value;
        
        // Bind text elements (attribute-based)
        document.querySelectorAll('[rune-text="' + key + '"]').forEach(function(el) {
          el.textContent = value;
        });
        
        // Bind text elements (custom tag name fallback)
        document.querySelectorAll('rune-text').forEach(function(el) {
          for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes[i];
            const cleanName = attr.name.replace(/['"=]/g, '');
            if (cleanName === key) {
              el.textContent = value;
            }
          }
        });
        
        // Bind input fields & checkboxes
        document.querySelectorAll('[rune-model="' + key + '"]').forEach(function(el) {
          if (el.type === 'checkbox') {
            if (el.checked !== !!value) el.checked = !!value;
          } else {
            if (el.value !== value) el.value = value;
          }
        });
        
        // Bind conditional visibility
        document.querySelectorAll('[rune-show="' + key + '"]').forEach(function(el) {
          el.style.display = value ? '' : 'none';
        });
        document.querySelectorAll('[rune-hide="' + key + '"]').forEach(function(el) {
          el.style.display = value ? 'none' : '';
        });
        return true;
      }
    }),

    init: function() {
      document.querySelectorAll('[rune-model]').forEach(function(el) {
        const key = el.getAttribute('rune-model');
        const isCheckbox = el.type === 'checkbox';
        
        el.addEventListener('input', function(e) {
          window.rune.state[key] = isCheckbox ? e.target.checked : e.target.value;
        });
        el.addEventListener('change', function(e) {
          window.rune.state[key] = isCheckbox ? e.target.checked : e.target.value;
        });
        
        if (isCheckbox) {
          window.runeState[key] = el.checked;
        } else if (el.value !== undefined) {
          window.runeState[key] = el.value;
        }
      });
      
      document.querySelectorAll('[rune-text]').forEach(function(el) {
        const key = el.getAttribute('rune-text');
        if (window.runeState[key] !== undefined) {
          el.textContent = window.runeState[key];
        }
      });

      // Initialize tag-based rune-text elements
      document.querySelectorAll('rune-text').forEach(function(el) {
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          const cleanName = attr.name.replace(/['"=]/g, '');
          if (window.runeState[cleanName] !== undefined) {
            el.textContent = window.runeState[cleanName];
          }
        }
      });

      document.querySelectorAll('[rune-show]').forEach(function(el) {
        const key = el.getAttribute('rune-show');
        el.style.display = window.runeState[key] ? '' : 'none';
      });
      document.querySelectorAll('[rune-hide]').forEach(function(el) {
        const key = el.getAttribute('rune-hide');
        el.style.display = window.runeState[key] ? 'none' : '';
      });
    },

    showTab: function(e, id) {
      document.querySelectorAll('.rune-tab-content').forEach(function(el) {
        el.classList.remove('active');
      });
      document.querySelectorAll('.rune-tab-btn').forEach(function(el) {
        el.classList.remove('active');
      });
      const tab = document.getElementById(id);
      if (tab) tab.classList.add('active');
      if (e && e.currentTarget) e.currentTarget.classList.add('active');
    },

    setProgress: function(id, percent) {
      const bar = document.getElementById(id);
      if (bar) bar.style.width = percent + '%';
    },

    showModal: function(id) {
      const modal = document.getElementById(id);
      if (modal) modal.classList.add('active');
    },

    closeModal: function(id) {
      const modal = document.getElementById(id);
      if (modal) modal.classList.remove('active');
    },

    showToast: function(message, type) {
      let container = document.getElementById('rune-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'rune-toast-container';
        container.style.cssText = 'position: fixed; top: 0.75rem; right: 0.75rem; z-index: 2000; display: flex; flex-direction: column; gap: 6px; pointer-events: none;';
        document.body.appendChild(container);
      }
      const toast = document.createElement('div');
      toast.className = 'rune-badge ' + (type === 'danger' ? 'rune-badge-danger' : type === 'warning' ? 'rune-badge-warning' : 'rune-badge-success');
      toast.style.cssText = 'padding: 6px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); pointer-events: auto; animation: rune-slide-in 0.2s ease-out; font-family: sans-serif;';
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(function() {
        toast.style.animation = 'rune-fade-out 0.2s ease-in';
        setTimeout(function() { toast.remove(); }, 200);
      }, 2000);
    },

    createBarChart: function(elementId, values, labels) {
      const el = document.getElementById(elementId);
      if (!el) return;
      const max = Math.max(...values, 1);
      let html = '<div class="rune-flex rune-row rune-gap-md" style="align-items: flex-end; height: 110px; border-bottom: 2px solid var(--color-border-muted); padding-bottom: 4px;">';
      values.forEach(function(val, i) {
        const height = (val / max) * 100;
        const label = labels ? labels[i] : '';
        html += '<div class="rune-col" style="flex: 1; align-items: center;">' +
                  '<div class="rune-progress-bar" style="width: 24px; height: ' + height + '%; background-color: var(--color-primary); border-radius: 4px 4px 0 0;" title="' + val + '"></div>' +
                  '<span class="rune-text" style="font-size: 10px; margin-top: 4px; font-weight:600;">' + label + '</span>' +
                '</div>';
      });
      html += '</div>';
      el.innerHTML = html;
    },

    createLineChart: function(elementId, values, labels) {
      const el = document.getElementById(elementId);
      if (!el) return;
      const width = 300;
      const height = 130;
      const padding = 20;
      const max = Math.max(...values, 1);
      const points = values.map(function(val, i) {
        const x = padding + (i * (width - 2 * padding) / (values.length - 1));
        const y = height - padding - (val * (height - 2 * padding) / max);
        return x + ',' + y;
      }).join(' ');
      
      let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" style="width: 100%; height: auto; overflow: visible;">' +
        '<polyline fill="none" stroke="var(--color-primary)" stroke-width="2.5" points="' + points + '" />' +
        values.map(function(val, i) {
          const x = padding + (i * (width - 2 * padding) / (values.length - 1));
          const y = height - padding - (val * (height - 2 * padding) / max);
          return '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="var(--color-primary)" />' +
                 '<text x="' + x + '" y="' + (y - 8) + '" font-size="8" font-family="sans-serif" text-anchor="middle" font-weight="600" fill="#57534e">' + val + '</text>' +
                 '<text x="' + x + '" y="' + (height - 4) + '" font-size="8" font-family="sans-serif" text-anchor="middle" fill="#78716c">' + (labels ? labels[i] : '') + '</text>';
        }).join('') +
      '</svg>';
      el.innerHTML = svg;
    }
  };
`;
