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
    } catch {
      alert("Invalid maze input");
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
    } catch {
      alert("Invalid sudoku input");
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

  const handleStart = () => {
    let result;
    if (algorithm === "nqueens") result = generateNQueensSteps(input);
    else if (algorithm === "maze") result = generateMazeSteps();
    else if (algorithm === "sudoku") result = generateSudokuSteps();

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="text-white max-w-5xl mx-auto pt-8">
      <button onClick={onBack} className="text-blue-400 hover:underline mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-4">Backtracking Algorithms Visualizer</h2>

      {!running && (
        <>
          <div className="flex gap-4 mb-4">
            <label>
              <input 
                type="radio" 
                name="algo" 
                value="nqueens" 
                checked={algorithm === "nqueens"} 
                onChange={() => setAlgorithm("nqueens")}
              /> N-Queens
            </label>
            <label>
              <input 
                type="radio" 
                name="algo" 
                value="sudoku" 
                checked={algorithm === "sudoku"} 
                onChange={() => setAlgorithm("sudoku")}
              /> Sudoku Solver
            </label>
            <label>
              <input 
                type="radio" 
                name="algo" 
                value="maze" 
                checked={algorithm === "maze"} 
                onChange={() => setAlgorithm("maze")}
              /> Maze Solver
            </label>
          </div>

          {algorithm === "nqueens" && (
            <input
              type="number"
              min={4}
              max={12}
              value={input}
              onChange={(e) => setInput(Number(e.target.value))}
              className="p-2 rounded bg-gray-700 mb-4"
              placeholder="Enter N"
            />
          )}

          {algorithm === "maze" && (
            <textarea
              rows={4}
              value={mazeInput}
              onChange={(e) => setMazeInput(e.target.value)}
              className="p-2 rounded bg-gray-700 mb-4 w-full"
              placeholder="Enter maze as JSON matrix"
            />
          )}

          {algorithm === "sudoku" && (
            <textarea
              rows={6}
              value={sudokuInput}
              onChange={(e) => setSudokuInput(e.target.value)}
              className="p-2 rounded bg-gray-700 mb-4 w-full"
              placeholder="Enter sudoku as JSON matrix"
            />
          )}

          <button
            onClick={handleStart}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded mb-6"
          >
            Start
          </button>
        </>
      )}

      {running && (
        <>
          <div className="text-blue-300 text-center mb-2 min-h-[24px]">{reason}</div>

          <div className="flex flex-col items-center space-y-2 mb-4">
            {/* Column indexes */}
            <div className="flex gap-2">
              <div className="w-6 h-6"></div> {/* Empty corner */}
              {currentBoard[0] && currentBoard[0].map((_, j) => (
                <div key={j} className="w-10 h-6 text-center text-xs text-gray-400 flex items-center justify-center">
                  {j}
                </div>
              ))}
            </div>
            
            {/* Rows with row indexes */}
            {currentBoard.map((row, i) => (
              <div key={i} className="flex gap-2">
                {/* Row index */}
                <div className="w-6 h-10 text-center text-xs text-gray-400 flex items-center justify-center">
                  {i}
                </div>
                
                {/* Row cells */}
                {row.map((cell, j) => {
                  let bg = "bg-gray-700";
                  const isCurrent = currentCell?.row === i && currentCell?.col === j;
                  const key = `${i},${j}`;
                  
                  if (algorithm === "maze") {
                    if (isCurrent && cell === 1) bg = "bg-yellow-500 text-black";
                    else if (visitedSet.has(key) && !backtrackedSet.has(key)) bg = "bg-green-600 text-white";
                    else if (backtrackedSet.has(key)) bg = "bg-red-600 text-white";
                    else if (cell === 1) bg = "bg-blue-600 text-white";
                    else bg = "bg-gray-700 text-white";
                  }
                  else if (algorithm === "nqueens") {
                    if (isCurrent) bg = "bg-yellow-500 text-black";
                    else if (visitedSet.has(key) && !backtrackedSet.has(key)) bg = "bg-green-600 text-white";
                    else if (backtrackedSet.has(key)) bg = "bg-red-600 text-white";
                    else if (cell === "Q") bg = "bg-green-600 text-white";
                    else bg = "bg-gray-700 text-white";
                  }
                  else if (algorithm === "sudoku") {
                    const initial = initialSudokuBoard[i]?.[j];
                    if (isCurrent) bg = "bg-yellow-500 text-black";
                    else if (initial !== 0) bg = "bg-blue-700 text-white";
                    else if (visitedSet.has(key) && !backtrackedSet.has(key) && cell !== 0) bg = "bg-green-600 text-white";
                    else if (backtrackedSet.has(key)) bg = "bg-red-600 text-white";
                    else bg = "bg-gray-700 text-white";
                  }

                  return (
                    <div
                      key={j}
                      className={`w-10 h-10 rounded text-center font-bold flex items-center justify-center ${bg}`}
                    >
                      {cell !== "." ? cell : ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="text-blue-300 text-sm text-center mb-4">
            {algorithm === "nqueens" && `Solutions Found: ${currentSolutionCount}`}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
            >Previous</button>
            <button
              onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}
              disabled={current === steps.length - 1}
              className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
            >Next</button>
            <button
              onClick={() => setAutoplay((prev) => !prev)}
              className="px-4 py-2 bg-purple-600 rounded"
            >{autoplay ? "Pause" : "Autoplay"}</button>
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

export default BacktrackingVisualizer;