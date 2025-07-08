import React, { useState, useEffect } from "react";

const TreeNode = ({ x, y, value, color }) => (
  <g>
    <circle cx={x} cy={y} r="20" fill={color} stroke="black" strokeWidth="2" />
    <text x={x} y={y + 5} textAnchor="middle" fill="dark grey" fontSize="14">
      {value}
    </text>
  </g>
);

const Edge = ({ x1, y1, x2, y2 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="2" />
);

const buildBST = (values) => {
  let steps = [];
  let root = null;
  const seen = new Set();

  const insert = (node, val, path = []) => {
    if (!node) {
      const newNode = { value: val, left: null, right: null };
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path, val], explanation: `Inserted ${val}` });
      return newNode;
    }
    path.push(node.value);
    if (val === node.value) {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `Duplicate value ${val} not allowed` });
      return node;
    }
    if (val < node.value) {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `${val} < ${node.value}, moving left` });
      node.left = insert(node.left, val, path);
    } else {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `${val} > ${node.value}, moving right` });
      node.right = insert(node.right, val, path);
    }
    return node;
  };

  for (let v of values) {
    if (v === "" || isNaN(v)) {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [], explanation: `Invalid input: ${v}` });
      continue;
    }
    const num = Number(v);
    if (seen.has(num)) {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [], explanation: `Duplicate value ${num} not allowed` });
      continue;
    }
    seen.add(num);
    steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [], explanation: `Inserting ${num}` });
    root = insert(root, num);
  }

  if (!root) {
    steps.push({ tree: null, highlight: [], explanation: `BST is empty` });
  } else {
    steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [], explanation: `BST built with input values` });
  }

  return steps;
};

const findInBST = (root, val) => {
  let steps = [];
  let node = root;
  let path = [];
  while (node) {
    path.push(node.value);
    if (node.value === val) {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `Found ${val}`, found: val });
      return steps;
    }
    steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `Visiting ${node.value}` });
    if (val < node.value) {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `${val} < ${node.value}, moving left` });
      node = node.left;
    } else {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `${val} >= ${node.value}, moving right` });
      node = node.right;
    }
  }
  steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `${val} not found` });
  return steps;
};

const insertIntoBST = (root, value) => {
  let steps = [];

  const checkDuplicate = (node) => {
    if (!node) return false;
    if (node.value === value) return true;
    return value < node.value ? checkDuplicate(node.left) : checkDuplicate(node.right);
  };

  if (checkDuplicate(root)) {
    steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [], explanation: `${value} already existed` });
    return steps;
  }

  const insert = (node, path = []) => {
    if (!node) {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path, value], explanation: `Inserted ${value}` });
      return { value, left: null, right: null };
    }
    path.push(node.value);
    if (value < node.value) {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `${value} < ${node.value}, moving left` });
      node.left = insert(node.left, path);
    } else {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `${value} > ${node.value}, moving right` });
      node.right = insert(node.right, path);
    }
    return node;
  };

  root = insert(root);
  steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [], explanation: `Finished insertion of ${value}` });
  return steps;
};

const deleteFromBST = (root, value, updateTreeRoot) => {
  let steps = [];
  
  const deleteNode = (node, val, path = []) => {
    if (!node) {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [], explanation: `${val} not found in the tree` });
      return null;
    }

    path.push(node.value);

    if (val < node.value) {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `${val} < ${node.value}, moving left` });
      node.left = deleteNode(node.left, val, [...path]);
    } else if (val > node.value) {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `${val} > ${node.value}, moving right` });
      node.right = deleteNode(node.right, val, [...path]);
    } else {
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `Found ${val}, preparing to delete` });

      if (!node.left && !node.right) {
        steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [], explanation: `${val} is a leaf node, deleting directly` });
        return null;
      }
      if (!node.left) {
        steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [], explanation: `${val} has only right child, replacing with right child` });
        return node.right;
      }
      if (!node.right) {
        steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [], explanation: `${val} has only left child, replacing with left child` });
        return node.left;
      }

      let successor = node.right;
      let successorPath = [...path];
      while (successor.left) {
        successorPath.push(successor.value);
        successor = successor.left;
      }
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...successorPath], explanation: `Successor is ${successor.value}` });
      
      node.value = successor.value;
      steps.push({ tree: JSON.parse(JSON.stringify(root)), highlight: [...path], explanation: `Replaced ${val} with ${successor.value}` });
      
      node.right = deleteNode(node.right, successor.value, [...path]);
    }

    return node;
  };

  const rootCopy = JSON.parse(JSON.stringify(root));
  const updatedRoot = deleteNode(rootCopy, value);
  steps.push({ tree: JSON.parse(JSON.stringify(updatedRoot)), highlight: [], explanation: `Finished deletion of ${value}` });
  if (updateTreeRoot) updateTreeRoot(updatedRoot);
  return steps;
};

// Calculate tree dimensions for better scaling
const calculateTreeDimensions = (node) => {
  if (!node) return { width: 0, height: 0, nodeCount: 0 };
  
  const leftDim = calculateTreeDimensions(node.left);
  const rightDim = calculateTreeDimensions(node.right);
  
  return {
    width: Math.max(leftDim.width + rightDim.width + 100, 100),
    height: Math.max(leftDim.height, rightDim.height) + 80,
    nodeCount: leftDim.nodeCount + rightDim.nodeCount + 1
  };
};

const renderTree = (node, x, y, level = 0, dx = 150, highlights = [], found = null) => {
  if (!node) return [];

  const children = [];
  
  // Only render edges and child nodes if they actually exist
  if (node.left) {
    const leftX = x - dx;
    const leftY = y + 80;
    children.push(<Edge key={`edge-${node.value}-left-${leftX}-${leftY}`} x1={x} y1={y} x2={leftX} y2={leftY} />);
    children.push(...renderTree(node.left, leftX, leftY, level + 1, dx / 1.5, highlights, found));
  }
  
  if (node.right) {
    const rightX = x + dx;
    const rightY = y + 80;
    children.push(<Edge key={`edge-${node.value}-right-${rightX}-${rightY}`} x1={x} y1={y} x2={rightX} y2={rightY} />);
    children.push(...renderTree(node.right, rightX, rightY, level + 1, dx / 1.5, highlights, found));
  }

  let color = "red";
  if (found === node.value) color = "green";
  else if (highlights.includes(node.value)) color = "yellow";

  children.push(
    <TreeNode
      key={`node-${node.value}-${x}-${y}-${level}`}
      x={x}
      y={y}
      value={node.value}
      color={color}
    />
  );

  return children;
};

const ErrorBar = ({ message, onClose }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-600 border border-red-700 text-white px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
      <span className="text-sm">{message}</span>
      <button 
        onClick={onClose}
        className="text-white hover:text-red-200 ml-4 font-bold text-lg"
      >
        ×
      </button>
    </div>
  );
};

const BSTVisualizer = ({ onBack }) => {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const [treeRoot, setTreeRoot] = useState(null);
  const [action, setAction] = useState("find");
  const [actionValue, setActionValue] = useState("");
  const [foundValue, setFoundValue] = useState(null);
  const [error, setError] = useState("");

  // Reset tree when input changes
  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Reset all tree-related states
    setTreeRoot(null);
    setSteps([]);
    setStepIdx(0);
    setAuto(false);
    setFoundValue(null);
    setError("");
  };

  const buildTree = () => {
    setError("");
    if (!input.trim()) {
      setError("Enter comma-separated values");
      setSteps([]);
      return;
    }
    const parts = input.split(",").map(v => v.trim());

    if (parts.some(v => v === "" || isNaN(Number(v)))) {
      setError("Enter valid comma-separated numbers with no blanks (e.g. 5, 3, 8)");
      setSteps([]);
      return;
    }

    const arr = parts.map(Number);
    const result = buildBST(arr);
    setSteps(result);
    setTreeRoot(result[result.length - 1]?.tree);
    setStepIdx(0);
    setAuto(false);
    setFoundValue(null);
  };

  const handleAction = () => {
    setError("");
    const val = parseInt(actionValue);
    if (isNaN(val)){
        if(action==="find") {
          setError("Enter a valid number to search");
          return;
        }
        else if(action==="insert") {
          setError("Enter a valid number to insert");
          return;
        }
        else if(action==="delete") {
          setError("Enter a valid number to delete");
          return;
        }
    }
    if (!treeRoot) {
      setError("Build BST first");
      return;
    }

    let result = [];
    setFoundValue(null);
    if (action === "find") {
      result = findInBST(treeRoot, val);
    } else if (action === "insert") result = insertIntoBST(treeRoot, val);
    else if (action === "delete") result = deleteFromBST(treeRoot, val,setTreeRoot);
    else {
      setError("Invalid action");
      return;
    }

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
        const lastStep = steps[steps.length - 1];
        if (lastStep?.found) setFoundValue(lastStep.found);
        return i;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [auto, steps]);

  const current = steps[stepIdx] || { tree: null, highlight: [], explanation: "" };

  // Calculate dynamic dimensions and scaling
  const treeDimensions = current.tree ? calculateTreeDimensions(current.tree) : { width: 800, height: 800, nodeCount: 0 };
  const minWidth = 800;
  const minHeight = 500;
  const maxWidth = 1800;
  const maxHeight = 1500;
  
  // Scale based on tree size
  const scaleFactor = Math.min(
    Math.max(0.4, 1 - (treeDimensions.nodeCount - 7) * 0.05),
    1
  );
  
  const svgWidth = Math.max(minWidth, Math.min(maxWidth, treeDimensions.width * scaleFactor + 200));
  const svgHeight = Math.max(minHeight, Math.min(maxHeight, treeDimensions.height * scaleFactor + 100));
  
  // Adjust initial spacing based on tree size
  const initialDx = treeDimensions.nodeCount > 15 ? 80 : treeDimensions.nodeCount > 10 ? 100 : 120;
  const centerX = svgWidth / 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack} 
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            <span className="mr-2">←</span>
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 pb-2">
            Binary Search Tree Visualizer
          </h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        {/* Error Bar */}
        

        {/* Input Section */}
        <div className="bg-gray-800 rounded-xl p-5 mb-6 shadow-2xl border border-gray-700">
            {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}
          <label className="block text-sm font-medium text-blue-300 mb-2">
            Enter Values (comma-separated)
          </label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            value={input}
            onChange={handleInputChange}
            placeholder="e.g. 5,3,8,2,7,1,9,4,6"
          />
          <button 
            onClick={buildTree} 
            className="mt-6 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
          >
            Build BST
          </button>
        </div>

        {/* Controls Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-2xl border border-gray-700">
          {/* Navigation Controls */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors duration-200"
            >
              Previous
            </button>
            <button
              onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
              disabled={stepIdx >= steps.length - 1}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors duration-200"
            >
              Next
            </button>
            <button 
              onClick={() => setAuto((a) => !a)} 
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all transform hover:scale-105 duration-200"
            >
              {auto ? "Pause" : "Autoplay"}
            </button>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="flex-1 sm:flex-none p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="find">Find</option>
              <option value="insert">Insert</option>
              <option value="delete">Delete</option>
            </select>
            <input
              type="text"
              className="flex-1 sm:flex-none p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Value"
              value={actionValue}
              onChange={(e) => setActionValue(e.target.value)}
            />
            <button 
              onClick={handleAction} 
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-blue-700 hover:to-teal-700 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Run
            </button>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-2xl border border-gray-700">
          <div className="text-center">
            <div className="text-sm text-gray-300 mb-2 min-h-[20px]">
              {current.explanation || "Ready to build BST"}
            </div>
            {treeDimensions.nodeCount > 0 && (
              <div className="text-xs text-gray-400">
                Tree size: {treeDimensions.nodeCount} nodes
              </div>
            )}
          </div>
        </div>

        {/* Tree Visualization */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-2xl border border-gray-700">
          <div className="overflow-auto">
            <svg width={svgWidth} height={svgHeight} className="min-w-full">
              <defs>
                <linearGradient id="treeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#1f2937', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#374151', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#treeGradient)" />
              <g key={`tree-${stepIdx}-${JSON.stringify(current.tree)}`}>
                {renderTree(current.tree, centerX, 60, 0, initialDx, current.highlight, foundValue)}
              </g>
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Default</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Found</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BSTVisualizer;