from jow_api import Jow
import asyncio
import json

async def test_jow_api():
    jow = Jow()
    
    # Test des méthodes disponibles
    print("Méthodes disponibles:")
    methods = [attr for attr in dir(jow) if not attr.startswith('_') and callable(getattr(jow, attr))]
    print(methods)
    
    # Test de la méthode search
    try:
        print("\n--- Test de la méthode search ---")
        result = jow.search('poulet', limit=2)
        print(f"Type du résultat: {type(result)}")
        print(f"Résultat: {result}")
        
        # Si c'est une liste, examiner le premier élément
        if isinstance(result, list) and len(result) > 0:
            first_recipe = result[0]
            print(f"\nPremière recette - Type: {type(first_recipe)}")
            print(f"Attributs: {[attr for attr in dir(first_recipe) if not attr.startswith('_')]}")
            
            # Essayer d'accéder aux propriétés communes
            try:
                print(f"ID: {getattr(first_recipe, 'id', 'N/A')}")
                print(f"Name: {getattr(first_recipe, 'name', 'N/A')}")
                print(f"Title: {getattr(first_recipe, 'title', 'N/A')}")
                print(f"Description: {getattr(first_recipe, 'description', 'N/A')}")
                print(f"Ingredients: {getattr(first_recipe, 'ingredients', 'N/A')}")
            except Exception as e:
                print(f"Erreur lors de l'accès aux propriétés: {e}")
    
    except Exception as e:
        print(f"Erreur avec search: {e}")

if __name__ == "__main__":
    asyncio.run(test_jow_api())
