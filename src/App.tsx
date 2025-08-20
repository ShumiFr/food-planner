import React, { useState } from 'react';
import { AppProvider } from './context/AppProvider';
import Navigation from './components/Navigation';
import Home from './pages/Home';

function App(): React.ReactNode {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'pantry':
        return <div>Page Garde-manger (à implémenter)</div>;
      case 'planning':
        return <div>Page Planning (à implémenter)</div>;
      case 'todo':
        return <div>Page À faire cette semaine (à implémenter)</div>;
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