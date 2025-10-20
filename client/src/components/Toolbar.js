import React, { useState } from 'react';
import './Toolbar.css';
import {
  FaSquare,
  FaMinus,
  FaFont,
  FaImage,
  FaFileAlt,
  FaCalendar,
  FaCaretDown,
  FaCheckSquare,
  FaDotCircle
} from 'react-icons/fa';
import axios from 'axios';

const Toolbar = ({ activeTool, setActiveTool, addElement }) => {
  const [uploadError, setUploadError] = useState('');

  const tools = [
    { id: 'rectangle', name: 'Rechteck', icon: FaSquare, category: 'shape' },
    { id: 'line', name: 'Linie', icon: FaMinus, category: 'shape' },
    { id: 'text', name: 'Text', icon: FaFont, category: 'shape' },
    { id: 'image', name: 'Logo', icon: FaImage, category: 'shape' },
    { id: 'textField', name: 'Textfeld', icon: FaFileAlt, category: 'form' },
    { id: 'dateField', name: 'Datumsfeld', icon: FaCalendar, category: 'form' },
    { id: 'dropdown', name: 'Dropdown', icon: FaCaretDown, category: 'form' },
    { id: 'checkbox', name: 'Checkbox', icon: FaCheckSquare, category: 'form' },
    { id: 'radio', name: 'Radio', icon: FaDotCircle, category: 'form' }
  ];

  const handleToolClick = (toolId) => {
    if (toolId === 'image') {
      // Trigger file upload
      document.getElementById('image-upload').click();
    } else {
      setActiveTool(activeTool === toolId ? null : toolId);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');

    // Validate file type
    if (!['image/png', 'image/svg+xml'].includes(file.type)) {
      setUploadError('Nur PNG und SVG Dateien sind erlaubt');
      return;
    }

    // Validate file size (500KB - 1MB)
    const sizeInKB = file.size / 1024;
    if (sizeInKB < 500 || sizeInKB > 1000) {
      setUploadError('Dateigröße muss zwischen 500 KB und 1000 KB liegen');
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;

        // Create image element to get dimensions
        const img = new Image();
        img.onload = () => {
          addElement({
            type: 'image',
            x: 100,
            y: 100,
            width: Math.min(img.width, 200),
            height: Math.min(img.height, 200),
            imageData: imageData,
            opacity: 1
          });
        };
        img.src = imageData;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadError('Fehler beim Hochladen: ' + error.message);
    }

    // Reset input
    e.target.value = '';
  };

  const shapeTools = tools.filter(t => t.category === 'shape');
  const formTools = tools.filter(t => t.category === 'form');

  return (
    <div className="toolbar">
      <h3 className="toolbar-title">Werkzeuge</h3>

      <div className="toolbar-section">
        <h4 className="toolbar-section-title">Formen & Elemente</h4>
        <div className="tool-grid">
          {shapeTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => handleToolClick(tool.id)}
                title={tool.name}
              >
                <Icon className="tool-icon" />
                <span className="tool-name">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="toolbar-section">
        <h4 className="toolbar-section-title">Formularfelder</h4>
        <div className="tool-grid">
          {formTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => handleToolClick(tool.id)}
                title={tool.name}
              >
                <Icon className="tool-icon" />
                <span className="tool-name">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <input
        id="image-upload"
        type="file"
        accept="image/png,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {uploadError && (
        <div className="upload-error">
          {uploadError}
        </div>
      )}

      <div className="toolbar-info">
        <p><strong>Tipp:</strong> Klicken Sie auf ein Werkzeug und dann auf die Canvas, um ein Element hinzuzufügen.</p>
      </div>
    </div>
  );
};

export default Toolbar;
