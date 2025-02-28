import type { ChatMessage } from '../types';
import { formatContent } from './mathRenderer';

interface LambdaRequest {
  query_text: string;
  syllabus_id: string;
  user_id: string;
  response_mode: 'reason' | 'fact';
}

// Lambda function URL
const LAMBDA_URL = 'https://qcepecnjjg.execute-api.us-east-2.amazonaws.com/Test/LMS-RAG';

// Default user and syllabus IDs
const DEFAULT_USER_ID = '5456';
const DEFAULT_SYLLABUS_ID = '5';

/**
 * Sends a request to the Lambda function and streams the response
 */
export const streamLambdaResponse = async (
  message: string,
  onToken: (token: string) => void,
  previousMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
) => {
  try {
    const request: LambdaRequest = {
      query_text: message,
      syllabus_id: DEFAULT_SYLLABUS_ID,
      user_id: DEFAULT_USER_ID,
      response_mode: 'reason'
    };

    // First, provide an initial response to show we're working
    onToken("I'm processing your request...");

    try {
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
      console.log("Raw Lambda response:", data);
      
      // Extract the actual content from the response
      let content = extractResponseContent(data);
      console.log("Extracted content:", content);
      
      // Process the content to ensure proper math rendering
      content = processContent(content, message);
      
      // Simulate streaming by breaking the content into chunks
      const chunks = simulateStreaming(content);
      
      let accumulatedResponse = '';
      
      for (const chunk of chunks) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Add a small delay to simulate streaming
        accumulatedResponse += chunk;
        onToken(formatContent(accumulatedResponse));
      }
    } catch (error) {
      console.error('Error in Lambda function call:', error);
      onToken(`I'm sorry, I encountered an error while processing your request. Please try again later.`);
    }
  } catch (error) {
    console.error('Error in Lambda function call:', error);
    throw error;
  }
};

/**
 * Extracts the actual response content from various possible Lambda response formats
 */
function extractResponseContent(data: any): string {
  // If data is a string, try to parse it as JSON first
  if (typeof data === 'string') {
    try {
      const parsedData = JSON.parse(data);
      return parsedData.response || parsedData.message || data;
    } catch (e) {
      return data; // If it's not JSON, use the string directly
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
 * Process content to ensure proper math rendering
 */
function processContent(content: string, query: string): string {
  if (!content || typeof content !== 'string') {
    return "I'm sorry, I couldn't process your request properly. Please try again.";
  }
  
  // Remove code blocks (like C++ code)
  content = content.replace(/#include[\s\S]*?return 0;\s*}/, '');
  
  // Remove any remaining code block markers
  content = content.replace(/```[\w]*\n[\s\S]*?```/g, '');
  
  // Remove any HTML tags that might be in the response (except math tags)
  content = content.replace(/<(?!math|\/math|m[a-z]+|\/m[a-z]+)[^>]*>/g, '');
  
  // Clean up excessive whitespace
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.trim();
  
  // Fix LaTeX-style math expressions
  content = fixLatexMath(content);
  
  // Convert plain text math expressions to LaTeX
  content = convertPlainTextMath(content);
  
  return content;
}

/**
 * Fix LaTeX-style math expressions
 */
function fixLatexMath(content: string): string {
  // Replace LaTeX-style math expressions with MathJax-compatible format
  
  // Fix inline math expressions with missing backslashes
  content = content.replace(/\$(.*?)\$/g, (match, math) => {
    // Skip if it's a currency symbol
    if (/^\s*\d+([,.]\d+)?\s*$/.test(math)) {
      return match;
    }
    
    // Fix common LaTeX issues within the math expression
    const fixedMath = math
      // Fix missing backslashes in common functions
      .replace(/([^\\])(sin|cos|tan|log|ln|lim|max|min)([^a-zA-Z])/g, '$1\\$2$3')
      // Fix missing backslashes in fractions
      .replace(/([^\\])frac\{/g, '$1\\frac{')
      // Fix missing backslashes in square roots
      .replace(/([^\\])sqrt\{/g, '$1\\sqrt{')
      // Fix missing backslashes in text mode
      .replace(/([^\\])text\{/g, '$1\\text{')
      // Fix missing backslashes in common symbols
      .replace(/([^\\])(alpha|beta|gamma|delta|theta|pi|sigma|omega)([^a-zA-Z])/g, '$1\\$2$3')
      // Fix missing braces in superscripts and subscripts
      .replace(/([_^])([0-9a-zA-Z])/g, '$1{$2}');
    
    return `$${fixedMath}$`;
  });
  
  // Fix block math expressions
  content = content.replace(/\[MATH\]([\s\S]*?)\[\/MATH\]/g, (match, math) => {
    // Fix common LaTeX issues within the math expression
    const fixedMath = math
      // Fix missing backslashes in common functions
      .replace(/([^\\])(sin|cos|tan|log|ln|lim|max|min)([^a-zA-Z])/g, '$1\\$2$3')
      // Fix missing backslashes in fractions
      .replace(/([^\\])frac\{/g, '$1\\frac{')
      // Fix missing backslashes in square roots
      .replace(/([^\\])sqrt\{/g, '$1\\sqrt{')
      // Fix missing backslashes in text mode
      .replace(/([^\\])text\{/g, '$1\\text{')
      // Fix missing backslashes in common symbols
      .replace(/([^\\])(alpha|beta|gamma|delta|theta|pi|sigma|omega)([^a-zA-Z])/g, '$1\\$2$3')
      // Fix missing braces in superscripts and subscripts
      .replace(/([_^])([0-9a-zA-Z])/g, '$1{$2}');
    
    return `[MATH]${fixedMath}[/MATH]`;
  });
  
  return content;
}

/**
 * Convert plain text math expressions to LaTeX
 */
function convertPlainTextMath(content: string): string {
  // Look for patterns that indicate math expressions but aren't properly formatted
  
  // Convert sin(θ) = opposite/hypotenuse to LaTeX
  content = content.replace(
    /sin\(θ\)\s*=\s*opposite\s*\/\s*hypotenuse/gi,
    '[MATH]\\sin(\\theta) = \\frac{\\text{opposite}}{\\text{hypotenuse}}[/MATH]'
  );
  
  // Convert cos(θ) = adjacent/hypotenuse to LaTeX
  content = content.replace(
    /cos\(θ\)\s*=\s*adjacent\s*\/\s*hypotenuse/gi,
    '[MATH]\\cos(\\theta) = \\frac{\\text{adjacent}}{\\text{hypotenuse}}[/MATH]'
  );
  
  // Convert tan(θ) = opposite/adjacent to LaTeX
  content = content.replace(
    /tan\(θ\)\s*=\s*opposite\s*\/\s*adjacent/gi,
    '[MATH]\\tan(\\theta) = \\frac{\\text{opposite}}{\\text{adjacent}}[/MATH]'
  );
  
  // Convert sin(30°) = 1/2 to LaTeX
  content = content.replace(
    /sin\(30°\)\s*=\s*1\s*\/\s*2/gi,
    '[MATH]\\sin(30^\\circ) = \\frac{1}{2}[/MATH]'
  );
  
  // Convert sin(45°) = 1/√2 or sin(45°) = 1/sqrt(2) to LaTeX
  content = content.replace(
    /sin\(45°\)\s*=\s*1\s*\/\s*(√2|sqrt\(2\))/gi,
    '[MATH]\\sin(45^\\circ) = \\frac{1}{\\sqrt{2}}[/MATH]'
  );
  
  // Convert sin(θ) = y to LaTeX
  content = content.replace(
    /sin\(θ\)\s*=\s*y/gi,
    '[MATH]\\sin(\\theta) = y[/MATH]'
  );
  
  // Convert cos(θ) = x to LaTeX
  content = content.replace(
    /cos\(θ\)\s*=\s*x/gi,
    '[MATH]\\cos(\\theta) = x[/MATH]'
  );
  
  // Convert tan(θ) = y/x to LaTeX
  content = content.replace(
    /tan\(θ\)\s*=\s*y\s*\/\s*x/gi,
    '[MATH]\\tan(\\theta) = \\frac{y}{x}[/MATH]'
  );
  
  return content;
}

/**
 * Simulates streaming by breaking content into chunks
 */
function simulateStreaming(content: string): string[] {
  if (!content || typeof content !== 'string') {
    return ["I'm sorry, I couldn't process your request properly. Please try again."];
  }
  
  // Don't break up math expressions
  const mathBlocks: string[] = [];
  content = content.replace(/(\\[\[\(][\s\S]*?\\[\]\)]|\[MATH\][\s\S]*?\[\/MATH\]|\$.*?\$)/g, (match, p1, offset) => {
    const placeholder = `__MATH_PLACEHOLDER_${mathBlocks.length}__`;
    mathBlocks.push(match);
    return placeholder;
  });
  
  const chunks: string[] = [];
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length === 0) {
    // If no sentences found, split by spaces
    const words = content.split(' ');
    let currentChunk = '';
    
    for (const word of words) {
      currentChunk += word + ' ';
      if (currentChunk.length > 30 || word === words[words.length - 1]) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
    }
  } else {
    // Split by sentences
    for (const sentence of sentences) {
      chunks.push(sentence);
    }
  }
  
  // Restore math expressions
  return chunks.map(chunk => {
    return chunk.replace(/__MATH_PLACEHOLDER_(\d+)__/g, (match, index) => {
      return mathBlocks[parseInt(index)];
    });
  });
}