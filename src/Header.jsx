import React, { useState } from 'react';
import logo from './assets/logo.png';
import './Header.css';

const dropdowns = {
  'Como ajudar': [
    'Vaquinhas',
    'Causas',
    'ONGs'
  ],
  'Descubra': [
    'Mais amadas',
    'Soluções para ONGs',
    'Eventos do Vakinha',
    'Blog'
  ],
  'Como funciona': [
    'O Vakinha',
    'Corações do Vakinha',
    'Vakinha Premiada',
    'Segurança e Transparência',
    'Equipes'
  ]
};

function Header() {
  const [open, setOpen] = useState('');

  const handleDropdown = (name) => {
    setOpen(open === name ? '' : name);
  };

  return (
    <header className="vakinha-header">
      <div className="vakinha-header-inner">
        <img src={logo} alt="Vakinha" className="vakinha-header-logo" />
        
        <nav className="vakinha-header-nav">
          <div className="vakinha-header-menu">
            <div className="vakinha-header-item">
              <span onClick={() => handleDropdown('Como ajudar')} className="vakinha-header-link">Como ajudar <span className="vakinha-header-arrow">▼</span></span>
              {open === 'Como ajudar' && (
                <div className="vakinha-header-dropdown">
                  {dropdowns['Como ajudar'].map(opt => (
                    <div className="vakinha-header-dropdown-item" key={opt}>{opt}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="vakinha-header-item">
              <span onClick={() => handleDropdown('Descubra')} className="vakinha-header-link">Descubra <span className="vakinha-header-arrow">▼</span></span>
              {open === 'Descubra' && (
                <div className="vakinha-header-dropdown">
                  {dropdowns['Descubra'].map(opt => (
                    <div className="vakinha-header-dropdown-item" key={opt}>{opt}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="vakinha-header-item">
              <span onClick={() => handleDropdown('Como funciona')} className="vakinha-header-link">Como funciona <span className="vakinha-header-arrow">▼</span></span>
              {open === 'Como funciona' && (
                <div className="vakinha-header-dropdown">
                  {dropdowns['Como funciona'].map(opt => (
                    <div className="vakinha-header-dropdown-item" key={opt}>{opt}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>
        <div className="vakinha-header-actions">
          <span className="vakinha-header-account">Minha conta</span>
          <button className="vakinha-header-btn">Faz uma vaquinha!</button>
        </div>
      </div>
    </header>
  );
}

export default Header;
