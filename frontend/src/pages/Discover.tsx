import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppProviderApi';
import type { Recipe } from '../types/types';

const Discover: React.FC = () => {
   const { recipes, recipesLoading, recipesError, addSelectedRecipe, updateWeeklyPlan } = useAppContext();

   // États pour les filtres
   const [selectedCategory, setSelectedCategory] = useState<string>('all');
   const [selectedSeason, setSelectedSeason] = useState<string>('all');
   const [selectedProtein, setSelectedProtein] = useState<string>('all');

   // Catégories disponibles
   const categories = [
      { id: 'all', label: 'Toutes les catégories', emoji: '🍽️' },
      { id: 'saison', label: 'Recettes de saison', emoji: '🌿' },
      { id: 'rapide', label: 'Recettes rapides', emoji: '⚡' },
      { id: 'vegetarien', label: 'Végétarien', emoji: '🥕' },
      { id: 'dessert', label: 'Desserts', emoji: '🍰' }
   ];

   // Saisons
   const seasons = [
      { id: 'all', label: 'Toutes saisons', emoji: '🌍' },
      { id: 'printemps', label: 'Printemps', emoji: '🌸' },
      { id: 'ete', label: 'Été', emoji: '☀️' },
      { id: 'automne', label: 'Automne', emoji: '🍂' },
      { id: 'hiver', label: 'Hiver', emoji: '❄️' }
   ];

   // Types de protéines
   const proteins = [
      { id: 'all', label: 'Toutes protéines', emoji: '🍽️' },
      { id: 'viande', label: 'Viande', emoji: '🥩' },
      { id: 'poisson', label: 'Poisson', emoji: '🐟' },
      { id: 'volaille', label: 'Volaille', emoji: '🐔' },
      { id: 'vegetarien', label: 'Végétarien', emoji: '🥬' },
      { id: 'vegan', label: 'Vegan', emoji: '🌱' }
   ];

   // Fonction pour déterminer la catégorie d'une recette
   const getRecipeCategory = (recipe: Recipe): string[] => {
      const categories: string[] = ['all'];
      const name = recipe.name.toLowerCase();
      const description = recipe.description.toLowerCase();
      const ingredients = recipe.ingredients.join(' ').toLowerCase();

      // Détection des protéines
      if (ingredients.includes('bœuf') || ingredients.includes('porc') || ingredients.includes('agneau') ||
         name.includes('viande') || description.includes('viande')) {
         categories.push('viande');
      }
      if (ingredients.includes('saumon') || ingredients.includes('thon') || ingredients.includes('poisson') ||
         name.includes('poisson') || description.includes('poisson')) {
         categories.push('poisson');
      }
      if (ingredients.includes('poulet') || ingredients.includes('canard') || ingredients.includes('volaille') ||
         name.includes('poulet') || name.includes('volaille')) {
         categories.push('volaille');
      }

      // Détection végétarien/vegan
      const meatKeywords = ['viande', 'poisson', 'poulet', 'bœuf', 'porc', 'saumon', 'thon'];
      const hasMeat = meatKeywords.some(keyword =>
         ingredients.includes(keyword) || name.includes(keyword) || description.includes(keyword)
      );

      if (!hasMeat) {
         categories.push('vegetarien');
         // Simple heuristique pour vegan (pas de produits laitiers/œufs)
         const dairyKeywords = ['fromage', 'lait', 'crème', 'beurre', 'œuf'];
         const hasDairy = dairyKeywords.some(keyword =>
            ingredients.includes(keyword) || name.includes(keyword)
         );
         if (!hasDairy) {
            categories.push('vegan');
         }
      }

      // Détection de recettes rapides
      if (recipe.prepTime <= 15) {
         categories.push('rapide');
      }

      // Détection de desserts
      if (name.includes('dessert') || name.includes('gâteau') || name.includes('tarte') ||
         name.includes('crème') || description.includes('dessert')) {
         categories.push('dessert');
      }

      return categories;
   };

   // Filtrer les recettes
   const filteredRecipes = useMemo(() => {
      if (!recipes) return [];

      return recipes.filter((recipe: Recipe) => {
         const recipeCategories = getRecipeCategory(recipe);

         // Filtre par catégorie
         if (selectedCategory !== 'all') {
            if (selectedCategory === 'saison') {
               // Pour les recettes de saison, on peut ajouter une logique spécifique
               // Pour l'instant, on considère toutes les recettes avec des légumes
               const hasSeasonalIngredients = recipe.ingredients.some((ing: string) =>
                  ing.includes('légume') || ing.includes('tomate') || ing.includes('courgette') ||
                  ing.includes('carotte') || ing.includes('salade')
               );
               if (!hasSeasonalIngredients) return false;
            } else {
               if (!recipeCategories.includes(selectedCategory)) return false;
            }
         }

         // Filtre par protéine
         if (selectedProtein !== 'all') {
            if (!recipeCategories.includes(selectedProtein)) return false;
         }

         return true;
      });
   }, [recipes, selectedCategory, selectedProtein]);

   // Fonction pour ajouter au planning
   const addToPlanning = (recipe: Recipe, day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday', mealType: 'breakfast' | 'lunch' | 'dinner') => {
      const newPlanItem = {
         id: `${day}-${mealType}-${Date.now()}`,
         day,
         mealType,
         recipeId: recipe.id,
         recipeName: recipe.name,
         servings: 1
      };

      updateWeeklyPlan(newPlanItem);
      alert(`"${recipe.name}" ajouté au ${mealType === 'breakfast' ? 'petit-déjeuner' : mealType === 'lunch' ? 'déjeuner' : 'dîner'} du ${day}`);
   };

   if (recipesLoading) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
               <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement des recettes...</p>
               </div>
            </div>
         </div>
      );
   }

   if (recipesError) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
               <div className="text-center">
                  <p className="text-red-600">Erreur lors du chargement des recettes: {recipesError.message}</p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
         <div className="max-w-6xl mx-auto">
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-800 mb-2">Découvrir les recettes</h1>
               <p className="text-gray-600">
                  Explorez notre collection de {recipes?.length || 0} recettes avec des filtres personnalisés
               </p>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
               <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtres</h2>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Filtre Catégorie */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                     <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                     >
                        {categories.map(category => (
                           <option key={category.id} value={category.id}>
                              {category.emoji} {category.label}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Filtre Saison */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Saison</label>
                     <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                     >
                        {seasons.map(season => (
                           <option key={season.id} value={season.id}>
                              {season.emoji} {season.label}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Filtre Protéine */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Type de protéine</label>
                     <select
                        value={selectedProtein}
                        onChange={(e) => setSelectedProtein(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                     >
                        {proteins.map(protein => (
                           <option key={protein.id} value={protein.id}>
                              {protein.emoji} {protein.label}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className="mt-4 text-sm text-gray-600">
                  {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''} trouvée{filteredRecipes.length > 1 ? 's' : ''}
               </div>
            </div>

            {/* Grille des recettes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                     {recipe.image && (
                        <img
                           src={recipe.image}
                           alt={recipe.name}
                           className="w-full h-48 object-cover"
                        />
                     )}

                     <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{recipe.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>

                        <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                           <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {recipe.prepTime} min
                           </span>
                           <span className="capitalize">
                              {recipe.difficulty === 'easy' ? '🟢 Facile' :
                                 recipe.difficulty === 'medium' ? '🟡 Moyen' : '🔴 Difficile'}
                           </span>
                        </div>

                        <div className="flex flex-col space-y-2">
                           <button
                              onClick={() => addSelectedRecipe(recipe)}
                              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200"
                           >
                              ⭐ Ajouter aux favoris
                           </button>

                           <div className="flex space-x-1">
                              <button
                                 onClick={() => addToPlanning(recipe, 'monday', 'lunch')}
                                 className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700 transition-colors duration-200"
                              >
                                 + Déjeuner
                              </button>
                              <button
                                 onClick={() => addToPlanning(recipe, 'monday', 'dinner')}
                                 className="flex-1 bg-purple-600 text-white py-1 px-2 rounded text-xs hover:bg-purple-700 transition-colors duration-200"
                              >
                                 + Dîner
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {filteredRecipes.length === 0 && (
               <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Aucune recette ne correspond à vos filtres</p>
                  <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
               </div>
            )}
         </div>
      </div>
   );
};

export default Discover;
