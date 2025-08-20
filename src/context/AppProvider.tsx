import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import type { Ingredient, Recipe, WeeklyPlan, TodoRecipe } from '../types/types';

interface AppContextType {
   ingredients: Ingredient[];
   recipes: Recipe[];
   weeklyPlan: WeeklyPlan[];
   todoRecipes: TodoRecipe[];
   addIngredient: (ingredient: Omit<Ingredient, 'id' | 'addedDate'>) => void;
   removeIngredient: (id: string) => void;
   addRecipeToTodo: (recipe: Recipe) => void;
   removeRecipeFromTodo: (id: string) => void;
   updateWeeklyPlan: (plan: WeeklyPlan) => void;
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
   const [ingredients, setIngredients] = useLocalStorage<Ingredient[]>('ingredients', []);
   const [recipes] = useLocalStorage<Recipe[]>('recipes', [
      {
         id: '1',
         name: 'Pasta Carbonara',
         description: 'Un délicieux plat de pâtes italien traditionnel',
         ingredients: ['pâtes', 'œufs', 'parmesan', 'pancetta'],
         instructions: 'Cuire les pâtes, mélanger avec les œufs et le parmesan...',
         prepTime: 20,
         difficulty: 'easy'
      },
      {
         id: '2',
         name: 'Salade César',
         description: 'Une salade fraîche et croquante',
         ingredients: ['salade', 'parmesan', 'croûtons', 'sauce césar'],
         instructions: 'Mélanger tous les ingrédients...',
         prepTime: 15,
         difficulty: 'easy'
      }
   ]);
   const [weeklyPlan, setWeeklyPlan] = useLocalStorage<WeeklyPlan[]>('weeklyPlan', []);
   const [todoRecipes, setTodoRecipes] = useLocalStorage<TodoRecipe[]>('todoRecipes', []);

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

   const addRecipeToTodo = (recipe: Recipe) => {
      const todoRecipe: TodoRecipe = {
         id: Date.now().toString(),
         recipe,
         addedDate: new Date(),
      };
      setTodoRecipes([...todoRecipes, todoRecipe]);
   };

   const removeRecipeFromTodo = (id: string) => {
      setTodoRecipes(todoRecipes.filter(tr => tr.id !== id));
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
         todoRecipes,
         addIngredient,
         removeIngredient,
         addRecipeToTodo,
         removeRecipeFromTodo,
         updateWeeklyPlan,
      }}>
         {children}
      </AppContext.Provider>
   );
};