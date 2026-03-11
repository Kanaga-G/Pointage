import { apiClient } from './apiClient'

export interface DashboardSettings {
  language: 'fr' | 'en'
  timezone: string
  theme: 'clair' | 'sombre' | 'systeme'
  compact_sidebar: boolean
  notifications_email: boolean
  notifications_push: boolean
  notifications_retards: boolean
  notifications_demandes: boolean
  daily_reports: boolean
  calendar_show_weekends: boolean
  dashboard_auto_refresh_seconds: number
  work_start_time: string
  work_end_time: string
  pause_duration_minutes: number
  session_duration_minutes: number
  badge_expiration_hours: number
  badge_regeneration_hours: number
}

export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  language: 'fr',
  timezone: 'Africa/Abidjan',
  theme: 'clair',
  compact_sidebar: false,
  notifications_email: true,
  notifications_push: false,
  notifications_retards: true,
  notifications_demandes: true,
  daily_reports: false,
  calendar_show_weekends: true,
  dashboard_auto_refresh_seconds: 60,
  work_start_time: '09:00',
  work_end_time: '18:00',
  pause_duration_minutes: 60,
  session_duration_minutes: 1440,
  badge_expiration_hours: 0,
  badge_regeneration_hours: 0
}

const normalizeSettings = (settings?: Partial<DashboardSettings> | null): DashboardSettings => {
  const source = settings || {}
  const autoRefresh = Number(source.dashboard_auto_refresh_seconds ?? DEFAULT_DASHBOARD_SETTINGS.dashboard_auto_refresh_seconds)
  const pauseDuration = Number(source.pause_duration_minutes ?? DEFAULT_DASHBOARD_SETTINGS.pause_duration_minutes)
  const sessionDuration = Number(source.session_duration_minutes ?? DEFAULT_DASHBOARD_SETTINGS.session_duration_minutes)
  const badgeExpiration = Number(source.badge_expiration_hours ?? DEFAULT_DASHBOARD_SETTINGS.badge_expiration_hours)
  const badgeRegeneration = Number(source.badge_regeneration_hours ?? DEFAULT_DASHBOARD_SETTINGS.badge_regeneration_hours)
  const normalizeTime = (value: unknown, fallback: string) => {
    const raw = String(value || '').trim()
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(raw) ? raw : fallback
  }
  return {
    language: source.language === 'en' ? 'en' : 'fr',
    timezone: String(source.timezone || DEFAULT_DASHBOARD_SETTINGS.timezone),
    theme: source.theme === 'sombre' || source.theme === 'systeme' ? source.theme : 'clair',
    compact_sidebar: Boolean(source.compact_sidebar),
    notifications_email: source.notifications_email !== undefined ? Boolean(source.notifications_email) : DEFAULT_DASHBOARD_SETTINGS.notifications_email,
    notifications_push: source.notifications_push !== undefined ? Boolean(source.notifications_push) : DEFAULT_DASHBOARD_SETTINGS.notifications_push,
    notifications_retards: source.notifications_retards !== undefined ? Boolean(source.notifications_retards) : DEFAULT_DASHBOARD_SETTINGS.notifications_retards,
    notifications_demandes: source.notifications_demandes !== undefined ? Boolean(source.notifications_demandes) : DEFAULT_DASHBOARD_SETTINGS.notifications_demandes,
    daily_reports: source.daily_reports !== undefined ? Boolean(source.daily_reports) : DEFAULT_DASHBOARD_SETTINGS.daily_reports,
    calendar_show_weekends: source.calendar_show_weekends !== undefined ? Boolean(source.calendar_show_weekends) : DEFAULT_DASHBOARD_SETTINGS.calendar_show_weekends,
    dashboard_auto_refresh_seconds: Number.isFinite(autoRefresh) ? Math.max(30, Math.min(600, Math.round(autoRefresh))) : DEFAULT_DASHBOARD_SETTINGS.dashboard_auto_refresh_seconds,
    work_start_time: normalizeTime(source.work_start_time, DEFAULT_DASHBOARD_SETTINGS.work_start_time),
    work_end_time: normalizeTime(source.work_end_time, DEFAULT_DASHBOARD_SETTINGS.work_end_time),
    pause_duration_minutes: Number.isFinite(pauseDuration) ? Math.max(0, Math.min(240, Math.round(pauseDuration))) : DEFAULT_DASHBOARD_SETTINGS.pause_duration_minutes,
    session_duration_minutes: Number.isFinite(sessionDuration) ? Math.max(15, Math.min(10080, Math.round(sessionDuration))) : DEFAULT_DASHBOARD_SETTINGS.session_duration_minutes,
    badge_expiration_hours: Number.isFinite(badgeExpiration) ? Math.max(0, Math.min(168, Math.round(badgeExpiration))) : DEFAULT_DASHBOARD_SETTINGS.badge_expiration_hours,
    badge_regeneration_hours: Number.isFinite(badgeRegeneration) ? Math.max(0, Math.min(168, Math.round(badgeRegeneration))) : DEFAULT_DASHBOARD_SETTINGS.badge_regeneration_hours
  }
}

class SettingsService {
  async getMySettings(): Promise<DashboardSettings> {
    const response = await apiClient.get<{ success: boolean; settings?: Partial<DashboardSettings> }>('/api/settings/me')
    if (!response?.success) {
      return { ...DEFAULT_DASHBOARD_SETTINGS }
    }
    return normalizeSettings(response.settings)
  }

  async updateMySettings(settings: Partial<DashboardSettings>): Promise<DashboardSettings> {
    const response = await apiClient.put<{ settings: Partial<DashboardSettings> }, { success: boolean; settings?: Partial<DashboardSettings> }>(
      '/api/settings/me',
      { settings }
    )
    if (!response?.success) {
      throw new Error('Erreur lors de la sauvegarde des parametres.')
    }
    return normalizeSettings(response.settings)
  }
}

export const settingsService = new SettingsService()
export default settingsService
