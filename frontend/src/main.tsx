import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/theme.css'
import './styles/globals.css'
import './styles/pages/dashboard-php.css'

// Import Font Awesome pour les icônes
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
document.head.appendChild(link)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
