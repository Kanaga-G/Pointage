import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PanelItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  component: React.ComponentType;
}

interface PanelNavigationProps {
  panels: PanelItem[];
  activePanel: string;
  onPanelChange: (panelId: string) => void;
}

export default function PanelNavigation({ panels, activePanel, onPanelChange }: PanelNavigationProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => onPanelChange(panel.id)}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200
              ${activePanel === panel.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {panel.badge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {panel.badge}
              </span>
            )}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">{panel.icon}</span>
              <span className="text-xs font-medium text-center">{panel.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Hook pour gérer l'état des panels
export function usePanelNavigation(initialPanel: string = 'dashboard') {
  const [activePanel, setActivePanel] = useState(initialPanel);
  
  const handlePanelChange = (panelId: string) => {
    setActivePanel(panelId);
  };
  
  return {
    activePanel,
    handlePanelChange,
    setActivePanel
  };
}
