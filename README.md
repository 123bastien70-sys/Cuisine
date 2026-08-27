# DAQ2630 Cuisine — V4 Admin

Cette version ajoute une entrée sécurisée `/admin`.

## Fonctionnel
- Connexion Supabase Auth e-mail / mot de passe
- Vérification du rôle `admin` dans `profiles`
- Refus d'accès aux comptes non administrateurs
- Tableau de bord
- Liste des recettes
- Statistiques publiées / brouillons
- Déconnexion
- Réécriture Vercel pour `/admin`

## Mise en ligne
Décompresser puis remplacer les fichiers du dépôt GitHub par cette V4.
Faire un commit. Vercel redéploiera automatiquement.

## Accès
`https://votre-site.vercel.app/admin`

## Prochaine étape
V5 :
- édition complète des recettes
- création / suppression
- gestion ingrédients
- réorganisation des étapes
- Supabase Storage
- ajout / remplacement / suppression des photos
