import React, { useState, useEffect, useRef } from "react";

const BinarySearch = ({ onBack }) => {
    const [arrayInput, setArrayInput] = useState("");
    const [targetInput, setTargetInput] = useState("");
    const [array, setArray] = useState([]);
    const [steps, setSteps] = useState([]);
    const [current, setCurrent] = useState(0);
    const [target, setTarget] = useState(null);
    const [running, setRunning] = useState(false);
    const [autoplay, setAutoplay] = useState(false);
    const [error, setError] = useState("");
    const intervalRef = useRef(null);

    const prepareSteps = (arr, target) => {
        let trace = [];
        let left = 0,
            right = arr.length - 1;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            trace.push({ left, right, mid, status: "checking" });
            if (arr[mid] === target) {
                trace.push({ left, right, mid, status: "found" });
                break;
            } else if (arr[mid] < target) {
                trace.push({ left, right, mid, status: "move-right" });
                left = mid + 1;
            } else {
                trace.push({ left, right, mid, status: "move-left" });
                right = mid - 1;
            }
        }
        if (left > right) trace.push({ left: -1, right: -1, mid: -1, status: "not-found" });
        return trace;
    };

    const handleStart = () => {
        setError("");
        
        const arr = arrayInput
            .split(",")
            .map((x) => parseInt(x))
            .filter((x) => !isNaN(x))
            .sort((a, b) => a - b);

        const tgt = parseInt(targetInput);
        
        if (arr.length === 0) {
            setError("Please enter at least one valid number for the array");
            return;
        }
        
        if (isNaN(tgt)) {
            setError("Please enter a valid target value");
            return;
        }

        const steps = prepareSteps(arr, tgt);

        setArray(arr);
        setTarget(tgt);
        setSteps(steps);
        setCurrent(0);
        setRunning(true);
    };
    
    const handleReset = () => {
        setArray([]);
        setTarget(null);
        setSteps([]);
        setCurrent(0);
        setRunning(false);
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
        }, 1200);
        return () => clearInterval(intervalRef.current);
    }, [autoplay, running, steps]);

    const currentStep = steps[current] || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-6 group"
                    >
                        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 pb-2">
                            Binary Search Visualizer
                        </h1>
                    </div>
                </div>

                {!running ? (
                    /* Input Section */
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-2xl">
                            <div className="space-y-7">
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
                                        Array Elements (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={arrayInput}
                                        onChange={(e) => setArrayInput(e.target.value)}
                                        placeholder="e.g., 1,3,5,7,9,11,13,15"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Enter numbers separated by commas. Array will be automatically sorted.
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-blue-300 mb-2">
                                        Target Value
                                    </label>
                                    <input
                                        type="text"
                                        value={targetInput}
                                        onChange={(e) => setTargetInput(e.target.value)}
                                        placeholder="e.g., 7"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Enter the number you want to search for.
                                    </p>
                                </div>
                                
                                <button
                                    onClick={handleStart}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    Start Visualization
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Visualization Section */
                    <div className="space-y-8">
                        {/* Array Visualization */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shadow-2xl">
                            <div className="flex flex-col items-center space-y-6">
                                {/* Target Info */}
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Searching for: 
                                        <span className="text-yellow-400 font-bold ml-2">{target}</span>
                                    </h3>
                                </div>

                                {/* Array Display */}
                                <div className="w-full overflow-x-auto">
                                    <div className="flex flex-col items-center space-y-4 min-w-max mx-auto">
                                        {/* Index Labels */}
                                        <div className="flex gap-1 sm:gap-2">
                                            {array.map((_, index) => (
                                                <div key={index} className="w-12 sm:w-16 text-center text-xs text-blue-300 font-mono">
                                                    {index}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Array Elements */}
                                        <div className="flex gap-1 sm:gap-2">
                                            {array.map((val, idx) => {
                                                let bgColor = "bg-gray-700/50";
                                                let textColor = "text-white";
                                                let borderColor = "border-gray-600";
                                                let transform = "translateY(0)";
                                                
                                                if (idx === currentStep.mid) {
                                                    bgColor = "bg-yellow-400";
                                                    textColor = "text-black";
                                                    borderColor = "border-yellow-300";
                                                    transform = "translateY(-4px)";
                                                }
                                                if (idx === currentStep.left) {
                                                    bgColor = "bg-green-500";
                                                    textColor = "text-white";
                                                    borderColor = "border-green-400";
                                                    transform = "translateY(-4px)";
                                                }
                                                if (idx === currentStep.right) {
                                                    bgColor = "bg-red-500";
                                                    textColor = "text-white";
                                                    borderColor = "border-red-400";
                                                    transform = "translateY(-4px)";
                                                }
                                                
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`w-12 sm:w-16 h-12 sm:h-16 rounded-lg flex items-center justify-center font-bold transition-all duration-500 text-sm sm:text-base border-2 ${bgColor} ${textColor} ${borderColor} shadow-lg`}
                                                        style={{ transform }}
                                                    >
                                                        {val}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-500 rounded border"></div>
                                        <span>Left Pointer</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-yellow-400 rounded border"></div>
                                        <span>Middle</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-red-500 rounded border"></div>
                                        <span>Right Pointer</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Display */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shadow-2xl">
                            <div className="text-center space-y-4">
                                <div className="text-lg sm:text-xl font-semibold">
                                    {currentStep.status === "checking" && (
                                        <span className="text-blue-400">
                                            🔍 Checking index {currentStep.mid}
                                        </span>
                                    )}
                                    {currentStep.status === "found" && (
                                        <span className="text-green-400">
                                            ✅ Found {target} at index {currentStep.mid}!
                                        </span>
                                    )}
                                    {currentStep.status === "move-right" && (
                                        <span className="text-orange-400">
                                            ➡️ Value less than {target}, moving right
                                        </span>
                                    )}
                                    {currentStep.status === "move-left" && (
                                        <span className="text-orange-400">
                                            ⬅️ Value greater than {target}, moving left
                                        </span>
                                    )}
                                    {currentStep.status === "not-found" && (
                                        <span className="text-red-400">
                                            ❌ Target {target} not found in array
                                        </span>
                                    )}
                                </div>
                                
                                {currentStep.status !== "not-found" && (
                                    <div className="text-sm text-gray-400 font-mono">
                                        Left = {currentStep.left} | Mid = {currentStep.mid} | Right = {currentStep.right}
                                    </div>
                                )}
                                
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shadow-2xl">
                            <div className="flex flex-wrap justify-center gap-3">
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default BinarySearch;