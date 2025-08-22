import React, { useState } from 'react';
import { AppProvider } from './context/AppProviderApi';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import DiscoverIntelligent from './pages/DiscoverIntelligent';
import RecipeDetail from './pages/RecipeDetail';
import Pantry from './pages/Pantry';
import Planning from './pages/Planning';

function App(): React.ReactNode {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const handleNavigate = (page: string, data?: unknown) => {
    setCurrentPage(page);
    if (page === 'recipe-detail' && data && typeof data === 'object' && 'recipeId' in data) {
      setSelectedRecipeId((data as { recipeId: string }).recipeId);
    } else {
      setSelectedRecipeId(null);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'discover':
        return <DiscoverIntelligent onNavigate={handleNavigate} />;
      case 'recipe-detail':
        return selectedRecipeId ? (
          <RecipeDetail recipeId={selectedRecipeId} onNavigate={handleNavigate} />
        ) : (
          <Home onNavigate={handleNavigate} />
        );
      case 'pantry':
        return <Pantry />;
      case 'planning':
        return <Planning />;
      default:
        return <Home onNavigate={handleNavigate} />;
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