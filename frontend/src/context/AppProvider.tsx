import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import type { Ingredient, Recipe, WeeklyPlan } from '../types/types';

interface AppContextType {
   ingredients: Ingredient[];
   recipes: Recipe[];
   weeklyPlan: WeeklyPlan[];
   selectedRecipes: Recipe[];
   addIngredient: (ingredient: Omit<Ingredient, 'id' | 'addedDate'>) => void;
   removeIngredient: (id: string) => void;
   updateWeeklyPlan: (plan: WeeklyPlan) => void;
   addSelectedRecipe: (recipe: Recipe) => void;
   removeSelectedRecipe: (recipeId: string) => void;
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
   const [ingredients, setIngredients] = useLocalStorage<Ingredient[]>('ingredients', [
      {
         id: '1',
         name: 'Tomates',
         quantity: 500,
         unit: 'g',
         expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
         addedDate: new Date()
      },
      {
         id: '2',
         name: 'Pâtes',
         quantity: 1,
         unit: 'kg',
         expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
         addedDate: new Date()
      },
      {
         id: '3',
         name: 'Œufs',
         quantity: 12,
         unit: 'pieces',
         expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours (priorité)
         addedDate: new Date()
      },
      {
         id: '4',
         name: 'Parmesan',
         quantity: 200,
         unit: 'g',
         expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Dans 15 jours
         addedDate: new Date()
      },
      {
         id: '5',
         name: 'Salade',
         quantity: 2,
         unit: 'pieces',
         expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours (priorité)
         addedDate: new Date()
      }
   ]);
   const [recipes] = useLocalStorage<Recipe[]>('recipes', [
      {
         id: '1',
         name: 'Pasta Carbonara',
         description: 'Un délicieux plat de pâtes italien traditionnel avec des œufs et du parmesan',
         ingredients: ['pâtes', 'œufs', 'parmesan', 'pancetta'],
         instructions: 'Cuire les pâtes, mélanger avec les œufs et le parmesan...',
         prepTime: 20,
         difficulty: 'easy'
      },
      {
         id: '2',
         name: 'Salade César',
         description: 'Une salade fraîche et croquante avec parmesan et croûtons',
         ingredients: ['salade', 'parmesan', 'croûtons', 'sauce césar'],
         instructions: 'Mélanger tous les ingrédients...',
         prepTime: 15,
         difficulty: 'easy'
      },
      {
         id: '3',
         name: 'Spaghetti Bolognaise',
         description: 'Pasta italienne avec sauce tomate et viande hachée',
         ingredients: ['pâtes', 'tomates', 'viande hachée', 'oignon', 'ail'],
         instructions: 'Faire revenir la viande, ajouter les tomates, servir sur les pâtes...',
         prepTime: 45,
         difficulty: 'medium'
      },
      {
         id: '4',
         name: 'Omelette aux fines herbes',
         description: 'Omelette moelleuse aux herbes fraîches',
         ingredients: ['œufs', 'beurre', 'fines herbes', 'sel', 'poivre'],
         instructions: 'Battre les œufs, cuire dans le beurre, ajouter les herbes...',
         prepTime: 10,
         difficulty: 'easy'
      },
      {
         id: '5',
         name: 'Risotto aux champignons',
         description: 'Risotto crémeux avec champignons et parmesan',
         ingredients: ['riz arborio', 'champignons', 'parmesan', 'bouillon', 'vin blanc'],
         instructions: 'Faire revenir les champignons, ajouter le riz, incorporer le bouillon...',
         prepTime: 35,
         difficulty: 'hard'
      },
      {
         id: '6',
         name: 'Salade de tomates',
         description: 'Salade simple et fraîche avec tomates et basilic',
         ingredients: ['tomates', 'basilic', 'huile olive', 'sel', 'poivre'],
         instructions: 'Couper les tomates, assaisonner, ajouter le basilic...',
         prepTime: 5,
         difficulty: 'easy'
      },
      {
         id: '7',
         name: 'Quiche Lorraine',
         description: 'Quiche traditionnelle aux lardons et œufs',
         ingredients: ['pâte brisée', 'œufs', 'crème', 'lardons', 'gruyère'],
         instructions: 'Étaler la pâte, disposer les lardons, verser l\'appareil...',
         prepTime: 60,
         difficulty: 'medium'
      },
      {
         id: '8',
         name: 'Salade composée',
         description: 'Salade complète avec légumes variés',
         ingredients: ['salade', 'tomates', 'concombre', 'œufs', 'thon'],
         instructions: 'Mélanger tous les légumes, ajouter les œufs durs et le thon...',
         prepTime: 15,
         difficulty: 'easy'
      }
   ]);
   const [weeklyPlan, setWeeklyPlan] = useLocalStorage<WeeklyPlan[]>('weeklyPlan', []);
   const [selectedRecipes, setSelectedRecipes] = useLocalStorage<Recipe[]>('selectedRecipes', []);

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

   const addSelectedRecipe = (recipe: Recipe) => {
      if (!selectedRecipes.some(r => r.id === recipe.id)) {
         setSelectedRecipes([...selectedRecipes, recipe]);
      }
   };

   const removeSelectedRecipe = (recipeId: string) => {
      setSelectedRecipes(selectedRecipes.filter(r => r.id !== recipeId));
   };

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
         ingredients,
         recipes,
         weeklyPlan,
         selectedRecipes,
         addIngredient,
         removeIngredient,
         updateWeeklyPlan,
         addSelectedRecipe,
         removeSelectedRecipe,
      }}>
         {children}
      </AppContext.Provider>
   );
};