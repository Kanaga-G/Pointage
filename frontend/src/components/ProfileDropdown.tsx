import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import Icon from './Icons';

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar cliquable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-700">
          {user?.prenom} {user?.nom}
        </span>
        <Icon 
          name="chevron-right"
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {/* Profil */}
            <button
              onClick={() => handleNavigation('/profile')}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Icon name="user" className="w-4 h-4" />
              <span>Mon Profil</span>
            </button>

            {/* Administration (seulement pour les admins) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavigation('/admin')}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Icon name="user-shield" className="w-4 h-4" />
                <span>Administration</span>
              </button>
            )}

            {/* Paramètres */}
            <button
              onClick={() => handleNavigation('/settings')}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Icon name="cog" className="w-4 h-4" />
              <span>Paramètres</span>
            </button>

            {/* Séparateur */}
            <div className="border-t border-gray-200 my-1"></div>

            {/* Déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Icon name="sign-out-alt" className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
