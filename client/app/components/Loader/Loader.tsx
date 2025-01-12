import React, { useEffect, useState } from "react";
import "./Loader.css";

const Loader = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures this runs only on the client
  }, []);

  if (!isClient) return null; // Skip rendering on the server

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="loading-container">
        <span className="loading-text">L</span>
        <span className="loading-text">O</span>
        <span className="loading-text">A</span>
        <span className="loading-text">D</span>
        <span className="loading-text">I</span>
        <span className="loading-text">N</span>
        <span className="loading-text">G</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </div>
    </div>
  );
};

export default Loader;
