# DAQ2630 Cuisine — V3 Supabase

Cette version connecte le prototype à Supabase.

## Ce qui change
- lecture de `recipes`
- lecture des ingrédients via `recipe_ingredients`
- lecture des 9 étapes via `recipe_steps`
- fallback local si Supabase n'est pas joignable
- indicateur visuel `Supabase connecté`

## Variables Vercel requises
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Mise en ligne
Remplacez les fichiers du dépôt GitHub par ceux de cette V3 puis faites un commit.
Vercel redéploiera automatiquement.

## Test
Sur la page Catalogue, l'indicateur doit afficher `Supabase connecté`.
Ensuite, modifier un champ de la recette dans Supabase permettra de vérifier que le site lit bien la base après actualisation.

## Prochaine étape
Espace Admin + Supabase Auth + Supabase Storage pour gérer recettes et photos.
