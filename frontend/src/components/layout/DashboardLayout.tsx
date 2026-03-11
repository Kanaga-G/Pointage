import React, { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './SidebarNew'
import Topbar from './Topbar'
import { cn } from '../../utils/cn'

interface DashboardLayoutProps {
  title?: string
  subtitle?: string
}

const DashboardLayout = ({ title, subtitle }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('dashboard_sidebar_collapsed') === '1'
  })
  const location = useLocation()

  const computedHeader = useMemo(() => {
    const path = location.pathname

    if (path.startsWith('/admin')) {
      if (path.includes('/employes/new') || path.includes('/employe/new')) {
        return { title: 'Nouvel employe', subtitle: 'Creation d une fiche collaborateur' }
      }

      if (path.match(/\/admin\/employe?s\/\d+\/edit/)) {
        return { title: 'Edition employe', subtitle: 'Modification du dossier collaborateur' }
      }

      if (path.match(/\/admin\/employe?s\/\d+$/)) {
        return { title: 'Detail employe', subtitle: 'Consultation du dossier complet' }
      }

      if (path.match(/\/admin\/pointages\/\d+$/)) {
        return { title: 'Detail pointage', subtitle: 'Consultation d un enregistrement' }
      }

      if (path.includes('/employes') || path.includes('/employe')) {
        return { title: 'Employes', subtitle: 'Gestion du personnel XpertPro' }
      }

      if (path.includes('/pointages')) return { title: 'Pointages', subtitle: 'Suivi des pointages' }
      if (path.includes('/demandes')) return { title: 'Demandes', subtitle: 'Validation et traitement des demandes' }
      if (path.includes('/calendrier')) return { title: 'Calendrier', subtitle: 'Planning des activites' }
      if (path.includes('/rapports')) return { title: 'Rapports', subtitle: 'Analyse et statistiques' }
      if (path.includes('/badges')) return { title: 'Badges', subtitle: 'Gestion des badges de pointage' }
      if (path.includes('/roles')) return { title: 'Roles', subtitle: 'Attribution des roles utilisateurs' }
      if (path.includes('/admins')) return { title: 'Admins', subtitle: 'Administration des comptes privilegies' }
      if (path.includes('/profil')) return { title: 'Mon profil', subtitle: 'Profil administrateur' }
      if (path.includes('/notifications')) return { title: 'Notifications', subtitle: 'Suivi des alertes administration' }
      if (path.includes('/parametres')) return { title: 'Parametres', subtitle: 'Configuration de l administration' }
      return { title: 'Tableau de bord', subtitle: 'Administration XpertPro' }
    }

    if (path.startsWith('/employee')) {
      if (path.includes('/rapports')) return { title: 'Rapports', subtitle: 'Analyse de vos pointages et demandes' }
      if (path.includes('/pointage')) return { title: 'Pointage', subtitle: 'Pointer vos arrivees et departs' }
      if (path.includes('/historique')) return { title: 'Historique', subtitle: 'Consulter vos pointages' }
      if (path.includes('/demandes')) return { title: 'Mes demandes', subtitle: 'Conges et permissions' }
      if (path.includes('/calendrier')) return { title: 'Calendrier', subtitle: 'Planning personnel et pointages' }
      if (path.includes('/profil')) return { title: 'Mon profil', subtitle: 'Informations personnelles' }
      if (path.includes('/badge')) return { title: 'Mon badge', subtitle: 'Acces et identification de pointage' }
      if (path.includes('/heures')) return { title: 'Mes heures', subtitle: 'Suivi des heures travaillees' }
      if (path.includes('/retards')) return { title: 'Retards', subtitle: 'Suivi des retards et justificatifs' }
      if (path.includes('/notifications')) return { title: 'Notifications', subtitle: 'Centre de notifications personnelles' }
      if (path.includes('/settings') || path.includes('/parametres')) {
        return { title: 'Parametres', subtitle: 'Preferences et compte personnel' }
      }
      return { title: 'Mon espace', subtitle: 'Espace employe XpertPro' }
    }

    return { title: title || 'Dashboard', subtitle: subtitle || '' }
  }, [location.pathname, subtitle, title])

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const nextValue = !prev
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('dashboard_sidebar_collapsed', nextValue ? '1' : '0')
      }
      return nextValue
    })
  }

  useEffect(() => {
    const syncFromStorage = () => {
      const stored = window.localStorage.getItem('dashboard_sidebar_collapsed') === '1'
      setSidebarCollapsed(stored)
    }

    window.addEventListener('storage', syncFromStorage)
    window.addEventListener('dashboard-sidebar-collapsed-change', syncFromStorage)
    window.addEventListener('focus', syncFromStorage)
    return () => {
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener('dashboard-sidebar-collapsed-change', syncFromStorage)
      window.removeEventListener('focus', syncFromStorage)
    }
  }, [])

  return (
    <div className={cn('php-layout', sidebarCollapsed && 'is-sidebar-collapsed')}>
      <Sidebar isOpen={true} onClose={() => {}} variant="desktop" collapsed={sidebarCollapsed} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} variant="mobile" />

      <div className="php-main-wrap">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onToggleSidebar={handleToggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          title={title || computedHeader.title}
          subtitle={subtitle || computedHeader.subtitle}
        />

        <main className="php-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
