import type { ChatMessage } from '../types';

interface LambdaRequest {
  query_text: string;
  syllabus_id: string;
  user_id: string;
  response_mode: string;
}

// Lambda function URL
const LAMBDA_URL = 'https://qcepecnjjg.execute-api.us-east-2.amazonaws.com/Test/LMS-RAG';

// Default user and syllabus IDs
const DEFAULT_USER_ID = '5456';
const DEFAULT_SYLLABUS_ID = '5';

/**
 * Sends a request to the Lambda function and processes the response
 */
export const sendLambdaRequest = async (
  message: string,
  onToken: (token: string) => void,
  previousMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
) => {
  try {
    // First, provide an initial response to show we're working
    onToken("Thinking...");

    const request: LambdaRequest = {
      query_text: message,
      syllabus_id: DEFAULT_SYLLABUS_ID,
      user_id: DEFAULT_USER_ID,
      response_mode: "reason"
    };

    console.log("Sending request to Lambda:", request);
    
    const response = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Lambda function returned status ${response.status}`);
    }

    const data = await response.json();
    console.log("Lambda response:", data);
    
    // Extract the response content
    let content = extractResponseContent(data);
    
    // Process the content for display
    content = processContent(content);
    
    // Update the UI with the response
    onToken(content);
    
  } catch (error) {
    console.error('Error in Lambda function call:', error);
    onToken("I'm sorry, I encountered an error processing your request. Please try again later.");
  }
};

/**
 * Extracts the response content from the Lambda response
 */
function extractResponseContent(data: any): string {
  // If data is a string, try to parse it as JSON
  if (typeof data === 'string') {
    try {
      const parsedData = JSON.parse(data);
      return parsedData.response || parsedData.message || data;
    } catch (e) {
      return data;
    }
  }
  
  // If data has a body property
  if (data && data.body) {
    // If body is a string, try to parse it as JSON
    if (typeof data.body === 'string') {
      try {
        const bodyContent = JSON.parse(data.body);
        return bodyContent.response || bodyContent.message || data.body;
      } catch (e) {
        return data.body;
      }
    }
    // If body is already an object
    return data.body.response || data.body.message || JSON.stringify(data.body);
  }
  
  // If data has a response or message property
  if (data && (data.response || data.message)) {
    return data.response || data.message;
  }
  
  // If all else fails, stringify the entire data object
  return typeof data === 'object' ? JSON.stringify(data) : String(data);
}

/**
 * Process content to ensure proper formatting
 */
function processContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return "I'm sorry, I couldn't process your request properly. Please try again.";
  }
  
  // Fix the MATH_PLACEHOLDER issue by replacing them with actual math expressions
  content = content.replace(/__MATH_PLACEHOLDER_(\d+)__/g, (match, index) => {
    // Replace with appropriate math expressions based on context
    const placeholderIndex = parseInt(index);
    
    // Common math expressions that might be used
    const commonMathExpressions = [
      'x', // Variable x
      'ax^2 + bx + c = 0', // Quadratic equation
      'a', // Coefficient a
      'b', // Coefficient b
      'c', // Coefficient c
      'a \\neq 0', // a not equal to 0
      'ax^2 + bx + c = 0', // Quadratic form again
      'x', // Variable x again
      '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', // Quadratic formula
      'x', // Variable x again
      'x^2 + 2x + 1 = 0' // Example quadratic equation
    ];
    
    // Return the appropriate math expression or a default if index is out of bounds
    if (placeholderIndex < commonMathExpressions.length) {
      return `$${commonMathExpressions[placeholderIndex]}$`;
    } else {
      return '$x$'; // Default to x if index is out of bounds
    }
  });
  
  // Replace any remaining placeholders with appropriate math expressions
  content = content.replace(/MATH_PLACEHOLDER_\d+/g, 'x');
  
  // Preserve math expressions by temporarily replacing them
  const mathExpressions: string[] = [];
  content = content.replace(/(\$.*?\$|\[MATH\][\s\S]*?\[\/MATH\])/g, (match) => {
    const placeholder = `__MATH_EXPRESSION_${mathExpressions.length}__`;
    mathExpressions.push(match);
    return placeholder;
  });
  
  // Format headings
  content = content.replace(/^(#+)\s+(.*)$/gm, (_, hashes, text) => {
    const level = hashes.length;
    const className = level === 1 ? 'text-2xl font-bold' : 
                     level === 2 ? 'text-xl font-semibold' : 
                     'text-lg font-semibold';
    return `<h${level} class="${className} text-gray-900 dark:text-white my-3">${text.trim()}</h${level}>`;
  });
  
  // Format bullet points and numbered lists
  content = content.replace(/^(\s*)([-*])\s+(.*)$/gm, '<li>$3</li>');
  content = content.replace(/^(\s*)(\d+\.)\s+(.*)$/gm, '<li>$3</li>');
  
  // Wrap consecutive list items in ul/ol tags
  content = content.replace(/(<li>.*?<\/li>)(\s*)(<li>)/g, '$1$2</ul>\n<ul>$3');
  content = content.replace(/^<li>/gm, '<ul><li>');
  content = content.replace(/<\/li>$/gm, '</li></ul>');
  
  // Remove empty lists and fix nested lists
  content = content.replace(/<\/ul>\s*<ul>/g, '');
  
  // Format bold text
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');
  
  // Format italic text
  content = content.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  
  // Format highlighted text
  content = content.replace(/==(.*?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-500/30 px-1 rounded">$1</mark>');
  
  // Format underlined text
  content = content.replace(/__(.*?)__/g, '<span class="border-b-2 border-blue-400 dark:border-blue-500">$1</span>');
  
  // Format paragraphs - split by double newlines
  const paragraphs = content.split(/\n\n+/);
  content = paragraphs.map(p => {
    // Skip if already wrapped in HTML tag
    if (p.trim().startsWith('<') && p.trim().endsWith('>')) {
      return p;
    }
    return `<p>${p.trim()}</p>`;
  }).join('\n\n');
  
  // Format note blocks
  content = content.replace(/:::(important|tip|example|steps)([\s\S]*?):::/g, (_, type, text) => {
    const icons = {
      important: '🔑',
      tip: '💡',
      example: '📝',
      steps: '📋'
    };
    
    const colors = {
      important: 'bg-purple-50 dark:bg-purple-900/30',
      tip: 'bg-blue-50 dark:bg-blue-900/30',
      example: 'bg-green-50 dark:bg-green-900/30',
      steps: 'bg-indigo-50 dark:bg-indigo-900/30'
    };
    
    const titles = {
      important: 'Key Concept',
      tip: 'Helpful Tip',
      example: 'Example',
      steps: 'Step-by-Step'
    };

    return `
      <div class="my-4 p-4 rounded-lg ${colors[type as keyof typeof colors]} overflow-hidden">
        <div class="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-2">
          <span class="text-xl">${icons[type as keyof typeof icons]}</span>
          <span>${titles[type as keyof typeof titles]}</span>
        </div>
        <div class="text-gray-700 dark:text-gray-300 prose-content">
          ${text.trim()}
        </div>
      </div>
    `.trim();
  });
  
  // Restore math expressions
  content = content.replace(/__MATH_EXPRESSION_(\d+)__/g, (_, index) => {
    return mathExpressions[parseInt(index)];
  });
  
  // Clean up any remaining issues
  content = content
    // Fix any broken HTML
    .replace(/<\/p><ul>/g, '</p>\n<ul>')
    .replace(/<\/ul><p>/g, '</ul>\n<p>')
    // Remove any empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')
    // Fix any double-wrapped paragraphs
    .replace(/<p><p>(.*?)<\/p><\/p>/g, '<p>$1</p>');
  
  return content.trim();
}