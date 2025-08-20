from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime
from jow_api import Jow
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Permettre les requêtes CORS depuis le frontend React

# Instance de l'API Jow - initialisation lazy
jow = None

def get_jow():
    """Initialise Jow API si nécessaire"""
    global jow
    if jow is None:
        logger.info("Initializing Jow API...")
        jow = Jow()
        logger.info("Jow API initialized successfully!")
    return jow

@app.route('/health', methods=['GET'])
def health_check():
    """Point de santé de l'API"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Food Planner API"
    })

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    """Récupérer toutes les recettes disponibles"""
    try:
        # Initialiser Jow API si nécessaire
        jow_api = get_jow()
        
        # Paramètres de la requête
        limit = request.args.get('limit', type=int)  # Pas de limite par défaut
        offset = request.args.get('offset', 0, type=int)
        search = request.args.get('search', '')
        
        # Si pas de limite spécifiée, utiliser une grande valeur pour récupérer toutes les recettes
        if limit is None:
            limit = 1000  # Valeur élevée pour récupérer un maximum de recettes
        
        logger.info(f"Fetching recipes - limit: {limit}, offset: {offset}, search: '{search}'")
        
        # Si aucun terme de recherche spécifique, combiner plusieurs recherches génériques
        if search:
            # Recherche spécifique
            recipes_data = jow_api.search(to_search=search, limit=limit)
        else:
            # Combinaison de plusieurs termes génériques pour maximiser les résultats
            search_terms = [
                'plat', 'cuisine', 'recette', 'poulet', 'poisson', 'légume', 'viande', 'dessert',
                'salade', 'soupe', 'pâtes', 'riz', 'pain', 'fromage', 'œuf', 'fruit',
                'bœuf', 'porc', 'agneau', 'crevette', 'saumon', 'légumes', 'épice',
                'sauce', 'gratin', 'tarte', 'gâteau', 'crème'
            ]
            all_recipes = {}  # Dictionnaire pour éviter les doublons (clé = id)
            
            recipes_per_term = max(1, limit // len(search_terms))  # Répartir la limite entre les termes
            
            for term in search_terms:
                try:
                    term_recipes = jow_api.search(to_search=term, limit=recipes_per_term)
                    if term_recipes:
                        for recipe in term_recipes:
                            recipe_id = str(recipe.id) if hasattr(recipe, 'id') else f"{term}_{len(all_recipes)}"
                            if recipe_id not in all_recipes:  # Éviter les doublons
                                all_recipes[recipe_id] = recipe
                                
                    # Si on a atteint la limite, arrêter
                    if len(all_recipes) >= limit:
                        break
                        
                except Exception as e:
                    logger.warning(f"Error searching for term '{term}': {e}")
                    continue
            
            recipes_data = list(all_recipes.values())
            logger.info(f"Combined search returned {len(recipes_data)} unique recipes from {len(search_terms)} terms")
        
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
                        "difficulty": "medium",  # par défaut
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
            "offset": offset
        })
        
    except Exception as e:
        logger.error(f"Error fetching recipes: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch recipes",
            "message": str(e)
        }), 500

@app.route('/api/recipes/<recipe_id>', methods=['GET'])
def get_recipe_details(recipe_id):
    """Récupérer les détails d'une recette spécifique"""
    try:
        logger.info(f"Fetching recipe details for ID: {recipe_id}")
        
        # Initialiser Jow API si nécessaire
        jow_api = get_jow()
        
        # Faire une recherche simple pour récupérer la recette
        # Note: l'API Jow ne permet pas de récupérer directement par ID
        recipes = jow_api.search(to_search='poulet', limit=50)
        
        recipe = None
        for r in recipes:
            if hasattr(r, 'id') and str(r.id) == recipe_id:
                recipe = r
                break
        
        if not recipe:
            return jsonify({
                "success": False,
                "error": "Recipe not found"
            }), 404

        formatted_ingredients = []
        if hasattr(recipe, 'ingredients') and recipe.ingredients:
            for ing in recipe.ingredients:
                if hasattr(ing, 'name'):
                    formatted_ingredients.append(ing.name)

        formatted_recipe = {
            "id": str(recipe.id) if hasattr(recipe, 'id') else recipe_id,
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
        
        return jsonify({
            "success": True,
            "data": formatted_recipe
        })
        
    except Exception as e:
        logger.error(f"Error fetching recipe {recipe_id}: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch recipe details",
            "message": str(e)
        }), 500

@app.route('/api/ingredients', methods=['GET'])
def get_ingredients():
    """Récupérer la liste des ingrédients disponibles"""
    try:
        logger.info("Fetching ingredients")
        
        # Note: Cette fonctionnalité n'est pas directement disponible dans jow-api
        # On retourne une liste vide pour l'instant
        ingredients_data = []
        
        return jsonify({
            "success": True,
            "data": ingredients_data,
            "message": "Ingredients endpoint - functionality depends on jow-api capabilities"
        })
        
    except Exception as e:
        logger.error(f"Error fetching ingredients: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch ingredients",
            "message": str(e)
        }), 500

def map_difficulty(difficulty):
    """Mapper la difficulté de Jow vers notre format"""
    if not difficulty:
        return "easy"
    
    difficulty_lower = str(difficulty).lower()
    
    if any(word in difficulty_lower for word in ['facile', 'easy', 'simple']):
        return "easy"
    elif any(word in difficulty_lower for word in ['moyen', 'medium', 'intermediate']):
        return "medium"
    elif any(word in difficulty_lower for word in ['difficile', 'hard', 'expert']):
        return "hard"
    else:
        return "easy"  # Par défaut

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
    logger.info("Starting Food Planner API Server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
