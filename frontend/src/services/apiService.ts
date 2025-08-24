import type { Recipe } from '../types/types';

const API_BASE_URL = 'http://localhost:5000';

// Types pour les réponses de l'API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

interface RecipesResponse extends ApiResponse<Recipe[]> {
  total: number;
  limit: number;
  offset: number;
}

interface SearchResponse extends ApiResponse<Recipe[]> {
  query: string;
  total: number;
}

interface HealthResponse extends ApiResponse<{
  status: string;
  timestamp: string;
  service: string;
}> {
  // Interface étendue pour la réponse de santé
}

// Classe pour gérer les appels API
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Méthode générique pour faire des requêtes HTTP
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      // Créer un AbortController pour gérer les timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes timeout (réduit de 30s)
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`Request timeout for ${endpoint} (15s)`);
          throw new Error('Request timed out - please try again');
        }
        console.error(`API request failed for ${endpoint}:`, error.message);
      } else {
        console.error(`API request failed for ${endpoint}:`, error);
      }
      throw error;
    }
  }

  // Vérifier l'état de l'API
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  // Récupérer toutes les recettes
  async getRecipes(params?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<RecipesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    const endpoint = `/api/recipes${query ? `?${query}` : ''}`;
    
    return this.request<RecipesResponse>(endpoint);
  }

  // Récupérer une recette spécifique
  async getRecipe(id: string): Promise<ApiResponse<Recipe>> {
    return this.request<ApiResponse<Recipe>>(`/api/recipes/${id}`);
  }

  // Rechercher des recettes
  async searchRecipes(query: string, limit?: number): Promise<SearchResponse> {
    const searchParams = new URLSearchParams({
      search: query
    });
    
    if (limit) {
      searchParams.append('limit', limit.toString());
    }

    return this.request<SearchResponse>(`/api/recipes?${searchParams.toString()}`);
  }

  // Récupérer les ingrédients (fonctionnalité future)
  async getIngredients(): Promise<ApiResponse<unknown[]>> {
    return this.request<ApiResponse<unknown[]>>('/api/ingredients');
  }
}

// Instance singleton du service API
export const apiService = new ApiService();

// Types d'erreur pour une meilleure gestion
export class ApiError extends Error {
  public status?: number;
  public endpoint?: string;

  constructor(
    message: string,
    status?: number,
    endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

// Utilitaires pour gérer les erreurs
export const handleApiError = (error: unknown, context?: string): ApiError => {
  console.error(`API Error ${context ? `in ${context}` : ''}:`, error);
  
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  
  return new ApiError('Une erreur inconnue s\'est produite');
};

// Hook personnalisé pour les états de loading
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export const createInitialApiState = <T>(): ApiState<T> => ({
  data: null,
  loading: false,
  error: null,
});

export default apiService;
