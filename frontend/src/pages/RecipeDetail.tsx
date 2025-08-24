import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppProviderApi';
import type { Recipe } from '../types/types';

interface RecipeDetailProps {
   recipeId: string;
   onNavigate?: (page: string, data?: unknown) => void;
}

export default function RecipeDetail({ recipeId, onNavigate }: RecipeDetailProps): React.ReactElement {
   const {
      recipes,
      selectedRecipes,
      addSelectedRecipe,
      removeSelectedRecipe,
      ingredients,
      recipesLoading,
      recipesError
   } = useAppContext();

   const [recipe, setRecipe] = useState<Recipe | null>(null);

   useEffect(() => {
      // Trouver la recette dans la liste des recettes
      if (recipes && recipeId) {
         const foundRecipe = recipes.find(r => r.id === recipeId);
         setRecipe(foundRecipe || null);
      }
   }, [recipes, recipeId]);

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

   // Calculer le pourcentage d'ingrédients possédés
   const getRecipeMatchPercentage = (recipe: Recipe) => {
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
   };

   if (recipesLoading) {
      return (
         <div style={{
            minHeight: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem'
         }}>
            <div className="loading-spinner"></div>
            <p>Chargement de la recette...</p>
         </div>
      );
   }

   if (recipesError) {
      return (
         <div style={{
            minHeight: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            textAlign: 'center',
            padding: '2rem'
         }}>
            <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>
               Erreur lors du chargement
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
               {recipesError?.message || 'Une erreur est survenue'}
            </p>
            <button
               onClick={() => onNavigate?.('home')}
               style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
               }}
            >
               Retour à l'accueil
            </button>
         </div>
      );
   }

   if (!recipe) {
      return (
         <div style={{
            minHeight: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            textAlign: 'center',
            padding: '2rem'
         }}>
            <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>
               Recette introuvable
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
               La recette demandée n'a pas pu être trouvée.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button
                  onClick={() => onNavigate?.('home')}
                  style={{
                     padding: '0.75rem 1.5rem',
                     backgroundColor: '#6c757d',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     cursor: 'pointer'
                  }}
               >
                  Retour à l'accueil
               </button>
               <button
                  onClick={() => onNavigate?.('discover')}
                  style={{
                     padding: '0.75rem 1.5rem',
                     backgroundColor: '#007bff',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     cursor: 'pointer'
                  }}
               >
                  Découvrir les recettes
               </button>
            </div>
         </div>
      );
   }

   const matchPercentage = getRecipeMatchPercentage(recipe);

   return (
      <div style={{
         padding: '2rem',
         maxWidth: '800px',
         margin: '0 auto',
         minHeight: '100vh'
      }}>
         {/* Bouton retour */}
         <button
            onClick={() => onNavigate?.('home')}
            style={{
               display: 'flex',
               alignItems: 'center',
               gap: '0.5rem',
               padding: '0.5rem 1rem',
               backgroundColor: 'transparent',
               border: '1px solid #dee2e6',
               borderRadius: '8px',
               cursor: 'pointer',
               marginBottom: '2rem',
               color: '#495057'
            }}
         >
            ← Retour
         </button>

         {/* En-tête de la recette */}
         <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
         }}>
            {recipe.image && (
               <div style={{
                  width: '100%',
                  height: '300px',
                  overflow: 'hidden'
               }}>
                  <img
                     src={recipe.image}
                     alt={recipe.name}
                     style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                     }}
                  />
               </div>
            )}

            <div style={{ padding: '2rem' }}>
               <h1 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#212529',
                  marginBottom: '1rem'
               }}>
                  {recipe.name}
               </h1>

               <p style={{
                  fontSize: '1.1rem',
                  color: '#6c757d',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
               }}>
                  {recipe.description}
               </p>

               {/* Informations pratiques */}
               <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem'
               }}>
                  <div style={{
                     padding: '1rem',
                     backgroundColor: '#f8f9fa',
                     borderRadius: '8px',
                     textAlign: 'center'
                  }}>
                     <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏱️</div>
                     <div style={{ fontWeight: '600', color: '#495057' }}>Temps total</div>
                     <div style={{ color: '#6c757d' }}>{(recipe.cookingTime || 0) + recipe.prepTime} min</div>
                  </div>

                  <div style={{
                     padding: '1rem',
                     backgroundColor: '#f8f9fa',
                     borderRadius: '8px',
                     textAlign: 'center'
                  }}>
                     <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
                     <div style={{ fontWeight: '600', color: '#495057' }}>Portions</div>
                     <div style={{ color: '#6c757d' }}>{recipe.coversCount || 2} personnes</div>
                  </div>

                  <div style={{
                     padding: '1rem',
                     backgroundColor: '#f8f9fa',
                     borderRadius: '8px',
                     textAlign: 'center'
                  }}>
                     <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
                     <div style={{ fontWeight: '600', color: '#495057' }}>Difficulté</div>
                     <div style={{ color: '#6c757d', textTransform: 'capitalize' }}>
                        {recipe.difficulty === 'easy' ? 'Facile' :
                           recipe.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                     </div>
                  </div>

                  {matchPercentage > 0 && (
                     <div style={{
                        padding: '1rem',
                        backgroundColor: matchPercentage >= 70 ? '#d4edda' : matchPercentage >= 40 ? '#fff3cd' : '#f8d7da',
                        borderRadius: '8px',
                        textAlign: 'center'
                     }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
                        <div style={{ fontWeight: '600', color: '#495057' }}>Compatibilité</div>
                        <div style={{ color: '#6c757d' }}>{matchPercentage}%</div>
                     </div>
                  )}
               </div>

               {/* Bouton d'action principal */}
               <button
                  onClick={() => handleRecipeToggle(recipe)}
                  style={{
                     width: '100%',
                     padding: '1rem 2rem',
                     fontSize: '1.1rem',
                     fontWeight: '600',
                     backgroundColor: isSelected(recipe) ? '#dc3545' : '#28a745',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     cursor: 'pointer',
                     marginBottom: '1rem',
                     transition: 'all 0.2s ease'
                  }}
               >
                  {isSelected(recipe) ? '❌ Retirer de mes recettes' : '➕ Ajouter à mes recettes'}
               </button>
            </div>
         </div>

         {/* Ingrédients */}
         <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '2rem',
            marginBottom: '2rem'
         }}>
            <h2 style={{
               fontSize: '1.5rem',
               fontWeight: '600',
               color: '#212529',
               marginBottom: '1.5rem',
               display: 'flex',
               alignItems: 'center',
               gap: '0.5rem'
            }}>
               🛒 Ingrédients ({recipe.ingredients.length})
            </h2>

            <div style={{
               display: 'grid',
               gap: '0.75rem'
            }}>
               {recipe.ingredients.map((ingredient, index) => {
                  const hasIngredient = ingredients.some(pantryIngredient =>
                     pantryIngredient.quantity > 0 && (
                        pantryIngredient.name.toLowerCase().includes(ingredient.toLowerCase()) ||
                        ingredient.toLowerCase().includes(pantryIngredient.name.toLowerCase())
                     )
                  );

                  return (
                     <div
                        key={index}
                        style={{
                           display: 'flex',
                           alignItems: 'center',
                           gap: '1rem',
                           padding: '0.75rem 1rem',
                           backgroundColor: hasIngredient ? '#d4edda' : '#fff',
                           border: hasIngredient ? '2px solid #c3e6cb' : '1px solid #dee2e6',
                           borderRadius: '8px',
                           transition: 'all 0.2s ease'
                        }}
                     >
                        <div style={{
                           fontSize: '1.2rem',
                           color: hasIngredient ? '#155724' : '#dc3545'
                        }}>
                           {hasIngredient ? '✅' : '❌'}
                        </div>
                        <div style={{
                           flex: 1,
                           fontSize: '1rem',
                           color: hasIngredient ? '#155724' : '#495057',
                           fontWeight: hasIngredient ? '500' : '400'
                        }}>
                           {ingredient}
                        </div>
                        {hasIngredient && (
                           <div style={{
                              fontSize: '0.8rem',
                              color: '#155724',
                              backgroundColor: '#c3e6cb',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '12px',
                              fontWeight: '500'
                           }}>
                              Disponible
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>

            {matchPercentage < 100 && (
               <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#e2e3e5',
                  borderRadius: '8px',
                  textAlign: 'center'
               }}>
                  <p style={{ color: '#495057', marginBottom: '1rem' }}>
                     Il vous manque {recipe.ingredients.length - Math.floor(recipe.ingredients.length * matchPercentage / 100)} ingrédients
                  </p>
                  <button
                     onClick={() => onNavigate?.('pantry')}
                     style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                     }}
                  >
                     Gérer mon garde-manger
                  </button>
               </div>
            )}
         </div>

         {/* Instructions */}
         <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '2rem'
         }}>
            <h2 style={{
               fontSize: '1.5rem',
               fontWeight: '600',
               color: '#212529',
               marginBottom: '1.5rem',
               display: 'flex',
               alignItems: 'center',
               gap: '0.5rem'
            }}>
               📋 Instructions
            </h2>

            <div style={{
               padding: '1.5rem',
               backgroundColor: '#f8f9fa',
               borderRadius: '8px',
               border: '1px solid #e9ecef'
            }}>
               <p style={{
                  color: '#495057',
                  lineHeight: '1.6',
                  fontSize: '1rem'
               }}>
                  {recipe.instructions}
               </p>
            </div>
         </div>
      </div>
   );
}
