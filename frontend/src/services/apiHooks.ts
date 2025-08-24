import { useState, useEffect, useCallback } from 'react';
import { apiService, handleApiError, createInitialApiState, type ApiState } from '../services/apiService';
import type { Recipe } from '../types/types';

// Hook pour récupérer toutes les recettes
export const useRecipes = (searchQuery?: string, limit?: number) => {
  const [state, setState] = useState<ApiState<Recipe[]>>(createInitialApiState);
  const [retryCount, setRetryCount] = useState(0);

  const fetchRecipes = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }
    
    try {
      let response;
      if (searchQuery && searchQuery.trim()) {
        response = await apiService.searchRecipes(searchQuery.trim(), limit || 50); // Limite par défaut réduite
      } else {
        response = await apiService.getRecipes({ limit: limit || 50 }); // Limite par défaut réduite
      }
      
      setState({
        data: response.data,
        loading: false,
        error: null
      });
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      const apiError = handleApiError(error, 'useRecipes');
      
      // Retry automatique avec limite plus faible en cas de timeout
      if (apiError.message.includes('timeout') && retryCount < 2) {
        console.warn(`Retry attempt ${retryCount + 1} with reduced limit`);
        setRetryCount(prev => prev + 1);
        
        // Retry avec une limite encore plus faible
        setTimeout(() => {
          fetchRecipes(true);
        }, 1000);
        return;
      }
      
      setState({
        data: null,
        loading: false,
        error: apiError
      });
    }
  }, [searchQuery, limit, retryCount]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes: state.data,
    loading: state.loading,
    error: state.error,
    refetch: () => {
      setRetryCount(0);
      fetchRecipes();
    }
  };
};

// Hook pour récupérer une recette spécifique
export const useRecipe = (id: string | null) => {
  const [state, setState] = useState<ApiState<Recipe>>(createInitialApiState);

  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiService.getRecipe(id);
      setState({
        data: response.data,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: handleApiError(error, 'useRecipe')
      });
    }
  }, [id]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  return {
    recipe: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchRecipe
  };
};

// Hook pour la recherche en temps réel avec debounce
export const useSearchRecipes = (initialQuery: string = '', debounceMs: number = 300) => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [state, setState] = useState<ApiState<Recipe[]>>(createInitialApiState);

  // Debounce du terme de recherche
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs]);

  // Effectuer la recherche quand le terme debouncé change
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    const searchRecipes = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await apiService.searchRecipes(debouncedQuery);
        setState({
          data: response.data,
          loading: false,
          error: null
        });
      } catch (error) {
        setState({
          data: [],
          loading: false,
          error: handleApiError(error, 'useSearchRecipes')
        });
      }
    };

    searchRecipes();
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    recipes: state.data,
    loading: state.loading,
    error: state.error,
    isSearching: query !== debouncedQuery
  };
};

// Hook pour vérifier l'état de l'API
export const useApiHealth = () => {
  const [state, setState] = useState<ApiState<{ status: string; timestamp: string; service: string }>>(
    createInitialApiState
  );

  const checkHealth = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiService.healthCheck();
      setState({
        data: response.data,
        loading: false,
        error: null
      });
    } catch (error) {
      // Log l'erreur mais ne pas la traiter comme fatale
      console.warn('API health check failed:', error);
      setState({
        data: null,
        loading: false,
        error: handleApiError(error, 'useApiHealth')
      });
    }
  }, []);

  // Ne pas faire le health check automatiquement au démarrage
  // Il sera fait uniquement quand nécessaire
  useEffect(() => {
    // Delay initial health check to avoid race conditions
    const timer = setTimeout(() => {
      checkHealth();
    }, 1000);

    return () => clearTimeout(timer);
  }, [checkHealth]);

  return {
    health: state.data,
    loading: state.loading,
    error: state.error,
    refetch: checkHealth,
    isHealthy: state.data?.status === 'healthy'
  };
};
