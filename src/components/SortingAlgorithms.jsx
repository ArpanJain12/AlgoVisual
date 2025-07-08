import React, { useState, useEffect } from "react";

const algorithms = {
  bubble: (arr) => {
    const steps = [];
    let temp = [...arr];
    const n = temp.length;
    let sortedSet = new Set();
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          array: [...temp],
          highlight: [j, j + 1],
          sortedIndices: Array.from(sortedSet),
          explanation: `Comparing ${temp[j]} and ${temp[j + 1]}`
        });
        if (temp[j] > temp[j + 1]) {
          [temp[j], temp[j + 1]] = [temp[j + 1], temp[j]];
          steps.push({
            array: [...temp],
            highlight: [j, j + 1],
            sortedIndices: Array.from(sortedSet),
            explanation: `Swapped ${temp[j + 1]} and ${temp[j]}`
          });
        }
      }
      sortedSet.add(n - i - 1);
      steps.push({
        array: [...temp],
        highlight: [],
        sortedIndices: Array.from(sortedSet),
        explanation: `Marked index ${n - i - 1} as sorted`
      });
    }
    sortedSet.add(0);
    steps.push({
      array: [...temp],
      highlight: [],
      sortedIndices: Array.from(sortedSet),
      explanation: `Array is fully sorted: [${temp.join(', ')}]`
    });
    return steps;
  },
  selection: (arr) => {
    const steps = [];
    let temp = [...arr];
    let sortedSet = new Set();
    for (let i = 0; i < temp.length; i++) {
      let minIdx = i;
      for (let j = i + 1; j < temp.length; j++) {
        steps.push({ array: [...temp], highlight: [minIdx, j], sortedIndices: Array.from(sortedSet), explanation: `Comparing ${temp[minIdx]} and ${temp[j]}` });
        if (temp[j] < temp[minIdx]) minIdx = j;
      }
      [temp[i], temp[minIdx]] = [temp[minIdx], temp[i]];
      sortedSet.add(i);
      steps.push({ array: [...temp], highlight: [i, minIdx], sortedIndices: Array.from(sortedSet), explanation: `Swapped ${temp[minIdx]} and ${temp[i]}` });
    }
    steps.push({ array: [...temp], highlight: [], sortedIndices: [...Array(temp.length).keys()], explanation: `Array is fully sorted: [${temp.join(', ')}]` });
    return steps;
  },
  insertion: (arr) => {
    const steps = [];
    let temp = [...arr];
    let sortedSet = new Set();
    for (let i = 1; i < temp.length; i++) {
      let key = temp[i];
      let j = i - 1;
      while (j >= 0 && temp[j] > key) {
        temp[j + 1] = temp[j];
        steps.push({ array: [...temp], highlight: [j, j + 1], sortedIndices: Array.from(sortedSet), explanation: `Shifting ${temp[j]} right` });
        j--;
      }
      temp[j + 1] = key;
      sortedSet.add(i);
      steps.push({ array: [...temp], highlight: [j + 1], sortedIndices: Array.from(sortedSet), explanation: `Inserting ${key} at position ${j + 1}` });
    }
    sortedSet = new Set([...Array(temp.length).keys()]);
    steps.push({ array: [...temp], highlight: [], sortedIndices: Array.from(sortedSet), explanation: `Array is fully sorted: [${temp.join(', ')}]` });
    return steps;
  },
  merge: (arr) => {
    const steps = [];
    const temp = [...arr];
    const sortedSet = new Set();
    const mergeSort = (start, end) => {
      if (end - start <= 1) return;
      const mid = Math.floor((start + end) / 2);

      steps.push({ array: [...temp], highlight: [], sortedIndices: Array.from(sortedSet), explanation: `Dividing array from index ${start} to ${mid - 1} and ${mid} to ${end - 1}` });

      mergeSort(start, mid);
      mergeSort(mid, end);
      const merged = [];
      let i = start, j = mid;
      while (i < mid && j < end) {
        steps.push({ array: [...temp], highlight: [i, j], sortedIndices: Array.from(sortedSet), explanation: `Comparing ${temp[i]} and ${temp[j]}` });
        if (temp[i] < temp[j]) {
          merged.push(temp[i++]);
        } else {
          merged.push(temp[j++]);
        }
      }
      while (i < mid) merged.push(temp[i++]);
      while (j < end) merged.push(temp[j++]);
      for (let k = 0; k < merged.length; k++) {
        temp[start + k] = merged[k];
        steps.push({ array: [...temp], highlight: [start + k], sortedIndices: Array.from(sortedSet), explanation: `Inserted ${merged[k]} at index ${start + k}` });
      }
    };
    mergeSort(0, temp.length);
    const finalSorted = new Set([...Array(temp.length).keys()]);
    steps.push({ array: [...temp], highlight: [], sortedIndices: Array.from(finalSorted), explanation: `Array is fully sorted: [${temp.join(', ')}]` });
    return steps;
  },
  quick: (arr) => {
    const steps = [];
    const temp = [...arr];
    const sortedSet = new Set();
    const quickSort = (start, end) => {
      if (start >= end) return;
      let pivot = temp[end];
      let pIndex = start;
      for (let i = start; i < end; i++) {
        steps.push({ array: [...temp], highlight: [i, end], sortedIndices: Array.from(sortedSet), explanation: `Comparing ${temp[i]} and pivot ${pivot}` });
        if (temp[i] < pivot) {
          [temp[i], temp[pIndex]] = [temp[pIndex], temp[i]];
          steps.push({ array: [...temp], highlight: [i, pIndex], sortedIndices: Array.from(sortedSet), explanation: `Swapped ${temp[pIndex]} and ${temp[i]}` });
          pIndex++;
        }
      }
      [temp[pIndex], temp[end]] = [temp[end], temp[pIndex]];
      steps.push({ array: [...temp], highlight: [pIndex, end], sortedIndices: Array.from(sortedSet), explanation: `Swapped pivot ${pivot} to position ${pIndex}` });
      quickSort(start, pIndex - 1);
      quickSort(pIndex + 1, end);
    };
    quickSort(0, temp.length - 1);
    const finalSorted = new Set([...Array(temp.length).keys()]);
    steps.push({ array: [...temp], highlight: [], sortedIndices: Array.from(finalSorted), explanation: `Array is fully sorted: [${temp.join(', ')}]` });
    return steps;
  },
};



const VisualSort = ({ type, onBack }) => {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const [error, setError] = useState("");

  const startSort = () => {
    if (!input.trim()) {
      setError("Please enter some numbers to sort");
      return;
    }
    
    // Split and clean the input
    const cleanedInput = input.split(",").map(item => item.trim()).filter(item => item !== "");
    
    // Check if array is empty after cleaning
    if (cleanedInput.length === 0) {
      setError("Please enter valid numbers (no empty values)");
      return;
    }
    
    // Convert to numbers and validate
    const arr = cleanedInput.map(Number);
    if (arr.some(isNaN)) {
      setError("Please enter valid comma-separated numbers only");
      return;
    }
    setError("");
    const result = algorithms[type](arr);
    setSteps(result);
    setStepIdx(0);
    setAuto(false);
  };

  useEffect(() => {
    if (!auto) return;
    const interval = setInterval(() => {
      setStepIdx((i) => {
        if (i + 1 < steps.length) return i + 1;
        clearInterval(interval);
        return i;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [auto, steps.length]);

  const maxVal = Math.max(...(steps[stepIdx]?.array || [1]));
  const current = steps[stepIdx] || { array: [], highlight: [], sortedIndices: [], explanation: "" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      
      
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button 
              onClick={onBack} 
              className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {type.charAt(0).toUpperCase() + type.slice(1)} Sort
            </h2>
          </div>

          {/* Input Section */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 mb-6 border border-white/10">
          {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Enter array values (comma-separated)
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={input}
              placeholder="e.g., 64,34,25,12,22,11,90"
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {/* Controls */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={startSort} 
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Sort
              </button>
              <button
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                disabled={stepIdx === 0}
                                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"

              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                Previous
              </button>
              <button
                onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
                disabled={stepIdx >= steps.length - 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
              </button>
              <button
                  onClick={() => setAuto((prev) => !prev)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  {auto ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 015 0H17M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Autoplay
                    </>
                  )}
                </button>
            </div>
          </div>

          {/* Step Info */}
          {steps.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Step {stepIdx + 1} of {steps.length}</span>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                    <span>Comparing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <span>Sorted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Unsorted</span>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm sm:text-base italic text-blue-300 min-h-[24px]">
                {current.explanation}
              </div>
            </div>
          )}

          {/* Visualization */}
          {current.array.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex flex-col items-center">
                <div className="flex items-end justify-center gap-1 sm:gap-2 w-full overflow-x-auto pb-4">
                  <div className="flex items-end justify-center gap-1 sm:gap-2 h-48 sm:h-64 border-b border-white/30 pt-8">
                    {current.array.map((num, idx) => {
                      const isHighlighted = current.highlight.includes(idx);
                      const isSorted = current.sortedIndices.includes(idx);
                      const bgColor = isHighlighted
                        ? "bg-yellow-400"
                        : isSorted
                        ? "bg-green-400"
                        : "bg-red-500";

                      return (
                        <div
                          key={idx}
                          className={`min-w-[20px] w-4 sm:w-6 rounded-t transition-all duration-500 relative flex items-end justify-center text-xs font-bold shadow-lg ${bgColor}`}
                          style={{ height: `${Math.max((num / maxVal) * 100, 10)}%` }}
                        >
                          <span className="absolute -top-7 text-xs sm:text-sm font-bold text-white px-1 py-0.5 rounded whitespace-nowrap left-1/2 transform -translate-x-1/2">
                            {num}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-center gap-1 sm:gap-2 mt-2 overflow-x-auto">
                  {current.array.map((_, idx) => (
                    <div
                      key={idx}
                      className="min-w-[20px] w-4 sm:w-6 text-xs text-gray-400 text-center"
                    >
                      {idx}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SortingAlgorithms = ({ onBack = () => {} }) => {
  const [selectedSort, setSelectedSort] = useState(null);

  if (selectedSort) {
    return <VisualSort type={selectedSort} onBack={() => setSelectedSort(null)} />;
  }

  const sortingAlgorithms = [
    {
      name: "Bubble Sort",
      key: "bubble",
      description: "Simple comparison-based algorithm",
      complexity: "O(n²)",
      color: "from-red-500 to-pink-500"
    },
    {
      name: "Selection Sort",
      key: "selection", 
      description: "Finds minimum element repeatedly",
      complexity: "O(n²)",
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Insertion Sort",
      key: "insertion",
      description: "Builds sorted array one element at a time",
      complexity: "O(n²)",
      color: "from-yellow-500 to-orange-500"
    },
    {
      name: "Merge Sort",
      key: "merge",
      description: "Divide and conquer algorithm",
      complexity: "O(n log n)",
      color: "from-green-500 to-teal-500"
    },
    {
      name: "Quick Sort",
      key: "quick",
      description: "Efficient divide and conquer",
      complexity: "O(n log n)",
      color: "from-blue-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={onBack} 
              className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 pb-2">
              Sorting Algorithms
            </h1>
            
              
            
          </div>

          {/* Algorithm Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sortingAlgorithms.map((algorithm) => (
              <button
                key={algorithm.key}
                onClick={() => setSelectedSort(algorithm.key)}
                className="group relative bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105 text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${algorithm.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-white/90">
                    {algorithm.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-3 group-hover:text-gray-200">
                    {algorithm.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${algorithm.color} text-white font-medium`}>
                      {algorithm.complexity}
                    </span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default SortingAlgorithms;