import katex from 'katex';

/**
 * Comprehensive math rendering service
 * Handles rendering of mathematical expressions using KaTeX and MathJax
 */

/**
 * Renders a LaTeX expression using KaTeX with fallback to MathJax
 * @param tex The LaTeX expression to render
 * @param isBlock Whether to render as a block or inline
 * @returns HTML string with rendered math
 */
export const renderMath = (tex: string, isBlock: boolean = false): string => {
  if (!tex || tex.trim() === '') {
    return '<span class="math-error">[Empty math expression]</span>';
  }

  try {
    // Clean up the TeX string
    tex = cleanTeXString(tex);
    
    // Try to render with KaTeX
    const html = katex.renderToString(tex, {
      displayMode: isBlock,
      throwOnError: false,
      errorColor: '#f44336',
      strict: false,
      trust: true,
      macros: {
        // Common macros
        '\\R': '\\mathbb{R}',
        '\\N': '\\mathbb{N}',
        '\\Z': '\\mathbb{Z}',
        '\\Q': '\\mathbb{Q}',
        '\\C': '\\mathbb{C}',
        '\\degree': '^{\\circ}',
        '\\vec': '\\boldsymbol',
      }
    });

    return isBlock 
      ? `<div class="katex-display">${html}</div>` 
      : `<span class="katex-inline">${html}</span>`;
  } catch (error) {
    console.error('Error rendering math with KaTeX:', error);
    
    // Fallback to MathJax format
    return isBlock
      ? `<div class="math-block">\\[${tex}\\]</div>`
      : `<span class="math-inline">\\(${tex}\\)</span>`;
  }
};

/**
 * Cleans a TeX string to fix common issues
 * @param tex The TeX string to clean
 * @returns Cleaned TeX string
 */
function cleanTeXString(tex: string): string {
  // Remove any HTML tags
  tex = tex.replace(/<[^>]*>/g, '');
  
  // Fix common LaTeX issues
  tex = tex
    // Ensure proper spacing around operators
    .replace(/([0-9])([a-zA-Z])/g, '$1 $2')
    
    // Fix missing backslashes in common functions
    .replace(/([^\\])(sin|cos|tan|log|ln|lim|max|min|sup|inf|det|gcd|lcm)([^a-zA-Z])/g, '$1\\$2$3')
    
    // Fix missing backslashes in fractions
    .replace(/([^\\])frac\{/g, '$1\\frac{')
    
    // Fix missing backslashes in square roots
    .replace(/([^\\])sqrt\{/g, '$1\\sqrt{')
    
    // Fix missing backslashes in common symbols
    .replace(/([^\\])(alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega)/gi, '$1\\$2')
    
    // Fix missing backslashes in common operators
    .replace(/([^\\])(sum|prod|int|oint|partial|nabla|infty|pm|mp|times|div|cdot|circ|bullet|oplus|otimes)/g, '$1\\$2')
    
    // Fix missing braces in superscripts and subscripts
    .replace(/([_^])([0-9a-zA-Z])/g, '$1{$2}')
    
    // Fix missing backslashes in text mode
    .replace(/([^\\])text\{/g, '$1\\text{')
    
    // Fix missing backslashes in mathbb
    .replace(/([^\\])mathbb\{/g, '$1\\mathbb{')
    
    // Fix missing backslashes in mathcal
    .replace(/([^\\])mathcal\{/g, '$1\\mathcal{')
    
    // Fix missing backslashes in mathfrak
    .replace(/([^\\])mathfrak\{/g, '$1\\mathfrak{')
    
    // Fix missing backslashes in mathrm
    .replace(/([^\\])mathrm\{/g, '$1\\mathrm{');
  
  return tex;
}

/**
 * Formats content with proper math rendering
 * @param content The content to format
 * @returns Formatted content with proper math rendering
 */
export const formatContent = (content: string): string => {
  if (!content) return '';

  try {
    // Process block math expressions [MATH]...[/MATH]
    content = content.replace(/\[MATH\]([\s\S]*?)\[\/MATH\]/g, (match, math) => {
      return renderMath(math.trim(), true);
    });

    // Process inline math expressions $...$
    content = content.replace(/\$(.*?)\$/g, (match, math) => {
      // Skip if it's a currency symbol
      if (/^\s*\d+([,.]\d+)?\s*$/.test(math)) {
        return match;
      }
      return renderMath(math.trim(), false);
    });

    // Process LaTeX-style block math expressions \[...\]
    content = content.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
      return renderMath(math.trim(), true);
    });

    // Process LaTeX-style inline math expressions \(...\)
    content = content.replace(/\\\(([\s\S]*?)\\\)/g, (match, math) => {
      return renderMath(math.trim(), false);
    });

    // Process chemical equations
    content = content.replace(/\[CHEM\]([\s\S]*?)\[\/CHEM\]/g, (match, equation) => {
      return formatChemicalEquation(equation.trim());
    });

    // Process note blocks
    content = content.replace(/:::(important|tip|example|warning|steps|definition)([\s\S]*?):::/g, (_, type, text) => {
      return formatNoteBlock(type as NoteBlockType, text.trim());
    });

    // Process key points
    content = content.replace(/Key Point:([^\n]+)/g, (match, point) => {
      return formatNoteBlock('important', point.trim(), 'Key Point');
    });

    // Process tables
    content = content.replace(/\[TABLE\]([\s\S]*?)\[\/TABLE\]/g, (match, tableContent) => {
      return formatTable(tableContent.trim());
    });

    // Process code blocks
    content = content.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, language, code) => {
      return `<pre class="code-block ${language}">${code.trim()}</pre>`;
    });

    // Process other formatting
    content = content
      // Headers
      .replace(/### (.*?)$/gm, '<h3 class="text-lg font-semibold text-gray-900 dark:text-white my-3">$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-xl font-semibold text-gray-900 dark:text-white my-4">$1</h2>')
      .replace(/# (.*?)$/gm, '<h1 class="text-2xl font-bold text-gray-900 dark:text-white my-5">$1</h1>')
      
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
      
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Highlight with different colors
      .replace(/==(.*?)==/g, '<mark class="highlight yellow">$1</mark>')
      .replace(/\^\^(.*?)\^\^/g, '<mark class="highlight blue">$1</mark>')
      .replace(/!!(.*?)!!/g, '<mark class="highlight red">$1</mark>')
      .replace(/@(.*?)@/g, '<mark class="highlight green">$1</mark>')
      .replace(/\+\+(.*?)\+\+/g, '<mark class="highlight purple">$1</mark>')
      
      // Underline
      .replace(/__(.*?)__/g, '<span class="border-b-2 border-blue-400 dark:border-blue-500">$1</span>')
      
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<span class="line-through">$1</span>')
      
      // Superscript and subscript
      .replace(/\^([^\s^]+)\^/g, '<sup>$1</sup>')
      .replace(/~([^\s~]+)~/g, '<sub>$1</sub>');

    // Convert plain text paragraphs to proper HTML paragraphs
    content = content.replace(/(?:\r\n|\r|\n){2,}/g, '</p><p>');
    if (!content.startsWith('<')) {
      content = '<p>' + content;
    }
    if (!content.endsWith('>')) {
      content += '</p>';
    }

    return content;
  } catch (error) {
    console.error('Error formatting content:', error);
    return `<p>Error formatting content: ${error.message}</p>`;
  }
};

/**
 * Formats a chemical equation
 * @param equation The chemical equation string
 * @returns Formatted HTML for the chemical equation
 */
function formatChemicalEquation(equation: string): string {
  // Replace arrow with proper HTML arrow
  equation = equation.replace(/<?->|→|⟶|⇒|⇌|⇋|⇄|⇆/g, ' → ');
  
  // Add proper subscripts for numbers
  equation = equation.replace(/([A-Za-z])(\d+)/g, '$1<sub>$2</sub>');
  
  // Add proper superscripts for charges
  equation = equation.replace(/([A-Za-z\)])(\d*[\+\-])/g, '$1<sup>$2</sup>');
  
  // Format state symbols (g), (l), (s), (aq)
  equation = equation.replace(/\((g|l|s|aq)\)/g, '<sub>($1)</sub>');
  
  // Format heat/catalyst indicators
  equation = equation.replace(/(Δ|heat|catalyst|cat\.|[\d]+°C)/gi, '<span class="text-red-600 dark:text-red-400">$1</span>');
  
  return `<div class="chemical-equation">${equation}</div>`;
}

/**
 * Formats a table
 * @param tableContent The table content in markdown format
 * @returns Formatted HTML table
 */
function formatTable(tableContent: string): string {
  const lines = tableContent.trim().split('\n');
  if (lines.length < 2) return `<div class="math-error">Invalid table format</div>`;
  
  const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
  const hasHeaders = lines[1].includes('-');
  
  let html = '<table class="math-table">';
  
  // Add headers if present
  if (hasHeaders) {
    html += '<thead><tr>';
    for (const header of headers) {
      html += `<th>${header}</th>`;
    }
    html += '</tr></thead>';
    
    // Start from line 2 (skip header and separator)
    lines.splice(0, 2);
  } else {
    // No headers, just use the first row as data
    lines.splice(0, 1);
  }
  
  // Add body
  html += '<tbody>';
  for (const line of lines) {
    const cells = line.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length === 0) continue;
    
    html += '<tr>';
    for (const cell of cells) {
      html += `<td>${cell}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  
  return html;
}

// Note block types
type NoteBlockType = 'important' | 'tip' | 'example' | 'warning' | 'steps' | 'definition';

/**
 * Formats a note block
 * @param type The type of note block
 * @param content The content of the note block
 * @param customTitle Optional custom title for the note block
 * @returns Formatted HTML for the note block
 */
function formatNoteBlock(type: NoteBlockType, content: string, customTitle?: string): string {
  const icons: Record<NoteBlockType, string> = {
    important: '🔑',
    tip: '💡',
    example: '📝',
    warning: '⚠️',
    steps: '📋',
    definition: '📚'
  };
  
  const titles: Record<NoteBlockType, string> = {
    important: 'Key Concept',
    tip: 'Helpful Tip',
    example: 'Example',
    warning: 'Warning',
    steps: 'Step-by-Step',
    definition: 'Definition'
  };
  
  const title = customTitle || titles[type];
  
  return `
    <div class="note-block ${type}">
      <div class="note-block-header text-gray-800 dark:text-gray-200">
        <span class="text-xl">${icons[type]}</span>
        <span>${title}</span>
      </div>
      <div class="note-block-content text-gray-700 dark:text-gray-300">
        ${content}
      </div>
    </div>
  `.trim();
}

/**
 * Triggers math rendering on an element
 * @param element The element to render math in
 */
export const renderMathInElement = async (element: HTMLElement | null): Promise<void> => {
  if (!element) return;
  
  try {
    // First try KaTeX auto-render
    if (window.renderMathInElement) {
      window.renderMathInElement(element, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\[', right: '\\]', display: true},
          {left: '\\(', right: '\\)', display: false}
        ],
        throwOnError: false,
        errorColor: '#f44336',
        strict: false,
        trust: true
      });
    }
    
    // Then try MathJax as a fallback
    if (window.MathJax) {
      try {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([element]);
        }
      } catch (e) {
        console.warn('Error clearing MathJax:', e);
      }
      
      if (window.MathJax.typesetPromise) {
        await window.MathJax.typesetPromise([element]);
      } else if (window.MathJax.typeset) {
        window.MathJax.typeset([element]);
      }
    }
  } catch (error) {
    console.error('Error rendering math in element:', error);
  }
};

/**
 * Formats scientific notation
 * @param base The base number
 * @param exponent The exponent
 * @returns Formatted HTML for scientific notation
 */
export const formatScientificNotation = (base: number, exponent: number): string => {
  return `<span class="scientific-notation">
    <span class="base">${base}</span>
    <span class="exponent">${exponent}</span>
  </span>`;
};