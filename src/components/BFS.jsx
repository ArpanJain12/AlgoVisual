import React, { useState, useEffect, useRef } from "react";

const BFS = ({ onBack }) => {
    const [graphInput, setGraphInput] = useState("");
    const [startNode, setStartNode] = useState("");
    const [nodes, setNodes] = useState([]);
    const [positions, setPositions] = useState({});
    const [graph, setGraph] = useState({});
    const [steps, setSteps] = useState([]);
    const [current, setCurrent] = useState(0);
    const [running, setRunning] = useState(false);
    const [visitedNodes, setVisitedNodes] = useState([]);
    const [autoplay, setAutoplay] = useState(false);
    const [error, setError] = useState("");
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const intervalRef = useRef(null);
    const svgRef = useRef(null);
    const containerRef = useRef(null);

    // Responsive dimensions
    const getViewportDimensions = () => {
        const isMobile = window.innerWidth < 768;
        return {
            width: isMobile ? window.innerWidth - 32 : 800,
            height: isMobile ? 400 : 600,
            center: { 
                x: isMobile ? (window.innerWidth - 32) / 2 : 400, 
                y: isMobile ? 200 : 300 
            },
            radius: isMobile ? 150 : 250
        };
    };

    const [viewportDims, setViewportDims] = useState(getViewportDimensions());

    useEffect(() => {
        const handleResize = () => {
            setViewportDims(getViewportDimensions());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const generatePositions = (nodes) => {
        const nodeCount = nodes.length;
        const pos = {};
        
        if (nodeCount <= 8) {
            // Circle layout for small graphs
            const angle = (2 * Math.PI) / nodeCount;
            nodes.forEach((node, i) => {
                pos[node] = {
                    x: viewportDims.center.x + viewportDims.radius * Math.cos(i * angle),
                    y: viewportDims.center.y + viewportDims.radius * Math.sin(i * angle),
                };
            });
        } else {
            // Grid layout for larger graphs
            const cols = Math.ceil(Math.sqrt(nodeCount));
            const rows = Math.ceil(nodeCount / cols);
            const spacing = Math.min(viewportDims.width / (cols + 1), viewportDims.height / (rows + 1));
            
            nodes.forEach((node, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                pos[node] = {
                    x: (col + 1) * spacing,
                    y: (row + 1) * spacing,
                };
            });
        }
        return pos;
    };

    const prepareSteps = (graph, start) => {
  const trace = [];
  const visited = new Set();
  const queue = [];

  const bfs = (startNode) => {
    queue.push(startNode);
    while (queue.length > 0) {
      const node = queue.shift();
      if (!visited.has(node)) {
        trace.push({ node, queue: [...queue], status: "visit" });
        visited.add(node);

        const neighbors = (graph[node] || []).filter(
          (n) => !visited.has(n) && !queue.includes(n)
        );

        if (neighbors.length > 0) {
          queue.push(...neighbors);
          trace.push({
            node,
            queue: [...queue],
            status: "enqueueing",
            neighbors,
          });
        }
      }
    }
  };

  // Explore from the user-defined start node first
  bfs(start);

  // Then continue with all other unvisited nodes (disconnected components)
  const allNodes = Array.from(
    new Set([...Object.keys(graph), ...Object.values(graph).flat()])
  );

  for (const node of allNodes) {
    if (!visited.has(node)) {
      bfs(node);
    }
  }

  return trace;
};

    const handleStart = () => {
        let parsed;
        try {
            parsed = JSON.parse(graphInput);
        } catch (e) {
            setError("Invalid JSON");
            return;
        }

        const nodesList = Array.from(new Set([...Object.keys(parsed), ...Object.values(parsed).flat()]));

if (!nodesList.includes(startNode)) {
    setError(`Start node "${startNode}" not found in the graph.`);
    return;
}
        setGraph(parsed);
setPositions(generatePositions([startNode, ...nodesList]));
setNodes([startNode, ...nodesList]);

        const stepTrace = prepareSteps(parsed, startNode);
        setSteps(stepTrace);
        setCurrent(0);
        setRunning(true);
        setVisitedNodes(stepTrace[0]?.status === "visit" ? [stepTrace[0].node] : []);
    };
        
    const handleReset = () => {
        setGraph({});
        setPositions({});
        setNodes([]);
        setSteps([]);
        setCurrent(0);
        setRunning(false);
        setAutoplay(false);
        setVisitedNodes([]);
        setError("")
        setZoom(1);
        setPan({ x: 0, y: 0 });
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const updateVisitedNodes = (stepList, stepIndex) => {
        if (!Array.isArray(stepList) || !stepList[stepIndex]) return;
        const newVisited = [];
        for (let i = 0; i <= stepIndex; i++) {
            const step = stepList[i];
            if (step?.status === "visit" && !newVisited.includes(step.node)) {
                newVisited.push(step.node);
            }
        }
        setVisitedNodes(newVisited);
    };

    useEffect(() => {
        if (!running || !autoplay) return;
        intervalRef.current = setInterval(() => {
            setCurrent((prev) => {
                const next = prev < steps.length - 1 ? prev + 1 : 0;
                updateVisitedNodes(steps, next);
                return next;
            });
        }, 2500);
        return () => clearInterval(intervalRef.current);
    }, [autoplay, running, steps]);

    useEffect(() => {
        updateVisitedNodes(steps, current);
    }, [current]);

    const currentStep = steps[current] || {};

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev * 1.3, 3));
    };
    
    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev / 1.3, 0.4));
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY;
        if (delta > 0) {
            handleZoomOut();
        } else {
            handleZoomIn();
        }
    };

    const handleMouseDown = (e) => {
        if (e.button === 0) { // Left mouse button
            const startX = e.clientX - pan.x;
            const startY = e.clientY - pan.y;
            
            const handleMouseMove = (e) => {
                setPan({
                    x: e.clientX - startX,
                    y: e.clientY - startY
                });
            };
            
            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
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
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 pb-2">
            BFS Visualizer
          </h1>
        </div>

                {!running ? (
                    /* Input Section */
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                            {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 mb-2 rounded-lg flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}
                                <label className="block text-sm font-medium mb-3 text-blue-300">
                                    Graph Definition (JSON)
                                </label>
                                <textarea
                                    value={graphInput}
                                    onChange={(e) => setGraphInput(e.target.value)}
                                    placeholder='{"A": ["B", "C"], "B": ["D"], "C": [], "D": []}'
                                    className="w-full h-32 p-4 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-mono text-sm"
                                />
                            </div>
                            
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                <label className="block text-sm font-medium mb-3 text-blue-300">
                                    Start Node
                                </label>
                                <input
                                    type="text"
                                    value={startNode}
                                    onChange={(e) => setStartNode(e.target.value)}
                                    placeholder="e.g., A"
                                    className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            
                            <button
                                onClick={handleStart}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6 py-4 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                Start Visualization
                            </button>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold mb-4 text-purple-300">Instructions</h3>
                            <div className="space-y-3 text-sm text-gray-300">
                                <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                                    <p>Define your graph as a JSON object where keys are nodes and values are arrays of connected nodes.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                                    <p>Enter the starting node for the BFS traversal.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                                    <p>Click "Start Visualization" to begin the interactive BFS demonstration.</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                                <h4 className="font-medium mb-2 text-green-300">Example Graph:</h4>
                                <code className="text-xs text-gray-300 font-mono break-all">
                                    {`{"A": ["B", "C"], "B": ["D", "E"], "C": ["F"], "D": [], "E": [], "F": []}`}
                                </code>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Visualization Section */
                    <div className="space-y-6">
                        {/* Controls */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <div className="flex gap-2">
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
                                </div>
                                
                                <div className="flex gap-2">
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
                                
                                <div className="flex gap-2 ml-auto">
                                    <button
                                        onClick={handleZoomOut}
                                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="px-3 py-2 bg-slate-700 rounded-lg text-sm font-mono">
                                        {Math.round(zoom * 100)}%
                                    </span>
                                    <button
                                        onClick={handleZoomIn}
                                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                            <div className="text-center space-y-2">
                                <div className="text-lg font-medium text-blue-300">
                                    {currentStep.status === "enqueueing"
                                        ? `Enqueueing neighbors: ${(currentStep.neighbors || []).join(", ")} → Queue becomes: [${(currentStep.queue || []).join(", ")}]`
                                        : currentStep.status === "visit"
                                            ? `Visiting node ${currentStep.node}`
                                            : currentStep.status}
                                </div>
                                <div className="text-sm text-gray-400">
                                    Current Queue: [{(currentStep.queue || []).join(", ")}]
                                </div>
                            </div>
                        </div>

                        {/* Graph Visualization */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 overflow-hidden">
                            <div 
                                ref={containerRef}
                                className="relative bg-slate-900/50 rounded-lg cursor-grab active:cursor-grabbing select-none" 
                                style={{ 
                                    width: viewportDims.width, 
                                    height: viewportDims.height, 
                                    margin: '0 auto',
                                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                                    transformOrigin: 'center center'
                                }}
                                onWheel={handleWheel}
                                onMouseDown={handleMouseDown}
                            >
                                <svg 
                                    ref={svgRef}
                                    width="100%" 
                                    height="100%" 
                                    className="absolute top-0 left-0 z-0"
                                >
                                    <defs>
                                        <marker
                                            id="arrow"
                                            markerWidth="20"
                                            markerHeight="10"
                                            refX="9"
                                            refY="5"
                                            orient="auto"
                                            markerUnits="userSpaceOnUse"
                                            overflow="visible"
                                        >
                                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                                        </marker>
                                    </defs>
                                    {Object.entries(graph).flatMap(([from, tos]) =>
                                        tos.map((to, i) => {
                                            const fromPos = positions[from];
                                            const toPos = positions[to];
                                            if (!fromPos || !toPos) return null;

                                            const dx = toPos.x - fromPos.x;
                                            const dy = toPos.y - fromPos.y;
                                            const length = Math.sqrt(dx * dx + dy * dy);
                                            const offset = 24;

                                            const x2 = toPos.x - (dx / length) * offset;
                                            const y2 = toPos.y - (dy / length) * offset;

                                            return (
                                                <line
                                                    key={`${from}->${to}-${i}`}
                                                    x1={fromPos.x}
                                                    y1={fromPos.y}
                                                    x2={x2}
                                                    y2={y2}
                                                    stroke="#64748b"
                                                    strokeWidth={2}
                                                    markerEnd="url(#arrow)"
                                                />
                                            );
                                        })
                                    )}
                                </svg>

                                <div className="absolute top-0 left-0 w-full h-full z-10">
                                    {nodes.map((n) => {
                                        let nodeClass = "bg-slate-700 text-white border-slate-600";
                                        if (n === currentStep.node) {
                                            nodeClass = "bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-400/50";
                                        } else if ((currentStep.queue || []).includes(n)) {
                                            nodeClass = "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/50";
                                        } else if (visitedNodes.includes(n)) {
                                            nodeClass = "bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/50";
                                        }
                                        
                                        return (
                                            <div
                                                key={n}
                                                className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${nodeClass} transition-all duration-300 transform hover:scale-110 pointer-events-none`}
                                                style={{ 
                                                    left: (positions[n]?.x || 0) - 24, 
                                                    top: (positions[n]?.y || 0) - 24
                                                }}
                                            >
                                                {n}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Zoom and Pan Instructions */}
                            <div className="mt-2 text-xs text-gray-400 text-center">
                                Scroll to zoom • Click and drag to pan • Use zoom buttons below
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                            <h3 className="font-semibold mb-3 text-purple-300">Legend</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                                    <span>Currently Visiting</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                    <span>In Queue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                    <span>Visited</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-slate-700 rounded-full"></div>
                                    <span>Unvisited</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BFS;