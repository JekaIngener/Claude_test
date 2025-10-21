import React, { useRef, useState, useEffect } from 'react';
import './Canvas.css';

const Canvas = ({
  elements,
  selectedElement,
  setSelectedElement,
  updateElement,
  canvasSize,
  activeTool,
  addElement,
  setActiveTool
}) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [previewElement, setPreviewElement] = useState(null);
  const [snapLines, setSnapLines] = useState([]);

  // Snapping configuration
  const SNAP_THRESHOLD = 5; // pixels

  // SNAPPING FUNCTION - Findet nächste Snap-Punkte
  const findSnapPoints = (element, excludeId = null) => {
    const snapPoints = { x: null, y: null, lines: [] };
    const otherElements = elements.filter(el => el.id !== excludeId);

    const elementEdges = {
      left: element.x,
      right: element.x + element.width,
      centerX: element.x + element.width / 2,
      top: element.y,
      bottom: element.y + element.height,
      centerY: element.y + element.height / 2
    };

    otherElements.forEach(other => {
      if (other.type === 'line') return; // Skip lines for snapping

      const otherEdges = {
        left: other.x,
        right: other.x + other.width,
        centerX: other.x + other.width / 2,
        top: other.y,
        bottom: other.y + other.height,
        centerY: other.y + other.height / 2
      };

      // Check horizontal snapping
      ['left', 'right', 'centerX'].forEach(edge => {
        ['left', 'right', 'centerX'].forEach(otherEdge => {
          const diff = Math.abs(elementEdges[edge] - otherEdges[otherEdge]);
          if (diff < SNAP_THRESHOLD) {
            snapPoints.x = otherEdges[otherEdge] - (elementEdges[edge] - element.x);
            snapPoints.lines.push({
              type: 'vertical',
              position: otherEdges[otherEdge]
            });
          }
        });
      });

      // Check vertical snapping
      ['top', 'bottom', 'centerY'].forEach(edge => {
        ['top', 'bottom', 'centerY'].forEach(otherEdge => {
          const diff = Math.abs(elementEdges[edge] - otherEdges[otherEdge]);
          if (diff < SNAP_THRESHOLD) {
            snapPoints.y = otherEdges[otherEdge] - (elementEdges[edge] - element.y);
            snapPoints.lines.push({
              type: 'horizontal',
              position: otherEdges[otherEdge]
            });
          }
        });
      });
    });

    return snapPoints;
  };

  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on an element
    const clickedElement = [...elements].reverse().find(el => {
      if (el.type === 'line') {
        const dist = pointToLineDistance(x, y, el.x1, el.y1, el.x2, el.y2);
        return dist < 10;
      }
      return x >= el.x && x <= el.x + el.width &&
             y >= el.y && y <= el.y + el.height;
    });

    if (clickedElement) {
      setSelectedElement(clickedElement);
      setActiveTool(null);

      // Check for resize handles
      const handle = getResizeHandle(x, y, clickedElement);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        setDragStart({ x, y });
      } else if (isPointInElement(x, y, clickedElement)) {
        setIsDragging(true);
        setDragStart({
          x: x - clickedElement.x,
          y: y - clickedElement.y
        });
      }
    } else if (activeTool) {
      // Start drawing new element
      setIsDrawing(true);
      setDrawStart({ x, y });

      // Create preview element
      const preview = createPreviewElement(activeTool, x, y);
      setPreviewElement(preview);
    } else {
      setSelectedElement(null);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle drawing new element
    if (isDrawing && drawStart && previewElement) {
      updatePreviewElement(x, y);
    }

    // Handle dragging selected element
    if (isDragging && selectedElement) {
      let newX = Math.max(0, Math.min(x - dragStart.x, canvasSize.width - selectedElement.width));
      let newY = Math.max(0, Math.min(y - dragStart.y, canvasSize.height - selectedElement.height));

      // Apply snapping
      const snapTarget = {
        x: newX,
        y: newY,
        width: selectedElement.width,
        height: selectedElement.height
      };
      const snapPoints = findSnapPoints(snapTarget, selectedElement.id);

      if (snapPoints.x !== null) newX = snapPoints.x;
      if (snapPoints.y !== null) newY = snapPoints.y;
      setSnapLines(snapPoints.lines);

      if (selectedElement.type === 'line') {
        const deltaX = newX - selectedElement.x;
        const deltaY = newY - selectedElement.y;
        updateElement(selectedElement.id, {
          x: newX,
          y: newY,
          x1: selectedElement.x1 + deltaX,
          y1: selectedElement.y1 + deltaY,
          x2: selectedElement.x2 + deltaX,
          y2: selectedElement.y2 + deltaY
        });
      } else {
        updateElement(selectedElement.id, { x: newX, y: newY });
      }
    }

    // Handle resizing selected element
    if (isResizing && resizeHandle && selectedElement) {
      handleResize(x, y, selectedElement, resizeHandle);
    }
  };

  const handleCanvasMouseUp = () => {
    // Finish drawing
    if (isDrawing && previewElement && drawStart) {
      // Only add if element has minimum size
      if (previewElement.width > 10 && previewElement.height > 10) {
        const finalElement = { ...previewElement };
        delete finalElement.id; // Remove preview id
        addElement(finalElement);
      }
      setIsDrawing(false);
      setDrawStart(null);
      setPreviewElement(null);
      setActiveTool(null);
    }

    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setSnapLines([]);
  };

  const createPreviewElement = (tool, x, y) => {
    const baseElement = {
      id: 'preview',
      x: x,
      y: y,
      width: 0,
      height: 0,
      color: '#000000',
      opacity: 0.7
    };

    switch (tool) {
      case 'rectangle':
        return { ...baseElement, type: 'rectangle', borderWidth: 2, filled: false };
      case 'line':
        return {
          id: 'preview',
          type: 'line',
          x1: x,
          y1: y,
          x2: x,
          y2: y,
          thickness: 2,
          color: '#000000',
          opacity: 0.7,
          x: x,
          y: y,
          width: 0,
          height: 0
        };
      case 'text':
        return {
          ...baseElement,
          type: 'text',
          text: 'Text eingeben',
          fontSize: 16,
          bold: false,
          width: 100,
          height: 30
        };
      case 'textField':
        return {
          ...baseElement,
          type: 'textField',
          placeholder: 'Text eingeben...',
          multiline: false
        };
      case 'dateField':
        return {
          ...baseElement,
          type: 'dateField'
        };
      case 'dropdown':
        return {
          ...baseElement,
          type: 'dropdown',
          options: ['Option 1', 'Option 2', 'Option 3']
        };
      case 'checkbox':
        return {
          ...baseElement,
          type: 'checkbox',
          label: 'Checkbox',
          width: 20,
          height: 20
        };
      case 'radio':
        return {
          ...baseElement,
          type: 'radio',
          options: ['Option 1', 'Option 2']
        };
      default:
        return null;
    }
  };

  const updatePreviewElement = (currentX, currentY) => {
    if (!previewElement || !drawStart) return;

    const width = Math.abs(currentX - drawStart.x);
    const height = Math.abs(currentY - drawStart.y);
    const x = Math.min(currentX, drawStart.x);
    const y = Math.min(currentY, drawStart.y);

    if (previewElement.type === 'line') {
      setPreviewElement({
        ...previewElement,
        x1: drawStart.x,
        y1: drawStart.y,
        x2: currentX,
        y2: currentY,
        x: Math.min(drawStart.x, currentX),
        y: Math.min(drawStart.y, currentY),
        width: Math.abs(currentX - drawStart.x),
        height: Math.abs(currentY - drawStart.y)
      });
    } else {
      setPreviewElement({
        ...previewElement,
        x,
        y,
        width,
        height
      });
    }
  };

  const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getResizeHandle = (x, y, element) => {
    if (element.type === 'line') {
      // Check line endpoints
      if (Math.abs(x - element.x1) < 8 && Math.abs(y - element.y1) < 8) return 'start';
      if (Math.abs(x - element.x2) < 8 && Math.abs(y - element.y2) < 8) return 'end';
      return null;
    }

    const handleSize = 8;
    const handles = [
      { name: 'nw', x: element.x, y: element.y },
      { name: 'ne', x: element.x + element.width, y: element.y },
      { name: 'sw', x: element.x, y: element.y + element.height },
      { name: 'se', x: element.x + element.width, y: element.y + element.height },
      { name: 'n', x: element.x + element.width / 2, y: element.y },
      { name: 's', x: element.x + element.width / 2, y: element.y + element.height },
      { name: 'w', x: element.x, y: element.y + element.height / 2 },
      { name: 'e', x: element.x + element.width, y: element.y + element.height / 2 }
    ];

    for (const handle of handles) {
      if (Math.abs(x - handle.x) < handleSize && Math.abs(y - handle.y) < handleSize) {
        return handle.name;
      }
    }
    return null;
  };

  const isPointInElement = (x, y, element) => {
    if (element.type === 'line') {
      const dist = pointToLineDistance(x, y, element.x1, element.y1, element.x2, element.y2);
      return dist < 10;
    }
    return x >= element.x && x <= element.x + element.width &&
           y >= element.y && y <= element.y + element.height;
  };

  const handleResize = (x, y, element, handle) => {
    let newProps = {};

    if (element.type === 'line') {
      if (handle === 'start') {
        newProps = { x1: x, y1: y };
      } else if (handle === 'end') {
        newProps = { x2: x, y2: y };
      }
      // Update bounding box
      const newX = Math.min(newProps.x1 || element.x1, newProps.x2 || element.x2);
      const newY = Math.min(newProps.y1 || element.y1, newProps.y2 || element.y2);
      const newWidth = Math.abs((newProps.x2 || element.x2) - (newProps.x1 || element.x1));
      const newHeight = Math.abs((newProps.y2 || element.y2) - (newProps.y1 || element.y1));
      newProps = { ...newProps, x: newX, y: newY, width: newWidth, height: newHeight };
    } else {
      switch (handle) {
        case 'se':
          newProps = {
            width: Math.max(20, x - element.x),
            height: Math.max(20, y - element.y)
          };
          break;
        case 'sw':
          newProps = {
            x: Math.min(x, element.x + element.width - 20),
            width: Math.max(20, element.x + element.width - x),
            height: Math.max(20, y - element.y)
          };
          break;
        case 'ne':
          newProps = {
            y: Math.min(y, element.y + element.height - 20),
            width: Math.max(20, x - element.x),
            height: Math.max(20, element.y + element.height - y)
          };
          break;
        case 'nw':
          newProps = {
            x: Math.min(x, element.x + element.width - 20),
            y: Math.min(y, element.y + element.height - 20),
            width: Math.max(20, element.x + element.width - x),
            height: Math.max(20, element.y + element.height - y)
          };
          break;
        case 'e':
          newProps = { width: Math.max(20, x - element.x) };
          break;
        case 'w':
          newProps = {
            x: Math.min(x, element.x + element.width - 20),
            width: Math.max(20, element.x + element.width - x)
          };
          break;
        case 'n':
          newProps = {
            y: Math.min(y, element.y + element.height - 20),
            height: Math.max(20, element.y + element.height - y)
          };
          break;
        case 's':
          newProps = { height: Math.max(20, y - element.y) };
          break;
        default:
          break;
      }
    }

    updateElement(element.id, newProps);
  };

  useEffect(() => {
    const handleMouseMove = (e) => handleCanvasMouseMove(e);
    const handleMouseUp = () => handleCanvasMouseUp();

    if (isDragging || isResizing || isDrawing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isDrawing, selectedElement, dragStart, resizeHandle, drawStart, previewElement]);

  return (
    <div
      ref={canvasRef}
      className="canvas"
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        cursor: activeTool ? 'crosshair' : 'default'
      }}
      onMouseDown={handleCanvasMouseDown}
    >
      {/* Render all elements */}
      {elements.map((element) => (
        <CanvasElement
          key={element.id}
          element={element}
          isSelected={selectedElement?.id === element.id}
        />
      ))}

      {/* Render preview element */}
      {previewElement && (
        <CanvasElement
          element={previewElement}
          isSelected={false}
        />
      )}

      {/* Render snap lines */}
      {snapLines.map((line, index) => (
        <div
          key={index}
          className="snap-line"
          style={
            line.type === 'vertical'
              ? {
                  position: 'absolute',
                  left: line.position,
                  top: 0,
                  width: '1px',
                  height: '100%',
                  backgroundColor: '#00ff00',
                  pointerEvents: 'none',
                  zIndex: 1000
                }
              : {
                  position: 'absolute',
                  left: 0,
                  top: line.position,
                  width: '100%',
                  height: '1px',
                  backgroundColor: '#00ff00',
                  pointerEvents: 'none',
                  zIndex: 1000
                }
          }
        />
      ))}

      {/* Selection box */}
      {selectedElement && (
        <SelectionBox element={selectedElement} />
      )}
    </div>
  );
};

const CanvasElement = ({ element, isSelected }) => {
  const renderElement = () => {
    const style = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      pointerEvents: 'none'
    };

    switch (element.type) {
      case 'rectangle':
        return (
          <div
            style={{
              ...style,
              border: `${element.borderWidth || 2}px solid ${element.color}`,
              backgroundColor: element.filled ? element.color : 'transparent',
              opacity: element.opacity
            }}
          />
        );

      case 'line':
        const length = Math.sqrt(
          Math.pow(element.x2 - element.x1, 2) +
          Math.pow(element.y2 - element.y1, 2)
        );
        const angle = Math.atan2(element.y2 - element.y1, element.x2 - element.x1) * (180 / Math.PI);

        return (
          <div
            style={{
              position: 'absolute',
              left: element.x1,
              top: element.y1,
              width: length,
              height: element.thickness || 2,
              backgroundColor: element.color,
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 0',
              opacity: element.opacity,
              pointerEvents: 'none'
            }}
          />
        );

      case 'text':
        return (
          <div
            style={{
              ...style,
              color: element.color,
              fontSize: element.fontSize || 16,
              fontWeight: element.bold ? 'bold' : 'normal',
              opacity: element.opacity,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {element.text}
          </div>
        );

      case 'image':
        return (
          <img
            src={element.imageData}
            alt="Logo"
            style={{
              ...style,
              objectFit: 'contain',
              opacity: element.opacity
            }}
          />
        );

      case 'textField':
      case 'dateField':
        return (
          <div
            style={{
              ...style,
              border: `1px solid ${element.color}`,
              backgroundColor: '#f9f9f9',
              padding: '4px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              opacity: element.opacity
            }}
          >
            <span style={{ color: '#999' }}>
              {element.type === 'dateField' ? 'TT.MM.JJJJ' : (element.placeholder || 'Text...')}
            </span>
          </div>
        );

      case 'dropdown':
        return (
          <div
            style={{
              ...style,
              border: `1px solid ${element.color}`,
              backgroundColor: 'white',
              padding: '4px 8px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: element.opacity
            }}
          >
            <span>{element.options?.[0] || 'Auswählen...'}</span>
            <span>▼</span>
          </div>
        );

      case 'checkbox':
        return (
          <div style={{ position: 'absolute', left: element.x, top: element.y }}>
            <div
              style={{
                width: element.width || 20,
                height: element.height || 20,
                border: `2px solid ${element.color}`,
                backgroundColor: 'white',
                display: 'inline-block',
                opacity: element.opacity
              }}
            />
            {element.label && (
              <span
                style={{
                  marginLeft: '5px',
                  color: element.color,
                  fontSize: '14px'
                }}
              >
                {element.label}
              </span>
            )}
          </div>
        );

      case 'radio':
        return (
          <div style={{ position: 'absolute', left: element.x, top: element.y }}>
            {(element.options || []).map((option, index) => (
              <div key={index} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: 15,
                    height: 15,
                    border: `2px solid ${element.color}`,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    opacity: element.opacity
                  }}
                />
                <span style={{ marginLeft: '5px', color: element.color, fontSize: '14px' }}>
                  {option}
                </span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return renderElement();
};

const SelectionBox = ({ element }) => {
  if (element.type === 'line') {
    // For lines, show endpoint handles
    return (
      <>
        <div
          className="resize-handle"
          style={{
            left: element.x1 - 4,
            top: element.y1 - 4,
            width: 8,
            height: 8
          }}
        />
        <div
          className="resize-handle"
          style={{
            left: element.x2 - 4,
            top: element.y2 - 4,
            width: 8,
            height: 8
          }}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="selection-box"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height
        }}
      />
      {/* Resize handles */}
      {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((pos) => {
        let left = element.x;
        let top = element.y;

        if (pos.includes('e')) left = element.x + element.width;
        if (pos.includes('s')) top = element.y + element.height;
        if (pos.includes('w')) left = element.x;
        if (pos.includes('n')) top = element.y;
        if (pos.length === 1) {
          if (pos === 'n' || pos === 's') left = element.x + element.width / 2;
          if (pos === 'e' || pos === 'w') top = element.y + element.height / 2;
        }

        return (
          <div
            key={pos}
            className={`resize-handle handle-${pos}`}
            style={{
              left: left - 4,
              top: top - 4
            }}
          />
        );
      })}
    </>
  );
};

export default Canvas;
