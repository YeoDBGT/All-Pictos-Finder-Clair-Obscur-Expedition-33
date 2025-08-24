import json

# Lire le fichier JSON
with open('public/pictofr_new.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Créer une nouvelle liste avec les objets réorganisés
reordered_data = []
for item in data:
    # Créer un nouvel objet avec l'id en premier
    new_item = {
        "id": item["id"],
        "name": item["name"],
        "zone": item["zone"],
        "niveau": item["niveau"],
        "bonus": item["bonus"],
        "emplacement": item["emplacement"]
    }
    reordered_data.append(new_item)

# Réécrire le fichier avec les objets réorganisés
with open('public/pictofr_new.json', 'w', encoding='utf-8') as f:
    json.dump(reordered_data, f, indent=2, ensure_ascii=False)

print(f"Fichier réorganisé avec {len(reordered_data)} objets - "
      f"champ 'id' placé au début de chaque objet")
