// Utilitaires UI portés depuis le JS original : highlighting, animate counters, etc.

// Mise en évidence du texte recherché dans le DOM
export function highlightText(searchTerm: string) {
  if (!searchTerm) return
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let node: Text | null = null
  while ((node = walker.nextNode() as Text | null)) {
    if (node.textContent && node.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
      if (!node.parentElement?.closest('script, style, noscript')) nodes.push(node)
    }
  }

  nodes.forEach(textNode => {
    const span = document.createElement('span')
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    span.innerHTML = textNode.textContent!.replace(regex, '<mark class="search-highlight">$1</mark>')
    textNode.parentNode?.replaceChild(span, textNode)
  })
}

// Animate simple counters (éléments qui contiennent un nombre)
export function animateCounters(selectors: string[]) {
  selectors.forEach(sel => {
    const el = document.getElementById(sel)
    if (!el) return
    const endValue = parseInt(el.dataset.value || el.textContent?.replace(/\D/g, '') || '0', 10)
    const duration = 1200
    const start = Date.now()
    const tick = () => {
      const now = Date.now()
      const progress = Math.min((now - start) / duration, 1)
      const current = Math.floor(endValue * (1 - (1 - progress) * (1 - progress)))
      el.textContent = current.toLocaleString()
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}
