import React, { useState, useEffect, useRef } from "react";

const BacktrackingVisualizer = ({ onBack }) => {
  const [algorithm, setAlgorithm] = useState("nqueens");
  const [input, setInput] = useState(4);
  const [mazeInput, setMazeInput] = useState("[[1,0,0,0],[1,1,0,1],[0,1,0,0],[1,1,1,1]]");
  const [sudokuInput, setSudokuInput] = useState("[[3,0,6,5,0,8,4,0,0],[5,2,0,0,0,0,0,0,0],[0,8,7,0,0,0,0,3,1],[0,0,3,0,1,0,0,8,0],[9,0,0,8,6,3,0,0,5],[0,5,0,0,9,0,6,0,0],[1,3,0,0,0,0,2,5,0],[0,0,0,0,0,0,0,7,4],[0,0,5,2,0,6,3,0,0]]");
  const [board, setBoard] = useState([]);
  const [initialSudokuBoard, setInitialSudokuBoard] = useState([]);
  const [steps, setSteps] = useState([]);
  const [solutionCounts, setSolutionCounts] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const [solutions, setSolutions] = useState([]);
  const [solutionCount, setSolutionCount] = useState(0);
  const [currentCells, setCurrentCells] = useState([]);
  const [visitedCells, setVisitedCells] = useState([]);
  const [backtrackedCells, setBacktrackedCells] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!autoplay) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => Math.min(prev + 1, steps.length - 1));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [autoplay, steps]);

  useEffect(() => {
    setSteps([]);
    setSolutionCounts([]);
    setReasons([]);
    setSolutions([]);
    setSolutionCount(0);
    setCurrent(0);
    setAutoplay(false);
    setCurrentCells([]);
    setVisitedCells([]);
    setBacktrackedCells([]);
    setError("");
  }, [algorithm]);

  const generateNQueensSteps = (n) => {
    const steps = [];
    const reasons = [];
    const solutions = [];
    const currentCells = [];
    const visitedCells = [];
    const backtrackedCells = [];
    const solutionCounts = [];
    const board = Array.from({ length: n }, () => Array(n).fill("."));
    
    let visited = new Set();
    let backtracked = new Set();
    let solutionCount = 0;

    const isSafe = (row, col) => {
      for (let i = 0; i < row; i++) {
        if (board[i][col] === "Q") return false;
        if (col - (row - i) >= 0 && board[i][col - (row - i)] === "Q") return false;
        if (col + (row - i) < n && board[i][col + (row - i)] === "Q") return false;
      }
      return true;
    };

    const solve = (row) => {
      if (row === n) {
        solutionCount++;
        steps.push(board.map(r => [...r]));
        reasons.push("Solution found.");
        solutions.push(board.map(r => [...r]));
        currentCells.push(null);
        visitedCells.push(new Set(visited));
        backtrackedCells.push(new Set(backtracked));
        solutionCounts.push(solutionCount);
        return;
      }
      for (let col = 0; col < n; col++) {
        // Trying to place queen
        steps.push(board.map(r => [...r]));
        reasons.push(`Trying to place queen at (${row}, ${col})`);
        currentCells.push({ row, col });
        visitedCells.push(new Set(visited));
        backtrackedCells.push(new Set(backtracked));
        solutionCounts.push(solutionCount);

        if (isSafe(row, col)) {
          board[row][col] = "Q";
          visited.add(`${row},${col}`);
          // Remove from backtracked when revisiting
          backtracked.delete(`${row},${col}`);
          steps.push(board.map(r => [...r]));
          reasons.push(`Placed queen at (${row}, ${col})`);
          currentCells.push(null);
          visitedCells.push(new Set(visited));
          backtrackedCells.push(new Set(backtracked));
          solutionCounts.push(solutionCount);
          
          solve(row + 1);
          
          board[row][col] = ".";
          visited.delete(`${row},${col}`);
          backtracked.add(`${row},${col}`);
          steps.push(board.map(r => [...r]));
          reasons.push(`Backtracked from (${row}, ${col})`);
          currentCells.push(null);
          visitedCells.push(new Set(visited));
          backtrackedCells.push(new Set(backtracked));
          solutionCounts.push(solutionCount);
        } else {
          steps.push(board.map(r => [...r]));
          reasons.push(`(${row}, ${col}) is not safe.`);
          currentCells.push(null);
          visitedCells.push(new Set(visited));
          backtrackedCells.push(new Set(backtracked));
          solutionCounts.push(solutionCount);
        }
      }
    };

    const result = solve(0);
    
    // If destination was not reached, add final step
    if (!result) {
      steps.push(board.map(r => [...r]));
      reasons.push(`Total Solutions : ${solutionCount}`);
      currentCells.push(null);
      visitedCells.push(new Set(visited));
      backtrackedCells.push(new Set(backtracked));
      solutionCounts.push(solutionCount);
    }
    
    return { steps, reasons, solutions, currentCells, visitedCells, backtrackedCells, solutionCounts };
  };

  const generateMazeSteps = () => {
    let maze;
    try {
      maze = JSON.parse(mazeInput);
      if (!Array.isArray(maze) || maze.length === 0 || !Array.isArray(maze[0])) {
        throw new Error("Invalid maze format");
      }
    } catch (error) {
      setError("Invalid maze input. Please provide a valid JSON matrix.");
      return { steps: [], reasons: [], currentCells: [], visitedCells: [], backtrackedCells: [] };    
    }
    const n = maze.length;
    const m = maze[0].length;
    const steps = [];
    const reasons = [];
    const currentCells = [];
    const visitedCells = [];
    const backtrackedCells = [];
    
    let visited = new Set();
    let backtracked = new Set();

    const isSafe = (x, y) => x >= 0 && y >= 0 && x < n && y < m && maze[x][y] === 1;

    const solve = (x, y) => {
      // Current cell being explored
      steps.push(maze.map(r => [...r]));
      reasons.push(`Trying to move to (${x}, ${y})`);
      currentCells.push({ row: x, col: y });
      visitedCells.push(new Set(visited));
      backtrackedCells.push(new Set(backtracked));
      
      if (!isSafe(x, y)) {
        reasons[reasons.length - 1] = `(${x}, ${y}) is not safe.`;
        return false;
      }

      visited.add(`${x},${y}`);
      // Remove from backtracked when revisiting
      backtracked.delete(`${x},${y}`);
      
      steps.push(maze.map(r => [...r]));
      reasons.push(`Moved to (${x}, ${y})`);
      currentCells.push(null);
      visitedCells.push(new Set(visited));
      backtrackedCells.push(new Set(backtracked));

      if (x === n - 1 && y === m - 1) {
        steps.push(maze.map(r => [...r]));
        reasons.push("Reached destination.");
        currentCells.push(null);
        visitedCells.push(new Set(visited));
        backtrackedCells.push(new Set(backtracked));
        return true;
      }

      if (solve(x + 1, y) || solve(x, y + 1)) return true;

      backtracked.add(`${x},${y}`);
      
      steps.push(maze.map(r => [...r]));
      reasons.push(`Backtracked from (${x}, ${y})`);
      currentCells.push(null);
      visitedCells.push(new Set(visited));
      backtrackedCells.push(new Set(backtracked));

      return false;
    };

    const result = solve(0, 0);
    
    // If destination was not reached, add final step
    if (!result) {
      steps.push(maze.map(r => [...r]));
      reasons.push("Destination not reached.");
      currentCells.push(null);
      visitedCells.push(new Set(visited));
      backtrackedCells.push(new Set(backtracked));
    }
    
    return { steps, reasons, currentCells, visitedCells, backtrackedCells };
  };

  const generateSudokuSteps = () => {
    let board;
    try {
      board = JSON.parse(sudokuInput);
      if (!Array.isArray(board) || board.length !== 9 || !board.every(row => Array.isArray(row) && row.length === 9)) {
        throw new Error("Invalid sudoku format");
      }
    } catch (error) {
      setError("Invalid sudoku input. Please provide a valid 9x9 JSON matrix.");
      return { steps: [], reasons: [], currentCells: [], visitedCells: [], backtrackedCells: [] };
    }
    const steps = [];
    const reasons = [];
    const currentCells = [];
    const visitedCells = [];
    const backtrackedCells = [];
    const initial = board.map(r => [...r]);
    setInitialSudokuBoard(initial);
    
    let visited = new Set();
    let backtracked = new Set();

    const isSafe = (r, c, num) => {
      for (let i = 0; i < 9; i++) {
        if (board[r][i] === num || board[i][c] === num) return false;
        const boxRow = 3 * Math.floor(r / 3) + Math.floor(i / 3);
        const boxCol = 3 * Math.floor(c / 3) + i % 3;
        if (board[boxRow][boxCol] === num) return false;
      }
      return true;
    };

    const solve = () => {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (board[i][j] === 0) {
            for (let num = 1; num <= 9; num++) {
              steps.push(board.map(r => [...r]));
              reasons.push(`Trying ${num} at (${i}, ${j})`);
              currentCells.push({ row: i, col: j });
              visitedCells.push(new Set(visited));
              backtrackedCells.push(new Set(backtracked));
              
              if (isSafe(i, j, num)) {
                board[i][j] = num;
                visited.add(`${i},${j}`);
                // Remove from backtracked when revisiting
                backtracked.delete(`${i},${j}`);
                
                steps.push(board.map(r => [...r]));
                reasons.push(`Placed ${num} at (${i}, ${j})`);
                currentCells.push(null);
                visitedCells.push(new Set(visited));
                backtrackedCells.push(new Set(backtracked));
                
                if (solve()) return true;
                
                board[i][j] = 0;
                visited.delete(`${i},${j}`);
                backtracked.add(`${i},${j}`);
                
                steps.push(board.map(r => [...r]));
                reasons.push(`Backtracked from (${i}, ${j})`);
                currentCells.push(null);
                visitedCells.push(new Set(visited));
                backtrackedCells.push(new Set(backtracked));
              } else {
                steps.push(board.map(r => [...r]));
               
                reasons.push(`${num} is not safe at (${i}, ${j})`);
                currentCells.push(null);
                visitedCells.push(new Set(visited));
                backtrackedCells.push(new Set(backtracked));
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    solve();
    return { steps, reasons, currentCells, visitedCells, backtrackedCells };
  };

  const handleStart = async () => {
    setError("");
    setIsLoading(true);
    
    // Input validation
    if (algorithm === "nqueens" && (input < 4 || input > 12)) {
      setError("N-Queens board size must be between 4 and 12.");
      setIsLoading(false);
      return;
    }
    
    try {
      let result;
      if (algorithm === "nqueens") result = generateNQueensSteps(input);
      else if (algorithm === "maze") result = generateMazeSteps();
      else if (algorithm === "sudoku") result = generateSudokuSteps();

      if (result.steps.length > 15000) {
        setError("This configuration generates too many steps. Please try a smaller input.");
        setIsLoading(false);
        return;
      }

      setSteps(result.steps);
      setReasons(result.reasons);
      setCurrentCells(result.currentCells || []);
      setVisitedCells(result.visitedCells || []);
      setBacktrackedCells(result.backtrackedCells || []);
      if (result.solutions) setSolutions(result.solutions);
      if (result.solutionCounts) setSolutionCounts(result.solutionCounts);
      setSolutionCount(0);
      setCurrent(0);
      setAutoplay(false);
      setRunning(true);
    } catch (error) {
      setError("An error occurred while generating the visualization.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSteps([]);
    setReasons([]);
    setCurrentCells([]);
    setVisitedCells([]);
    setBacktrackedCells([]);
    setSolutions([]);
    setSolutionCounts(0);
    setCurrent(0);
    setAutoplay(false);
    setRunning(false);
        
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const currentBoard = steps[current] || [];
  const reason = reasons[current] || "";
  const currentCell = currentCells[current] || null;
  const visitedSet = visitedCells[current] || new Set();
  const backtrackedSet = backtrackedCells[current] || new Set();
  const currentSolutionCount = solutionCounts[current] || 0;

  // Calculate responsive cell size based on screen size and algorithm
  const getCellSize = () => {
    if (algorithm === "sudoku") return "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10";
    if (algorithm === "nqueens" && input > 8) return "w-6 h-6 sm:w-8 sm:h-8";
    return "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12";
  };

  const getIndexSize = () => {
    if (algorithm === "sudoku") return "w-4 h-6 sm:w-5 sm:h-8 md:w-6 md:h-10";
    if (algorithm === "nqueens" && input > 8) return "w-4 h-6 sm:w-5 sm:h-8";
    return "w-5 h-8 sm:w-6 sm:h-10 md:w-7 md:h-12";
  };

  const getFontSize = () => {
    if (algorithm === "sudoku") return "text-xs sm:text-sm";
    if (algorithm === "nqueens" && input > 8) return "text-xs sm:text-sm";
    return "text-sm sm:text-base";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={onBack} 
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl pb-2 sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Backtracking Algorithms Visualizer
          </h1>
        </div>

        {/* Algorithm Selection and Configuration */}
        {!running && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-200">Configuration</h2>
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-red-300">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
            
            {/* Algorithm Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { value: "nqueens", label: "N-Queens", icon: "♛" },
                { value: "sudoku", label: "Sudoku Solver", icon: "🔢" },
                { value: "maze", label: "Maze Solver", icon: "🧩" }
              ].map((algo) => (
                <label key={algo.value} className="cursor-pointer">
                  <input 
                    type="radio" 
                    name="algo" 
                    value={algo.value}
                    checked={algorithm === algo.value} 
                    onChange={() => setAlgorithm(algo.value)}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-lg border-2 transition-all ${
                    algorithm === algo.value 
                      ? 'border-purple-500 bg-purple-500/20' 
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}>
                    <span className="text-2xl mr-2">{algo.icon}</span>
                    <span className="font-medium">{algo.label}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Input Configuration */}
            <div className="space-y-4">
              {algorithm === "nqueens" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Board Size (N)
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={12}
                    value={input}
                    onChange={(e) => setInput(Number(e.target.value))}
                    className="w-full sm:w-32 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              )}

              {algorithm === "maze" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maze Configuration (JSON Matrix)
                  </label>
                  <textarea
                    rows={4}
                    value={mazeInput}
                    onChange={(e) => setMazeInput(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors font-mono text-sm"
                    placeholder="Enter maze as JSON matrix (1 = path, 0 = wall)"
                  />
                </div>
              )}

              {algorithm === "sudoku" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sudoku Puzzle (JSON Matrix)
                  </label>
                  <textarea
                    rows={6}
                    value={sudokuInput}
                    onChange={(e) => setSudokuInput(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors font-mono text-sm"
                    placeholder="Enter sudoku as JSON matrix (0 = empty cell)"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleStart}
              className="mt-6 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              Start Visualization
            </button>
          </div>
        )}

        {/* Visualization */}
        {running && (
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-center">
                <div className="text-blue-300 text-sm sm:text-base mb-2 min-h-[24px] px-2">
                  {reason}
                </div>
                {algorithm === "nqueens" && (
                  <div className="text-green-400 text-sm font-medium">
                    Solutions Found: {currentSolutionCount}
                  </div>
                )}
              </div>
            </div>

            {/* Board */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col items-center space-y-2 overflow-x-auto">
                {/* Column indexes */}
                <div className="flex gap-1 sm:gap-2">
                  <div className={`${getIndexSize()} shrink-0`}></div>
                  {currentBoard[0] && currentBoard[0].map((_, j) => (
                    <div key={j} className={`${getCellSize()} shrink-0 text-center ${getFontSize()} text-gray-400 flex items-center justify-center`}>
                      {j}
                    </div>
                  ))}
                </div>
                
                {/* Rows with row indexes */}
                {currentBoard.map((row, i) => (
                  <div key={i} className="flex gap-1 sm:gap-2">
                    {/* Row index */}
                    <div className={`${getIndexSize()} shrink-0 text-center ${getFontSize()} text-gray-400 flex items-center justify-center`}>
                      {i}
                    </div>
                    
                    {/* Row cells */}
                    {row.map((cell, j) => {
                      let bg = "bg-gray-700 hover:bg-gray-600";
                      const isCurrent = currentCell?.row === i && currentCell?.col === j;
                      const key = `${i},${j}`;
                      
                      if (algorithm === "maze") {
                        if (isCurrent && cell === 1) bg = "bg-yellow-500 text-black shadow-lg animate-pulse";
                        else if (visitedSet.has(key) && !backtrackedSet.has(key)) bg = "bg-green-500 text-white shadow-md";
                        else if (backtrackedSet.has(key)) bg = "bg-red-500 text-white shadow-md";
                        else if (cell === 1) bg = "bg-blue-500 text-white";
                        else bg = "bg-gray-800 text-gray-500";
                      }
                      else if (algorithm === "nqueens") {
                        if (isCurrent) bg = "bg-yellow-500 text-black shadow-lg animate-pulse";
                        else if (visitedSet.has(key) && !backtrackedSet.has(key)) bg = "bg-green-500 text-white shadow-md";
                        else if (backtrackedSet.has(key)) bg = "bg-red-500 text-white shadow-md";
                        else if (cell === "Q") bg = "bg-purple-500 text-white shadow-md";
                        else bg = "bg-gray-700 hover:bg-gray-600";
                      }
                      else if (algorithm === "sudoku") {
                        const initial = initialSudokuBoard[i]?.[j];
                        if (isCurrent) bg = "bg-yellow-500 text-black shadow-lg animate-pulse";
                        else if (initial !== 0) bg = "bg-blue-600 text-white shadow-md";
                        else if (visitedSet.has(key) && !backtrackedSet.has(key) && cell !== 0) bg = "bg-green-500 text-white shadow-md";
                        else if (backtrackedSet.has(key)) bg = "bg-red-500 text-white shadow-md";
                        else bg = "bg-gray-700 hover:bg-gray-600";
                      }

                      return (
                        <div
                          key={j}
                          className={`${getCellSize()} shrink-0 rounded-lg ${getFontSize()} font-bold flex items-center justify-center ${bg} transition-all duration-200`}
                        >
                          {cell !== "." && cell !== 0 ? cell : ""}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  disabled={current === 0}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <button
                  onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}
                  disabled={current === steps.length - 1}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-400">
                Step {current + 1} of {steps.length}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        {running && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">Legend</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-300">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-300">Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-300">Backtracked</span>
              </div>
              {algorithm === "nqueens" && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm text-gray-300">Queen</span>
                </div>
              )}
              {algorithm === "maze" && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-300">Path</span>
                </div>
              )}
              {algorithm === "sudoku" && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-sm text-gray-300">Given</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BacktrackingVisualizer;