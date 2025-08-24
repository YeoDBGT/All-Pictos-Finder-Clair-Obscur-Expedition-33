import json
import re

def fix_bonus_formatting_v2(bonus_text):
    """Corrige le formatage du champ bonus en corrigeant les espaces mal placés et les bonus collés"""
    
    # Corriger les espaces mal placés avant les chiffres
    bonus_text = re.sub(r'(\w+)\s+(\d+)', r'\1 \2', bonus_text)
    
    # Corriger les bonus collés comme "Défense 50100%"
    bonus_text = re.sub(r'(\w+ \d+)(\d+)(%)', r'\1\n\2 \3', bonus_text)
    
    # Corriger les espaces avant les pourcentages
    bonus_text = re.sub(r'(\d+)(%)', r'\1 \2', bonus_text)
    
    # Ajouter des retours à la ligne pour les principaux bonus
    bonus_text = re.sub(r'(Défense \d+)', r'\1\n', bonus_text)
    bonus_text = re.sub(r'(Vitesse \d+)', r'\1\n', bonus_text)
    bonus_text = re.sub(r'(Santé \d+)', r'\1\n', bonus_text)
    bonus_text = re.sub(r'(Chances de critique \d+ %)', r'\1\n', bonus_text)
    
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
        item['bonus'] = fix_bonus_formatting_v2(item['bonus'])

# Réécrire le fichier avec le formatage corrigé
with open('public/pictofr_new.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Formatage des bonus corrigé pour {len(data)} objets")
print("Corrections appliquées :")
print("- Espaces mal placés corrigés")
print("- Bonus collés séparés")
print("- Formatage des pourcentages amélioré")
