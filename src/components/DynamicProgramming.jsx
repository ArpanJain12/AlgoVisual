import React, { useState, useEffect, useRef } from "react";

const DynamicProgrammingVisualizer = ({ onBack = () => {} }) => {
  const [problem, setProblem] = useState("fibonacci");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [steps, setSteps] = useState([]);
  const [explanations, setExplanations] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [finalResult, setFinalResult] = useState("");
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const generateFibonacciDP = (n) => {
    const trace = [];
    const explain = [];
    const dp = Array(n + 1).fill(0);
    dp[1] = 1;
    trace.push([...dp]);
    explain.push("Initialized: dp[0] = 0, dp[1] = 1");

    for (let i = 2; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      trace.push([...dp]);
      explain.push(`dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`);
    }
    setExplanations(explain);
    setFinalResult(`Fibonacci(${n}) = ${dp[n]}`);
    return trace;
  };

  const generateLCSDP = (a, b) => {
    const trace = [];
    const explain = [];
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    trace.push(dp.map(row => [...row]));
    explain.push("Initialized 0s in dp table");

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          explain.push(`dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]} (match: '${a[i - 1]}')`);
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          explain.push(`dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}`);
        }
        trace.push(dp.map(row => [...row]));
      }
    }
    
    // Reconstruct LCS
    let lcs = "";
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        lcs = a[i - 1] + lcs;
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    setExplanations(explain);
    setFinalResult(`LCS Length: ${dp[m][n]}, LCS: "${lcs}"`);
    return trace;
  };

  const generateSubsetSumDP = (arr, sum) => {
    const trace = [];
    const explain = [];
    const n = arr.length;
    const dp = Array.from({ length: n + 1 }, () => Array(sum + 1).fill(false));
    for (let i = 0; i <= n; i++) dp[i][0] = true;
    trace.push(dp.map(row => [...row]));
    explain.push("Set all dp[i][0] = true (sum 0 is always possible)");

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= sum; j++) {
        if (j < arr[i - 1]) {
          dp[i][j] = dp[i - 1][j];
          explain.push(`dp[${i}][${j}] = dp[${i - 1}][${j}] = ${dp[i][j]} (arr[${i - 1}] > ${j})`);
        } else {
          dp[i][j] = dp[i - 1][j] || dp[i - 1][j - arr[i - 1]];
          explain.push(`dp[${i}][${j}] = dp[${i - 1}][${j}] || dp[${i - 1}][${j - arr[i - 1]}] = ${dp[i][j]}`);
        }
        trace.push(dp.map(row => [...row]));
      }
    }
    setExplanations(explain);
    setFinalResult(`Subset Sum ${sum} is ${dp[n][sum] ? "POSSIBLE" : "NOT POSSIBLE"}`);
    return trace;
  };

  const handleStart = () => {
    setError("");
    
    if (problem === "fibonacci") {
      const n = parseInt(inputA);
      if (isNaN(n) || n <= 1 || n > 30) {
        setError("Enter a valid number greater than 1 and less than or equal to 30.");
        return;
      }
      setSteps(generateFibonacciDP(n));
    } else if (problem === "lcs") {
      if (!inputA || !inputB) {
        setError("Please enter both strings.");
        return;
      }
      setSteps(generateLCSDP(inputA, inputB));
    } else if (problem === "subset") {
      const arr = inputA.split(",").map(Number);
      const sum = parseInt(inputB);
      if (arr.some(isNaN) || isNaN(sum)) {
        setError("Please enter valid numbers for array and sum.");
        return;
      }
      setSteps(generateSubsetSumDP(arr, sum));
    }
    setCurrentStep(0);
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    setAutoplay(false);
    setSteps([]);
    setExplanations([]);
    setCurrentStep(0);
    setFinalResult("");
    setInputA("");
    setInputB("");
    setError("");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (!autoplay || !running) return;
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev < steps.length - 1 ? prev + 1 : prev;
        // Stop autoplay when we reach the final step
        if (next === steps.length - 1) {
          setAutoplay(false);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [autoplay, running, steps]);

  const currentData = steps[currentStep] || [];
  const currentExplanation = explanations[currentStep] || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-6 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Dynamic Programming Visualizer
          </h1>
          
        </div>

        {/* Error Bar */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!running ? (
          <div className="space-y-6">
            {/* Problem Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-blue-300">Select Algorithm</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { value: "fibonacci", label: "Fibonacci", desc: "Classic sequence problem" },
                  { value: "lcs", label: "Longest Common Subsequence", desc: "String matching algorithm" },
                  { value: "subset", label: "Subset Sum", desc: "Target sum possibility" }
                ].map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="problem"
                      value={option.value}
                      checked={problem === option.value}
                      onChange={() => setProblem(option.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      problem === option.value 
                        ? "border-purple-500 bg-purple-900/30" 
                        : "border-slate-600 bg-slate-800/30 hover:border-slate-500"
                    }`}>
                      <div className="font-medium text-white">{option.label}</div>
                      <div className="text-sm text-gray-400 mt-1">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-blue-300">Input Parameters</h2>
              <div className="space-y-4">
                {problem === "fibonacci" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Enter n (2-30)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 10"
                      className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors duration-200"
                      value={inputA}
                      onChange={(e) => setInputA(e.target.value)}
                    />
                  </div>
                ) : problem === "subset" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Array (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 3,34,4,12,5,2"
                        className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors duration-200"
                        value={inputA}
                        onChange={(e) => setInputA(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Target Sum
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 9"
                        className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors duration-200"
                        value={inputB}
                        onChange={(e) => setInputB(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        String A
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., ABCDGH"
                        className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors duration-200"
                        value={inputA}
                        onChange={(e) => setInputA(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        String B
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., AEDFHR"
                        className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors duration-200"
                        value={inputB}
                        onChange={(e) => setInputB(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Visualization
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Visualization Area */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex flex-col items-center justify-center space-y-4 mb-6">
                <div className="overflow-x-auto w-full flex justify-center">
                  <div className="min-w-fit">
                    {problem === "fibonacci" ? (
                      <div className="space-y-3 flex flex-col items-center">
                        {/* Index row */}
                        <div className="flex gap-1 sm:gap-2">
                          {currentData.map((_, idx) => (
                            <div key={idx} className="w-12 sm:w-16 text-center text-xs sm:text-sm text-blue-300 font-medium">
                              {idx}
                            </div>
                          ))}
                        </div>
                        {/* Value row */}
                        <div className="flex gap-1 sm:gap-2">
                          {currentData.map((val, idx) => (
                            <div
                              key={idx}
                              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
                                val === 0 && idx > 1 && currentStep === 0
                                  ? "bg-slate-700 text-slate-400" 
                                  : "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg"
                              }`}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 flex flex-col items-center">
                        {/* Column headers */}
                        <div className="flex gap-1 sm:gap-2">
                          <div className="w-12 sm:w-14 text-center text-xs sm:text-sm text-blue-300 font-medium"></div>
                          {currentData[0]?.map((_, j) => (
                            <div key={j} className="w-12 sm:w-14 text-center text-xs sm:text-sm text-blue-300 font-medium">
                              {j}
                            </div>
                          ))}
                        </div>
                        
                        {/* Table rows */}
                        {currentData.map((row, i) => (
                          <div key={i} className="flex gap-1 sm:gap-2">
                            <div className="w-12 sm:w-14 text-center text-xs sm:text-sm text-blue-300 font-medium flex items-center justify-center">
                              {i}
                            </div>
                            {row.map((val, j) => (
                              <div
                                key={j}
                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg text-xs sm:text-sm flex items-center justify-center font-bold transition-all duration-300 ${
                                  problem === "lcs" 
                                    ? (val > 0 ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg" : "bg-slate-700 text-slate-400")
                                    : (val ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg" : "bg-slate-700 text-slate-400")
                                }`}
                              >
                                {problem === "subset" ? (val ? "T" : "F") : val}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step Information */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="text-center space-y-4">
                <div className="text-sm text-gray-400">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <div className="text-blue-300 italic min-h-[1.5rem] px-4">
                  {currentExplanation}
                </div>
                {currentStep === steps.length - 1 && (
                  <div className="text-center p-4">
                    <div className="text-green-400 text-sm font-medium">
                      {finalResult}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <button
                onClick={() => setCurrentStep((c) => Math.max(0, c - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={() => setCurrentStep((c) => Math.min(steps.length - 1, c + 1))}
                disabled={currentStep === steps.length - 1}
                className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                  onClick={() => setAutoplay((prev) => !prev)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  {autoplay ? (
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
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicProgrammingVisualizer;