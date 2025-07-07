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
      alert("Invalid input or window size.");
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
    <div className="text-white max-w-4xl mx-auto pt-10 min-h-[500px] px-4">
      <button onClick={onBack} className="mb-4 text-blue-400 hover:underline">
        ← Back
      </button>
      <h2 className="text-2xl font-bold mb-4">Sliding Window Visualizer</h2>

      {!running ? (
        <>
          <input
            type="text"
            placeholder="Array (comma separated)"
            className="w-full p-2 mb-3 rounded bg-gray-700"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Window size (k)"
            className="w-full p-2 mb-3 rounded bg-gray-700"
            value={kInput}
            onChange={(e) => setKInput(e.target.value)}
          />

          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="view"
                checked={mode === "view"}
                onChange={() => setMode("view")}
              />
              Visual Only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="sum"
                checked={mode === "sum"}
                onChange={() => setMode("sum")}
              />
              Sum
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="avg"
                checked={mode === "avg"}
                onChange={() => setMode("avg")}
              />
              Average
            </label>
          </div>

          <button
            onClick={handleStart}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded shadow"
          >
            Start
          </button>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center space-y-4 mb-6 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {array.map((_, idx) => (
                <div
                  key={idx}
                  className="w-10 text-center text-xs text-blue-300 flex-shrink-0 pb-2"
                >
                  {idx}
                </div>
              ))}
            </div>
            <div className="flex gap-1 min-w-max">
              {array.map((val, idx) => {
                const inWindow = idx >= start && idx <= end;
                return (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded flex items-center justify-center font-bold transition-colors duration-500 text-xs flex-shrink-0 ${inWindow ? "bg-yellow-400 text-black" : "bg-gray-700"}`}
                    style={{ transition: "all 0.5s ease", transform: inWindow ? "translateY(-4px)" : "translateY(0)" }}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center text-blue-300 mb-4 text-sm">
            Showing window: [{start} - {end}] → {array.slice(start, end + 1).join(", ")} {mode === "sum" ? `| Sum = ${result}` : mode === "avg" ? `| Avg = ${result}` : ""}
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}
              disabled={current === steps.length - 1}
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

export default SlidingWindow;