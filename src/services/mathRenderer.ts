/**
 * Math Rendering Service
 * Handles proper rendering of mathematical expressions
 */

/**
 * Formats content with proper math rendering
 * @param content The content to format
 * @returns Formatted content with proper math rendering
 */
export const formatContent = (content: string): string => {
  if (!content) return '';

  try {
    // Fix any remaining MATH_PLACEHOLDER issues
    content = content.replace(/MATH_PLACEHOLDER_\d+/g, 'x');
    
    // Process block math expressions [MATH]...[/MATH]
    content = content.replace(/\[MATH\]([\s\S]*?)\[\/MATH\]/g, (match, math) => {
      return `<div class="math-block">\\[${math.trim()}\\]</div>`;
    });

    // Process inline math expressions $...$
    content = content.replace(/\$(.*?)\$/g, (match, math) => {
      // Skip if it's a currency symbol
      if (/^\s*\d+([,.]\d+)?\s*$/.test(math)) {
        return match;
      }
      return `<span class="math-inline">\\(${math.trim()}\\)</span>`;
    });

    // Process LaTeX-style block math expressions \[...\]
    content = content.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
      return `<div class="math-block">\\[${math.trim()}\\]</div>`;
    });

    // Process LaTeX-style inline math expressions \(...\)
    content = content.replace(/\\\(([\s\S]*?)\\\)/g, (match, math) => {
      return `<span class="math-inline">\\(${math.trim()}\\)</span>`;
    });

    return content;
  } catch (error) {
    console.error('Error formatting content:', error);
    return `<p>Error formatting content: ${error.message}</p>`;
  }
};

/**
 * Triggers math rendering on an element
 * @param element The element to render math in
 */
export const typeset = async (element: HTMLElement | null): Promise<void> => {
  if (!element) return;
  
  try {
    // Add a small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // First try KaTeX auto-render if available
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(element, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\[', right: '\\]', display: true},
            {left: '\\(', right: '\\)', display: false}
          ],
          throwOnError: false
        });
      } catch (e) {
        console.warn('KaTeX rendering error:', e);
      }
    }
    
    // Then try MathJax as a fallback
    if (window.MathJax) {
      // First, clear any existing math to prevent errors from persisting
      try {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([element]);
        }
      } catch (e) {
        console.warn('Error clearing MathJax:', e);
      }
      
      // Now typeset the element
      if (window.MathJax.typesetPromise) {
        await window.MathJax.typesetPromise([element]);
      } else if (window.MathJax.typeset) {
        window.MathJax.typeset([element]);
      }
    }
  } catch (error) {
    console.error('Math typesetting error:', error);
  }
};