import React, { useState, useEffect } from "react";
import { chatSession, model } from "./aimodel";
import axios from "axios";
import { SendIcon, SparklesIcon, UserIcon, BotIcon, MicIcon, MessageSquareCodeIcon } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
interface ChatbotComponentProps {
  messages: string;
}

const ChatbotComponent: React.FC<ChatbotComponentProps> = ({ messages }) => {
  const [AIOutput, setAIOutput] = useState<string>(""); // AI output state
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const [userMessage, setUserMessage] = useState<string>(""); // User input
  const [chatHistory, setChatHistory] = useState<string[]>([]); // Chat history
  const [instructorQuestion, setInstructorQuestion] = useState<string>(''); // Initial instructor question
  const [isLoadingInstructorQuestion, setIsLoadingInstructorQuestion] = useState<boolean>(true); // Loading state for instructor question
  const [inElse, setInElse] = useState<boolean>(false); // To track if we're in the "review buggy code" flow
  const [studentBugs, setstudentBugs] = useState<string>("");
  const problemStatement = `---
problem:
Given an unsorted array of size N, use selection sort to sort arr[] in increasing order.


Example 1:
Input: N = 5, arr[] = 7


Output: 1, 3, 4, 7, 9

---`;

  useEffect(() => {
    const generateAIContent = async () => {
      if (messages.length === 0) return; // Don't call API if no messages
      setIsLoading(true); // Show loading state
      console.log(messages);
      try {
        const userMessage = messages;
        const ProblemAndBuggycode = problemStatement+`---
        buggy_code:`+messages+`---`;
const checkbuggyprompt = ProblemAndBuggycode + "\n\n Carefully analyze the provided buggy code, paying close attention to its logic, adherence to the problem constraints, and potential edge cases.  \
\
Specifically, consider these points:\
\
* **Correctness:** Does the code implement the intended algorithm accurately?\
* **Efficiency:** Is the code's time and space complexity reasonable for the given problem?\
* **Edge Cases:** Does the code handle all possible input scenarios, including empty inputs, extreme values, or special cases mentioned in the problem statement?\
* **Error Handling:** Are potential errors (like index out of bounds, null values, etc.) handled gracefully?\
* **Best Practices:**  Does the code follow coding conventions and best practices for readability and maintainability?\
\
If you find any errors, logical flaws, or areas for improvement, respond with 'false'. If the code appears to be correct and efficient based on your analysis, respond with 'true'.";
        const result = await model.generateContent(checkbuggyprompt);
        const aiResponse = await result.response.text();

        setAIOutput(aiResponse); // Set AI output
        console.log(aiResponse);

        if (aiResponse.includes("true")) {
          setChatHistory((prev) => [
            ...prev,
            "Instructor: You have written a Perfect Code.",
          ]);
          speak("You have written a Perfect Code."); // Speak instructor response
        } else {
          setChatHistory((prev) => [
            ...prev,
            "Instructor: There might be some issues in your code. Do you want to review it?",
          ]);
          speak("There might be some issues in your code. Do you want to review it?"); // Speak instructor response
          setInElse(true);
        }
      } catch (error) {
        console.error("Error interacting with Instructor:", error);
        /*setChatHistory((prev) => [
          ...prev,
          "Instructor: Sorry, an error occurred while processing your request.",
        ]);
        speak("Sorry, an error occurred while processing your request."); // Speak error response
        */
      } finally {
        setIsLoading(false); // Hide loading state
      }
    };

    generateAIContent();
  }, [messages]); // Trigger API call when messages change

  const fetchInstructorQuestion = async (prevQuestion: string) => {
    setIsLoadingInstructorQuestion(true);
    try {
      let retries = 0; // Set a limit to the retries
      let updatedQuestion = prevQuestion;

      while (retries < 10) {
        const response = await fetch("http://127.0.0.1:8080/api/instructor_question");
        const data = await response.json();

        if (data.instructor_question && data.instructor_question !== prevQuestion) {
          updatedQuestion = data.instructor_question;
          setInstructorQuestion(updatedQuestion);
          setChatHistory((prev) => [...prev, `Instructor: ${updatedQuestion}`]);
          speak(updatedQuestion); // Speak instructor question
          break;
        }

        // Wait for 2 seconds before the next polling attempt
        await new Promise((resolve) => setTimeout(resolve, 2000));
        retries++;
      }

      if (retries === 40) {
        console.error("Instructor question update timed out.");
      }

    } catch (error) {
      console.error("Error fetching instructor question:", error);
    } finally {
      setIsLoadingInstructorQuestion(false);
    }
  };

  // Fetch initial instructor question
  useEffect(() => {
    fetchInstructorQuestion('');
  }, []);

  // Handle user input submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userMessage.trim()) return;

    setChatHistory((prev) => [...prev, `User: ${userMessage}`]); // Update chat history
    const trimmedMessage = userMessage.trim().toLowerCase();
    setUserMessage(""); // Clear input
    console.log(trimmedMessage);

    if (inElse) {
      if (trimmedMessage === "yes") {
        // The student wants to review the buggy code
        try {
          setIsLoading(true);
          setInElse(false);
          const ProblemAndBuggycode = problemStatement + `---
        buggy_code:` + messages + `---`;
        await fetch('http://127.0.0.1:8080/api/home', { //const response=
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: ProblemAndBuggycode }),
          });
         /*if (response.ok) {
           // const data = await response.json();
            setstudentBugs(data.studentbugs);
            setChatHistory((prev) => [
              ...prev,
              `Your bug fixes are ${data.studentbugs} `,
            ]);
            speak(`Your bug fixes are ${data.studentbugs} `); // Speak review instruction
            setChatHistory((prev) => [
              ...prev,
              `Instructor: Your bug fixes are ${data.studentbugs}.Go ahead to solve the problem with relevant bug fixes you mentioned.Did I meet your expectations today? 😊 I'd love to hear your thoughts! `,
            ]);
            speak("Your bug fixes are ${data.studentbugs}.Go ahead to solve the problem with relevant bug fixes.Did I meet your expectations today? I'd love to hear your thoughts!"); // Speak review instruction
        }*/
          
          
          setInElse(false); // Reset the state after review starts
        } catch (error) {
          
            console.error("Error reviewing code:", error);
            setChatHistory((prev) => [
              ...prev,
              `Instructor: Go ahead to solve the problem with relevant bug fixes.Did I meet your expectations today? 😊 I'd love to hear your thoughts! `,
            ]);
            speak("Go ahead to solve the problem with relevant bug fixes .Did I meet your expectations today? I'd love to hear your thoughts!"); // Speak review instruction
        
          
        } finally {
          setIsLoading(false);
        }
      } else {
        setChatHistory((prev) => [
          ...prev,
          "Instructor: Okay, no problem. Let me know if you need any help later.",
        ]);
        speak("Okay, no problem. Let me know if you need any help later."); // Speak dismissal
        setInElse(false); // Exit the review flow
      }
    } else {
      // Standard input processing
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8080/api/student_response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ student_response: userMessage }),
        });

        if (response.ok) {
          await fetchInstructorQuestion(instructorQuestion); // Fetch next instructor question after response
        } else {
          console.error("Failed to process student response:", response.statusText);
          setChatHistory((prev) => [
            ...prev,
            "Instructor: Sorry, there was an issue processing your request.",
          ]);
          speak("Sorry, there was an issue processing your request."); // Speak error response
        }
      } catch (error) {
        /*
        console.error("Error sending student response:", error);
        setChatHistory((prev) => [
          ...prev,
          "Instructor: Sorry, an error occurred while processing your request.",
        ]);
        speak("Sorry, an error occurred while processing your request."); // Speak error response
        */
        setChatHistory((prev) => [
          ...prev,
          `Instructor: Go ahead to solve the problem with relevant bug fixes.Did I meet your expectations today? 😊 I'd love to hear your thoughts! `,
        ]);
        speak("Go ahead to solve the problem with relevant bug fixes .Did I meet your expectations today? I'd love to hear your thoughts!"); // Speak review instruction
    
          } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // If an instructor question is received, handle the response submission
    if (instructorQuestion) {
      handleSubmit();
    }
  }, [instructorQuestion]);

  // Speech synthesis function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported in this browser.");
    }
  };
  
  

  // Speech recognition functionality
  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.interimResults = false;
    recognition.lang = 'en-US';
   
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserMessage(transcript); // Set user message from voice input
      //speak(`You said: ${transcript}`); // Feedback to user
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        {/* Chat Container */}
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-100">
          CodeSage - AI Code Learner
        </h2>
 
        {/* Chat Messages Container */}
        <div className="space-y-4">
          {chatHistory.length > 0 ? (
            chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 items-start ${
                  message.startsWith("Instructor:") ? "justify-start" : "justify-end"
                }`}
              >
                {message.startsWith("Instructor:") ? (
                  <div className="flex items-center gap-2 justify-start ">
                    <div className="p-2 border border-gray-800 rounded-full">
                      <SparklesIcon className="text-primary size-7" />
                    </div>
                    <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 rounded-lg p-3 max-w-[70%]">
                      <p className="text-base">{message.replace("Instructor: ", "")}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-end">
                    <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg p-3 max-w-[70%] ml-auto">
                      <p className="text-base">{message.replace("User: ", "")}</p>
                    </div>
                    <div className="p-4 border border-gray-800 rounded-full">
                      <UserIcon className="text-primary size-7" />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No messages yet.
            </p>
          )}
        </div>
 
        {/* Loading state */}
        {isLoading && (
          <p className="text-center mt-4 text-indigo-600 dark:text-indigo-400">
            Let's make learning code enjoyable!
          </p>
        )}
 
        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="w-full mt-6 flex bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        >
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Type your code question here..."
            className="flex-grow p-4 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-r-lg focus:outline-none hover:bg-indigo-700 dark:hover:bg-indigo-400"
          >
            <SendIcon className="size-5 text-white" />
          </button>
          <button type="button" onClick={handleVoiceInput} className="p-2 border border-gray-800 rounded-full">
         
                      <MicIcon className="text-primary size-7" />
                   
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotComponent;


