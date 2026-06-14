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
  .rune-card, .r-card {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    max-width: 100%;
  }
  .rune-flex, .r-flex { display: flex; }
  .rune-row, .r-row { display: flex; flex-direction: row; align-items: center; }
  .rune-col, .r-col { display: flex; flex-direction: column; }
  .rune-grid-2, .r-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .rune-grid-3, .r-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  
  /* Gaps */
  .rune-gap-sm, .r-gap-sm { gap: 6px; }
  .rune-gap-md, .r-gap-md { gap: 12px; }
  .rune-gap-lg, .r-gap-lg { gap: 20px; }

  /* Typography */
  .rune-title, .r-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-primary);
    margin: 0 0 0.5rem 0;
  }
  .rune-subtitle, .r-subtitle {
    font-size: 1rem;
    font-weight: 600;
    color: #44403c;
    margin: 0 0 0.5rem 0;
  }
  .rune-text, .r-text {
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0 0 1rem 0;
    color: #57534e;
  }

  /* Interactive Inputs & Sliders */
  .rune-input, .r-input {
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
  .rune-input:focus, .r-input:focus {
    border-color: var(--color-primary);
  }
  
  .rune-select, .r-select {
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

  .rune-slider, .r-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--color-border-muted);
    outline: none;
    margin: 8px 0;
  }
  .rune-slider::-webkit-slider-thumb, .r-slider::-webkit-slider-thumb {
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
  .rune-slider::-webkit-slider-thumb:hover, .r-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  /* Buttons */
  .rune-btn, .r-btn {
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
  .rune-btn:hover, .r-btn:hover {
    background: var(--color-bg-hover);
  }
  .rune-btn:active, .r-btn:active {
    transform: scale(0.97);
  }
  .rune-btn-primary, .r-btn-primary, .r-btn-prim {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
  .rune-btn-primary:hover, .r-btn-primary:hover, .r-btn-prim:hover {
    background: #861626;
    border-color: #861626;
    color: white;
    opacity: 1;
  }
  .rune-btn-secondary, .r-btn-secondary, .r-btn-sec {
    background: transparent;
    border-color: transparent;
    color: var(--color-primary);
  }
  .rune-btn-secondary:hover, .r-btn-secondary:hover, .r-btn-sec:hover {
    background: rgba(165, 28, 48, 0.05);
  }

  /* Dynamic Tabs Component */
  .rune-tabs, .r-tabs {
    display: flex;
    border-bottom: 2px solid var(--color-border-muted);
    margin-bottom: 1rem;
    gap: 4px;
  }
  .rune-tab-btn, .rune-tabs button, .r-tab, .r-tabs button {
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
  .rune-tab-btn:hover, .rune-tabs button:hover, .r-tab:hover, .r-tabs button:hover {
    color: var(--color-primary);
  }
  .rune-tab-btn.active, .rune-tabs button.active, .r-tab.active, .r-tabs button.active {
    color: var(--color-primary);
  }
  .rune-tab-btn.active::after, .rune-tabs button.active::after, .r-tab.active::after, .r-tabs button.active::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-primary);
    border-radius: 2px;
  }
  .rune-tab-content, .r-tab-content {
    display: none;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .rune-tab-content.active, .r-tab-content.active {
    display: block;
    opacity: 1;
    transform: translateY(0);
  }

  /* Custom Dropdowns & Popups with micro-animations */
  .rune-dropdown, .r-dropdown {
    position: relative;
    display: inline-block;
  }
  .rune-dropdown-content, .r-dropdown-content {
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
  .rune-dropdown-content a, .r-dropdown-content a {
    color: #292524;
    padding: 8px 12px;
    text-decoration: none;
    display: block;
    font-size: 0.875rem;
    transition: background-color 0.15s ease;
  }
  .rune-dropdown-content a:hover, .r-dropdown-content a:hover {
    background-color: var(--color-bg-hover);
  }
  .rune-dropdown:hover .rune-dropdown-content, .r-dropdown:hover .r-dropdown-content {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }

  /* Collapsible Accordions using HTML details summary */
  .rune-accordion, .r-accordion {
    border: 1px solid var(--color-border-muted);
    border-radius: 6px;
    background: var(--color-bg);
    margin: 8px 0;
    overflow: hidden;
    transition: border-color 0.15s ease;
  }
  .rune-accordion:hover, .r-accordion:hover {
    border-color: var(--color-border);
  }
  .rune-accordion-summary, .r-accordion-summary {
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
  .rune-accordion-summary:hover, .r-accordion-summary:hover {
    background: #e7e5e4;
  }
  .rune-accordion-summary::-webkit-details-marker, .r-accordion-summary::-webkit-details-marker {
    display: none;
  }
  .rune-accordion-content, .r-accordion-content {
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
  .rune-badge, .r-badge {
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
  .rune-badge-success, .r-badge-success, .r-badge-ok {
    background-color: #d1fae5;
    color: #065f46;
    border-color: #a7f3d0;
  }
  .rune-badge-warning, .r-badge-warning, .r-badge-warn {
    background-color: #fef3c7;
    color: #92400e;
    border-color: #fde68a;
  }
  .rune-badge-danger, .r-badge-danger, .r-badge-err {
    background-color: #fee2e2;
    color: #991b1b;
    border-color: #fca5a5;
  }

  /* Data Tables */
  .rune-table, .r-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 0.875rem;
    text-align: left;
  }
  .rune-table th, .r-table th {
    background-color: var(--color-bg-hover);
    color: #292524;
    font-weight: 600;
    padding: 10px 12px;
    border-bottom: 2px solid var(--color-border);
  }
  .rune-table td, .r-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-border-muted);
    color: #57534e;
  }
  .rune-table tr:hover, .r-table tr:hover {
    background-color: rgba(245, 245, 244, 0.5);
  }

  /* Progress Bars */
  .rune-progress, .r-progress {
    width: 100%;
    height: 8px;
    background-color: var(--color-border-muted);
    border-radius: 4px;
    overflow: hidden;
    margin: 10px 0;
  }
  .rune-progress-bar, .r-progress-bar {
    height: 100%;
    background-color: var(--color-primary);
    border-radius: 4px;
    transition: width 0.3s ease-out;
    width: 0%;
  }

  /* Toggle Switches */
  .rune-switch, .r-switch {
    position: relative;
    display: inline-flex;
    width: 38px;
    height: 20px;
    flex-shrink: 0;
  }
  .rune-switch input, .r-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .rune-switch-slider, .r-switch-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: var(--color-border-muted);
    transition: 0.2s ease;
    border-radius: 20px;
  }
  .rune-switch-slider:before, .r-switch-slider:before {
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
  .rune-switch input:checked + .rune-switch-slider, .r-switch input:checked + .r-switch-slider {
    background-color: var(--color-primary);
  }
  .rune-switch input:checked + .rune-switch-slider:before, .r-switch input:checked + .r-switch-slider:before {
    transform: translateX(18px);
  }

  /* Alert Blocks */
  .rune-alert, .r-alert {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    border-left: 4px solid #78716c;
    background-color: #f5f5f4;
    font-size: 0.875rem;
    margin: 12px 0;
    color: #57534e;
  }
  .rune-alert-success, .r-alert-success, .r-alert-ok {
    border-left-color: #10b981;
    background-color: #ecfdf5;
    color: #065f46;
  }
  .rune-alert-warning, .r-alert-warning, .r-alert-warn {
    border-left-color: #f59e0b;
    background-color: #fffbeb;
    color: #92400e;
  }
  .rune-alert-danger, .r-alert-danger, .r-alert-err {
    border-left-color: #ef4444;
    background-color: #fef2f2;
    color: #991b1b;
  }
  .rune-alert-info, .r-alert-info {
    border-left-color: #3b82f6;
    background-color: #eff6ff;
    color: #1e3a8a;
  }

  /* Glassmorphism Panel */
  .rune-glass, .r-glass {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }

  /* Avatars */
  .rune-avatar, .r-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--color-border-muted);
  }

  /* Modal / Dialog Primitives */
  .rune-modal, .r-modal {
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
  .rune-modal.active, .r-modal.active {
    opacity: 1;
    visibility: visible;
  }
  .rune-modal-content, .r-modal-content {
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
  .rune-modal.active .rune-modal-content, .r-modal.active .r-modal-content {
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
        document.querySelectorAll('[rune-text="' + key + '"], [r-text="' + key + '"]').forEach(function(el) {
          el.textContent = value;
        });
        
        // Bind text elements (custom tag name fallback)
        document.querySelectorAll('rune-text, r-text').forEach(function(el) {
          for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes[i];
            const cleanName = attr.name.replace(/['"=]/g, '');
            if (cleanName === key) {
              el.textContent = value;
            }
          }
        });
        
        // Bind input fields & checkboxes
        document.querySelectorAll('[rune-model="' + key + '"], [r-model="' + key + '"]').forEach(function(el) {
          if (el.type === 'checkbox') {
            if (el.checked !== !!value) el.checked = !!value;
          } else {
            if (el.value !== value) el.value = value;
          }
        });
        
        // Bind conditional visibility
        document.querySelectorAll('[rune-show="' + key + '"], [r-show="' + key + '"]').forEach(function(el) {
          el.style.display = value ? '' : 'none';
        });
        document.querySelectorAll('[rune-hide="' + key + '"], [r-hide="' + key + '"]').forEach(function(el) {
          el.style.display = value ? 'none' : '';
        });
        return true;
      }
    }),

    init: function() {
      document.querySelectorAll('[rune-model], [r-model]').forEach(function(el) {
        const key = el.getAttribute('rune-model') || el.getAttribute('r-model');
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
      
      document.querySelectorAll('[rune-text], [r-text]').forEach(function(el) {
        const key = el.getAttribute('rune-text') || el.getAttribute('r-text');
        if (window.runeState[key] !== undefined) {
          el.textContent = window.runeState[key];
        }
      });

      // Initialize tag-based rune-text elements
      document.querySelectorAll('rune-text, r-text').forEach(function(el) {
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          const cleanName = attr.name.replace(/['"=]/g, '');
          if (window.runeState[cleanName] !== undefined) {
            el.textContent = window.runeState[cleanName];
          }
        }
      });

      document.querySelectorAll('[rune-show], [r-show]').forEach(function(el) {
        const key = el.getAttribute('rune-show') || el.getAttribute('r-show');
        el.style.display = window.runeState[key] ? '' : 'none';
      });
      document.querySelectorAll('[rune-hide], [r-hide]').forEach(function(el) {
        const key = el.getAttribute('rune-hide') || el.getAttribute('r-hide');
        el.style.display = window.runeState[key] ? 'none' : '';
      });
      
      this.initResizeObserver();
    },

    lastHeight: 0,
    reportHeight: function() {
      const wrapper = document.getElementById("rune-wrapper");
      if (wrapper) {
        const bodyStyle = window.getComputedStyle(document.body);
        const paddingTop = parseFloat(bodyStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(bodyStyle.paddingBottom) || 0;
        const height = Math.ceil(wrapper.getBoundingClientRect().height + paddingTop + paddingBottom);
        if (Math.abs(height - this.lastHeight) > 1) {
          this.lastHeight = height;
          window.parent.postMessage({
            type: "rune-resize",
            height: height
          }, "*");
        }
      }
    },

    initResizeObserver: function() {
      const self = this;
      self.reportHeight();
      window.addEventListener("load", function() { self.reportHeight(); });
      if (window.ResizeObserver) {
        const wrapper = document.getElementById("rune-wrapper");
        if (wrapper) {
          const ro = new ResizeObserver(function() { self.reportHeight(); });
          ro.observe(wrapper);
        }
      }
    },

    showTab: function(e, id) {
      if (e && e.currentTarget) {
        const parent = e.currentTarget.closest('.rune-tabs, .r-tabs');
        if (parent) {
          parent.querySelectorAll('button, .rune-tab-btn, .r-tab').forEach(function(el) {
            el.classList.remove('active');
          });
        } else {
          document.querySelectorAll('.rune-tab-btn, .rune-tabs button, .r-tab, .r-tabs button').forEach(function(el) {
            el.classList.remove('active');
          });
        }
      } else {
        document.querySelectorAll('.rune-tab-btn, .rune-tabs button, .r-tab, .r-tabs button').forEach(function(el) {
          el.classList.remove('active');
        });
      }
      
      document.querySelectorAll('.rune-tab-content, .r-tab-content').forEach(function(el) {
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
      try {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (!values || values.length === 0) {
          el.innerHTML = '<div class="rune-text" style="text-align:center;padding:20px;">No data available</div>';
          return;
        }

        const width = 400;
        const height = 200;
        const paddingLeft = 40;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 30;

        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        const max = Math.max(...values, 1);
        const barGap = 12;
        const totalGaps = values.length - 1;
        const barWidth = Math.max(4, (chartWidth - (barGap * totalGaps)) / values.length);

        let gridHtml = '';
        const ticks = 4;
        for (let i = 0; i <= ticks; i++) {
          const val = Math.round((max / ticks) * i);
          const y = chartHeight + paddingTop - (i * (chartHeight / ticks));
          gridHtml += '<line x1="' + paddingLeft + '" y1="' + y + '" x2="' + (width - paddingRight) + '" y2="' + y + '" stroke="var(--color-border-muted)" stroke-width="1" stroke-dasharray="3,3" />' +
                      '<text x="' + (paddingLeft - 8) + '" y="' + (y + 3) + '" font-size="9" fill="#78716c" text-anchor="end">' + val + '</text>';
        }

        const barsHtml = values.map(function(val, i) {
          const h = (val / max) * chartHeight;
          const x = paddingLeft + (i * (barWidth + barGap));
          const y = chartHeight + paddingTop - h;
          const label = labels ? (labels[i] || '') : '';
          const shortenedLabel = label.length > 10 ? label.slice(0, 8) + '..' : label;

          return '<g style="cursor: pointer;">' +
                   '<rect x="' + (x - barGap/2) + '" y="' + paddingTop + '" width="' + (barWidth + barGap) + '" height="' + chartHeight + '" fill="transparent" />' +
                   '<rect x="' + x + '" y="' + (chartHeight + paddingTop) + '" width="' + barWidth + '" height="0" fill="url(#bar-grad-' + elementId + ')" rx="4" ry="4">' +
                     '<animate attributeName="y" to="' + y + '" dur="0.6s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4, 0, 0.2, 1" />' +
                     '<animate attributeName="height" to="' + h + '" dur="0.6s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4, 0, 0.2, 1" />' +
                   '</rect>' +
                   '<text x="' + (x + barWidth/2) + '" y="' + (y - 6) + '" font-size="10" font-weight="700" fill="var(--color-primary)" text-anchor="middle" opacity="0">' +
                     '<animate attributeName="opacity" to="1" begin="0.4s" dur="0.3s" fill="freeze" />' +
                     val +
                   '</text>' +
                   '<text x="' + (x + barWidth/2) + '" y="' + (height - paddingBottom + 16) + '" font-size="9" fill="#57534e" text-anchor="middle" font-weight="600">' +
                     shortenedLabel +
                     '<title>' + label + '</title>' +
                   '</text>' +
                 '</g>';
        }).join('');

        el.innerHTML = '<svg viewBox="0 0 ' + width + ' ' + height + '" style="width: 100%; height: auto; overflow: visible; display: block;">' +
                         '<defs>' +
                           '<linearGradient id="bar-grad-' + elementId + '" x1="0" y1="0" x2="0" y2="1">' +
                             '<stop offset="0%" stop-color="#e11d48" />' +
                             '<stop offset="100%" stop-color="var(--color-primary)" />' +
                           '</linearGradient>' +
                         '</defs>' +
                         gridHtml +
                         barsHtml +
                         '<line x1="' + paddingLeft + '" y1="' + (chartHeight + paddingTop) + '" x2="' + (width - paddingRight) + '" y2="' + (chartHeight + paddingTop) + '" stroke="var(--color-border)" stroke-width="1.5" />' +
                       '</svg>';
      } catch (err) {
        console.error("Rune createBarChart error:", err);
      }
    },

    createLineChart: function(elementId, values, labels) {
      try {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (!values || values.length === 0) {
          el.innerHTML = '<div class="rune-text" style="text-align:center;padding:20px;">No data available</div>';
          return;
        }

        const width = 400;
        const height = 200;
        const paddingLeft = 40;
        const paddingRight = 20;
        const paddingTop = 25;
        const paddingBottom = 30;

        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        const max = Math.max(...values, 1);
        
        const points = values.map(function(val, i) {
          const x = paddingLeft + (i * (chartWidth / (values.length - 1 || 1)));
          const y = chartHeight + paddingTop - ((val / max) * chartHeight);
          return { x: x, y: y, val: val, label: labels ? (labels[i] || '') : '' };
        });

        let linePath = '';
        let areaPath = '';

        if (points.length > 0) {
          linePath = 'M ' + points[0].x + ' ' + points[0].y;
          for (let i = 1; i < points.length; i++) {
            linePath += ' L ' + points[i].x + ' ' + points[i].y;
          }
          
          areaPath = linePath + ' L ' + points[points.length - 1].x + ' ' + (chartHeight + paddingTop) + 
                               ' L ' + points[0].x + ' ' + (chartHeight + paddingTop) + ' Z';
        }

        let gridHtml = '';
        const ticks = 4;
        for (let i = 0; i <= ticks; i++) {
          const val = Math.round((max / ticks) * i);
          const y = chartHeight + paddingTop - (i * (chartHeight / ticks));
          gridHtml += '<line x1="' + paddingLeft + '" y1="' + y + '" x2="' + (width - paddingRight) + '" y2="' + y + '" stroke="var(--color-border-muted)" stroke-width="1" stroke-dasharray="3,3" />' +
                      '<text x="' + (paddingLeft - 8) + '" y="' + (y + 3) + '" font-size="9" fill="#78716c" text-anchor="end">' + val + '</text>';
        }

        const dotsHtml = points.map(function(p, i) {
          return '<g style="cursor: pointer;">' +
                   '<circle cx="' + p.x + '" cy="' + p.y + '" r="4.5" fill="#ffffff" stroke="var(--color-primary)" stroke-width="2.5" />' +
                   '<text x="' + p.x + '" y="' + (p.y - 10) + '" font-size="9" font-weight="700" fill="var(--color-primary)" text-anchor="middle">' + p.val + '</text>' +
                   '<text x="' + p.x + '" y="' + (height - paddingBottom + 16) + '" font-size="9" fill="#57534e" text-anchor="middle" font-weight="600">' + p.label + '</text>' +
                 '</g>';
        }).join('');

        el.innerHTML = '<svg viewBox="0 0 ' + width + ' ' + height + '" style="width: 100%; height: auto; overflow: visible; display: block;">' +
                         '<defs>' +
                           '<linearGradient id="area-grad-' + elementId + '" x1="0" y1="0" x2="0" y2="1">' +
                             '<stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.3" />' +
                             '<stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.0" />' +
                           '</linearGradient>' +
                         '</defs>' +
                         gridHtml +
                         '<path d="' + areaPath + '" fill="url(#area-grad-' + elementId + ')" />' +
                         '<path d="' + linePath + '" fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />' +
                         dotsHtml +
                         '<line x1="' + paddingLeft + '" y1="' + (chartHeight + paddingTop) + '" x2="' + (width - paddingRight) + '" y2="' + (chartHeight + paddingTop) + '" stroke="var(--color-border)" stroke-width="1.5" />' +
                       '</svg>';
      } catch (err) {
        console.error("Rune createLineChart error:", err);
      }
    },

    createDonutChart: function(elementId, values, labels) {
      try {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (!values || values.length === 0) {
          el.innerHTML = '<div class="rune-text" style="text-align:center;padding:20px;">No data available</div>';
          return;
        }

        const width = 300;
        const height = 180;
        const radius = 60;
        const strokeWidth = 18;
        const cx = 90;
        const cy = 90;
        const circumference = 2 * Math.PI * radius;

        const sum = values.reduce(function(a, b) { return a + b; }, 0);
        const colors = ['var(--color-primary)', '#ea580c', '#16a34a', '#2563eb', '#4f46e5', '#db2777', '#7c3aed'];

        let currentOffset = 0;
        
        const slicesHtml = values.map(function(val, i) {
          const percent = sum > 0 ? (val / sum) : 0;
          const dashArray = (percent * circumference) + ' ' + circumference;
          const dashOffset = currentOffset;
          currentOffset -= (percent * circumference);
          const color = colors[i % colors.length];
          const label = labels ? (labels[i] || '') : '';

          return '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="transparent" ' +
                   'stroke="' + color + '" stroke-width="' + strokeWidth + '" ' +
                   'stroke-dasharray="' + dashArray + '" stroke-dashoffset="' + dashOffset + '" ' +
                   'transform="rotate(-90 ' + cx + ' ' + cy + ')" style="transition: stroke-width 0.2s ease;">' +
                   '<title>' + label + ': ' + val + ' (' + Math.round(percent * 100) + '%)</title>' +
                 '</circle>';
        }).join('');

        const legendHtml = values.map(function(val, i) {
          const percent = sum > 0 ? Math.round((val / sum) * 100) : 0;
          const color = colors[i % colors.length];
          const label = labels ? (labels[i] || '') : '';
          return '<div class="rune-row rune-gap-sm" style="font-size: 11px; margin-bottom: 4px;">' +
                   '<span style="width: 10px; height: 10px; border-radius: 2px; background-color: ' + color + '; flex-shrink:0;"></span>' +
                   '<span class="rune-text" style="margin:0; font-weight:600; color:#44403c;">' + label + ' (' + percent + '%)</span>' +
                 '</div>';
        }).join('');

        el.innerHTML = '<div class="rune-flex rune-row rune-gap-lg" style="align-items: center; justify-content: center; width: 100%;">' +
                         '<div style="position: relative; width: ' + (width/1.6) + 'px; height: ' + height + 'px;">' +
                           '<svg viewBox="0 0 ' + (cx * 2) + ' ' + (cy * 2) + '" style="width: 100%; height: 100%; transform: rotate(0deg);">' +
                             slicesHtml +
                             '<circle cx="' + cx + '" cy="' + cy + '" r="' + (radius - strokeWidth/2 - 1) + '" fill="#fafaf9" />' +
                             '<text x="' + cx + '" y="' + (cy - 2) + '" font-size="11" font-weight="700" fill="#78716c" text-anchor="middle">TOTAL</text>' +
                             '<text x="' + cx + '" y="' + (cy + 12) + '" font-size="14" font-weight="800" fill="var(--color-primary)" text-anchor="middle">' + sum + '</text>' +
                           '</svg>' +
                         '</div>' +
                         '<div class="rune-col" style="flex: 1; align-items: flex-start; justify-content: center;">' +
                           legendHtml +
                         '</div>' +
                       '</div>';
      } catch (err) {
        console.error("Rune createDonutChart error:", err);
      }
    }
  };
`;
