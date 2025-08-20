import React from 'react';
import { useAppContext } from '../context/AppProvider';
import type { Recipe, WeeklyPlan } from '../types/types';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type MealTime = 'lunch' | 'dinner';

export default function Planning(): React.ReactElement {
   const { weeklyPlan, updateWeeklyPlan } = useAppContext();

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

         // Optionnel : retirer la recette de la todo list
         // removeRecipeFromTodo(todoRecipeId); // Il faudrait passer l'ID de la todo

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

   return (
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
         <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
         }}>
            <h1>📅 Planning hebdomadaire</h1>
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
               <h3 style={{ margin: '0 0 0.5rem 0', color: '#007bff' }}>{getTotalMealsPlanned()}</h3>
               <p style={{ margin: 0, color: '#666' }}>Repas planifiés</p>
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
               <p style={{ margin: 0, color: '#666' }}>Temps de préparation</p>
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
               <p style={{ margin: 0, color: '#666' }}>Semaine complétée</p>
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
            <p style={{ margin: 0, color: '#0c5460' }}>
               💡 <strong>Comment ça marche :</strong> Allez sur la page "À faire cette semaine", puis glissez-déposez vos recettes dans les créneaux ci-dessous !
            </p>
         </div>

         {/* Planning Grid */}
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
               Ma semaine
            </h2>

            {/* Headers */}
            <div style={{
               display: 'grid',
               gridTemplateColumns: '120px repeat(7, 1fr)',
               backgroundColor: '#f8f9fa',
               borderBottom: '1px solid #ddd'
            }}>
               <div style={{ padding: '1rem', fontWeight: 'bold' }}>Repas</div>
               {days.map(day => (
                  <div key={day.id} style={{
                     padding: '1rem',
                     textAlign: 'center',
                     fontWeight: 'bold',
                     borderLeft: '1px solid #ddd'
                  }}>
                     <div>{day.shortLabel}</div>
                     <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {day.label}
                     </div>
                  </div>
               ))}
            </div>

            {/* Meal Rows */}
            {mealTimes.map(mealTime => (
               <div key={mealTime.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '120px repeat(7, 1fr)',
                  borderBottom: mealTime.id === 'lunch' ? '1px solid #ddd' : 'none'
               }}>
                  {/* Meal Time Label */}
                  <div style={{
                     padding: '2rem 1rem',
                     backgroundColor: '#f8f9fa',
                     display: 'flex',
                     alignItems: 'center',
                     fontWeight: 'bold',
                     borderRight: '1px solid #ddd'
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
                              minHeight: '120px',
                              padding: '1rem',
                              borderLeft: '1px solid #ddd',
                              borderRight: day.id === 'sunday' ? 'none' : '1px solid #ddd',
                              backgroundColor: recipe ? '#f8f9fa' : '#fff',
                              position: 'relative',
                              cursor: 'pointer',
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
                                       width: '24px',
                                       height: '24px',
                                       cursor: 'pointer',
                                       fontSize: '0.8rem',
                                       zIndex: 1
                                    }}
                                 >
                                    ×
                                 </button>

                                 <div style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem',
                                    color: '#333'
                                 }}>
                                    {recipe.name}
                                 </div>

                                 <div style={{
                                    fontSize: '0.8rem',
                                    color: '#666',
                                    marginBottom: '0.5rem'
                                 }}>
                                    ⏱️ {recipe.prepTime} min
                                 </div>

                                 <div style={{
                                    fontSize: '0.7rem',
                                    color: '#999',
                                    lineHeight: '1.2'
                                 }}>
                                    {recipe.ingredients.slice(0, 3).join(', ')}
                                    {recipe.ingredients.length > 3 && '...'}
                                 </div>
                              </div>
                           ) : (
                              <div style={{
                                 height: '100%',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 color: '#999',
                                 fontSize: '0.9rem',
                                 textAlign: 'center',
                                 border: '2px dashed #ddd',
                                 borderRadius: '4px'
                              }}>
                                 Glissez une recette ici
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
   );
}
