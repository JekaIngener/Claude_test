import React from 'react';
import './TemplatePanel.css';
import { FaClock, FaStar } from 'react-icons/fa';

const TemplatePanel = () => {
  return (
    <div className="template-panel">
      <h3 className="panel-title">Vorlagen</h3>

      <div className="coming-soon-container">
        <div className="coming-soon-icon">
          <FaClock />
        </div>
        <h4 className="coming-soon-title">Kommt demnächst!</h4>
        <p className="coming-soon-text">
          Hier werden Sie bald vorgefertigte Stempel-Vorlagen finden können.
        </p>

        <div className="template-preview-grid">
          <div className="template-preview-placeholder">
            <FaStar className="preview-icon" />
            <span>Vorlage 1</span>
          </div>
          <div className="template-preview-placeholder">
            <FaStar className="preview-icon" />
            <span>Vorlage 2</span>
          </div>
          <div className="template-preview-placeholder">
            <FaStar className="preview-icon" />
            <span>Vorlage 3</span>
          </div>
        </div>

        <div className="feature-list">
          <h5>Geplante Features:</h5>
          <ul>
            <li>Vorgefertigte Stempel-Designs</li>
            <li>Branchen-spezifische Vorlagen</li>
            <li>Eigene Vorlagen speichern</li>
            <li>Vorlagen teilen</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TemplatePanel;
