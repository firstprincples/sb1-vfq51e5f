import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

export const initializeOpenAI = (apiKey: string) => {
  openaiInstance = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

const systemPrompt = `You are Donnisha and Priscilla, two friendly and knowledgeable math tutors who work together. When a user joins, warmly introduce yourselves and explain that you're here to help with any math questions. Always maintain a supportive and encouraging tone.

CRITICAL: ALL mathematical expressions MUST be formatted using MathML with these EXACT rules:

1. For display math (centered, standalone equations):
   [MATH]
   <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
     <mrow>
       ... content ...
     </mrow>
   </math>
   [/MATH]

2. For inline math (within text):
   $<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow>...</mrow></math>$

3. ALWAYS use these MathML elements correctly:
   - <mrow> to group expressions
   - <mi> for variables and identifiers
   - <mn> for numbers
   - <mo> for operators
   - <msup> for superscripts
   - <msub> for subscripts
   - <mfrac> for fractions
   - <msqrt> for square roots
   - <mroot> for nth roots
   - <mtable> for matrices and tables
   - <mtr> for table rows
   - <mtd> for table cells
   - <mtext> for text within math
   - <mspace> for spacing
   - <mfenced> for parentheses and brackets

4. For matrices, ALWAYS use this EXACT format:
   [MATH]
   <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
     <mrow>
       <mi>A</mi>
       <mo>=</mo>
       <mfenced open="(" close=")">
         <mtable>
           <mtr>
             <mtd><mi>a</mi></mtd>
             <mtd><mi>b</mi></mtd>
           </mtr>
           <mtr>
             <mtd><mi>c</mi></mtd>
             <mtd><mi>d</mi></mtd>
           </mtr>
         </mtable>
       </mfenced>
     </mrow>
   </math>
   [/MATH]

5. For important notes and highlights:
   :::important
   Key concept here
   :::

   :::tip
   Helpful tip here
   :::

Example response with proper MathML:

Let's solve a quadratic equation: $<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>x</mi><mo>^</mo><mn>2</mn><mo>+</mo><mn>2</mn><mi>x</mi><mo>+</mo><mn>1</mn><mo>=</mo><mn>0</mn></mrow></math>$

Using the quadratic formula:

[MATH]
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
  <mrow>
    <mi>x</mi>
    <mo>=</mo>
    <mfrac>
      <mrow>
        <mo>−</mo>
        <mi>b</mi>
        <mo>±</mo>
        <msqrt>
          <mrow>
            <msup><mi>b</mi><mn>2</mn></msup>
            <mo>−</mo>
            <mn>4</mn>
            <mi>a</mi>
            <mi>c</mi>
          </mrow>
        </msqrt>
      </mrow>
      <mrow>
        <mn>2</mn>
        <mi>a</mi>
      </mrow>
    </mfrac>
  </mrow>
</math>
[/MATH]

:::important
Remember to check your solution by substituting back into the original equation!
:::

Follow these formatting rules EXACTLY.`;

export const formatContent = (content: string): string => {
  // Process math blocks first to prevent interference with other formatting
  content = content.replace(/\[MATH\]([\s\S]*?)\[\/MATH\]/g, (match, math) => {
    const trimmedMath = math.trim();
    if (!trimmedMath.includes('xmlns=')) {
      return `[MATH]<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${trimmedMath}</math>[/MATH]`;
    }
    return match; // Return the original match if it already has xmlns
  });

  // Process inline math - ensure proper spacing and complete tags
  content = content.replace(/\$(.*?)\$/g, (match, math) => {
    const trimmedMath = math.trim();
    if (!trimmedMath.includes('<math')) {
      return `$<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow>${trimmedMath}</mrow></math>$`;
    }
    return match; // Return the original match if it already has math tags
  });

  // Fix any MATH_PLACEHOLDER issues
  content = content.replace(/MATH_PLACEHOLDER_(\d+)/g, (match, index) => {
    // Common math expressions that might be used
    const commonMathExpressions = [
      'x', // Variable x
      'ax^2 + bx + c = 0', // Quadratic equation
      'a', // Coefficient a
      'b', // Coefficient b
      'c', // Coefficient c
      'a ≠ 0', // a not equal to 0
      'ax^2 + bx + c = 0', // Quadratic form again
      'x', // Variable x again
      '(-b ± √(b^2 - 4ac))/(2a)', // Quadratic formula
      'x', // Variable x again
      'x^2 + 2x + 1 = 0' // Example quadratic equation
    ];
    
    const placeholderIndex = parseInt(index);
    const expression = placeholderIndex < commonMathExpressions.length 
      ? commonMathExpressions[placeholderIndex] 
      : 'x';
    
    return `$<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>${expression}</mi></mrow></math>$`;
  });

  // Process note blocks
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

  // Process other formatting
  content = content
    .replace(/### (.*?)$/gm, '<h3 class="text-lg font-semibold text-gray-900 dark:text-white my-3">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
    .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-500/30 px-1 rounded">$1</mark>')
    .replace(/\^\^(.*?)\^\^/g, '<span class="border-b-2 border-blue-400 dark:border-blue-500">$1</span>');

  return content;
};

export const streamCompletion = async (
  message: string,
  onToken: (token: string) => void,
  previousMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
) => {
  if (!openaiInstance) {
    throw new Error('OpenAI not initialized');
  }

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...previousMessages,
      { role: 'user', content: message }
    ] as any[];
    
    const stream = await openaiInstance.chat.completions.create({
      model: 'gpt-4',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
      presence_penalty: 0.6,
      frequency_penalty: 0.5
    });
    
    let accumulatedResponse = '';
    let buffer = '';
    let mathBuffer = '';
    let inMathBlock = false;
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      
      // Process content character by character for better math block handling
      for (const char of content) {
        if (inMathBlock) {
          mathBuffer += char;
          if (mathBuffer.endsWith('[/MATH]')) {
            buffer += mathBuffer;
            mathBuffer = '';
            inMathBlock = false;
            // Process buffer after complete math block
            accumulatedResponse += buffer;
            onToken(formatContent(accumulatedResponse));
            buffer = '';
          }
        } else {
          if (buffer.endsWith('[MATH') && char === ']') {
            inMathBlock = true;
            mathBuffer = '[MATH]';
            buffer = buffer.slice(0, -5);
          } else {
            buffer += char;
            // Process buffer on sentence boundaries or paragraphs
            if (
              (char === '.' && buffer.match(/[.!?]\s+[A-Z]/)) ||
              buffer.includes('\n\n')
            ) {
              accumulatedResponse += buffer;
              onToken(formatContent(accumulatedResponse));
              buffer = '';
            }
          }
        }
      }
    }
    
    // Process any remaining content
    if (mathBuffer || buffer) {
      accumulatedResponse += mathBuffer + buffer;
      onToken(formatContent(accumulatedResponse));
    }
  } catch (error) {
    console.error('Error in OpenAI completion:', error);
    throw error;
  }
};