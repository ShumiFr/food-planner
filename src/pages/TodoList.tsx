import React from 'react';
import { useAppContext } from '../context/AppProvider';
import type { Recipe } from '../types/types';

export default function TodoList(): React.ReactElement {
   const { todoRecipes, removeRecipeFromTodo, recipes, addRecipeToTodo } = useAppContext();

   const handleAddRandomRecipe = () => {
      // Trouver des recettes qui ne sont pas déjà dans la todo list
      const availableRecipes = recipes.filter(recipe =>
         !todoRecipes.some(todo => todo.recipe.id === recipe.id)
      );

      if (availableRecipes.length > 0) {
         const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
         addRecipeToTodo(randomRecipe);
      }
   };

   const handleDragStart = (e: React.DragEvent, recipe: Recipe) => {
      e.dataTransfer.setData('text/plain', JSON.stringify(recipe));
      e.dataTransfer.effectAllowed = 'move';
   };

   const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
         case 'easy': return '#28a745';
         case 'medium': return '#ffc107';
         case 'hard': return '#dc3545';
         default: return '#6c757d';
      }
   };

   const getDifficultyText = (difficulty: string) => {
      switch (difficulty) {
         case 'easy': return 'Facile';
         case 'medium': return 'Moyen';
         case 'hard': return 'Difficile';
         default: return difficulty;
      }
   };

   return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
         <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
         }}>
            <h1>📝 À faire cette semaine</h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button
                  onClick={handleAddRandomRecipe}
                  disabled={recipes.length === todoRecipes.length}
                  style={{
                     backgroundColor: recipes.length === todoRecipes.length ? '#6c757d' : '#007bff',
                     color: 'white',
                     border: 'none',
                     padding: '0.75rem 1.5rem',
                     borderRadius: '8px',
                     cursor: recipes.length === todoRecipes.length ? 'not-allowed' : 'pointer',
                     fontSize: '1rem',
                     fontWeight: 'bold'
                  }}
               >
                  🎲 Ajouter une recette au hasard
               </button>
            </div>
         </div>

         {/* Statistiques */}
         <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
         }}>
            <div style={{
               backgroundColor: '#fff',
               padding: '1rem',
               borderRadius: '8px',
               textAlign: 'center',
               border: '1px solid #ddd'
            }}>
               <h3 style={{ margin: '0 0 0.5rem 0', color: '#007bff' }}>{todoRecipes.length}</h3>
               <p style={{ margin: 0, color: '#666' }}>Recettes prévues</p>
            </div>

            <div style={{
               backgroundColor: '#fff',
               padding: '1rem',
               borderRadius: '8px',
               textAlign: 'center',
               border: '1px solid #ddd'
            }}>
               <h3 style={{ margin: '0 0 0.5rem 0', color: '#28a745' }}>
                  {Math.round(todoRecipes.reduce((acc, todo) => acc + todo.recipe.prepTime, 0) / 60 * 10) / 10}h
               </h3>
               <p style={{ margin: 0, color: '#666' }}>Temps de préparation total</p>
            </div>

            <div style={{
               backgroundColor: '#fff',
               padding: '1rem',
               borderRadius: '8px',
               textAlign: 'center',
               border: '1px solid #ddd'
            }}>
               <h3 style={{ margin: '0 0 0.5rem 0', color: '#ffc107' }}>
                  {todoRecipes.filter(todo => todo.recipe.difficulty === 'easy').length}
               </h3>
               <p style={{ margin: 0, color: '#666' }}>Recettes faciles</p>
            </div>
         </div>

         {/* Info sur le drag and drop */}
         <div style={{
            backgroundColor: '#e7f3ff',
            border: '1px solid #bee5eb',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem'
         }}>
            <p style={{ margin: 0, color: '#0c5460' }}>
               💡 <strong>Astuce :</strong> Glissez-déposez vos recettes vers la page Planning pour les programmer dans votre semaine !
            </p>
         </div>

         {/* Liste des recettes */}
         <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #ddd',
            overflow: 'hidden'
         }}>
            <h2 style={{
               padding: '1rem',
               margin: 0,
               backgroundColor: '#f8f9fa',
               borderBottom: '1px solid #ddd'
            }}>
               Mes recettes ({todoRecipes.length})
            </h2>

            {todoRecipes.length === 0 ? (
               <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                  <h3>Aucune recette prévue</h3>
                  <p>Ajoutez des recettes depuis la page d'accueil ou cliquez sur "Ajouter une recette au hasard"</p>
               </div>
            ) : (
               <div style={{ padding: '1rem' }}>
                  <div style={{
                     display: 'grid',
                     gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                     gap: '1rem'
                  }}>
                     {todoRecipes.map(todoRecipe => (
                        <div
                           key={todoRecipe.id}
                           draggable
                           onDragStart={(e) => handleDragStart(e, todoRecipe.recipe)}
                           style={{
                              border: '1px solid #ddd',
                              borderRadius: '8px',
                              padding: '1rem',
                              backgroundColor: '#fff',
                              cursor: 'move',
                              transition: 'all 0.2s ease',
                              position: 'relative'
                           }}
                           onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                           }}
                           onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                           }}
                        >
                           {/* Badge draggable */}
                           <div style={{
                              position: 'absolute',
                              top: '0.5rem',
                              right: '0.5rem',
                              backgroundColor: '#007bff',
                              color: 'white',
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '12px'
                           }}>
                              📱 Glisser
                           </div>

                           <div style={{ marginTop: '1rem' }}>
                              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                                 {todoRecipe.recipe.name}
                              </h3>

                              <p style={{
                                 margin: '0 0 1rem 0',
                                 color: '#666',
                                 fontSize: '0.9rem',
                                 lineHeight: '1.4'
                              }}>
                                 {todoRecipe.recipe.description}
                              </p>

                              <div style={{
                                 display: 'flex',
                                 gap: '1rem',
                                 marginBottom: '1rem',
                                 fontSize: '0.9rem'
                              }}>
                                 <span style={{ color: '#666' }}>
                                    ⏱️ {todoRecipe.recipe.prepTime} min
                                 </span>
                                 <span style={{
                                    color: getDifficultyColor(todoRecipe.recipe.difficulty),
                                    fontWeight: 'bold'
                                 }}>
                                    📊 {getDifficultyText(todoRecipe.recipe.difficulty)}
                                 </span>
                              </div>

                              <div style={{ marginBottom: '1rem' }}>
                                 <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    Ingrédients :
                                 </div>
                                 <div style={{
                                    color: '#666',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.4'
                                 }}>
                                    {todoRecipe.recipe.ingredients.join(', ')}
                                 </div>
                              </div>

                              <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '1rem' }}>
                                 Ajouté le {new Date(todoRecipe.addedDate).toLocaleDateString()}
                              </div>

                              <button
                                 onClick={() => removeRecipeFromTodo(todoRecipe.id)}
                                 style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    width: '100%'
                                 }}
                              >
                                 🗑️ Retirer de la liste
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* Instructions pour le drag and drop */}
         {todoRecipes.length > 0 && (
            <div style={{
               marginTop: '2rem',
               padding: '1rem',
               backgroundColor: '#fff3cd',
               border: '1px solid #ffeaa7',
               borderRadius: '8px',
               color: '#856404'
            }}>
               <h4 style={{ margin: '0 0 0.5rem 0' }}>📋 Comment utiliser :</h4>
               <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>Cliquez et glissez une recette vers la page Planning</li>
                  <li>Déposez-la dans un créneau (midi ou soir) de votre choix</li>
                  <li>La recette sera automatiquement programmée pour ce moment</li>
               </ul>
            </div>
         )}
      </div>
   );
}
