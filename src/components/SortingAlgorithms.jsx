import React, { useState,useEffect } from "react";

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

  const startSort = () => {
    const arr = input.split(",").map(Number);
    if (arr.some(isNaN)) return alert("Enter valid comma-separated numbers");
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
  const current = steps[stepIdx] || { array: [], highlight: [], sorted: 0, explanation: "" };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
    <div className="text-white max-w-2xl mx-auto pt-10">
      <button onClick={onBack} className="mb-4 text-blue-400 hover:underline">
        ← Back
      </button>
      <h2 className="text-2xl font-bold mb-4 capitalize">{type} Sort</h2>
      <input
        type="text"
        className="w-full p-2 mb-4 rounded bg-gray-700"
        value={input}
        placeholder="Enter comma seperated array values like 10,3,2,4"
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex gap-4 mb-4">
        <button onClick={startSort} className="px-4 py-2 bg-purple-600 rounded">
          Start
        </button>
        <button
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          disabled={stepIdx === 0}
          className="px-4 py-2 bg-gray-700 rounded"
        >
          Previous
        </button>
        <button
          onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
          disabled={stepIdx >= steps.length - 1}
          className="px-4 py-2 bg-gray-700 rounded"
        >
          Next
        </button>
        <button onClick={() => setAuto((a) => !a)} className="px-4 py-2 bg-purple-600 rounded">
          {auto ? "Pause" : "Autoplay"}
        </button>
      </div>
      <div className="mb-4 text-center text-sm italic text-white-300 min-h-[24px]">
        {current.explanation}
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-end justify-center gap-1 h-64 border-t pt-8">
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
                className={`w-6 rounded-t transition-all duration-500 relative flex items-end justify-center text-xs font-semibold text-white ${bgColor}`}
                style={{ height: `${(num / maxVal) * 100}%` }}
              >
                <span className="absolute -top-6">{num}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-1 mt-2">
          {current.array.map((_, idx) => (
            <div
              key={idx}
              className="w-6 text-xs text-gray-400 text-center"
            >
              {idx}
            </div>
          ))}
        </div>
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
    <div className="text-white max-w-3xl mx-auto pt-10 min-h-[500px]">
      <button onClick={onBack} className="mb-4 text-blue-400 hover:underline">
        ← Back
      </button>
      <h2 className="text-2xl font-bold mb-4">Sorting Algorithms</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedSort("bubble")}
          className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
        >
          Bubble Sort
        </button>
        <button
          onClick={() => setSelectedSort("selection")}
          className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
        >
          Selection Sort
        </button>
        <button
          onClick={() => setSelectedSort("insertion")}
          className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
        >
          Insertion Sort
        </button>
        <button
          onClick={() => setSelectedSort("merge")}
          className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
        >
          Merge Sort
        </button>
        <button
          onClick={() => setSelectedSort("quick")}
          className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
        >
          Quick Sort
        </button>
      </div>
    </div>
    </div>
  );
};

export default SortingAlgorithms;