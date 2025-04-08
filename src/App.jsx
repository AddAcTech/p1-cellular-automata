import CellularAutomata from "./components/CellularAutomata";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Autómata Celular - Game of Life
      </h1>
      <CellularAutomata />
    </div>
  );
}

export default App;
