// // Landing Page Ultra-Moderne - Version Corrigée et Améliorée
// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/pages/landing-page-ultra-futuriste.css';

// // Type declarations
// declare global {
//   interface Window {
//     landingPage?: any;
//     LandingPageController?: any;
//   }
// }

// // Styles de base injectés pour éviter les problèmes CSS
// const baseStyles = `
// .modern-homepage {
//   background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
//   min-height: 100vh;
//   color: #0f172a;
//   font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
// }

// .container {
//   max-width: 1200px;
//   margin: 0 auto;
//   padding: 0 20px;
//   position: relative;
//   z-index: 1;
// }

// .row { display:flex; align-items:center; gap:60px }
// .col-lg-6 { flex:1 }
// .align-items-center { align-items:center }
// .min-vh-80 { min-height:80vh }
// .hero-content { padding-right: 40px }
// .hero-visual { padding-left: 40px }

// /* -------------------- */
// /* Dashboard cards & devices */
// /* -------------------- */
// .dashboard-showcase .dashboard-tabs { display:flex; gap:10px; margin-bottom:18px }
// .tab-button { padding:8px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:#fff; color:#0f172a; display:inline-flex; gap:8px; align-items:center; cursor:pointer; box-shadow:0 1px 2px rgba(2,6,23,.04) }
// .tab-button.active { background:linear-gradient(90deg,#2563eb,#7c3aed); color:#fff; border-color:transparent; transform:translateY(-1px) }

// .dashboard-preview-large { background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,250,0.9)); border-radius:12px; padding:18px; box-shadow: 0 10px 30px rgba(2,6,23,0.08); }
// .dashboard-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px }
// .user-info { display:flex; gap:12px; align-items:center }
// .avatar-large { width:56px; height:56px; border-radius:10px; background:linear-gradient(135deg,#60a5fa,#a78bfa); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700 }
// .today-info { text-align:right; color:#334155 }

// .dashboard-grid { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:14px }
// .stat-card-large { display:flex; gap:12px; align-items:center; padding:14px; border-radius:10px; background:linear-gradient(180deg,#ffffff,#fbfdff); border:1px solid rgba(15,23,42,0.03); box-shadow:0 6px 18px rgba(2,6,23,0.04); transition:box-shadow .18s ease }
// .stat-card-large:hover { transform:none; box-shadow:0 12px 28px rgba(15,23,42,0.08) }
// .stat-icon-large { width:46px; height:46px; border-radius:8px; background: linear-gradient(135deg,#e0f2fe,#f0f9ff); display:flex; align-items:center; justify-content:center; color:#0369a1; font-size:18px }
// .stat-content-large .stat-value-large { font-size:1.1rem; font-weight:700 }
// .stat-content-large .stat-label-large { font-size:0.85rem; color:#64748b }

// /* Device previews */
// .device-preview { width:220px; display:flex; flex-direction:column; align-items:center; gap:8px }
// .device-frame { width:100%; border-radius:18px; overflow:hidden; background:#0f172a; box-shadow:0 12px 30px rgba(2,6,23,0.12); transform:none; transition:box-shadow .2s ease }
// .device-screen { padding:12px; background:linear-gradient(180deg,#0f172a, #071132); color:#fff; min-height:360px }
// .device-label { font-size:0.85rem; padding:6px 10px; border-radius:999px; background:#ffffff; color:#0f172a; font-weight:600; box-shadow:0 6px 18px rgba(2,6,23,0.06) }
// .device-preview:hover .device-frame { transform:none }

// .mobile-device .device-screen { min-height:380px; width:160px; border-radius:16px }
// .tablet-device .device-screen { min-height:360px; width:200px; border-radius:12px }
// .desktop-device .device-screen { min-height:300px; width:320px; border-radius:8px }

// /* responsive */
// @media (max-width: 980px) {
//   .dashboard-grid { grid-template-columns: repeat(1,1fr) }
//   .device-preview { width:160px }
// }

// @media (max-width: 768px) {
//   .row { flex-direction:column; gap:40px }
//   .hero-content,.hero-visual { padding:0 }
//   .dashboard-grid { grid-template-columns: repeat(1,1fr) }
// }
// /* Enhanced device mockup visuals */
// .device-frame { border: 1px solid rgba(255,255,255,0.04); background: linear-gradient(180deg,#071133 0%, #071128 100%); }
// .device-frame .device-screen { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding: 14px; box-shadow: inset 0 -8px 20px rgba(0,0,0,0.35); }

// .mobile-device .device-frame { border-radius: 28px; }
// .mobile-device .device-screen { border-radius: 20px; box-shadow: 0 10px 30px rgba(2,6,23,0.6) inset; }
// .mobile-device .mobile-header { display:flex; justify-content:space-between; align-items:center; padding:8px 6px; }
// .mobile-device .mobile-avatar { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#60a5fa,#a78bfa); display:flex; align-items:center; justify-content:center; font-weight:700 }
// .mobile-device .mobile-pointage-card { margin-top:10px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:10px; border-radius:12px }
// .mobile-device .mobile-btn { width:100%; padding:10px; border-radius:10px; border:none; margin-top:8px }
// .mobile-device .mobile-btn.primary { background: linear-gradient(90deg,#2563eb,#7c3aed); color:#fff }
// .mobile-device .mobile-btn.secondary { background: rgba(255,255,255,0.04); color:#e6eef8 }

// .tablet-device .device-frame { border-radius: 22px }
// .tablet-device .tablet-dashboard { padding:10px }
// .tablet-device .tablet-stat { display:flex; gap:8px; align-items:center; padding:8px; background: rgba(255,255,255,0.02); border-radius:10px; margin-bottom:8px }

// .desktop-device .device-frame { border-radius: 12px }
// .desktop-device .desktop-header { display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background: rgba(255,255,255,0.02); }
// .desktop-device .desktop-nav .nav-item { display:inline-flex; gap:8px; align-items:center; padding:8px 10px; border-radius:8px }
// .desktop-device .desktop-stat-card { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:10px; border-radius:10px }

// /* make mockups visually prominent on small screens */
// @media (max-width: 768px) {
//   .device-preview { width: 100%; justify-content: center }
//   .device-preview .device-frame { max-width: 340px }
// }
// `;

// // Données pour la landing page
// const heroData = {
//   stats: [
//     { number: '+95%', label: 'Productivité', delay: '0' },
//     { number: '-80%', label: 'Erreurs', delay: '100' },
//     { number: '100%', label: 'Sécurité', delay: '200' }
//   ],
//   trustBadges: [
//     { icon: 'fa-shield-check', text: 'RGPD Compliant' },
//     { icon: 'fa-cloud', text: 'Cloud Français' },
//     { icon: 'fa-headset', text: 'Support 7j/7' }
//   ],
//   liveStats: {
//     employees: 42,
//     lastScan: '08:42',
//     avgTime: '1.8s'
//   }
// };

// const featuresData = [
//   {
//     icon: 'fa-qrcode',
//     title: 'Génération QR Code',
//     description: 'Créez des QR codes dynamiques sécurisés pour chaque session de travail',
//     features: ['Codes uniques', 'Géolocalisation', 'Expiration auto', 'Personnalisable']
//   },
//   {
//     icon: 'fa-mobile-alt',
//     title: 'Scan Mobile',
//     description: 'Scan ultra-rapide avec n\'importe quel smartphone, aucune app requise',
//     features: ['Aucune installation', 'Compatibilité totale', 'Validation instantanée', 'Scan NFC']
//   },
//   {
//     icon: 'fa-database',
//     title: 'Stockage Sécurisé',
//     description: 'Données chiffrées AES-256 avec horodatage certifié et backup automatique',
//     features: ['Chiffrement AES-256', 'Horodatage certifié', 'Backup automatique', 'Redondance géographique']
//   },
//   {
//     icon: 'fa-chart-bar',
//     title: 'Analytics Avancées',
//     description: 'Dashboard complet avec rapports automatiques et analyses temps réel',
//     features: ['Dashboard temps réel', 'Export PDF/Excel', 'Alertes intelligentes', 'Tableaux de bord']
//   }
// ];

// const benefitsData = [
//   {
//     icon: 'fa-stopwatch',
//     title: 'Gain de temps exceptionnel',
//     description: 'Réduisez de 80% le temps consacré à la gestion des présences grâce à l\'automatisation',
//     value: '80%'
//   },
//   {
//     icon: 'fa-chart-line',
//     title: 'Précision maximale',
//     description: 'Horodatage certifié et données 100% fiables pour une conformité parfaite',
//     value: '100%'
//   },
//   {
//     icon: 'fa-lock',
//     title: 'Sécurité renforcée',
//     description: 'Système anti-fraude avec géolocalisation et QR codes uniques',
//     value: '256-bit'
//   },
//   {
//     icon: 'fa-euro-sign',
//     title: 'ROI immédiat',
//     description: 'Réduction des coûts administratifs dès le premier mois grâce à l\'automatisation',
//     value: '+30%'
//   }
// ];

// export default function LandingPage(): JSX.Element {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState('employee');
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const todayLongLabel = useMemo(
//     () => `Aujourd'hui, ${currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
//     [currentTime]
//   );

//   useEffect(() => {
//     // Add body classes
//     document.body.classList.add('home-page', 'modern-design');

//     // Update current time every second
//     const timeInterval = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     // Réduire le nombre de particules pour améliorer les performances
//     const quantumContainer = document.createElement('div');
//     quantumContainer.className = 'quantum-particles';
    
//     // Créer seulement 5 particules au lieu de 10
//     for (let i = 0; i < 5; i++) {
//       const particle = document.createElement('div');
//       particle.className = 'quantum-particle';
//       quantumContainer.appendChild(particle);
//     }
    
//     document.body.appendChild(quantumContainer);

//     // Simple intersection observer pour les animations au scroll
//     const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach((entry) => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add('animate-in');
//         }
//       });
//     }, observerOptions);

//     // Observer les éléments principaux seulement
//     document.querySelectorAll('.feature-card-modern, .benefit-item, .stat-card-modern').forEach((el) => {
//       observer.observe(el);
//     });

//     // Cleanup
//     return () => {
//       observer.disconnect();
//       window.clearInterval(timeInterval);
//       document.body.classList.remove('home-page', 'modern-design');
//       if (quantumContainer.parentNode) {
//         quantumContainer.parentNode.removeChild(quantumContainer);
//       }
//     };
//   }, []);

//   const handleTabChange = (tab: string) => {
//     setActiveTab(tab);
//   };

//   return (
//     <main className="modern-homepage">
//       {/* Hero Section */}
//       <section className="hero-section-modern">
//         <div className="hero-background">
//           <div className="animated-shapes">
//             <div className="shape shape-1" />
//             <div className="shape shape-2" />
//             <div className="shape shape-3" />
//           </div>
//         </div>

//         <div className="container">
//           <div className="row align-items-center min-vh-80">
//             {/* Hero Content - Gauche */}
//             <div className="col-lg-6 hero-content">
//               <div className="badge-modern">
//                 <i className="fas fa-bolt" />
//                 <span>Solution Innovante</span>
//               </div>

//               <h1 className="hero-title-modern">
//                 <span className="gradient-text">Xpert Pro</span>
//                 <br />
//                 Système de Pointage<br />
//                 <span className="highlight-modern">Intelligent</span>
//               </h1>

//               <p className="hero-subtitle-modern">
//                 Transformez votre gestion des présences avec notre solution QR Code moderne. Simple,
//                 rapide et sécurisé pour les équipes d'aujourd'hui.
//               </p>

//               {/* Stats */}
//               <div className="hero-stats-modern">
//                 {heroData.stats.map((stat, index) => (
//                   <div key={index} className="stat-modern" data-delay={stat.delay}>
//                     <div className="stat-number" data-target={stat.number}>{stat.number}</div>
//                     <div className="stat-label">{stat.label}</div>
//                   </div>
//                 ))}
//               </div>

//               {/* Trust Badges */}
//               <div className="trust-badges">
//                 {heroData.trustBadges.map((badge, index) => (
//                   <div key={index} className="trust-item">
//                     <i className={`fas ${badge.icon}`} />
//                     <span>{badge.text}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Hero Visual - Droite */}
//             <div className="col-lg-6 hero-visual">
//               <div className="floating-dashboard">
//                 <div className="dashboard-preview-modern">
//                   <div className="dashboard-header-modern">
//                     <div className="dashboard-title">
//                       <i className="fas fa-qrcode" />
//                       <h6>Pointage en direct</h6>
//                     </div>
//                     <div className="status-badge active">
//                       <span className="pulse" />
//                       En ligne
//                     </div>
//                   </div>

//                   {/* Pointage Card Dynamique */}
//                   <div className="pointage-card-dynamic">
//                     <div className="pointage-header">
//                       <div className="pointage-user">
//                         <div className="user-avatar">
//                           <img src="https://picsum.photos/seed/user1/40/40" alt="User" />
//                           <div className="status-dot online"></div>
//                         </div>
//                         <div className="user-details">
//                           <h4>John Doe</h4>
//                           <p>Développeur Full-Stack</p>
//                         </div>
//                       </div>
//                       <div className="pointage-time">
//                         <div className="current-time">{currentTime.toLocaleTimeString('fr-FR')}</div>
//                         <div className="date">{currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
//                       </div>
//                     </div>

//                     <div className="pointage-status">
//                       <div className="status-indicator present">
//                         <div className="status-icon">
//                           <i className="fas fa-check-circle"></i>
//                         </div>
//                         <div className="status-text">
//                           <span className="status-label">Présent</span>
//                           <span className="status-time">Depuis 08:30</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="pointage-stats">
//                       <div className="stat-item">
//                         <div className="stat-icon-small">
//                           <i className="fas fa-clock"></i>
//                         </div>
//                         <div className="stat-info">
//                           <span className="stat-number">5h 53m</span>
//                           <span className="stat-label">Temps travaillé</span>
//                         </div>
//                       </div>
//                       <div className="stat-item">
//                         <div className="stat-icon-small">
//                           <i className="fas fa-coffee"></i>
//                         </div>
//                         <div className="stat-info">
//                           <span className="stat-number">45m</span>
//                           <span className="stat-label">Pause</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="pointage-actions">
//                       <button className="action-btn primary">
//                         <i className="fas fa-sign-out-alt"></i>
//                         Pointer le départ
//                       </button>
//                       <button className="action-btn secondary">
//                         <i className="fas fa-coffee"></i>
//                         Pause
//                       </button>
//                     </div>
//                   </div>

//                   {/* Live Stats */}
//                   <div className="live-stats">
//                     <div className="stat-card-modern">
//                       <div className="stat-icon">
//                         <i className="fas fa-users" />
//                       </div>
//                       <div className="stat-content">
//                         <div className="stat-value">{heroData.liveStats.employees}</div>
//                         <div className="stat-label">Présents</div>
//                       </div>
//                     </div>
//                     <div className="stat-card-modern">
//                       <div className="stat-icon">
//                         <i className="fas fa-clock" />
//                       </div>
//                       <div className="stat-content">
//                         <div className="stat-value">{heroData.liveStats.lastScan}</div>
//                         <div className="stat-label">Dernier scan</div>
//                       </div>
//                     </div>
//                     <div className="stat-card-modern">
//                       <div className="stat-icon">
//                         <i className="fas fa-bolt" />
//                       </div>
//                       <div className="stat-content">
//                         <div className="stat-value">{heroData.liveStats.avgTime}</div>
//                         <div className="stat-label">Temps moyen</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* CTA Buttons - Sous le dashboard */}
//               <div className="cta-buttons-modern" style={{ marginTop: '30px' }}>
//                 <button 
//                   onClick={() => navigate('/login?type=employee')} 
//                   className="btn-modern btn-primary-modern"
//                 >
//                   <i className="fas fa-user-check" />
//                   <span>Connexion Employé</span>
//                 </button>
//                 <button 
//                   onClick={() => navigate('/login?type=admin')} 
//                   className="btn-modern btn-secondary-modern"
//                 >
//                   <i className="fas fa-chart-line" />
//                   <span>Dashboard Admin</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="features-modern-section">
//         <div className="container">
//           <div className="section-header-modern">
//             <h2 className="section-title-modern">Comment ça marche ?</h2>
//             <p className="section-subtitle-modern">Un processus simple en 4 étapes</p>
//             <div className="title-decoration" />
//           </div>

//           <div className="row g-4">
//             {featuresData.map((feature, index) => (
//               <div key={index} className="col-lg-3 col-md-6">
//                 <div className="feature-card-modern" data-delay={index * 100}>
//                   <div className="feature-icon-wrapper">
//                     <div className="feature-icon-bg"></div>
//                     <i className={`fas ${feature.icon} feature-icon`}></i>
//                   </div>
//                   <h3 className="feature-title-modern">{feature.title}</h3>
//                   <p className="feature-description-modern">{feature.description}</p>
//                   <ul className="feature-list">
//                     {feature.features.map((item, itemIndex) => (
//                       <li key={itemIndex}>
//                         <i className="fas fa-check"></i>
//                         {item}
//                       </li>
//                     ))}
//                   </ul>
//                   <div className="feature-hover-effect"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Dashboard Showcase */}
//       <section className="dashboard-showcase">
//         <div className="container">
//           <div className="section-header-modern">
//             <h2 className="section-title-modern">Des interfaces intuitives</h2>
//             <p className="section-subtitle-modern">Conçues pour simplifier votre quotidien</p>
//             <div className="title-decoration" />
//           </div>

//           <div className="dashboard-tabs">
//             <button 
//               className={`tab-button ${activeTab === 'employee' ? 'active' : ''}`}
//               onClick={() => handleTabChange('employee')}
//             >
//               <i className="fas fa-user-tie"></i>
//               Vue Employé
//             </button>
//             <button 
//               className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
//               onClick={() => handleTabChange('admin')}
//             >
//               <i className="fas fa-chart-pie"></i>
//               Vue Admin
//             </button>
//             <button 
//               className={`tab-button ${activeTab === 'mobile' ? 'active' : ''}`}
//               onClick={() => handleTabChange('mobile')}
//             >
//               <i className="fas fa-mobile-alt"></i>
//               Version Mobile
//             </button>
//           </div>

//           <div className="tab-content">
//             <div className={`tab-pane ${activeTab === 'employee' ? 'active' : ''}`} id="employee-tab">
//               <div className="dashboard-preview-large">
//                 <div className="dashboard-header">
//                   <div className="user-info">
//                     <div className="avatar-large">JD</div>
//                     <div>
//                       <h5>John Doe</h5>
//                       <p className="role">Développeur Full-Stack</p>
//                     </div>
//                   </div>
//                   <div className="today-info">
//                     <div className="date">{todayLongLabel}</div>
//                     <div className="current-time">{currentTime.toLocaleTimeString('fr-FR')}</div>
//                   </div>
//                 </div>

//                 <div className="dashboard-grid">
//                   <div className="stat-card-large">
//                     <div className="stat-icon-large">
//                       <i className="fas fa-clock"></i>
//                     </div>
//                     <div className="stat-content-large">
//                       <div className="stat-value-large">7h 42m</div>
//                       <div className="stat-label-large">Temps travaillé</div>
//                     </div>
//                   </div>
//                   <div className="stat-card-large">
//                     <div className="stat-icon-large">
//                       <i className="fas fa-calendar-check"></i>
//                     </div>
//                     <div className="stat-content-large">
//                       <div className="stat-value-large">21</div>
//                       <div className="stat-label-large">Jours présents</div>
//                     </div>
//                   </div>
//                   <div className="stat-card-large">
//                     <div className="stat-icon-large">
//                       <i className="fas fa-qrcode"></i>
//                     </div>
//                     <div className="stat-content-large">
//                       <div className="stat-value-large">08:30</div>
//                       <div className="stat-label-large">Arrivée</div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="preview-details-grid">
//                   <div className="preview-detail-card">
//                     <h6>Mon activite du jour</h6>
//                     <ul className="preview-detail-list">
//                       <li><span>Pause dejeuner</span><strong>12:15 - 13:00</strong></li>
//                       <li><span>Demande en attente</span><strong>1 conge</strong></li>
//                       <li><span>Dernier scan QR</span><strong>14:08</strong></li>
//                     </ul>
//                   </div>
//                   <div className="preview-detail-card">
//                     <h6>Actions disponibles</h6>
//                     <div className="preview-action-row">
//                       <button className="preview-chip is-primary"><i className="fas fa-qrcode"></i> Scanner</button>
//                       <button className="preview-chip"><i className="fas fa-calendar-plus"></i> Demande</button>
//                       <button className="preview-chip"><i className="fas fa-file-alt"></i> Historique</button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className={`tab-pane ${activeTab === 'admin' ? 'active' : ''}`} id="admin-tab">
//               <div className="dashboard-preview-large">
//                 <div className="dashboard-header">
//                   <div className="user-info">
//                     <div className="avatar-large">AD</div>
//                     <div>
//                       <h5>Admin Système</h5>
//                       <p className="role">Administrateur</p>
//                     </div>
//                   </div>
//                   <div className="today-info">
//                     <div className="date">{todayLongLabel}</div>
//                     <div className="current-time">{currentTime.toLocaleTimeString('fr-FR')}</div>
//                   </div>
//                 </div>

//                 <div className="dashboard-grid">
//                   <div className="stat-card-large">
//                     <div className="stat-icon-large">
//                       <i className="fas fa-users"></i>
//                     </div>
//                     <div className="stat-content-large">
//                       <div className="stat-value-large">156</div>
//                       <div className="stat-label-large">Employés total</div>
//                     </div>
//                   </div>
//                   <div className="stat-card-large">
//                     <div className="stat-icon-large">
//                       <i className="fas fa-user-check"></i>
//                     </div>
//                     <div className="stat-content-large">
//                       <div className="stat-value-large">142</div>
//                       <div className="stat-label-large">Présents aujourd'hui</div>
//                     </div>
//                   </div>
//                   <div className="stat-card-large">
//                     <div className="stat-icon-large">
//                       <i className="fas fa-chart-line"></i>
//                     </div>
//                     <div className="stat-content-large">
//                       <div className="stat-value-large">91%</div>
//                       <div className="stat-label-large">Taux de présence</div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="preview-details-grid">
//                   <div className="preview-detail-card">
//                     <h6>Pilotage RH</h6>
//                     <ul className="preview-detail-list">
//                       <li><span>Retards detectes</span><strong>4 employes</strong></li>
//                       <li><span>Demandes a valider</span><strong>7 en attente</strong></li>
//                       <li><span>Heures du jour</span><strong>742 h cumulees</strong></li>
//                     </ul>
//                   </div>
//                   <div className="preview-detail-card">
//                     <h6>Supervision rapide</h6>
//                     <div className="preview-action-row">
//                       <button className="preview-chip is-primary"><i className="fas fa-users-cog"></i> Employes</button>
//                       <button className="preview-chip"><i className="fas fa-id-card"></i> Badges</button>
//                       <button className="preview-chip"><i className="fas fa-calendar-day"></i> Calendrier</button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className={`tab-pane ${activeTab === 'mobile' ? 'active' : ''}`} id="mobile-tab">
//               <div className="mobile-preview-summary">
//                 <h6>Apercu multi-ecran fixe</h6>
//                 <p>Une experience coherente sur smartphone, tablette et desktop pour le pointage, le calendrier et les actions rapides.</p>
//               </div>
//               <div className="mobile-showcase-grid">
//                 {/* Mobile Device */}
//                 <div className="device-preview mobile-device">
//                   <div className="device-frame">
//                     <div className="device-screen">
//                       <div className="mobile-app">
//                         <div className="mobile-header">
//                           <div className="mobile-user">
//                             <div className="mobile-avatar">JD</div>
//                             <div className="mobile-user-info">
//                               <span className="mobile-name">John Doe</span>
//                               <span className="mobile-role">Développeur</span>
//                             </div>
//                           </div>
//                           <div className="mobile-time">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
//                         </div>
                        
//                         <div className="mobile-content">
//                           <div className="mobile-pointage-card">
//                             <div className="mobile-status present">
//                               <i className="fas fa-check-circle"></i>
//                               <span>Présent</span>
//                             </div>
//                             <div className="mobile-time-info">
//                               <div className="mobile-arrival">08:30</div>
//                               <div className="mobile-work-time">7h 42m</div>
//                             </div>
//                           </div>
                          
//                           <div className="mobile-actions">
//                             <button className="mobile-btn primary">
//                               <i className="fas fa-sign-out-alt"></i>
//                               Départ
//                             </button>
//                             <button className="mobile-btn secondary">
//                               <i className="fas fa-coffee"></i>
//                               Pause
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="device-label">Mobile</div>
//                 </div>

//                 {/* Tablet Device */}
//                 <div className="device-preview tablet-device">
//                   <div className="device-frame">
//                     <div className="device-screen">
//                       <div className="tablet-app">
//                         <div className="tablet-header">
//                           <div className="tablet-logo">
//                             <i className="fas fa-qrcode"></i>
//                             <span>Xpert Pro</span>
//                           </div>
//                           <div className="tablet-user">
//                             <div className="tablet-avatar">JD</div>
//                             <span>John Doe</span>
//                           </div>
//                         </div>
                        
//                         <div className="tablet-content">
//                           <div className="tablet-dashboard">
//                             <div className="tablet-stats">
//                               <div className="tablet-stat">
//                                 <i className="fas fa-clock"></i>
//                                 <div>
//                                   <div className="tablet-value">7h 42m</div>
//                                   <div className="tablet-label">Temps</div>
//                                 </div>
//                               </div>
//                               <div className="tablet-stat">
//                                 <i className="fas fa-calendar-check"></i>
//                                 <div>
//                                   <div className="tablet-value">21</div>
//                                   <div className="tablet-label">Jours</div>
//                                 </div>
//                               </div>
//                               <div className="tablet-stat">
//                                 <i className="fas fa-chart-line"></i>
//                                 <div>
//                                   <div className="tablet-value">95%</div>
//                                   <div className="tablet-label">Présence</div>
//                                 </div>
//                               </div>
//                             </div>
                            
//                             <div className="tablet-pointage-section">
//                               <h4>Pointage du jour</h4>
//                               <div className="pointage-timeline">
//                                 <div className="timeline-item arrival">
//                                   <div className="timeline-icon">
//                                     <i className="fas fa-sign-in-alt"></i>
//                                   </div>
//                                   <div className="timeline-content">
//                                     <div className="timeline-time">08:30</div>
//                                     <div className="timeline-label">Arrivée</div>
//                                   </div>
//                                 </div>
//                                 <div className="timeline-item break">
//                                   <div className="timeline-icon">
//                                     <i className="fas fa-coffee"></i>
//                                   </div>
//                                   <div className="timeline-content">
//                                     <div className="timeline-time">12:15</div>
//                                     <div className="timeline-label">Pause déjeuner</div>
//                                   </div>
//                                 </div>
//                                 <div className="timeline-item return">
//                                   <div className="timeline-icon">
//                                     <i className="fas fa-sign-in-alt"></i>
//                                   </div>
//                                   <div className="timeline-content">
//                                     <div className="timeline-time">13:00</div>
//                                     <div className="timeline-label">Reprise</div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="device-label">Tablette</div>
//                 </div>

//                 {/* Desktop Device */}
//                 <div className="device-preview desktop-device">
//                   <div className="device-frame">
//                     <div className="device-screen">
//                       <div className="desktop-app">
//                         <div className="desktop-header">
//                           <div className="desktop-nav">
//                             <div className="nav-item active">
//                               <i className="fas fa-home"></i>
//                               <span>Tableau de bord</span>
//                             </div>
//                             <div className="nav-item">
//                               <i className="fas fa-calendar"></i>
//                               <span>Calendrier</span>
//                             </div>
//                             <div className="nav-item">
//                               <i className="fas fa-chart-bar"></i>
//                               <span>Rapports</span>
//                             </div>
//                           </div>
//                           <div className="desktop-user">
//                             <div className="desktop-avatar">JD</div>
//                             <span>John Doe</span>
//                             <i className="fas fa-chevron-down"></i>
//                           </div>
//                         </div>
                        
//                         <div className="desktop-content">
//                           <div className="desktop-dashboard">
//                             <div className="desktop-welcome">
//                               <h2>Bonjour Jean !</h2>
//                               <p>{todayLongLabel}</p>
//                             </div>
                            
//                             <div className="desktop-stats-grid">
//                               <div className="desktop-stat-card">
//                                 <div className="desktop-stat-icon">
//                                   <i className="fas fa-clock"></i>
//                                 </div>
//                                 <div className="desktop-stat-content">
//                                   <div className="desktop-stat-value">7h 42m</div>
//                                   <div className="desktop-stat-label">Temps travaillé</div>
//                                 </div>
//                               </div>
//                               <div className="desktop-stat-card">
//                                 <div className="desktop-stat-icon">
//                                   <i className="fas fa-calendar-check"></i>
//                                 </div>
//                                 <div className="desktop-stat-content">
//                                   <div className="desktop-stat-value">21</div>
//                                   <div className="desktop-stat-label">Jours ce mois</div>
//                                 </div>
//                               </div>
//                               <div className="desktop-stat-card">
//                                 <div className="desktop-stat-icon">
//                                   <i className="fas fa-trophy"></i>
//                                 </div>
//                                 <div className="desktop-stat-content">
//                                   <div className="desktop-stat-value">Excellent</div>
//                                   <div className="desktop-stat-label">Performance</div>
//                                 </div>
//                               </div>
//                             </div>
                            
//                             <div className="desktop-quick-actions">
//                               <h4>Actions rapides</h4>
//                               <div className="quick-buttons">
//                                 <button className="quick-btn primary">
//                                   <i className="fas fa-qrcode"></i>
//                                   Scanner QR Code
//                                 </button>
//                                 <button className="quick-btn secondary">
//                                   <i className="fas fa-coffee"></i>
//                                   Demander pause
//                                 </button>
//                                 <button className="quick-btn secondary">
//                                   <i className="fas fa-sign-out-alt"></i>
//                                   Pointer départ
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="device-label">Desktop</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Benefits Section */}
//       <section className="benefits-modern-section">
//         <div className="container">
//           <div className="section-header-modern">
//             <h2 className="section-title-modern">Pourquoi choisir Xpert Pro ?</h2>
//             <p className="section-subtitle-modern">Des avantages concrets pour votre entreprise</p>
//             <div className="title-decoration" />
//           </div>

//           <div className="benefits-grid">
//             {benefitsData.map((benefit, index) => (
//               <div key={index} className="benefit-item">
//                 <div className="benefit-icon">
//                   <i className={`fas ${benefit.icon}`}></i>
//                 </div>
//                 <h3 className="benefit-title">{benefit.title}</h3>
//                 <p className="benefit-description">{benefit.description}</p>
//                 <div className="benefit-value">{benefit.value}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Final CTA Section */}
//       <section className="cta-final-section">
//         <div className="cta-final-content">
//           <h2 className="cta-final-title">Prêt à transformer votre gestion ?</h2>
//           <p className="cta-final-subtitle">
//             Rejoignez des centaines d'entreprises qui font confiance à Xpert Pro 
//             pour une gestion des présences moderne et efficace.
//           </p>
//           <div className="cta-final-buttons">
//             <button 
//               onClick={() => navigate('/login?type=employee')} 
//               className="btn-cta-large btn-cta-primary"
//             >
//               <i className="fas fa-rocket"></i>
//               <span>Commencer Gratuitement</span>
//             </button>
//             <button 
//               onClick={() => navigate('/login?type=admin')} 
//               className="btn-cta-large btn-cta-secondary"
//             >
//               <i className="fas fa-play"></i>
//               <span>Voir la Démo</span>
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="footer-modern">
//         <div className="floating-elements">
//           <div className="floating-element"></div>
//           <div className="floating-element"></div>
//           <div className="floating-element"></div>
//           <div className="floating-element"></div>
//           <div className="floating-element"></div>
//         </div>
        
//         <div className="container">
//           <div className="footer-content">
//             <div className="footer-grid">
//               <div className="footer-column">
//                 <h4>Xpert Pro</h4>
//                 <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
//                   La solution de pointage intelligente pour les entreprises modernes.
//                   Simple, rapide et sécurisée.
//                 </p>
//                 <div className="footer-social">
//                   <a href="#" className="social-link">
//                     <i className="fab fa-facebook-f"></i>
//                   </a>
//                   <a href="#" className="social-link">
//                     <i className="fab fa-twitter"></i>
//                   </a>
//                   <a href="#" className="social-link">
//                     <i className="fab fa-linkedin-in"></i>
//                   </a>
//                   <a href="#" className="social-link">
//                     <i className="fab fa-instagram"></i>
//                   </a>
//                 </div>
//               </div>
              
//               <div className="footer-column">
//                 <h4>Produit</h4>
//                 <ul>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> Fonctionnalités</a></li>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> Tarifs</a></li>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> Integration</a></li>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> API</a></li>
//                 </ul>
//               </div>
              
//               <div className="footer-column">
//                 <h4>Solutions</h4>
//                 <ul>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> PME</a></li>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> Grandes Entreprises</a></li>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> Éducation</a></li>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> Santé</a></li>
//                 </ul>
//               </div>
              
//               <div className="footer-column">
//                 <h4>Support</h4>
//                 <ul>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> Documentation</a></li>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> Tutoriels</a></li>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> FAQ</a></li>
//                   <li><a href="#"><i className="fas fa-chevron-right"></i> Contact</a></li>
//                 </ul>
//               </div>
//             </div>
            
//             <div className="footer-bottom">
//               <p>&copy; 2024 Xpert Pro. Tous droits réservés. | 
//                 <a href="#">Mentions légales</a> | 
//                 <a href="#">Politique de confidentialité</a> | 
//                 <a href="#">CGU</a>
//               </p>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </main>
//   );
// }
