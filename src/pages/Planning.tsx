import React, { useState } from 'react';
import { useAppContext } from '../context/AppProvider';
import type { Recipe, WeeklyPlan } from '../types/types';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type MealTime = 'lunch' | 'dinner';

export default function Planning(): React.ReactElement {
   const { weeklyPlan, updateWeeklyPlan, recipes, ingredients } = useAppContext();
   const [searchTerm, setSearchTerm] = useState('');
   const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

   const days: { id: DayOfWeek; label: string; shortLabel: string }[] = [
      { id: 'monday', label: 'Lundi', shortLabel: 'Lun' },
      { id: 'tuesday', label: 'Mardi', shortLabel: 'Mar' },
      { id: 'wednesday', label: 'Mercredi', shortLabel: 'Mer' },
      { id: 'thursday', label: 'Jeudi', shortLabel: 'Jeu' },
      { id: 'friday', label: 'Vendredi', shortLabel: 'Ven' },
      { id: 'saturday', label: 'Samedi', shortLabel: 'Sam' },
      { id: 'sunday', label: 'Dimanche', shortLabel: 'Dim' }
   ];

   const mealTimes: { id: MealTime; label: string; icon: string }[] = [
      { id: 'lunch', label: 'Déjeuner', icon: '🌅' },
      { id: 'dinner', label: 'Dîner', icon: '🌙' }
   ];

   // Filtrer les recettes
   const filteredRecipes = recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
         recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDifficulty = difficultyFilter === 'all' || recipe.difficulty === difficultyFilter;

      return matchesSearch && matchesDifficulty;
   });

   // Recettes suggérées basées sur les ingrédients
   const availableRecipes = filteredRecipes.filter(recipe =>
      recipe.ingredients.some(ingredient =>
         ingredients.some(ing =>
            ing.name.toLowerCase().includes(ingredient.toLowerCase())
         )
      )
   );

   const handleDragStart = (e: React.DragEvent, recipe: Recipe) => {
      e.dataTransfer.setData('text/plain', JSON.stringify(recipe));
      e.dataTransfer.effectAllowed = 'move';
   };

   const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
   };

   const handleDrop = (e: React.DragEvent, day: DayOfWeek, mealTime: MealTime) => {
      e.preventDefault();

      try {
         const recipeData = e.dataTransfer.getData('text/plain');
         const recipe: Recipe = JSON.parse(recipeData);

         // Trouver le plan existant pour ce jour ou en créer un nouveau
         const existingPlan = weeklyPlan.find(p => p.day === day);

         const updatedPlan: WeeklyPlan = {
            id: existingPlan?.id || Date.now().toString(),
            day,
            lunch: mealTime === 'lunch' ? recipe : existingPlan?.lunch,
            dinner: mealTime === 'dinner' ? recipe : existingPlan?.dinner
         };

         updateWeeklyPlan(updatedPlan);

      } catch (error) {
         console.error('Erreur lors du drop:', error);
      }
   };

   const handleRemoveRecipe = (day: DayOfWeek, mealTime: MealTime) => {
      const existingPlan = weeklyPlan.find(p => p.day === day);
      if (!existingPlan) return;

      const updatedPlan: WeeklyPlan = {
         ...existingPlan,
         [mealTime]: undefined
      };

      updateWeeklyPlan(updatedPlan);
   };

   const getPlanForDay = (day: DayOfWeek): WeeklyPlan | undefined => {
      return weeklyPlan.find(p => p.day === day);
   };

   const getTotalMealsPlanned = (): number => {
      return weeklyPlan.reduce((total, plan) => {
         return total + (plan.lunch ? 1 : 0) + (plan.dinner ? 1 : 0);
      }, 0);
   };

   const getTotalPrepTime = (): number => {
      return weeklyPlan.reduce((total, plan) => {
         const lunchTime = plan.lunch?.prepTime || 0;
         const dinnerTime = plan.dinner?.prepTime || 0;
         return total + lunchTime + dinnerTime;
      }, 0);
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
      <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
         <h1 style={{ marginBottom: '2rem' }}>📅 Planning hebdomadaire</h1>

         {/* Layout principal avec galerie à gauche et planning à droite */}
         <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem' }}>

            {/* GALERIE DES RECETTES */}
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', height: 'fit-content' }}>
               <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderBottom: '1px solid #ddd',
                  borderRadius: '8px 8px 0 0'
               }}>
                  <h2 style={{ margin: '0 0 1rem 0' }}>🍽️ Galerie des recettes</h2>

                  {/* Recherche et filtres */}
                  <div style={{ marginBottom: '1rem' }}>
                     <input
                        type="text"
                        placeholder="Rechercher une recette..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                           width: '100%',
                           padding: '0.5rem',
                           border: '1px solid #ddd',
                           borderRadius: '4px',
                           marginBottom: '0.5rem'
                        }}
                     />

                     <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value as typeof difficultyFilter)}
                        style={{
                           width: '100%',
                           padding: '0.5rem',
                           border: '1px solid #ddd',
                           borderRadius: '4px'
                        }}
                     >
                        <option value="all">Toutes les difficultés</option>
                        <option value="easy">Facile</option>
                        <option value="medium">Moyen</option>
                        <option value="hard">Difficile</option>
                     </select>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                     {filteredRecipes.length} recette(s) | {availableRecipes.length} avec vos ingrédients
                  </div>
               </div>

               {/* Section recettes suggérées */}
               {availableRecipes.length > 0 && (
                  <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                     <h3 style={{ margin: '0 0 1rem 0', color: '#28a745', fontSize: '1rem' }}>
                        ⭐ Suggérées (avec vos ingrédients)
                     </h3>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {availableRecipes.map(recipe => (
                           <div
                              key={recipe.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, recipe)}
                              style={{
                                 padding: '0.75rem',
                                 border: '2px solid #28a745',
                                 borderRadius: '6px',
                                 backgroundColor: '#f8fff8',
                                 cursor: 'move',
                                 transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = 'translateX(4px)';
                                 e.currentTarget.style.boxShadow = '0 2px 8px rgba(40,167,69,0.2)';
                              }}
                              onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = 'translateX(0)';
                                 e.currentTarget.style.boxShadow = 'none';
                              }}
                           >
                              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                 {recipe.name}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                                 {recipe.description}
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                                 <span>⏱️ {recipe.prepTime}min</span>
                                 <span style={{ color: getDifficultyColor(recipe.difficulty) }}>
                                    📊 {getDifficultyText(recipe.difficulty)}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Toutes les recettes */}
               <div style={{ padding: '1rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>📚 Toutes les recettes</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto' }}>
                     {filteredRecipes.map(recipe => {
                        const isAvailable = availableRecipes.some(ar => ar.id === recipe.id);
                        return (
                           <div
                              key={recipe.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, recipe)}
                              style={{
                                 padding: '0.75rem',
                                 border: '1px solid #ddd',
                                 borderRadius: '6px',
                                 backgroundColor: '#fff',
                                 cursor: 'move',
                                 transition: 'all 0.2s ease',
                                 opacity: isAvailable ? 0.7 : 1 // Réduire l'opacité si déjà affiché en haut
                              }}
                              onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = 'translateX(4px)';
                                 e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = 'translateX(0)';
                                 e.currentTarget.style.boxShadow = 'none';
                              }}
                           >
                              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                 {recipe.name}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                                 {recipe.description}
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                                 <span>⏱️ {recipe.prepTime}min</span>
                                 <span style={{ color: getDifficultyColor(recipe.difficulty) }}>
                                    📊 {getDifficultyText(recipe.difficulty)}
                                 </span>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>

            {/* PLANNING HEBDOMADAIRE */}
            <div>
               {/* Statistiques */}
               <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
                     <h3 style={{ margin: '0 0 0.5rem 0', color: '#007bff' }}>{getTotalMealsPlanned()}</h3>
                     <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Repas planifiés</p>
                  </div>

                  <div style={{
                     backgroundColor: '#fff',
                     padding: '1rem',
                     borderRadius: '8px',
                     textAlign: 'center',
                     border: '1px solid #ddd'
                  }}>
                     <h3 style={{ margin: '0 0 0.5rem 0', color: '#28a745' }}>
                        {Math.round(getTotalPrepTime() / 60 * 10) / 10}h
                     </h3>
                     <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Temps total</p>
                  </div>

                  <div style={{
                     backgroundColor: '#fff',
                     padding: '1rem',
                     borderRadius: '8px',
                     textAlign: 'center',
                     border: '1px solid #ddd'
                  }}>
                     <h3 style={{ margin: '0 0 0.5rem 0', color: '#ffc107' }}>
                        {Math.round((getTotalMealsPlanned() / 14) * 100)}%
                     </h3>
                     <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Complétée</p>
                  </div>
               </div>

               {/* Instructions */}
               <div style={{
                  backgroundColor: '#e7f3ff',
                  border: '1px solid #bee5eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '2rem'
               }}>
                  <p style={{ margin: 0, color: '#0c5460', fontSize: '0.9rem' }}>
                     💡 <strong>Glissez-déposez</strong> les recettes de la galerie vers les créneaux du planning !
                  </p>
               </div>

               {/* Planning Grid */}
               <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  overflow: 'hidden'
               }}>
                  {/* Headers */}
                  <div style={{
                     display: 'grid',
                     gridTemplateColumns: '100px repeat(7, 1fr)',
                     backgroundColor: '#f8f9fa',
                     borderBottom: '1px solid #ddd'
                  }}>
                     <div style={{ padding: '0.75rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Repas</div>
                     {days.map(day => (
                        <div key={day.id} style={{
                           padding: '0.75rem',
                           textAlign: 'center',
                           fontWeight: 'bold',
                           borderLeft: '1px solid #ddd',
                           fontSize: '0.8rem'
                        }}>
                           <div>{day.shortLabel}</div>
                        </div>
                     ))}
                  </div>

                  {/* Meal Rows */}
                  {mealTimes.map(mealTime => (
                     <div key={mealTime.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '100px repeat(7, 1fr)',
                        borderBottom: mealTime.id === 'lunch' ? '1px solid #ddd' : 'none'
                     }}>
                        {/* Meal Time Label */}
                        <div style={{
                           padding: '1.5rem 0.75rem',
                           backgroundColor: '#f8f9fa',
                           display: 'flex',
                           alignItems: 'center',
                           fontWeight: 'bold',
                           borderRight: '1px solid #ddd',
                           fontSize: '0.8rem'
                        }}>
                           {mealTime.icon} {mealTime.label}
                        </div>

                        {/* Day Slots */}
                        {days.map(day => {
                           const dayPlan = getPlanForDay(day.id);
                           const recipe = dayPlan?.[mealTime.id];

                           return (
                              <div
                                 key={`${day.id}-${mealTime.id}`}
                                 onDragOver={handleDragOver}
                                 onDrop={(e) => handleDrop(e, day.id, mealTime.id)}
                                 style={{
                                    minHeight: '100px',
                                    padding: '0.75rem',
                                    borderLeft: '1px solid #ddd',
                                    backgroundColor: recipe ? '#f8f9fa' : '#fff',
                                    position: 'relative',
                                    transition: 'background-color 0.2s ease'
                                 }}
                                 onDragEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                                 }}
                                 onDragLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = recipe ? '#f8f9fa' : '#fff';
                                 }}
                              >
                                 {recipe ? (
                                    <div style={{ position: 'relative' }}>
                                       {/* Remove button */}
                                       <button
                                          onClick={() => handleRemoveRecipe(day.id, mealTime.id)}
                                          style={{
                                             position: 'absolute',
                                             top: '-0.5rem',
                                             right: '-0.5rem',
                                             backgroundColor: '#dc3545',
                                             color: 'white',
                                             border: 'none',
                                             borderRadius: '50%',
                                             width: '20px',
                                             height: '20px',
                                             cursor: 'pointer',
                                             fontSize: '0.7rem',
                                             zIndex: 1
                                          }}
                                       >
                                          ×
                                       </button>

                                       <div style={{
                                          fontSize: '0.8rem',
                                          fontWeight: 'bold',
                                          marginBottom: '0.5rem',
                                          color: '#333'
                                       }}>
                                          {recipe.name}
                                       </div>

                                       <div style={{
                                          fontSize: '0.7rem',
                                          color: '#666',
                                          marginBottom: '0.5rem'
                                       }}>
                                          ⏱️ {recipe.prepTime} min
                                       </div>

                                       <div style={{
                                          fontSize: '0.65rem',
                                          color: '#999',
                                          lineHeight: '1.2'
                                       }}>
                                          {recipe.ingredients.slice(0, 2).join(', ')}
                                          {recipe.ingredients.length > 2 && '...'}
                                       </div>
                                    </div>
                                 ) : (
                                    <div style={{
                                       height: '100%',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       color: '#999',
                                       fontSize: '0.8rem',
                                       textAlign: 'center',
                                       border: '2px dashed #ddd',
                                       borderRadius: '4px'
                                    }}>
                                       Glissez ici
                                    </div>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  ))}
               </div>

               {/* Résumé de la semaine */}
               {getTotalMealsPlanned() > 0 && (
                  <div style={{
                     marginTop: '2rem',
                     backgroundColor: '#fff',
                     borderRadius: '8px',
                     border: '1px solid #ddd',
                     padding: '1.5rem'
                  }}>
                     <h3 style={{ marginTop: 0 }}>📊 Résumé de la semaine</h3>

                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div>
                           <h4 style={{ color: '#007bff', marginBottom: '0.5rem' }}>Recettes planifiées</h4>
                           <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {weeklyPlan.map(plan => (
                                 <div key={plan.id}>
                                    {plan.lunch && (
                                       <li style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                          • {plan.lunch.name} (déjeuner)
                                       </li>
                                    )}
                                    {plan.dinner && (
                                       <li style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                          • {plan.dinner.name} (dîner)
                                       </li>
                                    )}
                                 </div>
                              ))}
                           </ul>
                        </div>

                        <div>
                           <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}>Temps de cuisine</h4>
                           <div style={{ fontSize: '0.9rem', color: '#666' }}>
                              <div>Total: {Math.round(getTotalPrepTime() / 60 * 10) / 10}h</div>
                              <div>Moyenne par repas: {Math.round(getTotalPrepTime() / getTotalMealsPlanned())} min</div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
