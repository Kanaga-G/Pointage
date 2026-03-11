import React, { useState } from 'react';
import { useAuth } from '../../services/authService';

export default function CalendarManagementPanel() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Mock events
  const events = [
    { date: 15, type: 'conge', employee: 'John Doe', title: 'Congé' },
    { date: 20, type: 'formation', employee: 'Marie Martin', title: 'Formation' },
    { date: 25, type: 'meeting', employee: 'Pierre Durand', title: 'Réunion' },
  ];

  const getEventForDay = (day: number) => {
    return events.filter(event => event.date === day);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'conge': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'formation': return 'bg-green-100 text-green-800 border-green-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Contrôles du calendrier */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[selectedMonth]} {selectedYear}
            </h3>
            <button
              onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Jour
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Mois
            </button>
          </div>
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-1">
          {/* Jours de la semaine */}
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
              {day}
            </div>
          ))}
          
          {/* Jours du mois */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-24 p-2 border rounded ${
                day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                  <div className="space-y-1">
                    {getEventForDay(day).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`text-xs p-1 rounded border ${getEventColor(event.type)}`}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs opacity-75">{event.employee}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Légende et statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Légende</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-sm text-gray-700">Congé</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-sm text-gray-700">Formation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
              <span className="text-sm text-gray-700">Réunion</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques du mois</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total employés</span>
              <span className="text-sm font-medium text-gray-900">45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Congés approuvés</span>
              <span className="text-sm font-medium text-gray-900">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Formations prévues</span>
              <span className="text-sm font-medium text-gray-900">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Réunions planifiées</span>
              <span className="text-sm font-medium text-gray-900">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
