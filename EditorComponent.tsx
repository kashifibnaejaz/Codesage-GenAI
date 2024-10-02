"use client";
import React, { useRef, useState } from "react";
import { ModeToggleBtn } from "./mode-toggle-btn";
import SelectLanguages, { selectedLanguageOptionProps } from "./SelectLanguages";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Loader, Play, TriangleAlert, MessageSquare } from "lucide-react";
import { codeSnippets, languageOptions } from "@/config/config";
import { compileCode } from "@/actions/compile";
import toast from "react-hot-toast";
//import { toast } from 'react-toastify';
//import { toast } from "react-toastify";
import ChatbotComponent from "./Chatbot"; // Import the Chatbot component
import SelectionSort from "./SelectionSort";
import assert from "assert";

// Test cases to check the user's code
/*const testCases = [
  { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
  { input: [[3, 2, 4], 6], expected: [1, 2] },
  { input: [[3, 3], 6], expected: [0, 1] },
];
*/
const testCases = [
  { input: [[2,7,3,17,22,11,23,15]], expected: [2,3,7,11,15,17,22,23] },
  { input: [[1,8,3,6,5,4,7,2,9]], expected: [1, 2,3,4,5,6,7,8,9] },
  { input: [[3,3,5,5,9,1,2,3]], expected: [1,2,3,3,3,5,5,9] },
];

export default function EditorComponent() {
  const { theme } = useTheme();
  const [sourceCode, setSourceCode] = useState(codeSnippets["python"]);
  const [languageOption, setLanguageOption] = useState(languageOptions[3]);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const editorRef = useRef(null);
  const [chatbotMessages, setChatbotMessages] = useState<string>('');
  const [isChatbotVisible, setIsChatbotVisible] = useState(false); // For toggling chatbot visibility
  
  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
    editor.focus();
  }
  
  function handleOnchange(value: string | undefined) {
    if (value) {
      setSourceCode(value);
    }
  }

  function onSelect(value: selectedLanguageOptionProps) {
    setLanguageOption(value);
    setSourceCode(codeSnippets[value.language]);
  }
  
  const extractErrorLine = (output) => {
    // Ensure the output is a string, join if it's an array
    const outputString = Array.isArray(output) ? output.join("\n") : output;

    // Regex to match lines containing the word "error" (case-insensitive)
    const regex = /.*error.*$/gim;  // ".*" captures the entire line, "error" for matching, "gim" for global, case-insensitive match
    const matches = outputString.match(regex);
    
    if (matches) {
      return matches[matches.length - 1];  // Get the last match
    }
  
    return null;  // Return null if no match found
  };
  /*

  const extractErrorLine = (output) => {
    // Ensure the output is a string, join if it's an array
    const outputString = Array.isArray(output) ? output.join("\n") : output;
  
    // Split the output string into individual lines
    const lines = outputString.split("\n");
  
    // Array to store the error line and the line with "line X"
    let errorDetails = [];
  
    // Loop through the lines and look for the line with "error"
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].match(/line\s\d+/)) {
        // Check the previous line for the word "error"
        if (lines[i - 1].toLowerCase().includes("error")) {
          errorDetails.push(lines[i - 1]);  // The line above containing the word "error"
          errorDetails.push(lines[i]);      // The line containing "line X"
        }
      }
    }
  
    // Join the extracted lines if any are found
    if (errorDetails.length > 0) {
      return errorDetails.join("\n");
    }
  
    return null;  // Return null if no match found
  };
  */
// Styled component for the toast message
const ToastMessage = ({ message }) => (
  <div className={`p-4 rounded-lg max-w-full whitespace-pre-wrap shadow-md 
      ${message.toLowerCase().includes("failed") 
        ? "bg-red-100 text-red-600 border-l-4 border-red-500" 
        : "bg-green-100 text-green-600 border-l-4 border-green-500"
      }`}>
    <pre className="font-mono leading-relaxed">
      {message}
    </pre>
  </div>
);

// Function to show toast messages
const showToast = (outputs) => {
  const message = outputs.join("\n");
  const hasFailed = message.toLowerCase().includes("failed");

  toast(hasFailed ? (
    <ToastMessage message={message} />
  ) : (
    <ToastMessage message={message} />
  ), {
    duration: 5000,
    position: "top-left",
    // Custom Icon
    icon: hasFailed ? '❌' : '👏', // Change icon based on message
  });
};



// Example usage
// showSuccessToast(outputs); // Call this function where you need to display the toast

  async function executeCode(testCase: any | null = null) {
    setLoading(true);
    const content =
    languageOption.language === "JavaScript" // Adjust based on your language check
      ? wrapUserCodeInExecution(sourceCode, testCase, languageOption.language) // Wrap user code with execution logic
      : sourceCode; // Use the source code as is for other languages

    const requestData = {
      language: languageOption.language,
      version: languageOption.version,
      files: [
        {
          content: content, // Wrap user code with the execution logic
        },
      ],
    };
    try {
      const result = await compileCode(requestData);
      const outputs = result.run.output.split("\n");
      setOutput(outputs);
      
       // Send code to chatbot without error
      setLoading(false);
      //{outputs.length > 0 ? (
      showToast(outputs);
      //console.log(outputs);
      const ErrorLineresult = extractErrorLine(outputs);
console.log(ErrorLineresult); 
updateChatbotMessages(sourceCode, ErrorLineresult);
setErrorMessage(ErrorLineresult); // Clear any previous error messages
      //toast.success("Compiled successfully");
      
    } catch (error: any) {
      setOutput([]);
      setErrorMessage(error.response?.data || "An unknown error occurred"); // Capture the error
      updateChatbotMessages(sourceCode, error.response?.data || "An unknown error occurred"); // Send both code and error to chatbot
      setLoading(false);
      toast.error("Failed to compile the Code");
      console.error("Compilation error:", error);
    }
  }

  function wrapUserCodeInExecution(userCode: string, testCase: any | null, language: string) {
    // Check if the language is JavaScript
    const isJavaScript = language === 'javascript';
  
    return `
      ${isJavaScript ? `
        ${userCode}
        
        // Custom assertion function to mimic assert.deepStrictEqual
        function assertEqual(actual, expected) {
          const actualStr = JSON.stringify(actual);
          const expectedStr = JSON.stringify(expected);
          if (actualStr !== expectedStr) {
            throw new Error(\`Assertion failed: expected \${expectedStr} but got \${actualStr}\`);
          }
        }
    
        // Function to run test cases
        function runTests() {
          try {
            ${testCase 
              ? `assertEqual(
                 selectionSort(${JSON.stringify(testCase.input[0])}${testCase.input[1] !== undefined ? `, ${testCase.input[1]}` : ''}${testCase.input[2] !== undefined ? `, ${testCase.input[2]}` : ''}),
                  ${JSON.stringify(testCase.expected)}
                );
                
                console.log('Congrats! This test case passed successfully');`
              : testCases.map((test, index) => `
                assertEqual(
                  selectionSort(${JSON.stringify(test.input[0])}${test.input[1] !== undefined ? `, ${test.input[1]}` : ''}${test.input[2] !== undefined ? `, ${test.input[2]}` : ''}),
                  ${JSON.stringify(test.expected)}
                );
                
                console.log('Test case ${index + 1} passed');
              `).join('\n')}
          } catch (error) {
            console.error('Test case failed: ', error.message);
          }
        }
        runTests();
      ` : userCode} // Return the user code as-is if it's not JavaScript
    `;
  }
  
  


  function updateChatbotMessages(code: string, error: string | null) {
    const newMessage = error
      ? `Error occurred while compiling the code: \n${error}\n\nCode:\n${code}`
      : `${code}`;
    setChatbotMessages(newMessage);
  }
  
  return (
    <div className="min-h-screen dark:bg-slate-900 rounded-2xl shadow-2xl py-6 px-8 overflow-hidden">
      {/* EDITOR HEADER */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">CodeSage</h2>
        <div className="flex items-center space-x-2">
          <ModeToggleBtn />
          <div className="w-[230px]">
            <SelectLanguages onSelect={onSelect} selectedLanguageOption={languageOption} />
          </div>
        </div>
      </div>

      {/* EDITOR */}
      <div className="bg-slate-400 dark:bg-slate-950 p-3 rounded-2xl">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50} minSize={35} maxSize={40}>
            {/* Left Panel: Selection Sort */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-auto">
              
                <SelectionSort />
             
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50} minSize={30}>
                {/* Code Editor */}
                <Editor
                  theme={theme === "dark" ? "vs-dark" : "vs-light"}
                  height="120vh"
                  defaultLanguage={languageOption.language}
                  defaultValue={sourceCode}
                  onMount={handleEditorDidMount}
                  value={sourceCode}
                  onChange={handleOnchange}
                  language={languageOption.language}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={50} minSize={40}>
  {/* Output Section */}
  <div className="space-y-3 bg-slate-300 dark:bg-slate-900 p-4 rounded-lg">
    <div className="flex items-center justify-between bg-slate-400 dark:bg-slate-950 px-6 py-2">
      <h3 className="text-lg font-semibold mb-3">Test Cases</h3>
      {loading ? (
        <Button
          disabled
          size={"sm"}
          className="dark:bg-purple-600 dark:hover:bg-purple-700 text-slate-100 bg-slate-800 hover:bg-slate-900"
        >
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          <span>Running please wait...</span>
        </Button>
      ) : (
        <Button
          onClick={() => executeCode(null)} // Run all test cases
          size={"sm"}
          className="dark:bg-purple-600 dark:hover:bg-purple-700 text-slate-100 bg-slate-800 hover:bg-slate-900"
        >
          <Play className="w-4 h-4 mr-2" />
          <span>Run All Test Cases</span>
        </Button>
      )}
    </div>
       
    {/* Make the test cases section horizontally scrollable */}
    <div className="bg-slate-300 dark:bg-slate-900 p-4 rounded-lg shadow-md overflow-x-auto">
      <div className="flex flex-col space-y-4">
        {testCases.map((test, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-slate-200 dark:bg-slate-800 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            {/* Test Case Details */}
            <div className="flex flex-col">
              <h5 className="text-base font-semibold text-gray-800 dark:text-gray-100">Test Case {index + 1}</h5>
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                <span className="mr-2">Input Array:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{JSON.stringify(test.input[0])}</code>

                {/* Conditionally Render Additional Inputs */}
                {test.input[1] !== undefined && (
                  <>
                    <span className="ml-4 mr-2">Target:</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{test.input[1]}</code>
                  </>
                )}
                {test.input[2] !== undefined && (
                  <>
                    <span className="ml-4 mr-2">Third Input:</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{test.input[2]}</code>
                  </>
                )}
              </div>
            </div>

            {/* Expected Output and Run Button Section */}
            <div className="flex items-center space-x-6">
              {/* Expected Output */}
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold mr-1">Expected Output:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                  {JSON.stringify(test.expected)}
                </code>
              </div>

              {/* Run Button <Button
                onClick={() => executeCode(test)} // Execute the specific test case
                className="bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-500 dark:hover:bg-purple-800"
              >
                Run
              </Button>*/}
              
            </div>
          </div>
        ))}
      </div>
    {/* Output/Error */}
    <div className="p-2">
      <h3 className="text-lg font-semibold">Results:</h3>
      {output.length > 0 ? (
  <pre 
    className={`bg-slate-800 p-4 rounded-lg omx-auto whitespace-pre-wrap ${
      output.some(msg => msg.toLowerCase().includes("failed")) ? "text-red-400" : "text-green-400"
    }`}
  >
    {output.join("\n")}
  </pre>
) : (
  <p className="text-gray-400">No output yet...</p>
)}

      {errorMessage && (
        <div className="mt-4 bg-red-800 text-red-300 p-4 rounded-lg">
          <TriangleAlert className="inline-block w-6 h-6 mr-2" />
          <span>Error: {errorMessage}</span>
        </div>
      )}
    </div>
    </div>

   
  </div>
</ResizablePanel>

            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Floating Chatbot Icon */}
  <div
    className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 rounded-full p-4 shadow-lg cursor-pointer"
    onClick={() => setIsChatbotVisible(true)}
  >
    <MessageSquare className="w-6 h-6 text-white" />
  </div>

  {/* Conditionally Render Chatbot */}
  {isChatbotVisible && (
    <div className="fixed bottom-20 right-6 bg-slate-100 dark:bg-slate-800 p-6 rounded-lg shadow-md max-h-96 overflow-auto z-50 w-97">
      <ChatbotComponent messages={chatbotMessages} />
      <div className="text-right mt-4">
      <Button 
  onClick={() => {
    toast.error("Chatbot conversations will not be saved.");
    setIsChatbotVisible(false); // Hide the chatbot
     // Show toast message
  }} 
  size="sm"
>
  Close
</Button>
      </div>
    </div>
  )}
</div>

  );
}
