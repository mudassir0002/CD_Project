// app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

interface TACStep {
  line: number;
  code: string;
  isActive?: boolean;
}

// Sample input code for new users
const SAMPLE_CODE = `if (a<5)
{
  c= b+d
  d= i+j
}
else
{
  d= a+b
  k= x+y
}`;

export default function Home() {
  const [inputCode, setInputCode] = useState(SAMPLE_CODE);
  const [tacCode, setTacCode] = useState<TACStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // ms
  const [showPreview, setShowPreview] = useState(true);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
    },
    onDrop: files => {
      const reader = new FileReader();
      reader.onload = () => setInputCode(reader.result as string);
      reader.readAsText(files[0]);
    },
  });

  // Stop animation when result changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, [tacCode]);

  // Animation playback
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying && currentStep < tacCode.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, animationSpeed);
    } else if (currentStep >= tacCode.length - 1) {
      setIsPlaying(false);
    }
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, tacCode, animationSpeed]);

  const generateTAC = () => {
    if (!inputCode.trim()) {
      alert('Please enter some code');
      return;
    }
    const generatedCode = parseCode(inputCode);
    setTacCode(generatedCode);
  };

  // Controls
  const handlePlayPause = () => {
    if (currentStep >= tacCode.length - 1) {
      // If we're at the end, reset to start before playing
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, tacCode.length - 1)));
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Example code button
  const loadExample = () => {
    setInputCode(SAMPLE_CODE);
  };

  // Get the current active step
  const activeStep = tacCode[currentStep];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Three Address Code Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Input</h2>
          
          <div {...getRootProps()} className="dropzone border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <input {...getInputProps()} />
            <p>Drag and drop a text file, or click to select</p>
          </div>
          
          <textarea
            className="w-full p-3 border rounded-lg h-64 font-mono text-sm mb-4 bg-white dark:bg-gray-900"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter your code here (e.g., if-else statements, assignments)..."
          />
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              onClick={loadExample}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition"
            >
              Load Example
            </button>
            <button 
              onClick={generateTAC}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
            >
              Generate Three Address Code
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Output</h2>
          
          {tacCode.length > 0 && (
            <>
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => handleStepChange(currentStep - 1)} 
                  disabled={currentStep === 0}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-1 px-3 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  onClick={handlePlayPause} 
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded flex-grow"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button 
                  onClick={() => handleStepChange(currentStep + 1)} 
                  disabled={currentStep === tacCode.length - 1}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-1 px-3 rounded disabled:opacity-50"
                >
                  Next
                </button>
                <button 
                  onClick={handleReset} 
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-1 px-3 rounded"
                >
                  Reset
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-1">Animation Speed:</label>
                <input 
                  type="range" 
                  min="200" 
                  max="2000" 
                  step="100" 
                  value={animationSpeed} 
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs">
                  <span>Fast</span>
                  <span>Slow</span>
                </div>
              </div>
              
              <div className="mb-4 flex gap-2 items-center">
                <label className="text-sm">Show Visualization:</label>
                <input 
                  type="checkbox" 
                  checked={showPreview} 
                  onChange={(e) => setShowPreview(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="border rounded-lg p-4 font-mono text-sm bg-white dark:bg-gray-900 h-64 overflow-auto">
                {tacCode.map((step, index) => (
                  <motion.div
                    key={step.line}
                    initial={{ opacity: 0.7 }}
                    animate={{ 
                      opacity: index === currentStep ? 1 : 0.7,
                      backgroundColor: index === currentStep ? 'rgb(219, 234, 254)' : 'transparent',
                    }}
                    className="py-1 px-2 rounded-md"
                  >
                    <span className="text-gray-500 mr-2">{step.line})</span> {step.code}
                  </motion.div>
                ))}
              </div>
            </>
          )}
          
          {tacCode.length === 0 && (
            <div className="border rounded-lg p-4 text-center h-64 flex items-center justify-center bg-white dark:bg-gray-900">
              <p className="text-gray-500">Generate code to see the result</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Visualization Preview */}
      {tacCode.length > 0 && showPreview && (
        <div className="mt-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Visualization</h2>
          <ExecutionPreview 
            tacCode={tacCode} 
            currentStep={currentStep} 
            originalCode={inputCode}
          />
        </div>
      )}
    </div>
  );
}

// Execution Visualization Component
function ExecutionPreview({ tacCode, currentStep, originalCode }: { 
  tacCode: TACStep[], 
  currentStep: number,
  originalCode: string
}) {
  // Determine what's happening at the current step
  const currentTac = tacCode[currentStep];
  const nextTac = currentStep < tacCode.length - 1 ? tacCode[currentStep + 1] : null;
  
  // Parse the flow type
  const isIfStatement = currentTac?.code.startsWith('if');
  const isGoto = currentTac?.code.startsWith('goto');
  const isAssignment = currentTac?.code.includes('=') && !isIfStatement;
  const isEnd = currentTac?.code === 'END';
  
  // For visualization:
  // - If statements show branching
  // - Goto statements show jumps
  // - Assignments show variable updates
  // - END shows execution complete
  
  // Default animation speed
  const animationDuration = 0.5;
  
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg min-h-40">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: Original Code with Highlighting */}
        <div className="border rounded-lg p-3 font-mono text-sm">
          <h3 className="font-semibold mb-2">Original Code</h3>
          <div className="overflow-auto max-h-60">
            {originalCode.split('\n').map((line, idx) => (
              <motion.div 
                key={idx}
                className="py-1"
                animate={{
                  backgroundColor: isCurrentExecutingLine(line, currentTac) 
                    ? 'rgba(219, 234, 254, 0.5)' 
                    : 'transparent'
                }}
              >
                {line}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Right Side: Execution Animation */}
        <div className="border rounded-lg p-3 h-full">
          <h3 className="font-semibold mb-2">Execution Step</h3>
          <div className="h-60 relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center p-4"
              >
                {isEnd ? (
                  <div className="text-green-500 font-bold text-lg">Execution Complete</div>
                ) : isIfStatement ? (
                  <div className="flex flex-col items-center">
                    <div className="mb-2 font-semibold">Condition Check</div>
                    <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg mb-3">
                      {extractCondition(currentTac.code)}
                    </div>
                    <div className="grid grid-cols-2 gap-10 mt-4">
                      <motion.div 
                        animate={{ opacity: [0, 1] }}
                        transition={{ duration: animationDuration, delay: 0.2 }}
                        className="flex flex-col items-center"
                      >
                        <div className="mb-1 text-sm">True</div>
                        <motion.div 
                          className="w-0 h-12 border-l-2 border-green-500"
                          animate={{ height: [0, 48] }}
                          transition={{ duration: animationDuration * 0.8, delay: 0.3 }}
                        />
                      </motion.div>
                      <motion.div 
                        animate={{ opacity: [0, 1] }}
                        transition={{ duration: animationDuration, delay: 0.2 }}
                        className="flex flex-col items-center"
                      >
                        <div className="mb-1 text-sm">False</div>
                        <motion.div 
                          className="w-0 h-12 border-l-2 border-red-500"
                          animate={{ height: [0, 48] }}
                          transition={{ duration: animationDuration * 0.8, delay: 0.3 }}
                        />
                      </motion.div>
                    </div>
                  </div>
                ) : isGoto ? (
                  <div className="flex flex-col items-center">
                    <div className="mb-2 font-semibold">Jump Instruction</div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mb-3">
                      {currentTac.code}
                    </div>
                    <motion.div 
                      animate={{ 
                        x: [0, 40, 0],
                        y: [0, -20, 0]
                      }}
                      transition={{ 
                        duration: animationDuration,
                        times: [0, 0.5, 1],
                        repeat: 0
                      }}
                      className="text-3xl mt-2"
                    >
                      ↪
                    </motion.div>
                  </div>
                ) : isAssignment ? (
                  <div className="flex flex-col items-center">
                    <div className="mb-2 font-semibold">
                      {currentTac.code.includes('T') && !currentTac.code.startsWith('T') 
                        ? 'Variable Assignment' 
                        : 'Temporary Value Calculation'}
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                      {currentTac.code}
                    </div>
                    {currentTac.code.includes('T') && !currentTac.code.startsWith('T') && (
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: animationDuration, delay: 0.2 }}
                        className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mt-4"
                      >
                        {`Memory updated: ${currentTac.code.split('=')[0]}`}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div>{currentTac?.code}</div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to extract condition from if statement
function extractCondition(code: string): string {
  const match = code.match(/if\s*\((.*?)\)/);
  return match ? match[1] : '';
}

// Helper function to check if a line is currently being executed
function isCurrentExecutingLine(line: string, currentTac: TACStep | undefined): boolean {
  if (!currentTac) return false;
  
  // Check if it's an if statement
  if (currentTac.code.startsWith('if')) {
    const condition = extractCondition(currentTac.code);
    return line.includes(`if (${condition})`) || line.includes(`if(${condition})`);
  }
  
  // Check if it's an assignment
  if (currentTac.code.includes('=') && !currentTac.code.startsWith('if')) {
    // If it's a temporary assignment (T1=...)
    if (currentTac.code.startsWith('T')) {
      const parts = currentTac.code.split('=');
      const expr = parts[1];
      return line.includes(expr);
    }
    
    // If it's a variable assignment (x=T1)
    const parts = currentTac.code.split('=');
    const variable = parts[0].trim();
    return line.includes(`${variable}=`) || line.includes(`${variable} =`);
  }
  
  return false;
}

// Three Address Code generation logic
function parseCode(input: string): TACStep[] {
  const lines = input.trim().split('\n');
  const tac: TACStep[] = [];
  let lineNumber = 1;
  let tempCounter = 1;
  
  // Analyze the structure first (find if-else blocks, etc.)
  const structuredCode = analyzeCodeStructure(lines);
  
  // Process each block according to its type
  processBlocks(structuredCode, tac, lineNumber, tempCounter);
  
  return tac;
}

// Helper types for code structure analysis
type CodeBlock = {
  type: 'if' | 'else' | 'assignment';
  content: string;
  children?: CodeBlock[];
  lineStart: number;
  lineEnd: number;
  condition?: string;
  elseBlock?: CodeBlock;
};

function analyzeCodeStructure(lines: string[]): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (line === '') {
      i++;
      continue;
    }
    
    // If statement
    const ifMatch = line.match(/if\s*\((.*?)\)/);
    if (ifMatch) {
      const condition = ifMatch[1].trim();
      const ifBlock: CodeBlock = {
        type: 'if',
        content: line,
        condition,
        children: [],
        lineStart: i,
        lineEnd: -1
      };
      
      // Find the corresponding opening brace
      let braceIndex = i;
      while (braceIndex < lines.length && !lines[braceIndex].trim().includes('{')) {
        braceIndex++;
      }
      
      // Find the closing brace (considering nested braces)
      let braceCount = 1;
      let j = braceIndex + 1;
      while (j < lines.length && braceCount > 0) {
        const currentLine = lines[j].trim();
        if (currentLine.includes('{')) braceCount++;
        if (currentLine.includes('}')) braceCount--;
        j++;
      }
      
      ifBlock.lineEnd = j - 1;
      
      // Extract the if block body (excluding braces)
      const bodyStart = braceIndex + 1;
      const bodyEnd = j - 1;
      
      // Parse children inside the if block
      for (let k = bodyStart; k < bodyEnd; k++) {
        const bodyLine = lines[k].trim();
        if (bodyLine === '' || bodyLine === '{' || bodyLine === '}') continue;
        
        // Handle assignments inside the if block
        const assignmentMatch = bodyLine.match(/(\w+)\s*=\s*(.*)/);
        if (assignmentMatch) {
          const [_, target, expr] = assignmentMatch;
          ifBlock.children!.push({
            type: 'assignment',
            content: bodyLine,
            lineStart: k,
            lineEnd: k
          });
        }
      }
      
      // Check if there's an else block following
      if (j < lines.length && lines[j].trim().startsWith('else')) {
        const elseBlock: CodeBlock = {
          type: 'else',
          content: lines[j].trim(),
          children: [],
          lineStart: j,
          lineEnd: -1
        };
        
        // Find else opening brace
        let elseBraceIndex = j;
        while (elseBraceIndex < lines.length && !lines[elseBraceIndex].trim().includes('{')) {
          elseBraceIndex++;
        }
        
        // Find else closing brace
        let elseBraceCount = 1;
        let l = elseBraceIndex + 1;
        while (l < lines.length && elseBraceCount > 0) {
          const currentLine = lines[l].trim();
          if (currentLine.includes('{')) elseBraceCount++;
          if (currentLine.includes('}')) elseBraceCount--;
          l++;
        }
        
        elseBlock.lineEnd = l - 1;
        
        // Extract else block body (excluding braces)
        const elseBodyStart = elseBraceIndex + 1;
        const elseBodyEnd = l - 1;
        
        // Parse children inside the else block
        for (let m = elseBodyStart; m < elseBodyEnd; m++) {
          const elseBodyLine = lines[m].trim();
          if (elseBodyLine === '' || elseBodyLine === '{' || elseBodyLine === '}') continue;
          
          // Handle assignments inside the else block
          const assignmentMatch = elseBodyLine.match(/(\w+)\s*=\s*(.*)/);
          if (assignmentMatch) {
            const [_, target, expr] = assignmentMatch;
            elseBlock.children!.push({
              type: 'assignment',
              content: elseBodyLine,
              lineStart: m,
              lineEnd: m
            });
          }
        }
        
        ifBlock.elseBlock = elseBlock;
        i = l; // Skip to after the else block
      } else {
        i = j; // Skip to after the if block
      }
      
      blocks.push(ifBlock);
    } 
    // Direct assignment (outside of blocks)
    else if (line.match(/(\w+)\s*=\s*(.*)/)) {
      blocks.push({
        type: 'assignment',
        content: line,
        lineStart: i,
        lineEnd: i
      });
      i++;
    } 
    // Other lines (skip)
    else {
      i++;
    }
  }
  
  return blocks;
}

function processBlocks(blocks: CodeBlock[], tac: TACStep[], lineNumberStart: number, tempCounterStart: number): void {
  let lineNumber = lineNumberStart;
  let tempCounter = tempCounterStart;
  
  blocks.forEach(block => {
    if (block.type === 'if') {
      // Generate TAC for if statement
      const ifStartLine = lineNumber;
      const hasElse = !!block.elseBlock;
      
      if (hasElse) {
        // First line: if condition, go to true branch
        tac.push({ 
          line: lineNumber++, 
          code: `if (${block.condition}) goto ${lineNumber + 1}` 
        });
        
        // Second line: jump to else branch
        const elseJumpLine = lineNumber++;
        const jumpToElseLine = lineNumber + (block.children?.length || 0) * 2 + 1; // +1 for goto after if block
        tac.push({ 
          line: elseJumpLine, 
          code: `goto ${jumpToElseLine}` 
        });
        
        // Process the if block assignments
        if (block.children && block.children.length > 0) {
          block.children.forEach(child => {
            if (child.type === 'assignment') {
              const assignmentMatch = child.content.match(/(\w+)\s*=\s*(.*)/);
              if (assignmentMatch) {
                const [_, target, expr] = assignmentMatch;
                tac.push({ 
                  line: lineNumber++, 
                  code: `T${tempCounter}=${expr.trim()}` 
                });
                tac.push({ 
                  line: lineNumber++, 
                  code: `${target.trim()}=T${tempCounter++}` 
                });
              }
            }
          });
        }
        
        // After if block, jump to end
        const endIfLine = lineNumber++;
        const jumpToEndLine = lineNumber + (block.elseBlock?.children?.length || 0) * 2;
        tac.push({ 
          line: endIfLine, 
          code: `goto__${jumpToEndLine}_` 
        });
        
        // Process the else block assignments
        if (block.elseBlock?.children && block.elseBlock.children.length > 0) {
          block.elseBlock.children.forEach(child => {
            if (child.type === 'assignment') {
              const assignmentMatch = child.content.match(/(\w+)\s*=\s*(.*)/);
              if (assignmentMatch) {
                const [_, target, expr] = assignmentMatch;
                tac.push({ 
                  line: lineNumber++, 
                  code: `T${tempCounter}=${expr.trim()}` 
                });
                tac.push({ 
                  line: lineNumber++, 
                  code: `${target.trim()}=T${tempCounter++}` 
                });
              }
            }
          });
        }
      } else {
        // Simple if without else
        tac.push({ 
          line: lineNumber++, 
          code: `if (${block.condition}) goto ${lineNumber + 1}` 
        });
        tac.push({ 
          line: lineNumber++, 
          code: `goto ${lineNumber + (block.children?.length || 0) * 2}` 
        });
        
        // Process the if block assignments
        if (block.children && block.children.length > 0) {
          block.children.forEach(child => {
            if (child.type === 'assignment') {
              const assignmentMatch = child.content.match(/(\w+)\s*=\s*(.*)/);
              if (assignmentMatch) {
                const [_, target, expr] = assignmentMatch;
                tac.push({ 
                  line: lineNumber++, 
                  code: `T${tempCounter}=${expr.trim()}` 
                });
                tac.push({ 
                  line: lineNumber++, 
                  code: `${target.trim()}=T${tempCounter++}` 
                });
              }
            }
          });
        }
      }
    } else if (block.type === 'assignment') {
      // Direct assignment outside of blocks
      const assignmentMatch = block.content.match(/(\w+)\s*=\s*(.*)/);
      if (assignmentMatch) {
        const [_, target, expr] = assignmentMatch;
        tac.push({ 
          line: lineNumber++, 
          code: `T${tempCounter}=${expr.trim()}` 
        });
        tac.push({ 
          line: lineNumber++, 
          code: `${target.trim()}=T${tempCounter++}` 
        });
      }
    }
  });
  
  // Add the END statement
  tac.push({ line: lineNumber, code: 'END' });
}