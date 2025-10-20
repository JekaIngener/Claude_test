const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
};

exports.generatePDF = async (req, res) => {
  try {
    const { elements, pageWidth, pageHeight } = req.body;

    if (!elements || !pageWidth || !pageHeight) {
      return res.status(400).json({
        error: 'Fehlende Parameter: elements, pageWidth, pageHeight'
      });
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Load standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Get form for interactive fields
    const form = pdfDoc.getForm();

    // Sort elements by zIndex to maintain layer order
    const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // Draw each element
    for (const element of sortedElements) {
      const color = hexToRgb(element.color || '#000000');
      const rgbColor = rgb(color.r, color.g, color.b);

      // Convert coordinates (canvas uses top-left origin, PDF uses bottom-left)
      const pdfY = pageHeight - element.y - element.height;

      switch (element.type) {
        case 'rectangle':
          page.drawRectangle({
            x: element.x,
            y: pdfY,
            width: element.width,
            height: element.height,
            borderColor: rgbColor,
            borderWidth: element.borderWidth || 2,
            color: element.filled ? rgbColor : undefined,
            opacity: element.opacity || 1
          });
          break;

        case 'line':
          const lineY1 = pageHeight - element.y1;
          const lineY2 = pageHeight - element.y2;
          page.drawLine({
            start: { x: element.x1, y: lineY1 },
            end: { x: element.x2, y: lineY2 },
            thickness: element.thickness || 2,
            color: rgbColor,
            opacity: element.opacity || 1
          });
          break;

        case 'text':
          const fontSize = element.fontSize || 12;
          page.drawText(element.text || '', {
            x: element.x,
            y: pdfY + element.height - fontSize,
            size: fontSize,
            font: element.bold ? boldFont : font,
            color: rgbColor,
            opacity: element.opacity || 1
          });
          break;

        case 'image':
          if (element.imageData) {
            try {
              let image;
              if (element.imageData.startsWith('data:image/png')) {
                const imageBytes = Buffer.from(
                  element.imageData.split(',')[1],
                  'base64'
                );
                image = await pdfDoc.embedPng(imageBytes);
              } else if (element.imageData.startsWith('data:image/svg')) {
                // For SVG, we'd need to convert it first
                // For now, skip SVG in PDF
                console.warn('SVG images not yet supported in PDF export');
                continue;
              }

              if (image) {
                page.drawImage(image, {
                  x: element.x,
                  y: pdfY,
                  width: element.width,
                  height: element.height,
                  opacity: element.opacity || 1
                });
              }
            } catch (imgError) {
              console.error('Image embedding error:', imgError);
            }
          }
          break;

        // Form fields
        case 'textField':
          const textField = form.createTextField(element.id || `textField_${Date.now()}`);
          textField.setText('');
          textField.addToPage(page, {
            x: element.x,
            y: pdfY,
            width: element.width,
            height: element.height,
            borderColor: rgbColor,
            borderWidth: 1
          });
          if (element.placeholder) {
            textField.setAlignment(0); // Left align
          }
          if (element.multiline) {
            textField.enableMultiline();
          }
          break;

        case 'dateField':
          const dateField = form.createTextField(element.id || `dateField_${Date.now()}`);
          dateField.setText('');
          dateField.addToPage(page, {
            x: element.x,
            y: pdfY,
            width: element.width,
            height: element.height,
            borderColor: rgbColor,
            borderWidth: 1
          });
          break;

        case 'dropdown':
          const dropdown = form.createDropdown(element.id || `dropdown_${Date.now()}`);
          const options = element.options || ['Option 1', 'Option 2', 'Option 3'];
          dropdown.addOptions(options);
          dropdown.addToPage(page, {
            x: element.x,
            y: pdfY,
            width: element.width,
            height: element.height,
            borderColor: rgbColor,
            borderWidth: 1
          });
          break;

        case 'checkbox':
          const checkbox = form.createCheckBox(element.id || `checkbox_${Date.now()}`);
          checkbox.addToPage(page, {
            x: element.x,
            y: pdfY,
            width: element.width || 20,
            height: element.height || 20,
            borderColor: rgbColor,
            borderWidth: 1
          });
          if (element.label) {
            page.drawText(element.label, {
              x: element.x + (element.width || 20) + 5,
              y: pdfY + 5,
              size: 12,
              font: font,
              color: rgbColor
            });
          }
          break;

        case 'radio':
          const radioGroup = form.createRadioGroup(element.id || `radio_${Date.now()}`);
          const radioOptions = element.options || ['Option 1', 'Option 2'];
          radioOptions.forEach((option, index) => {
            const radioY = pdfY - (index * 25);
            radioGroup.addOptionToPage(option, page, {
              x: element.x,
              y: radioY,
              width: 15,
              height: 15,
              borderColor: rgbColor,
              borderWidth: 1
            });
            page.drawText(option, {
              x: element.x + 20,
              y: radioY + 2,
              size: 12,
              font: font,
              color: rgbColor
            });
          });
          break;
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Send PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=stempel.pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: error.message });
  }
};
