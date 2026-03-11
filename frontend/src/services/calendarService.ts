import { apiClient } from './apiClient'

export type CalendarSource = 'evenement' | 'pointage'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  allDay?: boolean
  color?: string
  backgroundColor?: string
  borderColor?: string
  extendedProps?: {
    source?: CalendarSource
    type?: string
    description?: string
    priorite?: 'secondaire' | 'normale' | 'importante' | 'urgente'
    lieu?: string
    employe_id?: number | null
    employe_nom?: string | null
    retard_minutes?: number
  }
}

export interface CalendarEventPayload {
  titre: string
  description?: string
  start_date: string
  end_date: string
  type?: 'reunion' | 'formation' | 'autre'
  priorite?: 'secondaire' | 'normale' | 'importante' | 'urgente'
  lieu?: string
  employe_id?: number | null
}

class CalendarService {
  async getEvents(params?: { start?: string; end?: string; employe_id?: number; admin_id?: number; include_pointages?: boolean }): Promise<CalendarEvent[]> {
    const query = new URLSearchParams()
    if (params?.start) query.append('start', params.start)
    if (params?.end) query.append('end', params.end)
    if (Number.isInteger(params?.employe_id)) query.append('employe_id', String(params?.employe_id))
    if (Number.isInteger(params?.admin_id)) query.append('admin_id', String(params?.admin_id))
    if (params?.include_pointages !== undefined) query.append('include_pointages', params.include_pointages ? '1' : '0')

    const suffix = query.toString() ? `?${query.toString()}` : ''
    const candidateUrls = [
      `/api/calendrier/events${suffix}`,
      `/api/calendar/events${suffix}`,
      `/api/get_events${suffix}`
    ]

    let lastError: any = null
    for (const url of candidateUrls) {
      try {
        const response = await apiClient.get<any>(url)
        const source = response?.data && typeof response.data === 'object' ? response.data : response
        const events = Array.isArray(source)
          ? source
          : Array.isArray(source?.events)
            ? source.events
            : Array.isArray(source?.data?.events)
              ? source.data.events
              : []

        if (events.length > 0 || source?.success || Array.isArray(source)) {
          return events
        }
      } catch (error: any) {
        lastError = error
        if (error?.status === 404) {
          continue
        }
        throw error
      }
    }

    if (lastError && lastError?.status !== 404) {
      throw lastError
    }
    return []
  }

  async createEvent(payload: CalendarEventPayload): Promise<CalendarEvent> {
    const response = await apiClient.post<CalendarEventPayload, { success: boolean; event: CalendarEvent; message?: string }>(
      '/api/calendrier/events',
      payload
    )

    if (!response?.success || !response.event) {
      throw new Error(response?.message || 'Erreur lors de la creation de evenement')
    }

    return response.event
  }

  async updateEvent(eventId: number, payload: Partial<CalendarEventPayload>): Promise<CalendarEvent> {
    const response = await apiClient.put<Partial<CalendarEventPayload>, { success: boolean; event: CalendarEvent; message?: string }>(
      `/api/calendrier/events/${eventId}`,
      payload
    )

    if (!response?.success || !response.event) {
      throw new Error(response?.message || 'Erreur lors de la mise a jour de evenement')
    }

    return response.event
  }

  async deleteEvent(eventId: number): Promise<void> {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(`/api/calendrier/events/${eventId}`)
    if (!response?.success) {
      throw new Error(response?.message || 'Erreur lors de la suppression de evenement')
    }
  }
}

export const calendarService = new CalendarService()
export default calendarService
