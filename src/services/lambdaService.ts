/**
 * Lambda Service
 * Handles communication with the Lambda endpoint for math tutoring
 */
import type { Quiz, QuizQuestion } from '../types';

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
  onToken: (token: string) => void
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
    
    // Parse and format any JSON code blocks in the response
    content = parseJsonCodeBlocks(content);
    
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
 * Parse and format JSON code blocks in the response
 */
function parseJsonCodeBlocks(content: string): string {
  // Look for JSON code blocks in the format: json { ... }
  const jsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```/g;
  
  return content.replace(jsonBlockRegex, (match, jsonString) => {
    try {
      // Parse the JSON string
      const jsonData = JSON.parse(jsonString);
      
      // Format based on the type of JSON
      if (jsonData.type === 'feedback') {
        return formatFeedbackJson(jsonData);
      } else if (jsonData.type === 'options') {
        return formatOptionsJson(jsonData);
      } else if (jsonData.type === 'quiz') {
        return formatQuizJson(jsonData);
      } else {
        // If the type is unknown, just return the original JSON block
        return match;
      }
    } catch (error) {
      console.error('Error parsing JSON code block:', error);
      return match; // Return the original match if parsing fails
    }
  });
}

/**
 * Format feedback JSON into HTML with buttons
 */
function formatFeedbackJson(jsonData: any): string {
  if (!jsonData.message || !jsonData.options || !Array.isArray(jsonData.options)) {
    return '';
  }
  
  // Format the message
  let html = `<div class="feedback-message">${jsonData.message}</div>`;
  
  // Format the options as buttons
  html += '<div class="feedback-options">';
  jsonData.options.forEach((option: any) => {
    if (option.label && option.value) {
      html += `<button class="feedback-option" data-value="${option.value}">${option.label}</button>`;
    }
  });
  html += '</div>';
  
  // Wrap the formatted content in a special marker for the frontend to process
  return `[FEEDBACK]${JSON.stringify(jsonData)}[/FEEDBACK]`;
}

/**
 * Format options JSON into HTML with selectable choices
 */
function formatOptionsJson(jsonData: any): string {
  if (!jsonData.message || !jsonData.options || !Array.isArray(jsonData.options)) {
    return '';
  }
  
  // Format the message
  let html = `<div class="options-message">${jsonData.message}</div>`;
  
  // Format the options as radio buttons
  html += '<div class="options-choices">';
  jsonData.options.forEach((option: any, index: number) => {
    if (option.label && option.value) {
      html += `
        <div class="option-choice">
          <input type="radio" id="option-${index}" name="options" value="${option.value}">
          <label for="option-${index}">${option.label}</label>
        </div>
      `;
    }
  });
  html += '</div>';
  
  // Wrap the formatted content in a special marker for the frontend to process
  return `[OPTIONS]${JSON.stringify(jsonData)}[/OPTIONS]`;
}

/**
 * Format quiz JSON into HTML with questions and choices
 */
function formatQuizJson(jsonData: any): string {
  if (!jsonData.question || !jsonData.options || !Array.isArray(jsonData.options)) {
    return '';
  }
  
  // Format the question
  let html = `<div class="quiz-question">${jsonData.question}</div>`;
  
  // Format the options as radio buttons
  html += '<div class="quiz-choices">';
  jsonData.options.forEach((option: any, index: number) => {
    if (option.label && option.value) {
      html += `
        <div class="quiz-choice">
          <input type="radio" id="quiz-option-${index}" name="quiz-options" value="${option.value}">
          <label for="quiz-option-${index}">${option.label}</label>
        </div>
      `;
    }
  });
  html += '</div>';
  
  // Format the actions as buttons
  if (jsonData.actions && Array.isArray(jsonData.actions)) {
    html += '<div class="quiz-actions">';
    jsonData.actions.forEach((action: any, index: number) => {
      if (action.label && action.value) {
        html += `<button class="quiz-action" data-value="${action.value}">${action.label}</button>`;
      }
    });
    html += '</div>';
  }
  
  // Wrap the formatted content in a special marker for the frontend to process
  return `[QUIZ]${JSON.stringify(jsonData)}[/QUIZ]`;
}

/**
 * Process content to ensure proper formatting
 */
function processContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return "I'm sorry, I couldn't process your request properly. Please try again.";
  }
  
  // Replace any MATH_PLACEHOLDER with simple text
  content = content.replace(/MATH_PLACEHOLDER_\d+/g, 'x');
  
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

/**
 * Creates a quiz from the Lambda response format
 */
export function createQuizFromLambdaFormat(quizData: any): Quiz {
  // Ensure the quiz data has the required properties
  if (!quizData.Type || !quizData.quizType || !quizData.questions || !Array.isArray(quizData.questions)) {
    throw new Error("Invalid quiz data format");
  }
  
  // Create a properly formatted quiz object
  return {
    Type: quizData.Type,
    quizType: quizData.quizType,
    quizTitle: quizData.quizTitle || "Lesson Check",
    questions: quizData.questions.map((q: any) => ({
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex
    }))
  };
}