import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class APIHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query_params = parse_qs(parsed_url.query)
        
        # CORS headers
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        if path == '/health':
            response = {
                "status": "healthy",
                "timestamp": "2025-08-20T18:00:00",
                "service": "Food Planner API"
            }
        elif path == '/api/recipes':
            # Données de test avec des recettes de saumon
            search_query = query_params.get('search', [''])[0].lower()
            limit = int(query_params.get('limit', [20])[0])
            
            test_recipes = [
                {
                    "id": "1",
                    "name": "Saumon grillé aux herbes",
                    "description": "Délicieux saumon grillé avec des herbes fraîches",
                    "ingredients": ["saumon", "herbes", "citron", "huile d'olive"],
                    "instructions": "Griller le saumon 15 minutes",
                    "prepTime": 15,
                    "difficulty": "easy",
                    "image": "https://static.jow.fr/recipes/saumon1.png"
                },
                {
                    "id": "2", 
                    "name": "Saumon à la crème",
                    "description": "Saumon dans une sauce crémeuse onctueuse",
                    "ingredients": ["saumon", "crème", "échalotes", "vin blanc"],
                    "instructions": "Cuire le saumon en sauce",
                    "prepTime": 25,
                    "difficulty": "medium",
                    "image": "https://static.jow.fr/recipes/saumon2.png"
                },
                {
                    "id": "3",
                    "name": "Terrine de saumon",
                    "description": "Entrée fraîche à base de saumon",
                    "ingredients": ["saumon fumé", "fromage blanc", "aneth", "citron"],
                    "instructions": "Mélanger tous les ingrédients",
                    "prepTime": 10,
                    "difficulty": "easy",
                    "image": "https://static.jow.fr/recipes/saumon3.png"
                },
                {
                    "id": "4",
                    "name": "Pâtes au saumon",
                    "description": "Pâtes crémeuses avec des morceaux de saumon",
                    "ingredients": ["pâtes", "saumon", "crème", "parmesan"],
                    "instructions": "Cuire les pâtes et ajouter le saumon",
                    "prepTime": 20,
                    "difficulty": "easy",
                    "image": "https://static.jow.fr/recipes/saumon4.png"
                },
                {
                    "id": "5",
                    "name": "Salade de saumon fumé",
                    "description": "Salade fraîche avec du saumon fumé",
                    "ingredients": ["saumon fumé", "salade", "avocat", "tomates"],
                    "instructions": "Mélanger tous les ingrédients",
                    "prepTime": 10,
                    "difficulty": "easy",
                    "image": "https://static.jow.fr/recipes/saumon5.png"
                },
                {
                    "id": "6",
                    "name": "Poulet basquaise",
                    "description": "Poulet mijoté aux légumes du soleil",
                    "ingredients": ["poulet", "tomates", "poivrons", "oignons"],
                    "instructions": "Mijoter le poulet avec les légumes",
                    "prepTime": 45,
                    "difficulty": "medium",
                    "image": "https://static.jow.fr/recipes/poulet1.png"
                },
                {
                    "id": "7",
                    "name": "Bœuf bourguignon",
                    "description": "Classique français au vin rouge",
                    "ingredients": ["bœuf", "vin rouge", "champignons", "lardons"],
                    "instructions": "Mijoter longuement au vin rouge",
                    "prepTime": 120,
                    "difficulty": "hard",
                    "image": "https://static.jow.fr/recipes/boeuf1.png"
                },
                {
                    "id": "8",
                    "name": "Omelette aux fines herbes",
                    "description": "Omelette moelleuse aux herbes fraîches",
                    "ingredients": ["œufs", "fines herbes", "beurre", "sel"],
                    "instructions": "Battre les œufs et cuire à la poêle",
                    "prepTime": 8,
                    "difficulty": "easy",
                    "image": "https://static.jow.fr/recipes/oeufs1.png"
                },
                {
                    "id": "9",
                    "name": "Pâtes à la tomate",
                    "description": "Pâtes simples avec une sauce tomate maison",
                    "ingredients": ["pâtes", "tomates", "basilic", "parmesan"],
                    "instructions": "Cuire les pâtes et ajouter la sauce",
                    "prepTime": 18,
                    "difficulty": "easy",
                    "image": "https://static.jow.fr/recipes/pates1.png"
                },
                {
                    "id": "10",
                    "name": "Bœuf aux oignons",
                    "description": "Émincé de bœuf aux oignons caramélisés",
                    "ingredients": ["bœuf", "oignons", "vin rouge", "thym"],
                    "instructions": "Faire revenir le bœuf et caraméliser les oignons",
                    "prepTime": 35,
                    "difficulty": "medium", 
                    "image": "https://static.jow.fr/recipes/boeuf2.png"
                }
            ]
            
            # Filtrer par recherche si nécessaire
            filtered_recipes = test_recipes
            if search_query:
                search_terms = search_query.lower().split()
                filtered_recipes = []
                for recipe in test_recipes:
                    # Chercher dans le nom, description et ingrédients
                    text_to_search = (recipe['name'] + ' ' + recipe['description'] + ' ' + ' '.join(recipe['ingredients'])).lower()
                    if any(term in text_to_search for term in search_terms):
                        filtered_recipes.append(recipe)
            
            response = {
                "success": True,
                "data": filtered_recipes[:limit],
                "total": len(filtered_recipes[:limit]),
                "limit": limit,
                "query": search_query
            }
        else:
            response = {"error": "Not found"}
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

if __name__ == '__main__':
    server = HTTPServer(('127.0.0.1', 3001), APIHandler)
    print("🚀 Serveur de test démarré sur http://localhost:3001")
    print("📋 Endpoints disponibles:")
    print("   - GET /health")
    print("   - GET /api/recipes")
    print("   - GET /api/recipes?search=saumon")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Serveur arrêté")
        server.shutdown()
