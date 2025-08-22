export interface Ingredient {
   id: string;
   name: string;
   quantity: number;
   unit: 'kg' | 'g' | 'l' | 'ml' | 'pieces';
   expirationDate: Date;
   addedDate: Date;
}

export interface Recipe {
   id: string;
   name: string;
   description: string;
   ingredients: string[];
   instructions: string;
   prepTime: number;
   cookingTime?: number; // Optionnel car peut ne pas être présent dans toutes les sources
   coversCount?: number; // Optionnel car peut ne pas être présent dans toutes les sources
   difficulty: 'easy' | 'medium' | 'hard';
   image?: string;
}

export interface WeeklyPlan {
   id: string;
   day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
   lunch?: Recipe;
   dinner?: Recipe;
}

export interface TodoRecipe {
   id: string;
   recipe: Recipe;
   addedDate: Date;
}