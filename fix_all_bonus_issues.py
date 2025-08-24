import json
import re

def fix_all_bonus_issues(bonus_text):
    """Corrige tous les problèmes de formatage des bonus"""
    
    # Corriger les bonus collés comme "Défense 50100%"
    bonus_text = re.sub(r'(\w+ \d+)(\d+)(%)', r'\1\n\2 \3', bonus_text)
    
    # Corriger les espaces mal placés avant les chiffres
    bonus_text = re.sub(r'(\w+)\s+(\d+)', r'\1 \2', bonus_text)
    
    # Corriger les espaces avant les pourcentages
    bonus_text = re.sub(r'(\d+)(%)', r'\1 \2', bonus_text)
    
    # Corriger les espaces avant les points
    bonus_text = re.sub(r'(\d+)(\.)', r'\1 \2', bonus_text)
    
    # Nettoyer les doubles espaces et retours à la ligne
    bonus_text = re.sub(r'\n+', r'\n', bonus_text)
    bonus_text = re.sub(r' +', r' ', bonus_text)
    
    # Nettoyer les espaces en début et fin
    bonus_text = bonus_text.strip()
    
    return bonus_text

# Lire le fichier JSON
with open('public/pictofr_new.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Corriger le formatage de chaque bonus
for item in data:
    if 'bonus' in item:
        item['bonus'] = fix_all_bonus_issues(item['bonus'])

# Réécrire le fichier avec le formatage corrigé
with open('public/pictofr_new.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Tous les problèmes de formatage des bonus ont été corrigés pour {len(data)} objets")
print("Corrections appliquées :")
print("- Bonus collés séparés (ex: Défense 50100% -> Défense 50\n100%)")
print("- Espaces mal placés corrigés")
print("- Formatage des pourcentages et points amélioré")
print("- Nettoyage général du formatage")
