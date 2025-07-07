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
        const arr = arrayInput
            .split(",")
            .map((x) => parseInt(x))
            .filter((x) => !isNaN(x))
            .sort((a, b) => a - b);

        const tgt = parseInt(targetInput);
        if (isNaN(tgt)) {
            alert("Invalid target value");
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
        setAutoplay(false)
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

    const currentStep = steps[current] || [];

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="text-white max-w-4xl pt-10 mx-auto">
            <button
                onClick={onBack}
                className="mb-4 text-blue-400 hover:underline"
            >
                ← Back
            </button>
            <h2 className="text-2xl font-bold mb-4">Binary Search Visualizer</h2>

            {!running ? (
                <>
                    <input
                        type="text"
                        value={arrayInput}
                        onChange={(e) => setArrayInput(e.target.value)}
                        placeholder="Enter sorted array (e.g. 1,2,3,4,5)"
                        className="w-full p-2 rounded bg-gray-700 mb-4"
                    />
                    <input
                        type="text"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        placeholder="Enter target value (e.g. 3)"
                        className="w-full p-2 rounded bg-gray-700 mb-4"
                    />
                    <button
                        onClick={handleStart}
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded shadow"
                    >
                        Start
                    </button>
                </>
            ) : (
                <>
                    <div className="flex flex-col items-center space-y-4 mb-6 overflow-x-auto">
                        <div className="flex gap-1 min-w-max">
                            {array.map((_, index) => (
                                <div key={index} className="w-10 text-center text-xs text-blue-300 flex-shrink-0 pb-2">{index}</div>
                            ))}
                        </div>
                        <div className="flex gap-1 min-w-max">
                            {array.map((val, idx) => {
                                let highlight = "bg-gray-700";
                                if (idx === currentStep.mid) highlight = "bg-yellow-400 text-black";
                                if (idx === currentStep.left) highlight += " bg-green-600 text-black";
                                if (idx === currentStep.right) highlight += " bg-red-600 text-black";
                                return (
                                    <div
                                        key={idx}
                                        className={`w-10 h-10 rounded flex items-center justify-center font-bold transition-colors duration-500 text-sm flex-shrink-0 ${highlight}`}
                                        style={{ transition: "all 0.5s ease", transform: highlight !== "bg-gray-700" ? "translateY(-4px)" : "translateY(0)" }}
                                    >
                                        {val}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="text-center text-blue-300 mb-4">
                        {currentStep.status === "checking" && `Checking index ${currentStep.mid}`}
                        {currentStep.status === "found" && `Found ${target} at index ${currentStep.mid}`}
                        {currentStep.status === "move-right" && `Value less than ${target},Moving right`}
                        {currentStep.status === "move-left" && `Value greater than ${target},Moving left`}
                        {currentStep.status === "not-found" && `Target ${target} not found`}
                    </div>
                    {currentStep.status !== "not-found" && (
                        <div className="text-center text-sm text-gray-400 mb-4">
                            Left = {currentStep.left}, Mid = {currentStep.mid}, Right = {currentStep.right}
                        </div>
                    )}
                    <div className="flex justify-center gap-4">
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
                            className="px-4 py-2 bg-blue-600 rounded"
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

export default BinarySearch;