import React, { useState } from "react";
import { Button } from "./ui/button";


  
export default function SelectionSort() {
  const [inputArray, setInputArray] = useState([4, 1, 3, 9, 7]);
  const [sortedArray, setSortedArray] = useState<number[] | null>(null);

  // Selection Sort Algorithm
  function selectionSort(arr: number[]) {
    let n = arr.length;
    for (let i = 0; i < n; i++) {
      let minIndex = i;
      for (let j = i + 1; j < n; j++) {
        if (arr[j] < arr[minIndex]) {
          minIndex = j;
        }
      }
      if (minIndex !== i) {
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]; // Swap
      }
    }
    return arr;
  }

  const handleSort = () => {
    const sorted = [...inputArray];
    setSortedArray(selectionSort(sorted));
  };

  return (
    <div className="dark:bg-slate-800 bg-slate-100 p-6 rounded-lg shadow-lg max-w-lg mx-auto whitespace-pre-wrap">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Selection Sort </h2>
      <h3 className="text-lg font-bold text-gray-500 dark:text-gray-200">Difficulty: <span className="text-green-600">Easy</span></h3>
      
     
      {/* Problem description */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow">
       
        <p className="ml-3 ext-gray-1000 dark:text-gray-300">
          Given an unsorted array of size N, use selection sort to sort arr[] in increasing order.
        </p>
        
        
      </div>

      {/* Example section */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow">
        <h3 className="text-md font-bold text-gray-800 dark:text-gray-200">Example 1:</h3>
        <p className="text-gray-700 dark:text-gray-300 mt-2">Input: <span className="font-mono">N = 5, arr[] = {4, 1, 3, 9, 7}</span></p>
        <p className="text-gray-700 dark:text-gray-300 mt-2">Output: <span className="font-mono">1, 3, 4, 7, 9</span></p>
        <p className="text-gray-700 dark:text-gray-300 mt-2">Explanation:</p>
        <ul className="text-gray-600 dark:text-gray-400 ml-6 list-disc">
          <li>Select 1. Array becomes 1, 4, 3, 9, 7.</li>
          <li>Select 3. Array becomes 1, 3, 4, 9, 7.</li>
          <li>Select 4. Array becomes 1, 3, 4, 9, 7.</li>
          <li>Select 7. Array becomes 1, 3, 4, 7, 9.</li>
          <li>Select 9. Array becomes 1, 3, 4, 7, 9.</li>
        </ul>
      </div>

      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow">
        <h3 className="text-md font-bold text-gray-800 dark:text-gray-200">Example 2:</h3>
        <p className="text-gray-700 dark:text-gray-300 mt-2">Input: <span className="font-mono">N = 10, arr[] = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1}</span></p>
        <p className="text-gray-700 dark:text-gray-300 mt-2">Output: <span className="font-mono">1, 2, 3, 4, 5, 6, 7, 8, 9, 10</span></p>
      </div>

      {/* Constraints */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow">
        <h3 className="text-md font-bold text-gray-800 dark:text-gray-200">Constraints:</h3>
        <ul className="text-gray-600 dark:text-gray-400 ml-6 list-disc">
          <li>1 ≤ N ≤ 10<sup>3</sup></li>
          <li>Expected Time Complexity: O(N<sup>2</sup>)</li>
          <li>Expected Auxiliary Space: O(1)</li>
        </ul>
      </div>

      {/* Input Array Section */}
      <div className="bg-slate-200 dark:bg-slate-700 p-4 rounded-md">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Input Array:</p>
        <pre className="text-lg font-mono text-gray-800 dark:text-gray-200">
          {inputArray.join(", ")}
        </pre>
      </div>

      {/* Sorted Array Section */}
      {sortedArray && (
        <div className="bg-green-100 dark:bg-green-700 p-4 rounded-md mt-4">
          <p className="text-sm text-green-800 dark:text-green-200 mb-2">Sorted Array:</p>
          <pre className="text-lg font-mono text-green-900 dark:text-green-50">
            {sortedArray.join(", ")}
          </pre>
        </div>
      )}

      {/* Sort Button */}
      <Button
        onClick={handleSort}
        className="w-full mt-6 bg-purple-600 dark:bg-purple-700 text-white py-2 rounded-lg hover:bg-purple-500 dark:hover:bg-purple-800"
      >
        Sort Array
      </Button>
    </div>
  );
}
