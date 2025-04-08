import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
);

const CellularAutomata = () => {
  const canvasRef = useRef(null);
  const [gridSize, setGridSize] = useState({ width: 500, height: 500 });
  const [cellSize, setCellSize] = useState(2);
  const [grid, setGrid] = useState([]);
  const [generation, setGeneration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [cellColor, setCellColor] = useState("#FFFFFF");
  const [populationHistory, setPopulationHistory] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const [simulationSpeed, setSimulationSpeed] = useState(500);

  // Inicializar el grid
  useEffect(() => {
    const newGrid = Array(gridSize.height)
      .fill()
      .map(() => Array(gridSize.width).fill(false));
    setGrid(newGrid);
  }, [gridSize]);

  // Renderizar el grid
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const scale = cellSize;

    canvas.width = gridSize.width * scale;
    canvas.height = gridSize.height * scale;

    // Limpiar el canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar células vivas
    ctx.fillStyle = cellColor;
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      });
    });
  }, [grid, cellSize, cellColor]);

  // Calcular siguiente generación
  const nextGeneration = () => {
    const currentGrid = [...grid];
    const newGrid = currentGrid.map((row, y) =>
      row.map((cell, x) => {
        const neighbors = countNeighbors(x, y, currentGrid);
        if (cell) {
          return neighbors === 2 || neighbors === 3;
        }
        return neighbors === 3;
      })
    );

    const population = newGrid.flat().filter((cell) => cell).length;
    setPopulationHistory((prev) => [...prev, population]);
    setGrid(newGrid);
    setGeneration((prev) => prev + 1);
  };

  // Contar vecinos vivos
  const countNeighbors = (x, y, currentGrid) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newY = (y + i + gridSize.height) % gridSize.height;
        const newX = (x + j + gridSize.width) % gridSize.width;
        if (currentGrid[newY][newX]) count++;
      }
    }
    return count;
  };

  // Manejar click en el canvas
  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    if (x >= 0 && x < gridSize.width && y >= 0 && y < gridSize.height) {
      const newGrid = grid.map((row, yIdx) =>
        row.map((cell, xIdx) => (xIdx === x && yIdx === y ? !cell : cell))
      );
      setGrid(newGrid);
    }
  };

  // Iniciar/Detener simulación
  const toggleSimulation = () => {
    if (isRunning) {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    } else {
      if (intervalId) {
        clearInterval(intervalId);
      }
      const id = setInterval(nextGeneration, simulationSpeed);
      setIntervalId(id);
    }
    setIsRunning(!isRunning);
  };

  // Efecto para manejar cambios en la velocidad de simulación
  useEffect(() => {
    if (isRunning && intervalId) {
      clearInterval(intervalId);
      const id = setInterval(nextGeneration, simulationSpeed);
      setIntervalId(id);
    }
  }, [simulationSpeed]);

  // Limpiar el intervalo cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Limpiar grid
  const clearGrid = () => {
    const newGrid = Array(gridSize.height)
      .fill()
      .map(() => Array(gridSize.width).fill(false));
    setGrid(newGrid);
    setGeneration(0);
    setPopulationHistory([]);
  };

  // Generar patrón aleatorio
  const randomizeGrid = () => {
    const newGrid = Array(gridSize.height)
      .fill()
      .map(() =>
        Array(gridSize.width)
          .fill()
          .map(() => Math.random() < 0.1)
      );
    setGrid(newGrid);
    setGeneration(0);
    setPopulationHistory([]);
  };

  // Configuración de las gráficas
  const chartData = {
    labels: Array.from({ length: populationHistory.length }, (_, i) => i),
    datasets: [
      {
        label: "Población",
        data: populationHistory,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const logChartData = {
    ...chartData,
    datasets: [
      {
        ...chartData.datasets[0],
        data: populationHistory.map((p) => Math.log10(p || 1)),
      },
    ],
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-4 mb-4">
        <input
          type="color"
          value={cellColor}
          onChange={(e) => setCellColor(e.target.value)}
          className="h-8"
        />
        <input
          type="range"
          min="1"
          max="10"
          value={cellSize}
          onChange={(e) => setCellSize(Number(e.target.value))}
          className="w-32"
        />
        <button
          onClick={toggleSimulation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isRunning ? "Detener" : "Iniciar"}
        </button>
        <button
          onClick={nextGeneration}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Siguiente
        </button>
        <button
          onClick={clearGrid}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Limpiar
        </button>
        <button
          onClick={randomizeGrid}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Aleatorio
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm">Velocidad:</span>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={simulationSpeed}
            onChange={(e) => {
              const newSpeed = Number(e.target.value);
              setSimulationSpeed(newSpeed);
              if (isRunning) {
                clearInterval(intervalId);
                const id = setInterval(nextGeneration, newSpeed);
                setIntervalId(id);
              }
            }}
            className="w-32"
          />
          <span className="text-sm">{simulationSpeed}ms</span>
        </div>
      </div>

      <div className="overflow-auto border border-gray-600 rounded">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="cursor-pointer"
        />
      </div>

      <div className="text-lg">
        Generación: {generation} | Población:{" "}
        {populationHistory[populationHistory.length - 1] || 0}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-center mb-2">Población</h3>
          <Line data={chartData} />
        </div>
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-center mb-2">Población (Log10)</h3>
          <Line data={logChartData} />
        </div>
      </div>
    </div>
  );
};

export default CellularAutomata;
