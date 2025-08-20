from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime
from jow_api import Jow
import logging

# Configuration du logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Test de l'initialisation de Jow
try:
    logger.info("Initializing Jow API...")
    jow = Jow()
    logger.info("Jow API initialized successfully!")
    
    # Test de recherche
    test_result = jow.search('poulet', limit=3)
    logger.info(f"Test search successful: {len(test_result)} recipes found")
    
except Exception as e:
    logger.error(f"Error initializing Jow API: {e}")
    jow = None

@app.route('/health', methods=['GET'])
def health_check():
    """Point de santé de l'API"""
    logger.info("Health check requested")
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Food Planner API",
        "jow_available": jow is not None
    })

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    """Récupérer toutes les recettes disponibles"""
    try:
        if jow is None:
            return jsonify({
                "success": False,
                "error": "Jow API not available",
                "message": "Jow API failed to initialize"
            }), 500
            
        # Paramètres de la requête
        limit = request.args.get('limit', 20, type=int)
        search = request.args.get('search', '')
        
        logger.info(f"Fetching recipes - limit: {limit}, search: '{search}'")
        
        # Rechercher des recettes
        query = search if search else 'poulet'  # terme de recherche par défaut
        recipes_data = jow.search(to_search=query, limit=limit)
        
        # Transformation des données au format attendu par le frontend
        formatted_recipes = []
        
        if recipes_data and isinstance(recipes_data, list):
            for recipe in recipes_data:
                try:
                    formatted_ingredients = []
                    if hasattr(recipe, 'ingredients') and recipe.ingredients:
                        for ing in recipe.ingredients:
                            if hasattr(ing, 'name'):
                                formatted_ingredients.append(ing.name)
                    
                    formatted_recipe = {
                        "id": str(recipe.id) if hasattr(recipe, 'id') else str(len(formatted_recipes)),
                        "name": recipe.name if hasattr(recipe, 'name') else "Recette sans nom",
                        "description": recipe.description if hasattr(recipe, 'description') else "Délicieuse recette",
                        "ingredients": formatted_ingredients,
                        "instructions": "Consultez le site Jow pour les instructions détaillées",
                        "prepTime": recipe.preparationTime if hasattr(recipe, 'preparationTime') else 30,
                        "difficulty": "medium",
                        "image": recipe.imageUrl if hasattr(recipe, 'imageUrl') else None,
                        "cookingTime": recipe.cookingTime if hasattr(recipe, 'cookingTime') else 0,
                        "coversCount": recipe.coversCount if hasattr(recipe, 'coversCount') else 4
                    }
                    formatted_recipes.append(formatted_recipe)
                except Exception as e:
                    logger.warning(f"Error formatting recipe: {e}")
                    continue
        
        logger.info(f"Successfully fetched {len(formatted_recipes)} recipes")
        
        return jsonify({
            "success": True,
            "data": formatted_recipes,
            "total": len(formatted_recipes),
            "limit": limit,
            "query": search
        })
        
    except Exception as e:
        logger.error(f"Error fetching recipes: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch recipes",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting Food Planner API Server...")
    app.run(debug=True, host='127.0.0.1', port=5001)
