import React, { useState } from 'react';
import './PropertiesPanel.css';
import { ChromePicker } from 'react-color';

const PropertiesPanel = ({ selectedElement, updateElement }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!selectedElement) {
    return (
      <div className="properties-panel">
        <h3 className="panel-title">Eigenschaften</h3>
        <div className="no-selection">
          <p>Kein Element ausgewählt</p>
          <p className="hint">Klicken Sie auf ein Element auf der Canvas, um dessen Eigenschaften zu bearbeiten.</p>
        </div>
      </div>
    );
  }

  const handleChange = (property, value) => {
    updateElement(selectedElement.id, { [property]: value });
  };

  const renderCommonProperties = () => (
    <>
      <div className="property-group">
        <label className="property-label">Position & Größe</label>
        <div className="property-row">
          <div className="property-input-group">
            <span className="input-label">X:</span>
            <input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) => handleChange('x', parseFloat(e.target.value) || 0)}
              className="property-input"
            />
          </div>
          <div className="property-input-group">
            <span className="input-label">Y:</span>
            <input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) => handleChange('y', parseFloat(e.target.value) || 0)}
              className="property-input"
            />
          </div>
        </div>
        {selectedElement.type !== 'line' && (
          <div className="property-row">
            <div className="property-input-group">
              <span className="input-label">Breite:</span>
              <input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => handleChange('width', parseFloat(e.target.value) || 1)}
                className="property-input"
                min="1"
              />
            </div>
            <div className="property-input-group">
              <span className="input-label">Höhe:</span>
              <input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => handleChange('height', parseFloat(e.target.value) || 1)}
                className="property-input"
                min="1"
              />
            </div>
          </div>
        )}
      </div>

      {selectedElement.color !== undefined && (
        <div className="property-group">
          <label className="property-label">Farbe</label>
          <div className="color-picker-container">
            <div
              className="color-preview"
              style={{ backgroundColor: selectedElement.color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            <input
              type="text"
              value={selectedElement.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="color-input"
              placeholder="#000000"
            />
          </div>
          {showColorPicker && (
            <div className="color-picker-popover">
              <div
                className="color-picker-cover"
                onClick={() => setShowColorPicker(false)}
              />
              <ChromePicker
                color={selectedElement.color}
                onChange={(color) => handleChange('color', color.hex)}
                disableAlpha={false}
              />
            </div>
          )}
        </div>
      )}

      {selectedElement.opacity !== undefined && (
        <div className="property-group">
          <label className="property-label">
            Deckkraft: {Math.round(selectedElement.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={selectedElement.opacity}
            onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
            className="property-slider"
          />
        </div>
      )}
    </>
  );

  const renderTypeSpecificProperties = () => {
    switch (selectedElement.type) {
      case 'rectangle':
        return (
          <>
            <div className="property-group">
              <label className="property-label">Rahmenstärke</label>
              <input
                type="number"
                value={selectedElement.borderWidth || 2}
                onChange={(e) => handleChange('borderWidth', parseInt(e.target.value) || 1)}
                className="property-input"
                min="1"
                max="20"
              />
            </div>
            <div className="property-group">
              <label className="property-checkbox">
                <input
                  type="checkbox"
                  checked={selectedElement.filled || false}
                  onChange={(e) => handleChange('filled', e.target.checked)}
                />
                <span>Gefüllt</span>
              </label>
            </div>
          </>
        );

      case 'line':
        return (
          <div className="property-group">
            <label className="property-label">Linienstärke</label>
            <input
              type="number"
              value={selectedElement.thickness || 2}
              onChange={(e) => handleChange('thickness', parseInt(e.target.value) || 1)}
              className="property-input"
              min="1"
              max="20"
            />
          </div>
        );

      case 'text':
        return (
          <>
            <div className="property-group">
              <label className="property-label">Text</label>
              <textarea
                value={selectedElement.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
                className="property-textarea"
                rows="3"
              />
            </div>
            <div className="property-group">
              <label className="property-label">Schriftgröße</label>
              <input
                type="number"
                value={selectedElement.fontSize || 16}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value) || 12)}
                className="property-input"
                min="8"
                max="72"
              />
            </div>
            <div className="property-group">
              <label className="property-checkbox">
                <input
                  type="checkbox"
                  checked={selectedElement.bold || false}
                  onChange={(e) => handleChange('bold', e.target.checked)}
                />
                <span>Fett</span>
              </label>
            </div>
          </>
        );

      case 'textField':
        return (
          <>
            <div className="property-group">
              <label className="property-label">Platzhalter</label>
              <input
                type="text"
                value={selectedElement.placeholder || ''}
                onChange={(e) => handleChange('placeholder', e.target.value)}
                className="property-input"
                placeholder="Text eingeben..."
              />
            </div>
            <div className="property-group">
              <label className="property-checkbox">
                <input
                  type="checkbox"
                  checked={selectedElement.multiline || false}
                  onChange={(e) => handleChange('multiline', e.target.checked)}
                />
                <span>Mehrzeilig</span>
              </label>
            </div>
          </>
        );

      case 'dropdown':
        return (
          <div className="property-group">
            <label className="property-label">Optionen (eine pro Zeile)</label>
            <textarea
              value={(selectedElement.options || []).join('\n')}
              onChange={(e) => handleChange('options', e.target.value.split('\n').filter(o => o.trim()))}
              className="property-textarea"
              rows="4"
              placeholder="Option 1&#10;Option 2&#10;Option 3"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="property-group">
            <label className="property-label">Beschriftung</label>
            <input
              type="text"
              value={selectedElement.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              className="property-input"
              placeholder="Checkbox Beschriftung"
            />
          </div>
        );

      case 'radio':
        return (
          <div className="property-group">
            <label className="property-label">Optionen (eine pro Zeile)</label>
            <textarea
              value={(selectedElement.options || []).join('\n')}
              onChange={(e) => handleChange('options', e.target.value.split('\n').filter(o => o.trim()))}
              className="property-textarea"
              rows="4"
              placeholder="Option 1&#10;Option 2"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getElementTypeName = (type) => {
    const names = {
      rectangle: 'Rechteck',
      line: 'Linie',
      text: 'Text',
      image: 'Logo',
      textField: 'Textfeld',
      dateField: 'Datumsfeld',
      dropdown: 'Dropdown',
      checkbox: 'Checkbox',
      radio: 'Radio Buttons'
    };
    return names[type] || type;
  };

  return (
    <div className="properties-panel">
      <h3 className="panel-title">Eigenschaften</h3>
      <div className="element-type-badge">
        {getElementTypeName(selectedElement.type)}
      </div>

      <div className="properties-content">
        {renderCommonProperties()}
        {renderTypeSpecificProperties()}
      </div>
    </div>
  );
};

export default PropertiesPanel;
