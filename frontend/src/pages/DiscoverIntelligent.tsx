import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../context/AppProviderApi';
import type { Recipe } from '../types/types';

interface DiscoverIntelligentProps {
   onNavigate?: (page: string, data?: unknown) => void;
}

const DiscoverIntelligent: React.FC<DiscoverIntelligentProps> = ({ onNavigate }) => {
   const {
      setSearchQuery,
      refreshRecipes,
      recipesLoading,
      recipesError,
      recipes,
      ingredients,
      selectedRecipes,
      addSelectedRecipe,
      removeSelectedRecipe
   } = useAppContext();

   const [selectedCategory, setSelectedCategory] = useState<string>('');
   const [isLoadingCategory, setIsLoadingCategory] = useState(false);
   const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('');
   const [showResults, setShowResults] = useState(false);

   // Obtenir le mois actuel pour les suggestions saisonnières
   const getCurrentMonth = () => new Date().getMonth() + 1; // 1-12
   const currentMonth = getCurrentMonth();

   // Définir les saisons selon le mois
   const getCurrentSeason = () => {
      if (currentMonth >= 3 && currentMonth <= 5) return 'printemps';
      if (currentMonth >= 6 && currentMonth <= 8) return 'été';
      if (currentMonth >= 9 && currentMonth <= 11) return 'automne';
      return 'hiver';
   };

   const currentSeason = getCurrentSeason();

   // Ingrédients par catégorie pour une recherche intelligente
   const ingredientCategories = useMemo(() => ({
      // Fruits et légumes de saison selon les données de fruits-legumes.org
      printemps: [
         'asperge', 'artichaut', 'petits pois', 'radis', 'épinards', 'laitue', 'ail',
         'bette', 'carotte', 'chou', 'fenouil', 'rhubarbe', 'avocat', 'banane',
         'citron', 'kiwi', 'mangue', 'fraise', 'papaye'
      ],
      été: [
         'tomate', 'courgette', 'aubergine', 'poivron', 'concombre', 'basilic',
         'brocoli', 'haricot', 'maïs', 'pâtisson', 'pomme de terre', 'abricot',
         'cerise', 'framboise', 'groseille', 'melon', 'nectarine', 'pêche',
         'pastèque', 'mirabelle', 'myrtille', 'mûre', 'cassis'
      ],
      automne: [
         'potiron', 'champignon', 'châtaigne', 'courge', 'brocoli', 'chou-fleur',
         'céleri', 'betterave', 'panais', 'poireau', 'citrouille', 'amande',
         'figue', 'noix', 'noisette', 'poire', 'pomme', 'prune', 'quetsche',
         'raisin', 'coing', 'marron'
      ],
      hiver: [
         'poireau', 'chou', 'navet', 'carotte', 'endive', 'pomme de terre',
         'topinambour', 'salsifis', 'mâche', 'cresson', 'ananas', 'clémentine',
         'orange', 'mandarine', 'pamplemousse', 'kaki', 'grenade', 'datte',
         'litchi'
      ],
      // Protéines avec toutes leurs variantes
      boeuf: [
         'bœuf', 'boeuf', 'steak', 'entrecôte', 'filet de bœuf', 'rôti de bœuf',
         'bavette', 'rumsteck', 'côte de bœuf', 'bœuf bourguignon', 'tartare',
         'carpaccio', 'bœuf braisé', 'pot-au-feu', 'blanquette de veau'
      ],
      poulet: [
         'poulet', 'poule', 'volaille', 'blanc de poulet', 'cuisse de poulet',
         'aile de poulet', 'escalope de poulet', 'nuggets', 'cordon bleu',
         'poulet rôti', 'coq au vin', 'fricassée de poulet', 'dinde', 'canard'
      ],
      porc: [
         'porc', 'jambon', 'lardons', 'bacon', 'saucisse', 'saucisson',
         'boudin', 'côte de porc', 'filet de porc', 'échine de porc',
         'poitrine de porc', 'rôti de porc', 'chorizo', 'pancetta',
         'prosciutto', 'coppa', 'andouille', 'merguez'
      ],
      poisson: [
         'poisson', 'saumon', 'thon', 'cabillaud', 'morue', 'sole', 'turbot',
         'bar', 'dorade', 'truite', 'sardine', 'maquereau', 'anchois',
         'crevette', 'gambas', 'homard', 'crabe', 'moules', 'huîtres',
         'coquilles Saint-Jacques', 'calamars', 'poulpe', 'seiche'
      ],
      oeuf: [
         'œuf', 'oeuf', 'œufs', 'oeufs', 'omelette', 'œuf à la coque',
         'œuf dur', 'œuf mollet', 'œuf poché', 'œuf brouillé',
         'œuf au plat', 'quiche', 'soufflé'
      ]
   }), []);

   // Calculer le pourcentage d'ingrédients possédés pour chaque recette
   const getRecipeMatchPercentage = useCallback((recipe: Recipe) => {
      if (recipe.ingredients.length === 0) return 0;

      let matchCount = 0;
      recipe.ingredients.forEach(recipeIngredient => {
         const hasIngredient = ingredients.some(pantryIngredient =>
            pantryIngredient.quantity > 0 && (
               pantryIngredient.name.toLowerCase().includes(recipeIngredient.toLowerCase()) ||
               recipeIngredient.toLowerCase().includes(pantryIngredient.name.toLowerCase())
            )
         );
         if (hasIngredient) matchCount++;
      });

      return Math.round((matchCount / recipe.ingredients.length) * 100);
   }, [ingredients]);

   // Filtrer et trier les recettes pour les résultats de recherche
   const searchResults = useMemo(() => {
      if (!recipes || !showResults) return [];

      const filteredRecipes = recipes
         .map(recipe => ({
            ...recipe,
            matchPercentage: getRecipeMatchPercentage(recipe)
         }))
         .filter(recipe => {
            // Si on a une catégorie d'ingrédients spécifique, filtrer plus précisément
            if (selectedCategory && ingredientCategories[selectedCategory as keyof typeof ingredientCategories]) {
               const categoryIngredients = ingredientCategories[selectedCategory as keyof typeof ingredientCategories];
               
               // Vérifier si la recette contient au moins un ingrédient de la catégorie
               const hasRelevantIngredient = recipe.ingredients.some(ingredient =>
                  categoryIngredients.some(catIngredient =>
                     ingredient.toLowerCase().includes(catIngredient.toLowerCase()) ||
                     catIngredient.toLowerCase().includes(ingredient.toLowerCase())
                  )
               );

               // Vérifier aussi dans le nom et la description
               const nameMatch = categoryIngredients.some(catIngredient =>
                  recipe.name.toLowerCase().includes(catIngredient.toLowerCase())
               );

               const descMatch = categoryIngredients.some(catIngredient =>
                  recipe.description?.toLowerCase().includes(catIngredient.toLowerCase())
               );

               return hasRelevantIngredient || nameMatch || descMatch;
            }
            
            return true; // Pour les autres recherches, garder tous les résultats
         })
         .sort((a, b) => b.matchPercentage - a.matchPercentage); // Trier par pourcentage de correspondance décroissant

      return filteredRecipes;
   }, [recipes, showResults, getRecipeMatchPercentage, selectedCategory, ingredientCategories]);

   const isSelected = (recipe: Recipe) => {
      return selectedRecipes.some(selected => selected.id === recipe.id);
   };

   const handleRecipeToggle = (recipe: Recipe) => {
      if (isSelected(recipe)) {
         removeSelectedRecipe(recipe.id);
      } else {
         addSelectedRecipe(recipe);
      }
   };

   // Légumes de saison par période pour l'affichage
   const seasonalVegetables = {
      printemps: [
         { name: 'asperge', emoji: '🌱' },
         { name: 'artichaut', emoji: '🌿' },
         { name: 'petits pois', emoji: '🟢' },
         { name: 'radis', emoji: '🔴' },
         { name: 'épinards', emoji: '🥬' },
         { name: 'laitue', emoji: '🥗' }
      ],
      été: [
         { name: 'tomate', emoji: '🍅' },
         { name: 'courgette', emoji: '🥒' },
         { name: 'aubergine', emoji: '🍆' },
         { name: 'poivron', emoji: '🌶️' },
         { name: 'concombre', emoji: '🥒' },
         { name: 'basilic', emoji: '🌿' }
      ],
      automne: [
         { name: 'potiron', emoji: '🎃' },
         { name: 'champignon', emoji: '🍄' },
         { name: 'châtaigne', emoji: '🌰' },
         { name: 'courge', emoji: '🧡' },
         { name: 'brocoli', emoji: '🥦' },
         { name: 'chou-fleur', emoji: '🤍' }
      ],
      hiver: [
         { name: 'poireau', emoji: '🥬' },
         { name: 'chou', emoji: '🥬' },
         { name: 'navet', emoji: '🤍' },
         { name: 'carotte', emoji: '🥕' },
         { name: 'endive', emoji: '🤍' },
         { name: 'pomme de terre', emoji: '🥔' }
      ]
   };

   // Sections de recherche
   const searchSections = {
      seasons: {
         title: "🌿 Recettes par Saison",
         subtitle: "Découvrez les saveurs de chaque saison",
         items: [
            { id: 'printemps', label: 'Printemps', emoji: '🌸', color: '#ff9ff3' },
            { id: 'été', label: 'Été', emoji: '☀️', color: '#ffd93d' },
            { id: 'automne', label: 'Automne', emoji: '🍂', color: '#ff6b35' },
            { id: 'hiver', label: 'Hiver', emoji: '❄️', color: '#74b9ff' }
         ]
      },
      proteins: {
         title: "🍖 Recettes par Protéine",
         subtitle: "Choisissez votre source de protéine préférée",
         items: [
            { id: 'boeuf', label: 'Bœuf', emoji: '🥩', color: '#d63031' },
            { id: 'poulet', label: 'Poulet', emoji: '🐔', color: '#fdcb6e' },
            { id: 'porc', label: 'Porc', emoji: '🐷', color: '#fab1a0' },
            { id: 'poisson', label: 'Poisson', emoji: '🐟', color: '#74b9ff' },
            { id: 'oeuf', label: 'Œufs', emoji: '🥚', color: '#ffeaa7' },
            { id: 'sans viande', label: 'Sans viande', emoji: '🥬', color: '#00b894' }
         ]
      },
      seasonal: {
         title: `🥕 Légumes de ${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}`,
         subtitle: `Les légumes frais de saison pour ${currentSeason}`,
         items: seasonalVegetables[currentSeason as keyof typeof seasonalVegetables]
      }
   };

   // Fonction pour rechercher des recettes de façon intelligente
   const searchRecipes = async (query: string, categoryName: string) => {
      setSelectedCategory(categoryName);
      setIsLoadingCategory(true);
      setCurrentSearchQuery(query);

      try {
         // Construire une recherche intelligente selon la catégorie
         let searchTerms: string[] = [];
         
         // Si c'est une catégorie d'ingrédients, utiliser la liste complète
         if (ingredientCategories[query as keyof typeof ingredientCategories]) {
            searchTerms = ingredientCategories[query as keyof typeof ingredientCategories];
         } else {
            // Sinon, utiliser le terme simple
            searchTerms = [query];
         }

         // Pour les recherches par catégorie, prendre les 10 premiers termes les plus importants
         // pour éviter une recherche trop lourde
         if (searchTerms.length > 10) {
            searchTerms = searchTerms.slice(0, 10);
         }

         // Créer une requête de recherche qui combine les termes principaux
         const intelligentQuery = searchTerms.join(' ');
         
         console.log(`Recherche intelligente pour ${categoryName}:`, intelligentQuery);
         
         // Utiliser le système de recherche existant avec la requête intelligente
         setSearchQuery(intelligentQuery);

         // Simuler un délai pour l'UX
         await new Promise(resolve => setTimeout(resolve, 1500));

         // Afficher les résultats dans cette page
         setShowResults(true);

      } catch (error) {
         console.error('Erreur lors de la recherche:', error);
      } finally {
         setIsLoadingCategory(false);
      }
   };

   // Fonction pour revenir aux catégories
   const backToCategories = () => {
      setShowResults(false);
      setCurrentSearchQuery('');
      setSelectedCategory('');
      setSearchQuery(''); // Effacer la recherche
   };

   if (recipesLoading || isLoadingCategory) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
               <div className="text-center" style={{ paddingTop: '3rem' }}>
                  <div style={{
                     width: '60px',
                     height: '60px',
                     border: '6px solid #f3f3f3',
                     borderTop: '6px solid #10b981',
                     borderRadius: '50%',
                     animation: 'spin 1s linear infinite',
                     margin: '0 auto 1.5rem'
                  }}></div>
                  <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>
                     {selectedCategory ? `Recherche des recettes ${selectedCategory}...` : 'Chargement des recettes...'}
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                     Filtrage intelligent en cours...
                  </p>
                  {!selectedCategory && (
                     <div style={{
                        display: 'inline-block',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#ecfdf5',
                        borderRadius: '8px',
                        color: '#047857',
                        fontSize: '0.9rem'
                     }}>
                        🚀 Optimisé avec cache - Chargement plus rapide !
                     </div>
                  )}
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
                  <p className="error-message">Erreur: {recipesError.message}</p>
                  <button
                     onClick={refreshRecipes}
                     className="retry-button"
                  >
                     Réessayer
                  </button>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
         <div className="max-w-6xl mx-auto discover-container">
            {showResults ? (
               // Section des résultats de recherche
               <>
                  {/* En-tête des résultats */}
                  <div className="text-center mb-8">
                     <button
                        onClick={backToCategories}
                        className="back-button"
                     >
                        <span>←</span>
                        <span>Retour aux catégories</span>
                     </button>

                     <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        🔍 Résultats pour "{currentSearchQuery}"
                     </h1>
                     <p className="text-xl text-gray-600">
                        {searchResults.length} recette{searchResults.length > 1 ? 's' : ''} trouvée{searchResults.length > 1 ? 's' : ''}
                     </p>
                  </div>

                  {/* Liste des recettes */}
                  {searchResults.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 results-grid">
                        {searchResults.map((recipe) => (
                           <div 
                              key={recipe.id} 
                              className="result-card"
                              onClick={() => onNavigate?.('recipe-detail', { recipeId: recipe.id })}
                              style={{
                                 cursor: 'pointer',
                                 transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = 'translateY(-2px)';
                                 e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                              }}
                              onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = 'translateY(0)';
                                 e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                              }}
                           >
                              {/* Image de la recette */}
                              <div className="image-container">
                                 {recipe.image ? (
                                    <img
                                       src={recipe.image}
                                       alt={recipe.name}
                                       style={{
                                          width: '100%',
                                          height: '240px',
                                          objectFit: 'cover',
                                          borderRadius: '12px'
                                       }}
                                       onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                       }}
                                    />
                                 ) : (
                                    <div 
                                       className="placeholder-emoji"
                                       style={{
                                          width: '100%',
                                          height: '240px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          backgroundColor: '#f8f9fa',
                                          borderRadius: '12px',
                                          fontSize: '3rem'
                                       }}
                                    >
                                       🍽️
                                    </div>
                                 )}

                                 {/* Badge de correspondance */}
                                 <div className={`match-badge ${recipe.matchPercentage >= 75 ? 'bg-green-500 text-white' :
                                       recipe.matchPercentage >= 50 ? 'bg-yellow-500 text-white' :
                                          recipe.matchPercentage >= 25 ? 'bg-orange-500 text-white' :
                                             'bg-red-500 text-white'
                                    }`}>
                                    {recipe.matchPercentage}%
                                 </div>
                              </div>

                              {/* Contenu de la carte */}
                              <div className="content">
                                 <h3 className="title">{recipe.name}</h3>

                                 <p className="description">
                                    {recipe.description || 'Délicieuse recette à découvrir'}
                                 </p>

                                 {/* Liste des ingrédients */}
                                 <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{
                                       fontSize: '0.85rem',
                                       fontWeight: '600',
                                       marginBottom: '0.75rem',
                                       color: '#495057'
                                    }}>
                                       Ingrédients que vous avez :
                                    </div>
                                    <div style={{
                                       display: 'flex',
                                       flexWrap: 'wrap',
                                       gap: '0.35rem'
                                    }}>
                                       {recipe.ingredients.slice(0, 8).map((ingredient, index) => {
                                          const hasIngredient = ingredients.some(pantryIngredient =>
                                             pantryIngredient.quantity > 0 && (
                                                pantryIngredient.name.toLowerCase().includes(ingredient.toLowerCase()) ||
                                                ingredient.toLowerCase().includes(pantryIngredient.name.toLowerCase())
                                             )
                                          );

                                          return (
                                             <span
                                                key={index}
                                                style={{
                                                   padding: '0.25rem 0.6rem',
                                                   fontSize: '0.75rem',
                                                   borderRadius: '15px',
                                                   backgroundColor: hasIngredient ? '#d1f2eb' : '#fadbd8',
                                                   color: hasIngredient ? '#0d5345' : '#922b21',
                                                   border: hasIngredient ? '1px solid #a9dfbf' : '1px solid #f1948a',
                                                   whiteSpace: 'nowrap',
                                                   fontWeight: '500'
                                                }}
                                             >
                                                {hasIngredient ? '✓' : '✗'} {ingredient}
                                             </span>
                                          );
                                       })}
                                       {recipe.ingredients.length > 8 && (
                                          <span style={{
                                             padding: '0.25rem 0.6rem',
                                             fontSize: '0.75rem',
                                             color: '#6c757d',
                                             fontStyle: 'italic',
                                             backgroundColor: '#f8f9fa',
                                             borderRadius: '15px',
                                             border: '1px solid #e9ecef'
                                          }}>
                                             +{recipe.ingredients.length - 8} autres...
                                          </span>
                                       )}
                                    </div>
                                 </div>

                                 {/* Informations pratiques */}
                                 <div className="info-row">
                                    <span className="info-item">
                                       <span>⏱️</span>
                                       <span>{(recipe.cookingTime || 0) + recipe.prepTime}min</span>
                                    </span>
                                    <span className="info-item">
                                       <span>👥</span>
                                       <span>{recipe.coversCount || 2}p</span>
                                    </span>
                                    <span className="info-item">
                                       <span>📊</span>
                                       <span>{recipe.difficulty === 'easy' ? 'facile' : recipe.difficulty === 'medium' ? 'moyen' : 'difficile'}</span>
                                    </span>
                                 </div>

                                 {/* Bouton d'action */}
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation(); // Empêcher la propagation vers le div parent
                                       handleRecipeToggle(recipe);
                                    }}
                                    className={`action-button ${isSelected(recipe) ? 'selected' : 'unselected'
                                       }`}
                                 >
                                    {isSelected(recipe) ? '❌ Retirer' : '➕ Ajouter'}
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="empty-state">
                        <div className="empty-emoji">😔</div>
                        <h3>Aucune recette trouvée</h3>
                        <p>Aucune recette ne correspond à votre recherche "{currentSearchQuery}".</p>
                        <button
                           onClick={backToCategories}
                           className="try-again-button"
                        >
                           Essayer une autre catégorie
                        </button>
                     </div>
                  )}
               </>
            ) : (
               // Section des catégories (code existant)
               <>
                  {/* En-tête */}
                  <div className="text-center mb-12">
                     <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        🔍 Découvrir des Recettes Intelligentes
                     </h1>
                     <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Explorez notre collection de recettes avec une recherche intelligente par saison et ingrédients.
                        Nos filtres trouvent les recettes qui correspondent vraiment à vos critères !
                     </p>
                  </div>

                  {/* Section Saisons */}
                  <div className="mb-16">
                     <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                           {searchSections.seasons.title}
                        </h2>
                        <p className="text-gray-600">{searchSections.seasons.subtitle}</p>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {searchSections.seasons.items.map((season) => (
                           <button
                              key={season.id}
                              onClick={() => searchRecipes(season.id, season.label)}
                              className="category-button"
                              style={{
                                 background: `linear-gradient(135deg, ${season.color}DD, ${season.color}FF)`,
                              }}
                           >
                              <div className="overlay"></div>
                              <div className="content">
                                 <span className="emoji">{season.emoji}</span>
                                 <span className="label">{season.label}</span>
                              </div>
                              <div className="bottom-bar"></div>
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Section Protéines */}
                  <div className="mb-16">
                     <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                           {searchSections.proteins.title}
                        </h2>
                        <p className="text-gray-600">{searchSections.proteins.subtitle}</p>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {searchSections.proteins.items.map((protein) => (
                           <button
                              key={protein.id}
                              onClick={() => searchRecipes(protein.id, protein.label)}
                              className="protein-button"
                              style={{
                                 background: `linear-gradient(135deg, ${protein.color}DD, ${protein.color}FF)`,
                              }}
                           >
                              <div className="overlay"></div>
                              <div className="content">
                                 <span className="emoji">{protein.emoji}</span>
                                 <span className="label">{protein.label}</span>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Section Légumes de Saison */}
                  <div className="mb-16">
                     <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                           {searchSections.seasonal.title}
                        </h2>
                        <p className="text-gray-600">{searchSections.seasonal.subtitle}</p>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {searchSections.seasonal.items.map((vegetable, index) => (
                           <button
                              key={index}
                              onClick={() => searchRecipes(vegetable.name, vegetable.name)}
                              className="vegetable-button"
                           >
                              <div className="bg-overlay"></div>
                              <div className="content">
                                 <span className="emoji">{vegetable.emoji}</span>
                                 <span className="label">{vegetable.name}</span>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Message d'encouragement */}
                  <div className="encouragement-section">
                     <div className="chef-emoji">👨‍🍳</div>
                     <h3>Découverte Intelligente !</h3>
                     <p>
                        Nos filtres améliorés recherchent dans toutes les variantes d'ingrédients. 
                        Par exemple, "Porc" trouvera des recettes avec jambon, lardons, saucisse, etc.
                        "Printemps" trouvera des recettes avec asperges, petits pois, fraises, et tous les fruits et légumes de saison !
                     </p>
                  </div>
               </>
            )}
         </div>
      </div>
   );
};

export default DiscoverIntelligent;
