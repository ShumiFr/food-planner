import React, { useState } from 'react';
import { AppProvider } from './context/AppProvider';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Pantry from './pages/Pantry';
import Planning from './pages/Planning';
import TodoList from './pages/TodoList';

function App(): React.ReactNode {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'pantry':
        return <Pantry />;
      case 'planning':
        return <Planning />;
      case 'todo':
        return <TodoList />;
      default:
        return <Home />;
    }
  };

  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        {renderPage()}
      </div>
    </AppProvider>
  );
}

export default App;