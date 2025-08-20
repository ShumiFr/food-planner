import React, { useState } from 'react';
import { useAppContext } from '../context/AppProvider';
import type { Recipe } from '../types/types';

export default function Home(): React.ReactElement {
  const { ingredients, recipes, addRecipeToTodo } = useAppContext();
  const [activeTab, setActiveTab] = useState('all'); // 'all' ou 'priority'

  // Filtrer les ingrédients par priorité (expire dans les 7 prochains jours)
  const priorityIngredients = ingredients.filter(ingredient => {
    const expirationDate = new Date(ingredient.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  });

  // Filtrer les recettes disponibles selon les ingrédients
  const availableRecipes = recipes.filter(recipe =>
    recipe.ingredients.some(ingredient =>
      ingredients.some(ing =>
        ing.name.toLowerCase().includes(ingredient.toLowerCase())
      )
    )
  );

  const handleAddToTodo = (recipe: Recipe) => {
    addRecipeToTodo(recipe);
    alert(`${recipe.name} ajouté à votre liste "À faire cette semaine"`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🍽️ Food Planner - Accueil</h1>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        {/* Section Recettes */}
        <div style={{ flex: 2 }}>
          <h2>Recettes suggérées</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Basées sur vos ingrédients disponibles
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {availableRecipes.map(recipe => (
              <div key={recipe.id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#fff'
              }}>
                <h3>{recipe.name}</h3>
                <p><strong>Temps de préparation:</strong> {recipe.prepTime} min</p>
                <p><strong>Difficulté:</strong> {recipe.difficulty}</p>
                <p><strong>Ingrédients:</strong> {recipe.ingredients.join(', ')}</p>
                <button
                  onClick={() => handleAddToTodo(recipe)}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Ajouter à mes recettes
                </button>
              </div>
            ))}
          </div>

          {availableRecipes.length === 0 && (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Ajoutez des ingrédients à votre garde-manger pour voir des recettes suggérées !
            </p>
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