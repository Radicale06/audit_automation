import React from 'react';
import DOMPurify from 'dompurify';
import * as XLSX from 'xlsx';
import { marked } from 'marked';
import '../styles/markdown.css';

interface MessageRendererProps {
  text: string;
  sender: 'user' | 'bot';
}

// Global function to handle Excel downloads (attached to window)
declare global {
  interface Window {
    downloadExcel: (type: string) => void;
  }
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ text, sender }) => {
  // Ensure text is always a string
  const safeText = typeof text === 'string' ? text : String(text || '');
  React.useEffect(() => {
    // Attach the downloadExcel function to window for button clicks
    window.downloadExcel = (type: string) => {
      handleExcelDownload(type);
    };
  }, []);

  const handleExcelDownload = async (type: string) => {
    try {
      // Extract data from the current HTML table based on type
      const tableData = extractTableData(type);
      
      if (tableData.length === 0) {
        alert('Aucune donnée à exporter / No data to export');
        return;
      }

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(tableData);

      // Enable text wrapping for cells with line breaks
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (ws[cellAddress]) {
            ws[cellAddress].s = ws[cellAddress].s || {};
            ws[cellAddress].s.alignment = { 
              wrapText: true, 
              vertical: 'top',
              horizontal: 'left'
            };
            
            // Style the header row
            if (row === 0) {
              ws[cellAddress].s.font = { bold: true };
              ws[cellAddress].s.fill = { fgColor: { rgb: 'E9ECEF' } };
            }
            
            ws[cellAddress].s.border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            };
            
            // Set minimum row height for cells with line breaks
            if (ws[cellAddress].v && typeof ws[cellAddress].v === 'string' && ws[cellAddress].v.includes('\n')) {
              if (!ws['!rows']) ws['!rows'] = [];
              if (!ws['!rows'][row]) ws['!rows'][row] = {};
              ws['!rows'][row].hpt = Math.max(ws['!rows'][row].hpt || 20, 60); // Minimum 60pt height for multi-line cells
            }
          }
        }
      }

      // Set column widths
      ws['!cols'] = getColumnWidths(type);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, getSheetName(type));

      // Generate filename
      const date = new Date().toISOString().split('T')[0];
      const filename = `audit_${type}_${date}.xlsx`;

      // Download the file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Excel download error:', error);
      alert('Erreur lors du téléchargement / Download error');
    }
  };

  const extractTableData = (type: string): string[][] => {
    // Map type to actual CSS class names used in the templates
    const tableSelectors = {
      'scope': '.audit-scope-table',
      'checklist': '.audit-checklist-table', 
      'finding': '.audit-finding-table'
    };
    
    const selector = tableSelectors[type as keyof typeof tableSelectors];
    if (!selector) {
      console.error(`Unknown table type: ${type}`);
      return [];
    }
    
    const container = document.querySelector(selector);
    if (!container) {
      console.error(`No container found for selector: ${selector}`);
      return [];
    }

    const rows = container.querySelectorAll('tr');
    const data: string[][] = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll('th, td');
      const rowData: string[] = [];
      cells.forEach((cell) => {
        // Handle HTML content and line breaks for Excel
        let cellText = cell.textContent?.trim() || '';
        
        // Special handling for cells with bullet points and line breaks
        if (cell.innerHTML.includes('<br>')) {
          // Get the innerHTML and process it for Excel
          let htmlContent = cell.innerHTML;
          console.log('Original HTML:', htmlContent);
          
          // Handle the pattern: • text<br>• text<br>• text
          cellText = htmlContent
            // Replace <br> tags with actual newlines
            .replace(/<br\s*\/?>/gi, '\n')
            // Remove all HTML tags
            .replace(/<[^>]*>/g, '')
            // Clean up HTML entities
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
          
          console.log('Final processed text for Excel:', JSON.stringify(cellText));
        }
        
        rowData.push(cellText);
      });
      if (rowData.length > 0) {
        data.push(rowData);
      }
    });

    console.log(`Extracted ${data.length} rows for type: ${type}`, data);
    return data;
  };

  const getColumnWidths = (type: string) => {
    switch (type) {
      case 'scope':
        return [
          { width: 25 }, // Champ
          { width: 50 }  // Détail
        ];
      case 'checklist':
        return [
          { width: 12 }, // Control No.
          { width: 20 }, // Control
          { width: 30 }, // Description
          { width: 40 }  // Questions
        ];
      case 'finding':
        return [
          { width: 25 }, // Champ
          { width: 60 }  // Détail - increased width for multi-line recommendations
        ];
      default:
        return [{ width: 20 }];
    }
  };

  const getSheetName = (type: string) => {
    switch (type) {
      case 'scope':
        return 'Cadrage Mission';
      case 'checklist':
        return 'Checklist ISO27001';
      case 'finding':
        return 'Constat Audit';
      default:
        return 'Audit Data';
    }
  };

  // Function to detect if content is markdown-formatted
  const isMarkdownContent = (text: string): boolean => {
    // Look for markdown patterns like headers, bold text, lists, etc.
    const markdownPatterns = [
      /^#{1,6}\s/m,                      // Headers
      /^\*\*.*\*\*/m,                    // Bold text
      /^-\s/m,                           // Unordered lists  
      /^\d+\.\s/m,                       // Ordered lists
      /^\|\s/m,                          // Tables
      /^\>\s/m,                          // Blockquotes
      /\*\*[^*]+\*\*/,                   // Inline bold
      /#{1,6}\s[^#\n]+/,                 // Headers anywhere
      /# 📊/,                            // Specific synthesis header
      /---/                              // Horizontal rules
    ];
    
    return markdownPatterns.some(pattern => pattern.test(text)) && 
           !text.includes('<table') && 
           !text.includes('<div class="audit-table-container">');
  };

  // Function to convert markdown to HTML
  const markdownToHtml = (markdown: string): string => {
    try {
      // Configure marked options for better rendering
      marked.setOptions({
        breaks: true, // Convert single line breaks to <br>
        gfm: true,    // GitHub flavored markdown
      });
      
      return marked(markdown) as string;
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return markdown.replace(/\n/g, '<br>'); // Fallback: just convert newlines
    }
  };

  // Check if the text contains HTML table content
  const isHtmlContent = safeText.includes('<table') || safeText.includes('<div class="audit-table-container">');
  const isMarkdown = isMarkdownContent(safeText);
  
  // Debug logging
  console.log('MessageRenderer - Content type detection:', {
    isHtmlContent,
    isMarkdown,
    textLength: safeText.length,
    textPreview: safeText.substring(0, 100) + '...'
  });

  if (sender === 'bot' && isHtmlContent) {
    // Sanitize HTML content for safety
    const sanitizedHtml = DOMPurify.sanitize(safeText, {
      ADD_TAGS: ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'button', 'div', 'h3', 'h4'],
      ADD_ATTR: ['border', 'style', 'class', 'onclick']
    });

    return (
      <div 
        className="audit-message-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // Handle markdown content (like synthesis responses)
  if (sender === 'bot' && isMarkdown) {
    const htmlContent = markdownToHtml(safeText);
    const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
      ADD_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'hr', 'br', 'code', 'pre', 'input'],
      ADD_ATTR: ['type', 'checked', 'class']
    });

    return (
      <div 
        className="markdown-content max-w-none text-sm leading-relaxed"
        style={{
          fontFamily: 'Inter, sans-serif'
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // Regular text content
  return (
    <p className="text-sm leading-relaxed font-['Inter'] tracking-wide whitespace-pre-wrap">
      {safeText}
    </p>
  );
};

export default MessageRenderer;