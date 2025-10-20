import React from 'react';
import './LayerPanel.css';
import {
  FaTrash,
  FaCopy,
  FaArrowUp,
  FaArrowDown,
  FaAngleDoubleUp,
  FaAngleDoubleDown
} from 'react-icons/fa';

const LayerPanel = ({
  elements,
  selectedElement,
  setSelectedElement,
  deleteElement,
  duplicateElement,
  moveLayer
}) => {
  const getElementIcon = (type) => {
    const icons = {
      rectangle: '▭',
      line: '─',
      text: 'T',
      image: '🖼',
      textField: '📝',
      dateField: '📅',
      dropdown: '▼',
      checkbox: '☐',
      radio: '◯'
    };
    return icons[type] || '?';
  };

  const getElementName = (element, index) => {
    const typeNames = {
      rectangle: 'Rechteck',
      line: 'Linie',
      text: 'Text',
      image: 'Logo',
      textField: 'Textfeld',
      dateField: 'Datumsfeld',
      dropdown: 'Dropdown',
      checkbox: 'Checkbox',
      radio: 'Radio'
    };

    const baseName = typeNames[element.type] || element.type;

    // Add some context if available
    if (element.type === 'text' && element.text) {
      const preview = element.text.substring(0, 15);
      return `${baseName}: "${preview}${element.text.length > 15 ? '...' : ''}"`;
    }

    return `${baseName} ${index + 1}`;
  };

  // Reverse to show top layer first
  const reversedElements = [...elements].reverse();

  return (
    <div className="layer-panel">
      <h3 className="panel-title">Ebenen</h3>

      {elements.length === 0 ? (
        <div className="no-layers">
          <p>Keine Ebenen vorhanden</p>
          <p className="hint">Fügen Sie Elemente mit den Werkzeugen hinzu.</p>
        </div>
      ) : (
        <div className="layers-list">
          {reversedElements.map((element, reversedIndex) => {
            const actualIndex = elements.length - 1 - reversedIndex;
            const isSelected = selectedElement?.id === element.id;

            return (
              <div
                key={element.id}
                className={`layer-item ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedElement(element)}
              >
                <div className="layer-info">
                  <span className="layer-icon">{getElementIcon(element.type)}</span>
                  <span className="layer-name">{getElementName(element, actualIndex)}</span>
                </div>

                <div className="layer-actions">
                  <button
                    className="layer-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(element.id, 'top');
                    }}
                    title="Nach ganz oben"
                  >
                    <FaAngleDoubleUp />
                  </button>
                  <button
                    className="layer-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(element.id, 'up');
                    }}
                    title="Nach oben"
                    disabled={reversedIndex === 0}
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    className="layer-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(element.id, 'down');
                    }}
                    title="Nach unten"
                    disabled={reversedIndex === reversedElements.length - 1}
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    className="layer-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(element.id, 'bottom');
                    }}
                    title="Nach ganz unten"
                  >
                    <FaAngleDoubleDown />
                  </button>
                  <button
                    className="layer-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateElement(element.id);
                    }}
                    title="Duplizieren"
                  >
                    <FaCopy />
                  </button>
                  <button
                    className="layer-action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Ebene wirklich löschen?')) {
                        deleteElement(element.id);
                      }
                    }}
                    title="Löschen"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="layer-info-box">
        <p><strong>Tipp:</strong> Klicken Sie auf eine Ebene, um sie auszuwählen. Verwenden Sie die Pfeile, um die Reihenfolge zu ändern.</p>
      </div>
    </div>
  );
};

export default LayerPanel;
