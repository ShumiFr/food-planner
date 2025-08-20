# Food Planner API Backend

API backend pour l'application Food Planner utilisant jow-api pour fournir des recettes.

## 🚀 Installation et Démarrage

### Prérequis
- Python 3.8+
- pip

### Installation
```bash
# Créer un environnement virtuel
python -m venv .venv

# Activer l'environnement virtuel (Windows)
.venv\Scripts\activate

# Installer les dépendances
pip install -r backend/requirements.txt
```

### Démarrage du serveur
```bash
python backend/app.py
```

Le serveur sera disponible sur `http://localhost:5000`

## 📚 Endpoints API

### Health Check
- **GET** `/health`
- **Description**: Vérification de l'état de l'API
- **Réponse**: 
```json
{
    "status": "healthy",
    "timestamp": "2025-08-20T10:30:00.000000",
    "service": "Food Planner API"
}
```

### Récupérer toutes les recettes
- **GET** `/api/recipes`
- **Paramètres optionnels**:
  - `limit`: Nombre de recettes à récupérer (défaut: 50)
  - `offset`: Décalage pour la pagination (défaut: 0)
  - `search`: Terme de recherche
- **Réponse**:
```json
{
    "success": true,
    "data": [
        {
            "id": "1",
            "name": "Nom de la recette",
            "description": "Description de la recette",
            "ingredients": ["ingrédient 1", "ingrédient 2"],
            "instructions": "Instructions de préparation",
            "prepTime": 30,
            "difficulty": "easy",
            "image": "url_de_l_image"
        }
    ],
    "total": 50,
    "limit": 50,
    "offset": 0
}
```

### Récupérer une recette spécifique
- **GET** `/api/recipes/<recipe_id>`
- **Réponse**:
```json
{
    "success": true,
    "data": {
        "id": "1",
        "name": "Nom de la recette",
        "description": "Description de la recette",
        "ingredients": ["ingrédient 1", "ingrédient 2"],
        "instructions": "Instructions de préparation",
        "prepTime": 30,
        "difficulty": "easy",
        "image": "url_de_l_image"
    }
}
```

### Rechercher des recettes
- **GET** `/api/recipes/search?q=terme_recherche`
- **Paramètres**:
  - `q`: Terme de recherche (obligatoire)
  - `limit`: Nombre maximum de résultats (défaut: 20)
- **Réponse**:
```json
{
    "success": true,
    "data": [...],
    "query": "terme_recherche",
    "total": 10
}
```

### Récupérer les ingrédients
- **GET** `/api/ingredients`
- **Note**: Fonctionnalité dépendante des capacités de jow-api
- **Réponse**:
```json
{
    "success": true,
    "data": [],
    "message": "Ingredients endpoint - functionality depends on jow-api capabilities"
}
```

## 🔧 Configuration

Le serveur utilise les variables d'environnement suivantes :

- `FLASK_DEBUG`: Mode debug (défaut: True)
- `FLASK_HOST`: Adresse d'écoute (défaut: 0.0.0.0)
- `FLASK_PORT`: Port d'écoute (défaut: 5000)
- `CORS_ORIGINS`: Origines autorisées pour CORS (défaut: http://localhost:3000,http://localhost:5173)

## 📦 Dépendances

- **flask**: Framework web
- **flask-cors**: Support CORS pour les requêtes cross-origin
- **jow-api**: API pour récupérer les recettes de Jow
- **requests**: Client HTTP

## 🐛 Gestion des erreurs

L'API retourne des codes d'erreur HTTP standard :
- `200`: Succès
- `400`: Requête malformée
- `404`: Ressource non trouvée
- `500`: Erreur serveur

Format des erreurs :
```json
{
    "success": false,
    "error": "Message d'erreur",
    "message": "Détails de l'erreur"
}
```

## 📝 Logs

L'API utilise le module `logging` de Python pour les logs avec le niveau INFO.

## 🔄 Prochaines étapes

- [ ] Authentification et autorisation
- [ ] Cache pour améliorer les performances
- [ ] Base de données pour stocker les favoris utilisateur
- [ ] Tests unitaires et d'intégration
- [ ] Documentation Swagger/OpenAPI
