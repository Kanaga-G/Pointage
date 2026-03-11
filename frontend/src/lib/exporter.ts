// Utils d'export (PDF / Excel)
// Ces fonctions sont des portages du comportement présent dans le template PHP.
// Elles supposent que `jspdf` et `xlsx` sont installés côté frontend.

// Exporter une table HTML en PDF
export async function exportTableToPDF(tableId: string, filePrefix = 'export') {
  try {
    const table = document.getElementById(tableId) as HTMLTableElement | null
    if (!table) throw new Error('Table not found: ' + tableId)

    const jspdfMod = (await import('jspdf').catch(() => null)) as any
    const autoTableMod = (await import('jspdf-autotable').catch(() => null)) as any
    if (!jspdfMod?.jsPDF || !autoTableMod) {
      throw new Error('PDF export dependencies are missing: please install `jspdf` and `jspdf-autotable`')
    }

    const doc = new jspdfMod.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    doc.text(`Export - ${new Date().toLocaleDateString()}`, 14, 16)

    const autoTable = autoTableMod.default ?? autoTableMod
    autoTable(doc, { html: `#${tableId}`, startY: 24, styles: { fontSize: 8 } })
    doc.save(`${filePrefix}_${Date.now()}.pdf`)
  } catch (err) {
    console.error('PDF export error', err)
    throw err
  }
}

// Exporter une table HTML en fichier Excel
export async function exportTableToExcel(tableId: string, filePrefix = 'export') {
  try {
    const table = document.getElementById(tableId) as HTMLTableElement | null
    if (!table) throw new Error('Table not found: ' + tableId)

    const xlsxMod = (await import('xlsx').catch(() => null)) as any
    if (!xlsxMod?.utils) {
      throw new Error('Excel export dependency is missing: please install `xlsx`')
    }

    const ws = xlsxMod.utils.table_to_sheet(table)
    const wb = xlsxMod.utils.book_new()
    xlsxMod.utils.book_append_sheet(wb, ws, 'Export')
    xlsxMod.writeFile(wb, `${filePrefix}_${Date.now()}.xlsx`)
  } catch (err) {
    console.error('Excel export error', err)
    throw err
  }
}
