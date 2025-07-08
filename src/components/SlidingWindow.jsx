import React, { useState, useEffect, useRef } from "react";

const SlidingWindow = ({ onBack = () => {} }) => {
  const [arrayInput, setArrayInput] = useState("");
  const [kInput, setKInput] = useState("");
  const [mode, setMode] = useState("view");
  const [array, setArray] = useState([]);
  const [windowSize, setWindowSize] = useState(0);
  const [steps, setSteps] = useState([]);
  const [current, setCurrent] = useState(0);
  const [running, setRunning] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const prepareSteps = (arr, k) => {
    const trace = [];
    for (let i = 0; i <= arr.length - k; i++) {
      const window = arr.slice(i, i + k);
      let result = null;
      if (mode === "sum") result = window.reduce((a, b) => a + b, 0);
      if (mode === "avg") result = window.reduce((a, b) => a + b, 0) / k;
      trace.push({ start: i, end: i + k - 1, result });
    }
    return trace;
  };

  const handleStart = () => {
    setError("");
    const parsedArray = arrayInput
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n !== "")
      .map(Number);
    const k = parseInt(kInput);
    if (
      parsedArray.length === 0 ||
      parsedArray.some(isNaN) ||
      isNaN(k) ||
      k <= 0 ||
      k > parsedArray.length
    ) {
      setError("Invalid input or window size. Please enter valid numbers and ensure window size is positive and not larger than array length.");
      setArrayInput("");
      setKInput("");
      return;
    }
    const stepTrace = prepareSteps(parsedArray, k);
    setArray(parsedArray);
    setWindowSize(k);
    setSteps(stepTrace);
    setCurrent(0);
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    setArray([]);
    setWindowSize(0);
    setSteps([]);
    setCurrent(0);
    setAutoplay(false);
    setError("");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (!autoplay || !running) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = prev < steps.length - 1 ? prev + 1 : 0;
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [autoplay, running, steps]);

  const { start, end, result } = steps[current] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-6 group"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Sliding Window Visualizer
          </h2>
        </div>

          {!running ? (
            <div className="max-w-2xl mx-auto">
              {/* Input Section */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-2xl">
              <div className="space-y-6">
                {/* Error Message */}
              {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    Array (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1, 2, 3, 4, 5"
                    className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-white placeholder-gray-400"
                    value={arrayInput}
                    onChange={(e) => setArrayInput(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                                        Enter numbers separated by commas.
                                    </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-3">
                    Window size (k)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 3"
                    className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-white placeholder-gray-400"
                    value={kInput}
                    onChange={(e) => setKInput(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1 mb-5">
                                        Enter the window size.
                                    </p>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-3">
                  Operation Mode
                </label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { value: "view", label: "Visual Only", icon: "👁️" },
                    { value: "sum", label: "Sum", icon: "➕" },
                    { value: "avg", label: "Average", icon: "📊" }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mode"
                        value={option.value}
                        checked={mode === option.value}
                        onChange={() => setMode(option.value)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="text-sm flex items-center gap-1">
                        <span>{option.icon}</span>
                        {option.label}
                      </span>
                    </label>
                  ))}
                  <button
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Visualization
                </button>
                  </div>
                </div>
              </div>

              

              {/* Start Button */}
              <div className="flex justify-center">
                
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Array Visualization */}
              <div className="bg-gray-700/30 rounded-xl p-6 overflow-x-auto">
                <div className="flex flex-col items-center space-y-4">
                  {/* Index Labels */}
                  <div className="flex gap-1 min-w-max">
                    {array.map((_, idx) => (
                      <div
                        key={idx}
                        className="w-12 lg:w-14 text-center text-xs text-blue-300 flex-shrink-0 pb-2 font-mono"
                      >
                        {idx}
                      </div>
                    ))}
                  </div>
                  
                  {/* Array Values */}
                  <div className="flex gap-1 min-w-max">
                    {array.map((val, idx) => {
                      const inWindow = idx >= start && idx <= end;
                      return (
                        <div
                          key={idx}
                          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-lg flex items-center justify-center font-bold transition-all duration-500 text-sm lg:text-base flex-shrink-0 shadow-lg ${
                            inWindow 
                              ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-black transform scale-110 -translate-y-2 shadow-yellow-400/50" 
                              : "bg-gray-600 text-white hover:bg-gray-500"
                          }`}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Window Info */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-blue-300 mb-2 text-sm lg:text-base">
                    <span className="font-semibold">Current Window:</span> [{start} - {end}]
                  </div>
                  <div className="text-white font-mono text-lg lg:text-xl">
                    [{array.slice(start, end + 1).join(", ")}]
                  </div>
                  {mode !== "view" && (
                    <div className="text-purple-300 mt-2 text-sm lg:text-base">
                      <span className="font-semibold">
                        {mode === "sum" ? "Sum" : "Average"}:
                      </span> {result}
                    </div>
                  )}
                </div>
              </div>

              {/* Step Indicator */}
              <div className="flex justify-center">
                <div className="bg-gray-700/50 rounded-full px-4 py-2 text-sm">
                  Step {current + 1} of {steps.length}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                                    disabled={current === 0}
                                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>
                <button
                                    onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}
                                    disabled={current === steps.length - 1}
                                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                                >
                                    Next
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                <button
                                    onClick={() => setAutoplay((prev) => !prev)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 flex items-center gap-2"
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l.707-.707a1 1 0 01.707-.293H15" />
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

export default SlidingWindow;