import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import BinarySearch from "./components/BinarySearch";
import BFS from "./components/BFS";
import DFS from "./components/DFS";
import SlidingWindow from "./components/SlidingWindow";
import DynamicProgramming from "./components/DynamicProgramming";
import SortingAlgorithms from "./components/SortingAlgorithms";
import BinarySearchTree from "./components/BinarySearchTree";
import BacktrackingVisualizer from "./components/BacktrackingAlgorithms";

const algorithms = [
  {
    name: "Binary Search",
    description: "Search an element in a sorted array",
    id: "binary-search",
    image: "/images/binary-search-find-mid.webp",
  },
  {
    name: "Breadth First Search (BFS)",
    description: "Graph traversal using queue",
    id: "bfs",
    image: "/images/bfs.png",
  },
  {
    name: "Depth First Search (DFS)",
    description: "Graph traversal using recursion",
    id: "dfs",
    image: "/images/dfs.png",
  },
  {
    name: "Sliding Window",
    description: "Optimize subarray problems",
    id: "sliding-window",
    image: "/images/sliding window.png"
  },
  {
    name: "Dynamic Programming",
    description: "Break problems into subproblems",
    id: "dynamic-programming",
    image: "/images/dp.png",
  },
  {
    name: "Sorting Algorithms",
    description: "Visualize and understand different sorting algorithms",
    id: "sorting-algorithms",
    image: "/images/sorting-algorithms.png",
  },
  {
    name: "Binary Search Tree",
    description: "Visualize Insertion, Deletion and Find operation in BST",
    id: "bst",
    image: "/images/bst.png",
  },
  {
    name: "Backtracking Algorithms",
    description: "Visualize the backtracking algorithm using games",
    id: "backtracking",
    image: "/images/backtracking.png",
  },
];

// Home component with algorithm cards
function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header Section */}
        <div className="text-center mb-16 pt-8">
          <div className="inline-block mb-6 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold mb-4 pb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Algorithm Visualizer
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Explore and understand algorithms through interactive visualizations.
          </p>
        </div>

        {/* Algorithm Cards Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {algorithms.map((algo, index) => (
              <div
                key={algo.id}
                className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20 hover:border-purple-400/50"
                onClick={() => navigate(`/algorithm/${algo.id}`)}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Image container with glow effect */}
                  <div className="relative mb-6 p-4 rounded-2xl bg-gray-800/50 group-hover:bg-gray-700/50 transition-colors duration-300">
                    <img
                      src={algo.image}
                      alt={algo.name}
                      className="w-full h-24 object-contain rounded-lg group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Text content */}
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                    {algo.name}
                  </h2>
                  <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                    {algo.description}
                  </p>

                  {/* Hover arrow */}
                  {/* <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-20 pb-12">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
            <span>Built with</span>
            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span>for learning</span>
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}

// Algorithm wrapper component
function AlgorithmPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const renderAlgoComponent = () => {
    switch (id) {
      case "binary-search":
        return <BinarySearch onBack={handleBack} />;
      case "bfs":
        return <BFS onBack={handleBack} />;
      case "dfs":
        return <DFS onBack={handleBack} />;
      case "sliding-window":
        return <SlidingWindow onBack={handleBack} />;
      case "dynamic-programming":
        return <DynamicProgramming onBack={handleBack} />;
      case "sorting-algorithms":
        return <SortingAlgorithms onBack={handleBack} />;
      case "bst":
        return <BinarySearchTree onBack={handleBack} />;
      case "backtracking":
        return <BacktrackingVisualizer onBack={handleBack} />;
      default:
        return (
          <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-red-400">
                Algorithm Not Found
              </h1>
              <p className="text-gray-300 mb-6">
                The algorithm you're looking for doesn't exist.
              </p>
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        );
    }
  };

  return <div>{renderAlgoComponent()}</div>;
}

// Main App component with routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/algorithm/:id" element={<AlgorithmPage />} />
        <Route path="*" element={
          <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-red-400">
                404 - Page Not Found
              </h1>
              <p className="text-gray-300 mb-6">
                The page you're looking for doesn't exist.
              </p>
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;