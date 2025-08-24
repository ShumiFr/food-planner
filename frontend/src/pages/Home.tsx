import React, { useMemo, useCallback } from 'react';
import { useAppContext } from '../context/AppProviderApi';
import type { Recipe } from '../types/types';

interface HomeProps {
  onNavigate?: (page: string, data?: unknown) => void;
}

export default function Home({ onNavigate }: HomeProps): React.ReactElement {
  const {
    ingredients,
    recipes,
    selectedRecipes,
    addSelectedRecipe,
    removeSelectedRecipe,
    recipesLoading,
    recipesError,
    refreshRecipes
  } = useAppContext();

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

  // Filtrer les recettes selon les ingrédients disponibles (seulement celles avec des correspondances)
  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];

    // Ne montrer que les recettes qui ont des correspondances avec le garde-manger
    return recipes
      .map(recipe => ({
        ...recipe,
        matchPercentage: getRecipeMatchPercentage(recipe)
      }))
      .filter(recipe => recipe.matchPercentage > 0) // Seulement les recettes avec correspondances
      .sort((a, b) => b.matchPercentage - a.matchPercentage); // Trier par pourcentage décroissant
  }, [recipes, getRecipeMatchPercentage]);

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

  // Message d'état selon les ingrédients
  const getStatusMessage = () => {
    if (ingredients.length === 0) {
      return {
        title: "Garde-manger vide",
        message: "Ajoutez des ingrédients à votre garde-manger pour découvrir des recettes personnalisées !",
        action: "Aller au garde-manger"
      };
    }

    if (!ingredients.some(ing => ing.quantity > 0)) {
      return {
        title: "Aucun ingrédient disponible",
        message: "Tous vos ingrédients sont épuisés. Mettez à jour les quantités pour voir des recettes !",
        action: "Aller au garde-manger"
      };
    }

    if (filteredRecipes.length === 0) {
      return {
        title: "Aucune recette trouvée",
        message: "Aucune recette ne correspond à vos ingrédients actuels.",
        action: "Découvrir toutes les recettes"
      };
    }

    return null;
  };

  const statusMessage = getStatusMessage();

  if (recipesLoading) {
    return (
      <div style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h3 style={{ color: '#007bff', marginBottom: '0.5rem', textAlign: 'center' }}>
          Chargement de vos recettes personnalisées...
        </h3>
        <p style={{ color: '#6c757d', textAlign: 'center', maxWidth: '500px', lineHeight: '1.5' }}>
          Optimisation en cours - Les recettes sont mises en cache pour un chargement plus rapide lors des prochaines visites.
        </p>
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          color: '#1565c0',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          💡 Premier chargement : 10-15s • Suivants : instantané grâce au cache
        </div>
      </div>
    );
  }

  if (recipesError) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#dc3545'
      }}>
        <h2>Erreur de chargement</h2>
        <p>{recipesError.message}</p>
        <button
          onClick={refreshRecipes}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          🏠 Vos Recettes Personnalisées
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#666',
          marginBottom: '1rem'
        }}>
          Basées sur les ingrédients de votre garde-manger
        </p>

        {filteredRecipes.length > 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: '#e3f2fd',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            fontSize: '0.9rem'
          }}>
            <span>📊 {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''} trouvée{filteredRecipes.length > 1 ? 's' : ''}</span>
            <span>•</span>
            <span>🥘 {ingredients.filter(i => i.quantity > 0).length} ingrédient{ingredients.filter(i => i.quantity > 0).length > 1 ? 's' : ''} disponible{ingredients.filter(i => i.quantity > 0).length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Message d'état si pas de recettes */}
      {statusMessage && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {ingredients.length === 0 ? '🛒' : filteredRecipes.length === 0 ? '🔍' : '📭'}
          </div>
          <h2 style={{ marginBottom: '1rem', color: '#495057' }}>{statusMessage.title}</h2>
          <p style={{
            marginBottom: '2rem',
            color: '#6c757d',
            maxWidth: '500px',
            margin: '0 auto 2rem auto'
          }}>
            {statusMessage.message}
          </p>
          <button
            onClick={() => onNavigate?.(statusMessage.action.includes('garde-manger') ? 'pantry' : 'discover')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {statusMessage.action}
          </button>
        </div>
      )}

      {/* Grille des recettes */}
      {filteredRecipes.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {filteredRecipes.map((recipe) => {
            const matchPercentage = recipe.matchPercentage || 0;
            const selected = isSelected(recipe);

            return (
              <div
                key={recipe.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: selected
                    ? '0 8px 25px rgba(0, 123, 255, 0.3)'
                    : '0 4px 15px rgba(0, 0, 0, 0.1)',
                  border: selected ? '2px solid #007bff' : '1px solid #e9ecef',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => onNavigate?.('recipe-detail', { recipeId: recipe.id })}
              >
                {/* Badge de correspondance */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: matchPercentage >= 70 ? '#28a745' :
                    matchPercentage >= 40 ? '#ffc107' : '#dc3545',
                  color: matchPercentage >= 40 ? 'white' : 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {matchPercentage}% match
                </div>

                {/* Image */}
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}
                  />
                )}

                {/* Contenu */}
                <div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    marginBottom: '0.5rem',
                    color: selected ? '#007bff' : '#212529',
                    fontWeight: '600'
                  }}>
                    {selected ? '⭐ ' : ''}{recipe.name}
                  </h3>

                  <p style={{
                    color: '#6c757d',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {recipe.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    color: '#6c757d'
                  }}>
                    <span>⏱️ {recipe.prepTime} min</span>
                    <span>👥 {recipe.coversCount || 2} personnes</span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {recipe.difficulty === 'easy' ? '🟢 Facile' :
                        recipe.difficulty === 'medium' ? '🟡 Moyen' : '🔴 Difficile'}
                    </span>
                  </div>

                  {/* Ingrédients correspondants */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      color: '#495057'
                    }}>
                      Ingrédients que vous avez :
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.25rem'
                    }}>
                      {recipe.ingredients.slice(0, 6).map((ingredient, index) => {
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
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.75rem',
                              borderRadius: '12px',
                              backgroundColor: hasIngredient ? '#d4edda' : '#f8d7da',
                              color: hasIngredient ? '#155724' : '#721c24',
                              border: hasIngredient ? '1px solid #c3e6cb' : '1px solid #f1b0b7'
                            }}
                          >
                            {hasIngredient ? '✓' : '✗'} {ingredient}
                          </span>
                        );
                      })}
                      {recipe.ingredients.length > 6 && (
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.75rem',
                          color: '#6c757d'
                        }}>
                          +{recipe.ingredients.length - 6} autres
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bouton d'action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher la propagation vers le div parent
                      handleRecipeToggle(recipe);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginTop: '1rem',
                      backgroundColor: selected ? '#dc3545' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {selected ? '❌ Retirer' : '➕ Ajouter'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
