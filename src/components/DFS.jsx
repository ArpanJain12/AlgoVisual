import React, { useState, useEffect, useRef } from "react";

const DFS = ({ onBack = () => { } }) => {
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
    const intervalRef = useRef(null);

    const center = { x: 300, y: 320 };
    const radius = 200;

    const generatePositions = (nodes) => {
        const angle = (2 * Math.PI) / nodes.length;
        const pos = {};
        nodes.forEach((node, i) => {
            pos[node] = {
                x: center.x + radius * Math.cos(i * angle),
                y: center.y + radius * Math.sin(i * angle),
            };
        });
        return pos;
    };

    const prepareSteps = (graph, start) => {
        const trace = [];
        const visited = new Set();

        const dfs = (node) => {
            if (visited.has(node)) return;
            trace.push({ node, status: "visit" });
            visited.add(node);

            const neighbors = (graph[node] || []).filter((n) => !visited.has(n));
            if (neighbors.length > 0) {
                trace.push({ node, stack: [...neighbors], status: "enqueueing", neighbors });
            }

            for (const neighbor of neighbors) {
                dfs(neighbor);
            }

            trace.push({ node, status: "backtrack" });
        };

        dfs(start);
        return trace;
    };

    const handleStart = () => {
        let parsed;
        try {
            parsed = JSON.parse(graphInput);
        } catch (e) {
            alert("Invalid JSON");
            return;
        }

        const nodesList = Array.from(new Set([startNode, ...Object.keys(parsed), ...Object.values(parsed).flat()]));
        setGraph(parsed);
        setPositions(generatePositions(nodesList));
        setNodes(nodesList);

        setSteps(prepareSteps(parsed, startNode));
        setCurrent(0);
        setRunning(true);
        setVisitedNodes(stepTrace[0]?.status === "visit" ? [stepTrace[0].node] : []);
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
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [autoplay, running, steps]);

    useEffect(() => {
        updateVisitedNodes(steps, current);
    }, [current]);

    const currentStep = steps[current] || {};

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="text-white max-w-5xl mx-auto relative min-h-[700px] z-10 pt-8">
            <button onClick={() => {
                clearInterval(intervalRef.current);
                onBack();
            }} className="mb-4 text-blue-400 hover:underline">← Back</button>
            <h2 className="text-2xl font-bold mb-4">Graph-Based DFS Visualizer</h2>

            {!running ? (
                <>
                    <textarea
                        value={graphInput}
                        onChange={(e) => setGraphInput(e.target.value)}
                        placeholder='Graph as JSON: {"A": ["B", "C"], "B": ["D"], "C": [], "D": []}'
                        className="w-full p-2 rounded bg-gray-700 mb-4 h-32"
                    />
                    <input
                        type="text"
                        value={startNode}
                        onChange={(e) => setStartNode(e.target.value)}
                        placeholder="Start node (e.g. A)"
                        className="w-full p-2 rounded bg-gray-700 mb-4"
                    />
                    <button
                        onClick={handleStart}
                        className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded shadow"
                    >
                        Start
                    </button>
                </>
            ) : (
                <>
                    <div className="relative w-full h-[600px]">
                        <svg width="100%" height="600" className="absolute top-0 left-0 z-0">
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
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#999" />
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
                                    const offset = 24; // node radius (half of node size)

                                    const x2 = toPos.x - (dx / length) * offset;
                                    const y2 = toPos.y - (dy / length) * offset;

                                    return (
                                        <line
                                            key={`${from}->${to}-${i}`}
                                            x1={fromPos.x}
                                            y1={fromPos.y}
                                            x2={x2}
                                            y2={y2}
                                            stroke="#999"
                                            strokeWidth={2}
                                            markerEnd="url(#arrow)"
                                        />
                                    );
                                })
                            )}
                        </svg>

                        <div className="absolute top-0 left-0 w-full h-full z-10">
                            {nodes.map((n) => {
                                let highlight = "bg-gray-700";
                                if (n === currentStep.node && currentStep.status === "visit") highlight = "bg-yellow-400 text-black";
                                else if ((currentStep.stack || []).includes(n)) highlight = "bg-purple-500 text-white";
                                else if (visitedNodes.includes(n)) highlight = "bg-green-600 text-white";
                                else if (n === currentStep.node && currentStep.status === "backtrack") highlight = "bg-red-500 text-white";
                                return (
                                    <div
                                        key={n}
                                        className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-bold ${highlight} shadow-lg transition-all duration-300`}
                                        style={{ left: positions[n]?.x - 24, top: positions[n]?.y - 24 }}
                                    >
                                        {n}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="text-center text-blue-300 mb-2">
                        {currentStep.status === "enqueueing"
                            ? `Exploring neighbors: ${(currentStep.neighbors || []).join(", ")}`
                            : currentStep.status === "visit"
                                ? `Visiting node ${currentStep.node}`
                                : currentStep.status === "backtrack"
                                    ? `Backtracking from ${currentStep.node}`
                                    : currentStep.status}
                    </div>

                    <div className="flex justify-center gap-4 mt-4">
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
                    </div>
                </>
            )}
        </div>
        </div>
        
    );
};

export default DFS;

