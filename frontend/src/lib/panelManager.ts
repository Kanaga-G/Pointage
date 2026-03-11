// Gestionnaire de panels porté depuis le script JS du projet PHP.
// Ce module initialise le comportement de navigation entre panels
// en manipulant le DOM de la page (compatibilité progressive).

export function initPanelManager(isSuperAdmin: boolean = false) {
  // Liste des panels — reproduit la logique PHP originale
  const panels = ["pointage", "retard", "heures", "employes", "demandes"]
  if (isSuperAdmin) panels.push('admins')
  panels.push('calendrier')

  const validPanels = new Set(panels)

  function switchPanel(panelId: string, btn: HTMLElement | null = null) {
    panels.forEach(id => {
      const panel = document.getElementById(id)
      if (panel) {
        panel.style.display = 'none'
        panel.classList.remove('active-panel')
      }
    })

    const active = document.getElementById(panelId)
    if (active) {
      active.style.display = 'block'
      active.classList.add('active-panel')
    }

    // update active button
    document.querySelectorAll('.btn-nav, .sidebar-simple nav a').forEach(b => {
      b.classList.remove('active')
      ;(b as HTMLElement).style.backgroundColor = ''
    })
    if (!btn) {
      btn = document.querySelector(`[data-panel="${panelId}"]`) as HTMLElement || document.querySelector(`a[href="#${panelId}"]`) as HTMLElement || document.getElementById(`${panelId}Btn`)
    }
    if (btn) {
      btn.classList.add('active')
      Object.assign((btn as HTMLElement).style, { backgroundColor: 'rgba(13,110,253,0.12)' })
    }

    // update url
    if (window.location.hash !== '#' + panelId) {
      window.history.replaceState(null, '', window.location.pathname + '#' + panelId)
    }

    try { sessionStorage.setItem('lastPanel', panelId); localStorage.setItem('preferredPanel', panelId) } catch (e) { }
  }

  function setupButtonListeners() {
    document.querySelectorAll('.btn-nav, [data-panel]').forEach(b => {
      b.addEventListener('click', (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        const btn = ev.currentTarget as HTMLElement
        const panelId = btn.dataset?.panel || btn.getAttribute('href')?.replace('#','') || (btn.id?.replace('Btn','').toLowerCase())
        if (panelId && validPanels.has(panelId)) switchPanel(panelId, btn)
      })
    })
  }

  function loadInitialPanel() {
    let panel = 'pointage'
    if (window.location.hash) {
      const h = window.location.hash.substring(1)
      if (validPanels.has(h)) panel = h
    } else if (sessionStorage.getItem('lastPanel')) {
      const last = sessionStorage.getItem('lastPanel')!
      if (validPanels.has(last)) panel = last
    } else if (localStorage.getItem('preferredPanel')) {
      const pref = localStorage.getItem('preferredPanel')!
      if (validPanels.has(pref)) panel = pref
    }
    switchPanel(panel)
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupButtonListeners()
    loadInitialPanel()
  })
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1)
    if (validPanels.has(hash)) switchPanel(hash)
  })
}
