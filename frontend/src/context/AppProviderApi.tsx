import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { useRecipes, useApiHealth } from '../services/apiHooks';
import { ApiError } from '../services/apiService';
import type { Ingredient, Recipe, WeeklyPlan } from '../types/types';

interface AppContextType {
   // États des données
   ingredients: Ingredient[];
   recipes: Recipe[];
   weeklyPlan: WeeklyPlan[];
   selectedRecipes: Recipe[];
   
   // États de loading et d'erreur
   recipesLoading: boolean;
   recipesError: ApiError | null;
   apiHealthy: boolean;
   
   // Actions pour les ingrédients
   addIngredient: (ingredient: Omit<Ingredient, 'id' | 'addedDate'>) => void;
   removeIngredient: (id: string) => void;
   updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void;
   
   // Actions pour le planning
   updateWeeklyPlan: (plan: WeeklyPlan) => void;
   
   // Actions pour les recettes sélectionnées
   addSelectedRecipe: (recipe: Recipe) => void;
   removeSelectedRecipe: (recipeId: string) => void;
   
   // Actions pour la recherche
   searchQuery: string;
   setSearchQuery: (query: string) => void;
   refreshRecipes: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
   const context = useContext(AppContext);
   if (!context) {
      throw new Error('useAppContext must be used within an AppProvider');
   }
   return context;
};

interface AppProviderProps {
   children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
   // État de recherche
   const [searchQuery, setSearchQuery] = useState<string>('');
   
   // Ingrédients stockés localement avec des exemples par défaut
   const [ingredients, setIngredients] = useLocalStorage<Ingredient[]>('ingredients', [
      {
         id: '1',
         name: 'Tomates',
         quantity: 500,
         unit: 'g',
         expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
         addedDate: new Date()
      },
      {
         id: '2',
         name: 'Pâtes',
         quantity: 400,
         unit: 'g',
         expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
         addedDate: new Date()
      },
      {
         id: '3',
         name: 'Œufs',
         quantity: 6,
         unit: 'pieces',
         expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
         addedDate: new Date()
      },
      {
         id: '4',
         name: 'Bœuf haché',
         quantity: 500,
         unit: 'g',
         expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
         addedDate: new Date()
      },
      {
         id: '5',
         name: 'Oignons',
         quantity: 2,
         unit: 'pieces',
         expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
         addedDate: new Date()
      }
   ]);
   
   // Santé de l'API
   const { isHealthy: apiHealthy } = useApiHealth();
   
   // Créer une requête de recherche basée sur les ingrédients du garde-manger
   const ingredientSearchQuery = useMemo(() => {
      if (ingredients.length > 0) {
         // Prendre les 3 premiers ingrédients avec quantité > 0
         const availableIngredients = ingredients
            .filter(ing => ing.quantity > 0)
            .slice(0, 3)
            .map(ing => ing.name)
            .join(' ');
         return availableIngredients || '';
      }
      return '';
   }, [ingredients]);
   
   // Utiliser la recherche manuelle si disponible, sinon les ingrédients
   const effectiveSearchQuery = searchQuery || ingredientSearchQuery;
   
   // Récupération des recettes depuis l'API sans limite
   const { recipes: apiRecipes, loading: recipesLoading, error: recipesError, refetch: refreshRecipes } = useRecipes(effectiveSearchQuery);
   
   // Planning hebdomadaire stocké localement
   const [weeklyPlan, setWeeklyPlan] = useLocalStorage<WeeklyPlan[]>('weeklyPlan', []);
   
   // Recettes sélectionnées stockées localement
   const [selectedRecipes, setSelectedRecipes] = useLocalStorage<Recipe[]>('selectedRecipes', []);

   // Actions pour les ingrédients
   const addIngredient = (ingredient: Omit<Ingredient, 'id' | 'addedDate'>) => {
      const newIngredient: Ingredient = {
         ...ingredient,
         id: Date.now().toString(),
         addedDate: new Date(),
      };
      setIngredients([...ingredients, newIngredient]);
   };

   const removeIngredient = (id: string) => {
      setIngredients(ingredients.filter(ing => ing.id !== id));
   };

   const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
      setIngredients(ingredients.map(ing => 
         ing.id === id ? { ...ing, ...updates } : ing
      ));
   };

   // Actions pour les recettes sélectionnées
   const addSelectedRecipe = (recipe: Recipe) => {
      if (!selectedRecipes.some(r => r.id === recipe.id)) {
         setSelectedRecipes([...selectedRecipes, recipe]);
      }
   };

   const removeSelectedRecipe = (recipeId: string) => {
      setSelectedRecipes(selectedRecipes.filter(r => r.id !== recipeId));
   };

   // Actions pour le planning
   const updateWeeklyPlan = (plan: WeeklyPlan) => {
      const existingPlanIndex = weeklyPlan.findIndex(p => p.day === plan.day);
      if (existingPlanIndex >= 0) {
         const updatedPlan = [...weeklyPlan];
         updatedPlan[existingPlanIndex] = plan;
         setWeeklyPlan(updatedPlan);
      } else {
         setWeeklyPlan([...weeklyPlan, plan]);
      }
   };

   return (
      <AppContext.Provider value={{
         // États des données
         ingredients,
         recipes: apiRecipes || [],
         weeklyPlan,
         selectedRecipes,
         
         // États de loading et d'erreur
         recipesLoading,
         recipesError,
         apiHealthy,
         
         // Actions pour les ingrédients
         addIngredient,
         removeIngredient,
         updateIngredient,
         
         // Actions pour le planning
         updateWeeklyPlan,
         
         // Actions pour les recettes sélectionnées
         addSelectedRecipe,
         removeSelectedRecipe,
         
         // Actions pour la recherche
         searchQuery,
         setSearchQuery,
         refreshRecipes,
      }}>
         {children}
      </AppContext.Provider>
   );
};
