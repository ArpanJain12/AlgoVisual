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
    if (problem === "fibonacci") {
      const n = parseInt(inputA);
      if (isNaN(n) || n <= 1 || n > 30) {
        alert("Enter a valid number greater than 1 and less than or equal to 30.");
        return;
      }
      setSteps(generateFibonacciDP(n));
    } else if (problem === "lcs") {
      if (!inputA || !inputB) {
        alert("Please enter both strings.");
        return;
      }
      setSteps(generateLCSDP(inputA, inputB));
    } else if (problem === "subset") {
      const arr = inputA.split(",").map(Number);
      const sum = parseInt(inputB);
      if (arr.some(isNaN) || isNaN(sum)) {
        alert("Please enter valid numbers for array and sum.");
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
    <div className="text-white max-w-4xl mx-auto pt-10 min-h-[500px]">
      <button onClick={onBack} className="mb-4 text-blue-400 hover:underline">
        ← Back
      </button>
      <h2 className="text-2xl font-bold mb-4">Dynamic Programming Visualizer</h2>

      {!running ? (
        <>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="problem"
                value="fibonacci"
                checked={problem === "fibonacci"}
                onChange={() => setProblem("fibonacci")}
              />
              Fibonacci
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="problem"
                value="lcs"
                checked={problem === "lcs"}
                onChange={() => setProblem("lcs")}
              />
              Longest Common Subsequence
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="problem"
                value="subset"
                checked={problem === "subset"}
                onChange={() => setProblem("subset")}
              />
              Subset Sum
            </label>
          </div>

          {problem === "fibonacci" ? (
            <input
              type="number"
              placeholder="Enter n (e.g. 10)"
              className="w-full p-2 mb-3 rounded bg-gray-700"
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
            />
          ) : problem === "subset" ? (
            <>
              <input
                type="text"
                placeholder="Array (comma separated)"
                className="w-full p-2 mb-3 rounded bg-gray-700"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
              />
              <input
                type="number"
                placeholder="Target Sum"
                className="w-full p-2 mb-3 rounded bg-gray-700"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
              />
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter string A"
                className="w-full p-2 mb-3 rounded bg-gray-700"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
              />
              <input
                type="text"
                placeholder="Enter string B"
                className="w-full p-2 mb-3 rounded bg-gray-700"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
              />
            </>
          )}

          <button
            onClick={handleStart}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded shadow"
          >
            Start
          </button>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center space-y-2 mb-6 overflow-auto max-h-[500px]">
            {problem !== "fibonacci" && (
              <div className="flex gap-2">
                <div className="w-10 text-sm"></div>
                {currentData[0]?.map((_, j) => (
                  <div key={j} className="w-10 text-center text-blue-300">
                    {j}
                  </div>
                ))}
              </div>
            )}
            {problem === "fibonacci" ? (
              <>
                <div className="flex gap-4">
                  {currentData.map((_, idx) => (
                    <div key={idx} className="w-12 text-center text-sm text-blue-300">
                      {idx}
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  {currentData.map((val, idx) => (
                    <div
                      key={idx}
                      className={`w-12 h-12 rounded flex items-center justify-center font-bold ${val === 0 && idx > currentStep + 1 ? "bg-gray-700" : "bg-green-500 text-black"}`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </>
            ) : problem === "lcs" ? (
              currentData.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-10 text-sm text-blue-300 text-right pr-1">{i}</div>
                  {row.map((val, j) => (
                    <div
                      key={j}
                      className={`w-10 h-10 rounded text-sm flex items-center justify-center font-bold ${val > 0 ? "bg-green-500 text-black" : "bg-gray-700"}`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              currentData.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-10 text-sm text-blue-300 text-right pr-1">{i}</div>
                  {row.map((val, j) => (
                    <div
                      key={j}
                      className={`w-10 h-10 rounded text-sm flex items-center justify-center font-bold ${val ? "bg-green-500 text-black" : "bg-gray-700"}`}
                    >
                      {val ? "T" : "F"}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="text-center text-blue-300 mb-4">
            Step {currentStep + 1} / {steps.length}
          </div>
          <div className="text-center text-yellow-300 mb-4 italic">
            {currentExplanation}
          </div>

          {/* Final Result Display */}
          {currentStep === steps.length - 1 && (
            <div className="text-center text-green-400 mb-4 text-xl font-bold">
              {finalResult}
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentStep((c) => Math.max(0, c - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep((c) => Math.min(steps.length - 1, c + 1))}
              disabled={currentStep === steps.length - 1}
              className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => setAutoplay((prev) => !prev)}
              className="px-4 py-2 bg-purple-600 rounded"
            >
              {autoplay ? "Pause" : "Autoplay"}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Reset
            </button>
          </div>
        </>
      )}
    </div>
    </div>
  );
};

export default DynamicProgrammingVisualizer;