import React, { useState } from 'react';
import { useAppContext } from '../context/AppProviderApi';
import type { Ingredient } from '../types/types';

export default function Pantry(): React.ReactElement {
   const { ingredients, addIngredient, removeIngredient } = useAppContext();
   const [showAddForm, setShowAddForm] = useState(false);
   const [formData, setFormData] = useState({
      name: '',
      quantity: 0,
      unit: 'g' as 'kg' | 'g' | 'l' | 'ml' | 'pieces',
      expirationDate: ''
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.name && formData.quantity > 0 && formData.expirationDate) {
         addIngredient({
            name: formData.name,
            quantity: formData.quantity,
            unit: formData.unit,
            expirationDate: new Date(formData.expirationDate)
         });
         setFormData({
            name: '',
            quantity: 0,
            unit: 'g',
            expirationDate: ''
         });
         setShowAddForm(false);
      }
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: name === 'quantity' ? parseFloat(value) || 0 : value
      }));
   };

   const getExpirationStatus = (ingredient: Ingredient) => {
      const expirationDate = new Date(ingredient.expirationDate);
      const today = new Date();
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { status: 'expired', message: 'Expiré', color: '#dc3545' };
      if (diffDays <= 3) return { status: 'critical', message: `Expire dans ${diffDays} jour(s)`, color: '#dc3545' };
      if (diffDays <= 7) return { status: 'warning', message: `Expire dans ${diffDays} jour(s)`, color: '#ffc107' };
      return { status: 'good', message: `Expire le ${expirationDate.toLocaleDateString()}`, color: '#28a745' };
   };

   // Trier les ingrédients par date d'expiration
   const sortedIngredients = [...ingredients].sort((a, b) =>
      new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
   );

   return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>🥬 Mon Garde-manger</h1>
            <button
               onClick={() => setShowAddForm(!showAddForm)}
               style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
               }}
            >
               {showAddForm ? 'Annuler' : '+ Ajouter un aliment'}
            </button>
         </div>

         {/* Formulaire d'ajout */}
         {showAddForm && (
            <div style={{
               backgroundColor: '#fff',
               padding: '1.5rem',
               borderRadius: '8px',
               marginBottom: '2rem',
               border: '1px solid #ddd'
            }}>
               <h3>Ajouter un nouvel aliment</h3>
               <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                     <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Nom de l'aliment *
                     </label>
                     <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        style={{
                           width: '100%',
                           padding: '0.5rem',
                           border: '1px solid #ddd',
                           borderRadius: '4px'
                        }}
                     />
                  </div>

                  <div>
                     <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Quantité *
                     </label>
                     <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        required
                        style={{
                           width: '100%',
                           padding: '0.5rem',
                           border: '1px solid #ddd',
                           borderRadius: '4px'
                        }}
                     />
                  </div>

                  <div>
                     <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Unité
                     </label>
                     <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        style={{
                           width: '100%',
                           padding: '0.5rem',
                           border: '1px solid #ddd',
                           borderRadius: '4px'
                        }}
                     >
                        <option value="g">grammes (g)</option>
                        <option value="kg">kilogrammes (kg)</option>
                        <option value="ml">millilitres (ml)</option>
                        <option value="l">litres (l)</option>
                        <option value="pieces">pièces</option>
                     </select>
                  </div>

                  <div>
                     <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Date de péremption *
                     </label>
                     <input
                        type="date"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleInputChange}
                        required
                        style={{
                           width: '100%',
                           padding: '0.5rem',
                           border: '1px solid #ddd',
                           borderRadius: '4px'
                        }}
                     />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', gridColumn: '1 / -1' }}>
                     <button
                        type="submit"
                        style={{
                           backgroundColor: '#28a745',
                           color: 'white',
                           border: 'none',
                           padding: '0.75rem 1.5rem',
                           borderRadius: '4px',
                           cursor: 'pointer'
                        }}
                     >
                        Ajouter
                     </button>
                  </div>
               </form>
            </div>
         )}

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
               <h3 style={{ margin: '0 0 0.5rem 0', color: '#007bff' }}>{ingredients.length}</h3>
               <p style={{ margin: 0, color: '#666' }}>Aliments total</p>
            </div>

            <div style={{
               backgroundColor: '#fff',
               padding: '1rem',
               borderRadius: '8px',
               textAlign: 'center',
               border: '1px solid #ddd'
            }}>
               <h3 style={{ margin: '0 0 0.5rem 0', color: '#ffc107' }}>
                  {ingredients.filter(ing => {
                     const diffDays = Math.ceil((new Date(ing.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                     return diffDays <= 7 && diffDays >= 0;
                  }).length}
               </h3>
               <p style={{ margin: 0, color: '#666' }}>Expire bientôt</p>
            </div>

            <div style={{
               backgroundColor: '#fff',
               padding: '1rem',
               borderRadius: '8px',
               textAlign: 'center',
               border: '1px solid #ddd'
            }}>
               <h3 style={{ margin: '0 0 0.5rem 0', color: '#dc3545' }}>
                  {ingredients.filter(ing => {
                     const diffDays = Math.ceil((new Date(ing.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                     return diffDays < 0;
                  }).length}
               </h3>
               <p style={{ margin: 0, color: '#666' }}>Expirés</p>
            </div>
         </div>

         {/* Liste des ingrédients */}
         <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
            <h2 style={{ padding: '1rem', margin: 0, backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
               Mes aliments ({ingredients.length})
            </h2>

            {sortedIngredients.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  <p>Votre garde-manger est vide</p>
                  <p>Cliquez sur "Ajouter un aliment" pour commencer</p>
               </div>
            ) : (
               <div style={{ display: 'grid', gap: '1px', backgroundColor: '#f0f0f0' }}>
                  {sortedIngredients.map(ingredient => {
                     const expiration = getExpirationStatus(ingredient);
                     return (
                        <div key={ingredient.id} style={{
                           backgroundColor: '#fff',
                           padding: '1rem',
                           display: 'grid',
                           gridTemplateColumns: '2fr 1fr 1fr 2fr 100px',
                           gap: '1rem',
                           alignItems: 'center'
                        }}>
                           <div>
                              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                 {ingredient.name}
                              </div>
                              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                 Ajouté le {new Date(ingredient.addedDate).toLocaleDateString()}
                              </div>
                           </div>

                           <div style={{ textAlign: 'center' }}>
                              <div style={{ fontWeight: 'bold' }}>{ingredient.quantity}</div>
                              <div style={{ fontSize: '0.9rem', color: '#666' }}>{ingredient.unit}</div>
                           </div>

                           <div style={{ textAlign: 'center' }}>
                              <div style={{ color: expiration.color, fontWeight: 'bold' }}>
                                 {expiration.status === 'expired' ? '⚠️' :
                                    expiration.status === 'critical' ? '🔴' :
                                       expiration.status === 'warning' ? '🟡' : '🟢'}
                              </div>
                           </div>

                           <div>
                              <div style={{ color: expiration.color, fontWeight: 'bold', fontSize: '0.9rem' }}>
                                 {expiration.message}
                              </div>
                           </div>

                           <div>
                              <button
                                 onClick={() => removeIngredient(ingredient.id)}
                                 style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    width: '100%'
                                 }}
                              >
                                 🗑️
                              </button>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>
      </div>
   );
}
