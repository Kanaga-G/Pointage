import React, { useState, useEffect } from 'react';
import { employeService, Pointage, Evenement } from '../../services/employeService';
import { useAuth } from '../../services/authService';

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  hasPointage: boolean;
  pointages?: Pointage[];
  evenements?: Evenement[];
  isAbsent?: boolean;
  isLate?: boolean;
}

interface CalendarPanelProps {
  employeId?: number;
  showControls?: boolean;
}

export default function CalendarPanel({ employeId, showControls = true }: CalendarPanelProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventType, setNewEventType] = useState('');
  const [newEventLieu, setNewEventLieu] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [savingEvent, setSavingEvent] = useState(false);

  // Calcul des jours du mois
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Génération du calendrier
  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days: CalendarDay[] = [];

    // Jours du mois précédent
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        isWeekend: i % 7 === 0 || i % 7 === 6,
        hasPointage: false
      });
    }

    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Vérifier les pointages pour ce jour
      const dayPointages = pointages.filter(p => p.date.startsWith(dateStr));
      const dayEvenements = evenements.filter(e => e.date_evenement.startsWith(dateStr));
      
      days.push({
        date: day,
        isCurrentMonth: true,
        isWeekend,
        hasPointage: dayPointages.length > 0,
        pointages: dayPointages,
        evenements: dayEvenements,
        isLate: dayPointages.some(p => p.retard_minutes > 0)
      });
    }

    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isWeekend: days.length % 7 === 0 || days.length % 7 === 6,
        hasPointage: false
      });
    }

    setCalendarDays(days);
  };

  // Chargement des données
  useEffect(() => {
    loadCalendarData();
  }, [selectedMonth, selectedYear, employeId]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const targetEmployeId = employeId || user?.id;
      if (!targetEmployeId) {
        setError('ID employé non disponible');
        return;
      }

      // Charger les pointages du mois
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(getDaysInMonth(selectedYear, selectedMonth)).padStart(2, '0')}`;
      
      const [pointagesData, evenementsData] = await Promise.all([
        employeService.getPointagesPeriod(startDate, endDate).catch(() => []),
        employeService.getEvenements().catch(() => [])
      ]);

      setPointages(pointagesData || []);
      setEvenements(evenementsData || []);

    } catch (err) {
      console.error('Erreur lors du chargement des données du calendrier:', err);
      setError('Erreur lors du chargement des données');
      setPointages([]);
      setEvenements([]);
    } finally {
      setLoading(false);
    }
  };

  // Regénération du calendrier quand les données changent
  useEffect(() => {
    generateCalendar();
  }, [pointages, evenements, selectedMonth, selectedYear]);

  // Navigation dans le calendrier
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
    setCurrentDate(today);
  };

  const handlePickDate = (dateStr: string) => {
    const picked = new Date(dateStr);
    if (Number.isNaN(picked.getTime())) return;
    setSelectedMonth(picked.getMonth());
    setSelectedYear(picked.getFullYear());
    setCurrentDate(picked);
    setShowDatePicker(false);
  };

  // Gestion du clic sur un jour
  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    setSelectedDay(day);
    setShowDayDetails(true);
    setShowCreateEvent(false);
  };

  const getSelectedDayIsoDate = () => {
    if (!selectedDay || !selectedDay.isCurrentMonth) return null;
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay.date).padStart(2, '0')}`;
  };

  const openCreateEvent = () => {
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventType('');
    setNewEventLieu('');
    setNewEventTime('10:00');
    setShowCreateEvent(true);
  };

  const handleSaveEvent = async () => {
    const dateStr = getSelectedDayIsoDate();
    if (!dateStr) return;
    if (!newEventTitle.trim()) {
      setError('Titre requis');
      return;
    }

    try {
      setSavingEvent(true);
      setError(null);

      const date_evenement = `${dateStr}T${newEventTime}:00`;
      await employeService.createEvenement({
        titre: newEventTitle.trim(),
        description: newEventDescription.trim(),
        date_evenement,
        type: newEventType.trim(),
        lieu: newEventLieu.trim(),
        organisateur: user?.email || 'system'
      });

      await loadCalendarData();
      setShowCreateEvent(false);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'évènement:", err);
      setError("Erreur lors de l'enregistrement de l'évènement");
    } finally {
      setSavingEvent(false);
    }
  };

  // Formatage des heures
  const formatTime = (timeStr: string) => {
    return timeStr.split('T')[1].substring(0, 5);
  };

  // Obtenir la classe CSS pour un jour
  const getDayClassName = (day: CalendarDay) => {
    let className = 'calendar-day';
    
    if (!day.isCurrentMonth) {
      className += ' other-month';
    }
    
    if (day.isWeekend) {
      className += ' weekend';
    }
    
    if (day.hasPointage) {
      className += ' has-pointage';
      if (day.isLate) {
        className += ' has-late';
      }
    }
    
    if (day.evenements && day.evenements.length > 0) {
      className += ' has-event';
    }
    
    const today = new Date();
    if (day.isCurrentMonth && 
        day.date === today.getDate() && 
        selectedMonth === today.getMonth() && 
        selectedYear === today.getFullYear()) {
      className += ' today';
    }
    
    return className;
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-panel">
      {/* En-tête du calendrier */}
      <div className="calendar-header d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <h4 className="mb-0">
            {monthNames[selectedMonth]} {selectedYear}
          </h4>
          {showControls && (
            <div className="position-relative">
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowDatePicker(v => !v)}
              >
                Aujourd'hui
              </button>
              {showDatePicker && (
                <div className="position-absolute bg-white border rounded p-2" style={{ zIndex: 10, top: '110%', left: 0 }}>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`}
                    onChange={(e) => handlePickDate(e.target.value)}
                  />
                  <div className="d-flex justify-content-end mt-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        goToToday();
                        setShowDatePicker(false);
                      }}
                    >
                      Aujourd'hui
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {showControls && (
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-secondary"
              onClick={goToPreviousMonth}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={goToNextMonth}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="alert alert-danger mb-3">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Grille du calendrier */}
      <div className="calendar-grid">
        {/* Jours de la semaine */}
        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Jours du mois */}
        <div className="calendar-days">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={getDayClassName(day)}
              onClick={() => handleDayClick(day)}
              style={{ cursor: day.isCurrentMonth ? 'pointer' : 'default' }}
            >
              <div className="calendar-day-number">
                {day.date}
              </div>
              
              {/* Indicateurs de pointages */}
              {day.hasPointage && (
                <div className="calendar-indicators">
                  {day.pointages?.map((pointage, i) => (
                    <div
                      key={i}
                      className={`calendar-indicator ${pointage.type === 'arrivee' ? 'arrivee' : 'depart'} ${pointage.retard_minutes > 0 ? 'late' : ''}`}
                      title={`${pointage.type === 'arrivee' ? 'Arrivée' : 'Départ'} - ${formatTime(pointage.date_heure)}${pointage.retard_minutes > 0 ? ` (${pointage.retard_minutes}min retard)` : ''}`}
                    >
                      <i className={`fas fa-${pointage.type === 'arrivee' ? 'sign-in-alt' : 'sign-out-alt'}`}></i>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Indicateurs d'événements */}
              {day.evenements && day.evenements.length > 0 && (
                <div className="calendar-event-indicator">
                  <i className="fas fa-calendar-alt"></i>
                  <span className="event-count">{day.evenements.length}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Légende */}
      <div className="calendar-legend mt-4">
        <div className="legend-item">
          <div className="legend-color has-pointage"></div>
          <span>Pointage présent</span>
        </div>
        <div className="legend-item">
          <div className="legend-color has-late"></div>
          <span>Retard</span>
        </div>
        <div className="legend-item">
          <div className="legend-color has-event"></div>
          <span>Événement</span>
        </div>
        <div className="legend-item">
          <div className="legend-color weekend"></div>
          <span>Weekend</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Aujourd'hui</span>
        </div>
      </div>

      {/* Modal détails du jour */}
      {showDayDetails && selectedDay && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Détails du {selectedDay.date} {monthNames[selectedMonth]} {selectedYear}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDayDetails(false)}
                ></button>
              </div>
              <div className="modal-body">
                {showCreateEvent && (
                  <div className="mb-4">
                    <h6 className="mb-3">
                      <i className="fas fa-plus-circle me-2"></i>
                      Ajouter un événement
                    </h6>

                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Titre</label>
                        <input
                          className="form-control"
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={newEventDescription}
                          onChange={(e) => setNewEventDescription(e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Heure</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newEventTime}
                          onChange={(e) => setNewEventTime(e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Type</label>
                        <input
                          className="form-control"
                          value={newEventType}
                          onChange={(e) => setNewEventType(e.target.value)}
                          placeholder="reunion / formation / ..."
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Lieu</label>
                        <input
                          className="form-control"
                          value={newEventLieu}
                          onChange={(e) => setNewEventLieu(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pointages du jour */}
                {selectedDay.pointages && selectedDay.pointages.length > 0 && (
                  <div className="mb-4">
                    <h6 className="mb-3">
                      <i className="fas fa-clock me-2"></i>
                      Pointages
                    </h6>
                    <div className="list-group">
                      {selectedDay.pointages.map(pointage => (
                        <div key={pointage.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <i className={`fas fa-${pointage.type === 'arrivee' ? 'sign-in-alt text-success' : 'sign-out-alt text-danger'} me-2`}></i>
                              <span className="fw-semibold">
                                {pointage.type === 'arrivee' ? 'Arrivée' : 'Départ'}
                              </span>
                              <span className="ms-2">{formatTime(pointage.date_heure)}</span>
                            </div>
                            {pointage.retard_minutes > 0 && (
                              <span className="badge bg-warning">
                                {pointage.retard_minutes}min retard
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Événements du jour */}
                {selectedDay.evenements && selectedDay.evenements.length > 0 && (
                  <div>
                    <h6 className="mb-3">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Événements
                    </h6>
                    <div className="list-group">
                      {selectedDay.evenements.map(event => (
                        <div key={event.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{event.titre}</h6>
                              <p className="mb-1 text-muted small">{event.description}</p>
                              {event.lieu && (
                                <p className="mb-0 small">
                                  <i className="fas fa-map-marker-alt me-1"></i>
                                  {event.lieu}
                                </p>
                              )}
                            </div>
                            <span className="badge bg-primary">{event.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aucune activité */}
                {(!selectedDay.pointages || selectedDay.pointages.length === 0) && 
                 (!selectedDay.evenements || selectedDay.evenements.length === 0) && (
                  <div className="text-center text-muted py-4">
                    <i className="fas fa-calendar-times fa-3x mb-3"></i>
                    <p>Aucune activité ce jour</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {!showCreateEvent && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={openCreateEvent}
                  >
                    Ajouter un événement
                  </button>
                )}

                {showCreateEvent && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveEvent}
                    disabled={savingEvent}
                  >
                    {savingEvent ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                )}

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDayDetails(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS pour le calendrier */}
      <style>{`
        .calendar-panel {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #e9ecef;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .calendar-weekdays {
          display: contents;
        }

        .calendar-weekday {
          background: #f8f9fa;
          padding: 10px;
          text-align: center;
          font-weight: 600;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .calendar-days {
          display: contents;
        }

        .calendar-day {
          background: white;
          padding: 8px;
          min-height: 80px;
          position: relative;
          transition: background-color 0.2s;
        }

        .calendar-day:hover {
          background: #f8f9fa;
        }

        .calendar-day.other-month {
          background: #f8f9fa;
          color: #adb5bd;
        }

        .calendar-day.weekend {
          background: #f8f9fa;
        }

        .calendar-day.today {
          background: #e7f5ff;
          border: 2px solid #339af0;
        }

        .calendar-day.has-pointage {
          background: #f0fff4;
        }

        .calendar-day.has-late {
          background: #fff4e6;
        }

        .calendar-day.has-event {
          background: #f3f0ff;
        }

        .calendar-day-number {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .calendar-indicators {
          display: flex;
          gap: 2px;
          flex-wrap: wrap;
        }

        .calendar-indicator {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }

        .calendar-indicator.arrivee {
          background: #d4edda;
          color: #155724;
        }

        .calendar-indicator.depart {
          background: #f8d7da;
          color: #721c24;
        }

        .calendar-indicator.late {
          background: #fff3cd;
          color: #856404;
        }

        .calendar-event-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #6c5ce7;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }

        .calendar-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          font-size: 0.875rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid #dee2e6;
        }

        .legend-color.has-pointage {
          background: #f0fff4;
        }

        .legend-color.has-late {
          background: #fff4e6;
        }

        .legend-color.has-event {
          background: #f3f0ff;
        }

        .legend-color.weekend {
          background: #f8f9fa;
        }

        .legend-color.today {
          background: #e7f5ff;
          border-color: #339af0;
        }
      `}</style>
    </div>
  );
}
