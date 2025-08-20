#!/usr/bin/env node

/**
 * Script de test de l'intégration frontend-backend
 */

const API_BASE = 'http://localhost:5000';

async function testAPI() {
    console.log('🧪 Test de l\'API Food Planner\n');
    
    try {
        // Test 1: Health check
        console.log('1️⃣  Test du health check...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.status);
        
        // Test 2: Récupération des recettes par défaut
        console.log('\n2️⃣  Test de récupération des recettes par défaut...');
        const recipesResponse = await fetch(`${API_BASE}/api/recipes?limit=5`);
        const recipesData = await recipesResponse.json();
        console.log('✅ Recettes récupérées:', recipesData.data.length);
        console.log('📝 Première recette:', recipesData.data[0]?.name);
        
        // Test 3: Recherche de recettes
        console.log('\n3️⃣  Test de recherche de recettes...');
        const searchResponse = await fetch(`${API_BASE}/api/recipes?search=pizza&limit=3`);
        const searchData = await searchResponse.json();
        console.log('✅ Résultats de recherche:', searchData.data.length);
        if (searchData.data.length > 0) {
            console.log('🍕 Première recette trouvée:', searchData.data[0]?.name);
        }
        
        // Test 4: Récupération d'une recette spécifique
        if (recipesData.data.length > 0) {
            console.log('\n4️⃣  Test de récupération d\'une recette spécifique...');
            const recipeId = recipesData.data[0].id;
            const recipeResponse = await fetch(`${API_BASE}/api/recipes/${recipeId}`);
            const recipeData = await recipeResponse.json();
            console.log('✅ Recette spécifique:', recipeData.data?.name);
        }
        
        console.log('\n🎉 Tous les tests API réussis !');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
    }
}

// Exécuter seulement si ce fichier est appelé directement
if (typeof window === 'undefined') {
    // Nous sommes dans Node.js
    testAPI();
} else {
    // Nous sommes dans un navigateur
    window.testAPI = testAPI;
}
