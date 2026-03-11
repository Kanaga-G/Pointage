import React, { useState, useEffect } from 'react'
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  User, 
  Clock, 
  Coffee, 
  QrCode,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react'

interface DeviceDisplayProps {
  employeeName: string
  employeeRole: string
  status: 'present' | 'absent' | 'late'
  arrivalTime?: string
  workTime?: string
  lunchTime?: string
  resumeTime?: string
  performance?: string
  attendanceRate?: number
  daysWorked?: number
  onDepartClick?: () => void
  onPauseClick?: () => void
  onScanClick?: () => void
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'auto'
  orientation?: 'portrait' | 'landscape' | 'auto'
  mockData?: {
    notifications: number
    nextAction: string
    teamMembers: number
    pendingTasks: number
    recentActivity: Array<{time: string, action: string}>
  }
}

export default function DeviceDisplay({
  employeeName,
  employeeRole,
  status,
  arrivalTime = '08:30',
  workTime = '7h 42m',
  lunchTime = '12:15',
  resumeTime = '13:00',
  performance = 'Excellent',
  attendanceRate = 95,
  daysWorked = 21,
  onDepartClick,
  onPauseClick,
  onScanClick,
  deviceType = 'auto',
  orientation = 'auto',
  mockData = {
    notifications: 3,
    nextAction: 'Pointer le départ',
    teamMembers: 12,
    pendingTasks: 5,
    recentActivity: [
      { time: '14:30', action: 'Reprise de pause' },
      { time: '12:15', action: 'Début pause' },
      { time: '08:30', action: 'Arrivée au bureau' }
    ]
  }
}: DeviceDisplayProps) {
  const [currentDevice, setCurrentDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [currentOrientation, setCurrentOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (deviceType !== 'auto') {
      setCurrentDevice(deviceType)
    } else {
      // Détecter automatiquement le type d'appareil
      const updateDeviceType = () => {
        const width = window.innerWidth
        if (width < 768) {
          setCurrentDevice('mobile')
        } else if (width < 1024) {
          setCurrentDevice('tablet')
        } else {
          setCurrentDevice('desktop')
        }
      }

      updateDeviceType()
      window.addEventListener('resize', updateDeviceType)
      return () => window.removeEventListener('resize', updateDeviceType)
    }
  }, [deviceType])

  useEffect(() => {
    if (orientation !== 'auto') {
      setCurrentOrientation(orientation)
    } else {
      // Détecter automatiquement l'orientation
      const updateOrientation = () => {
        setCurrentOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
      }

      updateOrientation()
      window.addEventListener('resize', updateOrientation)
      return () => window.removeEventListener('resize', updateOrientation)
    }
  }, [orientation])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case 'present': return '#10b981'
      case 'late': return '#f59e0b'
      case 'absent': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'present': return 'Présent'
      case 'late': return 'En retard'
      case 'absent': return 'Absent'
      default: return 'Inconnu'
    }
  }

  // Mobile Device Component with Orientation Support
  const MobileDevice = () => {
    if (currentOrientation === 'landscape') {
      return (
        <div className="flex justify-center">
          <div className="relative">
            {/* Phone Frame Landscape */}
            <div className="w-[700px] h-80 bg-black rounded-[3rem] p-3 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="bg-gray-900 text-white px-4 py-2 text-xs flex justify-between items-center">
                  <span>{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-3 bg-white rounded-sm"></div>
                    <div className="w-4 h-3 bg-white rounded-sm"></div>
                    <div className="w-4 h-3 bg-white rounded-sm"></div>
                  </div>
                </div>
                
                {/* Landscape Content */}
                <div className="p-4 h-full bg-gradient-to-r from-blue-50 to-white flex">
                  {/* Left Section - User Info */}
                  <div className="w-1/3 pr-4 border-r">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">
                        {employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">{employeeName}</h3>
                      <p className="text-gray-600 text-xs">{employeeRole}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getStatusColor() + '20', color: getStatusColor() }}>
                        {getStatusText()}
                      </div>
                    </div>
                  </div>

                  {/* Center Section - Time & Actions */}
                  <div className="w-1/3 px-4">
                    <div className="text-center mb-3">
                      <div className="text-2xl font-bold text-gray-900">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-xs text-gray-500">{currentTime.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Arrivée:</span>
                        <span className="font-medium">{arrivalTime}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Temps:</span>
                        <span className="font-medium">{workTime}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={onDepartClick}
                        className="w-full bg-red-500 text-white py-2 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                      >
                        Départ
                      </button>
                      <button
                        onClick={onScanClick}
                        className="w-full bg-gray-800 text-white py-2 rounded-lg text-xs font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-1"
                      >
                        <QrCode className="w-3 h-3" />
                        QR
                      </button>
                    </div>
                  </div>

                  {/* Right Section - Quick Stats */}
                  <div className="w-1/3 pl-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">PERFORMANCE</div>
                        <div className="text-sm font-bold text-green-600">{performance}</div>
                        <div className="text-xs text-gray-600 mt-1">PRÉSENCE</div>
                        <div className="text-sm font-medium text-gray-900">{attendanceRate}%</div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-xs text-gray-500">{mockData.notifications} notifications</div>
                      <div className="text-xs text-gray-500">{mockData.pendingTasks} tâches en attente</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex justify-center">
        <div className="relative">
          {/* Phone Frame Portrait */}
          <div className="w-80 h-[700px] bg-black rounded-[3rem] p-3 shadow-2xl">
            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
              {/* Status Bar */}
              <div className="bg-gray-900 text-white px-4 py-2 text-xs flex justify-between items-center">
                <span>{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="flex gap-1">
                  <div className="w-4 h-3 bg-white rounded-sm"></div>
                  <div className="w-4 h-3 bg-white rounded-sm"></div>
                  <div className="w-4 h-3 bg-white rounded-sm"></div>
                </div>
              </div>
              
              {/* App Content */}
              <div className="p-4 h-full bg-gradient-to-b from-blue-50 to-white">
                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                    {employeeName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{employeeName}</h3>
                  <p className="text-gray-600 text-sm">{employeeRole}</p>
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getStatusColor() + '20', color: getStatusColor() }}>
                    {getStatusText()}
                  </div>
                </div>

                {/* Time Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                  <div className="text-center mb-3">
                    <div className="text-3xl font-bold text-gray-900">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-sm text-gray-500">{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Arrivée:</span>
                      <span className="font-medium">{arrivalTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temps:</span>
                      <span className="font-medium">{workTime}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={onDepartClick}
                    className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
                  >
                    Pointer le départ
                  </button>
                  <button
                    onClick={onPauseClick}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  >
                    Demander pause
                  </button>
                  <button
                    onClick={onScanClick}
                    className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-5 h-5" />
                    Scanner QR Code
                  </button>
                </div>

                {/* Performance */}
                <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">PERFORMANCE</div>
                    <div className="text-lg font-bold text-green-600">{performance}</div>
                    <div className="text-xs text-gray-600 mt-1">TEMPS TRAVAILLÉ</div>
                    <div className="text-sm font-medium text-gray-900">{workTime}</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Activité récente</h4>
                  <div className="space-y-2">
                    {mockData.recentActivity.slice(0, 2).map((activity, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-500">{activity.time}</span>
                        <span className="text-gray-700">{activity.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tablet Device Component
  const TabletDevice = () => (
    <div className="flex justify-center">
      <div className="relative">
        {/* Tablet Frame */}
        <div className="w-[600px] h-[800px] bg-gray-800 rounded-3xl p-4 shadow-2xl">
          <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
            {/* Status Bar */}
            <div className="bg-gray-900 text-white px-4 py-2 text-xs flex justify-between items-center">
              <span>{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex gap-1">
                <div className="w-4 h-3 bg-white rounded-sm"></div>
                <div className="w-4 h-3 bg-white rounded-sm"></div>
                <div className="w-4 h-3 bg-white rounded-sm"></div>
              </div>
            </div>
            
            {/* App Content */}
            <div className="p-6 h-full bg-gradient-to-b from-indigo-50 to-white">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {employeeName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl">{employeeName}</h3>
                    <p className="text-gray-600">{employeeRole}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2`} style={{ backgroundColor: getStatusColor() + '20', color: getStatusColor() }}>
                  <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getStatusColor() }}></div>
                  {getStatusText()}
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Time Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Pointage du jour
                  </h4>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-sm text-gray-500">{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    </div>
                    <div className="space-y-2 text-sm border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Arrivée:</span>
                        <span className="font-medium">{arrivalTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pause:</span>
                        <span className="font-medium">{lunchTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reprise:</span>
                        <span className="font-medium">{resumeTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Statistiques
                  </h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{attendanceRate}%</div>
                      <div className="text-sm text-gray-600">Présence</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{daysWorked}</div>
                        <div className="text-xs text-gray-600">Jours travaillés</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{workTime}</div>
                        <div className="text-xs text-gray-600">Temps total</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={onDepartClick}
                  className="bg-red-500 text-white py-4 rounded-xl font-medium hover:bg-red-600 transition-colors flex flex-col items-center gap-2"
                >
                  <Clock className="w-6 h-6" />
                  Pointer départ
                </button>
                <button
                  onClick={onPauseClick}
                  className="bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex flex-col items-center gap-2"
                >
                  <Coffee className="w-6 h-6" />
                  Demander pause
                </button>
                <button
                  onClick={onScanClick}
                  className="bg-gray-800 text-white py-4 rounded-xl font-medium hover:bg-gray-900 transition-colors flex flex-col items-center gap-2"
                >
                  <QrCode className="w-6 h-6" />
                  Scanner QR
                </button>
              </div>

              {/* Performance */}
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">PERFORMANCE</div>
                  <div className="text-2xl font-bold text-green-600 mb-2">{performance}</div>
                  <div className="text-sm text-gray-600">TEMPS TRAVAILLÉ AUJOURD'HUI</div>
                  <div className="text-xl font-medium text-gray-900">{workTime}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Desktop Device Component
  const DesktopDevice = () => (
    <div className="flex justify-center">
      <div className="relative">
        {/* Desktop Monitor Frame */}
        <div className="w-[800px] h-[600px] bg-gray-900 rounded-2xl p-4 shadow-2xl">
          <div className="w-full h-full bg-white rounded-xl overflow-hidden relative">
            {/* Monitor Stand */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-gray-700 rounded-b-lg"></div>
            
            {/* Desktop Content */}
            <div className="p-8 h-full bg-gradient-to-br from-slate-50 to-white">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {employeeName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-2xl">{employeeName}</h3>
                    <p className="text-gray-600 text-lg">{employeeRole}</p>
                  </div>
                </div>
                <div className={`px-6 py-3 rounded-full text-lg font-medium flex items-center gap-3 shadow-lg`} style={{ backgroundColor: getStatusColor() + '20', color: getStatusColor() }}>
                  <div className={`w-3 h-3 rounded-full animate-pulse`} style={{ backgroundColor: getStatusColor() }}></div>
                  {getStatusText()}
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Time Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                    <Clock className="w-6 h-6 text-blue-500" />
                    Pointage du jour
                  </h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-sm text-gray-500">{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                    <div className="space-y-3 text-sm border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Arrivée:
                        </span>
                        <span className="font-semibold text-lg">{arrivalTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Pause:
                        </span>
                        <span className="font-semibold text-lg">{lunchTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Reprise:
                        </span>
                        <span className="font-semibold text-lg">{resumeTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    Statistiques mensuelles
                  </h4>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600">{attendanceRate}%</div>
                      <div className="text-sm text-gray-600">Taux de présence</div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-center">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-blue-600">{daysWorked}</div>
                        <div className="text-xs text-gray-600">Jours travaillés</div>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-green-600">{workTime}</div>
                        <div className="text-xs text-gray-600">Temps total</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg border border-green-100">
                  <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                    <Activity className="w-6 h-6 text-green-500" />
                    Performance
                  </h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-3">{performance}</div>
                    <div className="text-sm text-gray-600 mb-4">TEMPS TRAVAILLÉ AUJOURD'HUI</div>
                    <div className="text-2xl font-bold text-gray-900">{workTime}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-4 gap-4">
                <button
                  onClick={onDepartClick}
                  className="bg-red-500 text-white py-6 rounded-2xl font-semibold hover:bg-red-600 transition-all hover:scale-105 shadow-lg flex flex-col items-center gap-3"
                >
                  <Clock className="w-8 h-8" />
                  Pointer départ
                </button>
                <button
                  onClick={onPauseClick}
                  className="bg-blue-500 text-white py-6 rounded-2xl font-semibold hover:bg-blue-600 transition-all hover:scale-105 shadow-lg flex flex-col items-center gap-3"
                >
                  <Coffee className="w-8 h-8" />
                  Demander pause
                </button>
                <button
                  onClick={onScanClick}
                  className="bg-gray-800 text-white py-6 rounded-2xl font-semibold hover:bg-gray-900 transition-all hover:scale-105 shadow-lg flex flex-col items-center gap-3"
                >
                  <QrCode className="w-8 h-8" />
                  Scanner QR
                </button>
                <button
                  className="bg-purple-500 text-white py-6 rounded-2xl font-semibold hover:bg-purple-600 transition-all hover:scale-105 shadow-lg flex flex-col items-center gap-3"
                >
                  <Calendar className="w-8 h-8" />
                  Historique
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      {/* Device Selector */}
      {deviceType === 'auto' && (
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
            <button
              onClick={() => setCurrentDevice('mobile')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                currentDevice === 'mobile' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Mobile
            </button>
            <button
              onClick={() => setCurrentDevice('tablet')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                currentDevice === 'tablet' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Tablet className="w-4 h-4" />
              Tablette
            </button>
            <button
              onClick={() => setCurrentDevice('desktop')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                currentDevice === 'desktop' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Desktop
            </button>
          </div>
        </div>
      )}

      {/* Orientation Selector */}
      {deviceType === 'auto' && (
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
            <button
              onClick={() => setCurrentOrientation('portrait')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                currentOrientation === 'portrait' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="w-4 h-4 rotate-0" />
              Portrait
            </button>
            <button
              onClick={() => setCurrentOrientation('landscape')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                currentOrientation === 'landscape' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="w-4 h-4 rotate-90" />
              Paysage
            </button>
            <button
              onClick={() => setCurrentOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')}
              className="px-4 py-2 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Activity className="w-4 h-4" />
              Auto
            </button>
          </div>
        </div>
      )}

      {/* Device Display */}
      {currentDevice === 'mobile' && <MobileDevice />}
      {currentDevice === 'tablet' && <TabletDevice />}
      {currentDevice === 'desktop' && <DesktopDevice />}
    </div>
  )
}
