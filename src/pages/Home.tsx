import React, { useState } from 'react';
import { useAppContext } from '../context/AppProvider';
import type { Recipe } from '../types/types';

interface HomeProps {
  onNavigate?: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps): React.ReactElement {
  const { ingredients, recipes, selectedRecipes, addSelectedRecipe, removeSelectedRecipe } = useAppContext();
  const [activeTab, setActiveTab] = useState('all'); // 'all' ou 'priority'

  // Filtrer les ingrédients par priorité (expire dans les 7 prochains jours)
  const priorityIngredients = ingredients.filter(ingredient => {
    const expirationDate = new Date(ingredient.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  });

  // Calculer le pourcentage d'ingrédients possédés pour chaque recette
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

  // Filtrer et trier les recettes selon les ingrédients disponibles
  const availableRecipes = ingredients.length > 0 && ingredients.some(ing => ing.quantity > 0)
    ? recipes
        .map(recipe => ({
          ...recipe,
          matchPercentage: getRecipeMatchPercentage(recipe)
        }))
        .filter(recipe => recipe.matchPercentage > 0)
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
    : [];

  const handleToggleRecipe = (recipe: Recipe) => {
    const isSelected = selectedRecipes.some(r => r.id === recipe.id);
    if (isSelected) {
      removeSelectedRecipe(recipe.id);
    } else {
      addSelectedRecipe(recipe);
    }
  };

  const handleGoToPlanning = () => {
    if (onNavigate) {
      onNavigate('planning');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🍽️ Food Planner - Accueil</h1>

      {/* Résumé des recettes sélectionnées */}
      {selectedRecipes.length > 0 && (
        <div style={{
          backgroundColor: '#e7f3ff',
          border: '1px solid #bee5eb',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0c5460' }}>
            ✅ {selectedRecipes.length} recette(s) sélectionnée(s)
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {selectedRecipes.map(recipe => (
              <span key={recipe.id} style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.8rem'
              }}>
                {recipe.name}
              </span>
            ))}
          </div>
          <button
            onClick={handleGoToPlanning}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginTop: '1rem'
            }}
          >
            📅 Aller au Planning ({selectedRecipes.length} recettes)
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        {/* Section Recettes */}
        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Recettes suggérées</h2>
            {availableRecipes.length > 0 && (
              <div style={{ 
                backgroundColor: '#e7f3ff', 
                padding: '0.5rem 1rem', 
                borderRadius: '20px',
                fontSize: '0.9rem',
                color: '#0c5460'
              }}>
                {availableRecipes.length} recette(s) disponible(s)
              </div>
            )}
          </div>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            {ingredients.length > 0 && ingredients.some(ing => ing.quantity > 0)
              ? 'Basées sur vos ingrédients disponibles, triées par pourcentage de compatibilité'
              : 'Ajoutez des ingrédients à votre garde-manger pour découvrir des recettes personnalisées'
            }
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {availableRecipes.map(recipe => {
              const isSelected = selectedRecipes.some(r => r.id === recipe.id);
              const matchPercentage = recipe.matchPercentage;
              const getPercentageColor = (percentage: number) => {
                if (percentage >= 80) return '#28a745'; // Vert
                if (percentage >= 50) return '#ffc107'; // Jaune
                return '#dc3545'; // Rouge
              };
              
              return (
              <div key={recipe.id} style={{
                border: `2px solid ${isSelected ? '#28a745' : '#ddd'}`,
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: isSelected ? '#f8fff8' : '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{recipe.name}</h3>
                  <div style={{
                    backgroundColor: getPercentageColor(matchPercentage),
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {matchPercentage}%
                  </div>
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {recipe.description}
                </p>
                <p><strong>Temps de préparation:</strong> {recipe.prepTime} min</p>
                <p><strong>Difficulté:</strong> {recipe.difficulty}</p>
                <p><strong>Ingrédients ({recipe.ingredients.length}):</strong></p>
                <div style={{ fontSize: '0.8rem', marginBottom: '1rem', maxHeight: '100px', overflowY: 'auto' }}>
                  {recipe.ingredients.map((ingredient, index) => {
                    const hasIngredient = ingredients.some(pantryIngredient =>
                      pantryIngredient.quantity > 0 && (
                        pantryIngredient.name.toLowerCase().includes(ingredient.toLowerCase()) ||
                        ingredient.toLowerCase().includes(pantryIngredient.name.toLowerCase())
                      )
                    );
                    return (
                      <span key={index} style={{
                        color: hasIngredient ? '#28a745' : '#dc3545',
                        fontWeight: hasIngredient ? 'bold' : 'normal',
                        marginRight: '0.5rem'
                      }}>
                        {hasIngredient ? '✅' : '❌'} {ingredient}
                        {index < recipe.ingredients.length - 1 ? ', ' : ''}
                      </span>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleToggleRecipe(recipe)}
                    style={{
                      backgroundColor: isSelected ? '#dc3545' : '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    {isSelected ? '❌ Retirer' : '✅ Sélectionner'}
                  </button>
                  {selectedRecipes.length > 0 && (
                    <button
                      onClick={handleGoToPlanning}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      📅 Planning
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>

          {availableRecipes.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 2rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🥘</div>
              {ingredients.length === 0 || !ingredients.some(ing => ing.quantity > 0) ? (
                <>
                  <h3>Aucune recette suggérée</h3>
                  <p style={{ color: '#666', marginBottom: '1rem' }}>
                    Ajoutez des ingrédients avec une quantité supérieure à 0 dans votre garde-manger pour découvrir des recettes !
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#888' }}>
                    💡 Astuce : Plus vous avez d'ingrédients, plus vous verrez de recettes avec un pourcentage élevé.
                  </p>
                </>
              ) : (
                <>
                  <h3>Aucune recette disponible</h3>
                  <p style={{ color: '#666' }}>
                    Vos ingrédients actuels ne correspondent à aucune recette de notre base de données.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Section Garde-manger */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2>Mon garde-manger</h2>

          {/* Onglets */}
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                backgroundColor: activeTab === 'all' ? '#007bff' : '#fff',
                color: activeTab === 'all' ? '#fff' : '#000',
                cursor: 'pointer',
                borderRadius: '4px 0 0 4px'
              }}
            >
              Tous ({ingredients.length})
            </button>
            <button
              onClick={() => setActiveTab('priority')}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                backgroundColor: activeTab === 'priority' ? '#dc3545' : '#fff',
                color: activeTab === 'priority' ? '#fff' : '#000',
                cursor: 'pointer',
                borderRadius: '0 4px 4px 0'
              }}
            >
              Priorité ({priorityIngredients.length})
            </button>
          </div>

          {/* Liste des ingrédients */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {(activeTab === 'all' ? ingredients : priorityIngredients).map(ingredient => {
              const expirationDate = new Date(ingredient.expirationDate);
              const today = new Date();
              const diffTime = expirationDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isExpiringSoon = diffDays <= 7 && diffDays >= 0;

              return (
                <div key={ingredient.id} style={{
                  padding: '0.5rem',
                  margin: '0.5rem 0',
                  border: `1px solid ${isExpiringSoon ? '#dc3545' : '#ddd'}`,
                  borderRadius: '4px',
                  backgroundColor: isExpiringSoon ? '#fff5f5' : '#fff'
                }}>
                  <div style={{ fontWeight: 'bold' }}>{ingredient.name}</div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {ingredient.quantity} {ingredient.unit}
                  </div>
                  <div style={{
                    fontSize: '0.8em',
                    color: isExpiringSoon ? '#dc3545' : '#666'
                  }}>
                    {isExpiringSoon ? `⚠️ Expire dans ${diffDays} jour(s)` :
                      `Expire le ${expirationDate.toLocaleDateString()}`}
                  </div>
                </div>
              );
            })}
          </div>

          {(activeTab === 'all' ? ingredients : priorityIngredients).length === 0 && (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              {activeTab === 'all'
                ? 'Votre garde-manger est vide'
                : 'Aucun aliment n\'expire prochainement'
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}