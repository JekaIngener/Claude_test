import React, { useState } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import LayerPanel from './components/LayerPanel';
import TemplatePanel from './components/TemplatePanel';
import axios from 'axios';

function App() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 595, height: 842 }); // A4 default
  const [activeTool, setActiveTool] = useState(null);
  const [nextZIndex, setNextZIndex] = useState(1);

  const addElement = (element) => {
    const newElement = {
      ...element,
      id: `element_${Date.now()}_${Math.random()}`,
      zIndex: nextZIndex
    };
    setElements([...elements, newElement]);
    setNextZIndex(nextZIndex + 1);
    setSelectedElement(newElement);
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ));
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
  };

  const duplicateElement = (id) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `element_${Date.now()}_${Math.random()}`,
        x: element.x + 20,
        y: element.y + 20,
        zIndex: nextZIndex
      };
      setElements([...elements, newElement]);
      setNextZIndex(nextZIndex + 1);
      setSelectedElement(newElement);
    }
  };

  const moveLayer = (id, direction) => {
    const index = elements.findIndex(el => el.id === id);
    if (index === -1) return;

    const newElements = [...elements];
    if (direction === 'up' && index < elements.length - 1) {
      [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
    } else if (direction === 'down' && index > 0) {
      [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
    } else if (direction === 'top') {
      const element = newElements.splice(index, 1)[0];
      newElements.push(element);
    } else if (direction === 'bottom') {
      const element = newElements.splice(index, 1)[0];
      newElements.unshift(element);
    }

    setElements(newElements);
  };

  const exportPDF = async () => {
    try {
      const response = await axios.post('/api/pdf/generate', {
        elements,
        pageWidth: canvasSize.width,
        pageHeight: canvasSize.height
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'stempel.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF Export Fehler:', error);
      alert('Fehler beim Exportieren der PDF: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>PDF Stempel Designer</h1>
        <div className="header-actions">
          <button onClick={exportPDF} className="btn-primary">
            PDF Exportieren
          </button>
        </div>
      </header>

      <div className="app-content">
        <div className="left-panel">
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            addElement={addElement}
          />
          <TemplatePanel />
        </div>

        <div className="canvas-container">
          <div className="canvas-controls">
            <label>
              Breite:
              <input
                type="number"
                value={canvasSize.width}
                onChange={(e) => setCanvasSize({ ...canvasSize, width: parseInt(e.target.value) })}
                min="100"
                max="2000"
              />
              px
            </label>
            <label>
              Höhe:
              <input
                type="number"
                value={canvasSize.height}
                onChange={(e) => setCanvasSize({ ...canvasSize, height: parseInt(e.target.value) })}
                min="100"
                max="2000"
              />
              px
            </label>
          </div>

          <Canvas
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            updateElement={updateElement}
            canvasSize={canvasSize}
            activeTool={activeTool}
            addElement={addElement}
            setActiveTool={setActiveTool}
          />
        </div>

        <div className="right-panel">
          <PropertiesPanel
            selectedElement={selectedElement}
            updateElement={updateElement}
          />
          <LayerPanel
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            deleteElement={deleteElement}
            duplicateElement={duplicateElement}
            moveLayer={moveLayer}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
