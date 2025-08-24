from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime, timedelta
from jow_api import Jow
import logging
import time

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Permettre les requêtes CORS depuis le frontend React

# Instance de l'API Jow - initialisation lazy
jow = None

# Cache en mémoire pour les recettes
recipe_cache = {
    'data': None,
    'timestamp': None,
    'ttl': 300  # 5 minutes de cache
}

def get_jow():
    """Initialise Jow API si nécessaire"""
    global jow
    if jow is None:
        logger.info("Initializing Jow API...")
        jow = Jow()
        logger.info("Jow API initialized successfully!")
    return jow

def is_cache_valid():
    """Vérifie si le cache est encore valide"""
    if recipe_cache['data'] is None or recipe_cache['timestamp'] is None:
        return False
    
    elapsed = time.time() - recipe_cache['timestamp']
    return elapsed < recipe_cache['ttl']

def get_cached_recipes():
    """Récupère les recettes du cache si valides"""
    if is_cache_valid():
        logger.info(f"Returning {len(recipe_cache['data'])} recipes from cache")
        return recipe_cache['data']
    return None

def cache_recipes(recipes):
    """Met les recettes en cache"""
    recipe_cache['data'] = recipes
    recipe_cache['timestamp'] = time.time()
    logger.info(f"Cached {len(recipes)} recipes")

@app.route('/health', methods=['GET'])
def health_check():
    """Point de santé de l'API avec informations sur le cache"""
    cache_status = "valid" if is_cache_valid() else "expired"
    cache_size = len(recipe_cache['data']) if recipe_cache['data'] else 0
    
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Food Planner API",
        "cache": {
            "status": cache_status,
            "recipes_count": cache_size,
            "ttl": recipe_cache['ttl']
        }
    })

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    """Récupérer toutes les recettes disponibles avec cache optimisé"""
    try:
        # Paramètres de la requête
        limit = request.args.get('limit', type=int)  
        offset = request.args.get('offset', 0, type=int)
        search = request.args.get('search', '')
        
        # Pour les recherches spécifiques, ne pas utiliser le cache
        if search:
            logger.info(f"Specific search for: '{search}'")
            jow_api = get_jow()
            recipes_data = jow_api.search(to_search=search, limit=min(limit or 50, 100))
        else:
            # Vérifier le cache d'abord
            cached_recipes = get_cached_recipes()
            if cached_recipes:
                # Appliquer limite et offset sur les données cachées
                start_idx = offset
                end_idx = start_idx + (limit or len(cached_recipes))
                recipes_data = cached_recipes[start_idx:end_idx]
                
                return jsonify({
                    "success": True,
                    "data": recipes_data,
                    "total": len(cached_recipes),
                    "limit": limit,
                    "offset": offset,
                    "cached": True
                })
            
            # Cache expiré ou inexistant - récupérer de nouvelles recettes
            logger.info("Cache miss - fetching new recipes from Jow API")
            jow_api = get_jow()
            
            # Stratégie optimisée : moins de termes, plus ciblés
            search_terms = [
                'poulet', 'bœuf', 'poisson', 'pâtes', 'riz', 'salade', 
                'légumes', 'dessert', 'soupe', 'gratin'
            ]
            all_recipes = {}
            recipes_per_term = 15  # Limite réduite par terme pour éviter les timeouts
            
            for i, term in enumerate(search_terms):
                try:
                    logger.info(f"Searching for '{term}' ({i+1}/{len(search_terms)})")
                    term_recipes = jow_api.search(to_search=term, limit=recipes_per_term)
                    
                    if term_recipes:
                        for recipe in term_recipes:
                            recipe_id = str(recipe.id) if hasattr(recipe, 'id') else f"{term}_{len(all_recipes)}"
                            if recipe_id not in all_recipes:
                                all_recipes[recipe_id] = recipe
                                
                    # Limiter à 100 recettes max pour éviter les timeouts
                    if len(all_recipes) >= 100:
                        logger.info("Reached 100 recipes limit, stopping search")
                        break
                        
                except Exception as e:
                    logger.warning(f"Error searching for term '{term}': {e}")
                    continue
            
            recipes_data = list(all_recipes.values())
            logger.info(f"Fetched {len(recipes_data)} unique recipes from {len(search_terms)} terms")
        
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
                        "coversCount": 2  # Toujours pour 2 personnes
                    }
                    formatted_recipes.append(formatted_recipe)
                except Exception as e:
                    logger.warning(f"Error formatting recipe: {e}")
                    continue

        # Mettre en cache uniquement pour les recherches génériques (pas de search term)
        if not search and formatted_recipes:
            cache_recipes(formatted_recipes)

        # Appliquer limite et offset
        if not search:
            start_idx = offset
            end_idx = start_idx + (limit or len(formatted_recipes))
            result_recipes = formatted_recipes[start_idx:end_idx]
        else:
            result_recipes = formatted_recipes
        
        logger.info(f"Successfully returned {len(result_recipes)} recipes")
        
        return jsonify({
            "success": True,
            "data": result_recipes,
            "total": len(formatted_recipes),
            "limit": limit,
            "offset": offset,
            "cached": False
        })
        
    except Exception as e:
        logger.error(f"Error fetching recipes: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch recipes",
            "message": str(e)
        }), 500

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Vider le cache des recettes"""
    try:
        recipe_cache['data'] = None
        recipe_cache['timestamp'] = None
        logger.info("Recipe cache cleared manually")
        
        return jsonify({
            "success": True,
            "message": "Cache cleared successfully"
        })
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to clear cache",
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
            "coversCount": 2  # Toujours pour 2 personnes
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
