# 🚀 Mise en production de FoodApp

Ce document explique **comment notre application FoodApp est mise en ligne** et accessible à tous, en utilisant un vocabulaire simple et des analogies pour rendre les aspects techniques compréhensibles.

---

## 🧩 Objectif

La **mise en production** consiste à **transformer le code écrit par les développeurs** en une **version stable, hébergée sur Internet** et **accessible au public**.

👉 En d’autres mots :  
C’est comme **passer d’une recette écrite dans un cahier (le code)** à **un plat prêt à servir dans un restaurant (le site en ligne)**.

---

## 🏗️ Architecture générale

Notre projet est séparé en **deux grandes parties** :

| Élément | Description | Hébergement |
|----------|--------------|--------------|
| **Frontend** | L’application visible par l’utilisateur : interface, boutons, écrans… | 🖥️ **GitHub Pages** |
| **Backend (API)** | Le cerveau qui gère les données (comptes, recettes, posts...) | ⚙️ **Render.com** |
| **Base de données** | L’endroit où sont stockées les informations utilisateurs | 🗄️ **PostgreSQL (Render)** |

---

## 🌐 Étape 1 — Le Frontend (l’interface utilisateur)

Le **frontend** est développé avec **React Native + Expo**, puis exporté pour le **web**.

### ⚙️ Processus simplifié

1. Le code est écrit et testé sur les ordinateurs des développeurs.
2. Une commande (`npx expo export --platform web`) transforme le code en **fichiers web** (HTML, JS, CSS).
3. Ces fichiers sont envoyés sur **GitHub Pages**, qui les héberge gratuitement.
4. Le site devient accessible sur :  
   👉 `https://hlefevregit.github.io/edhecx42-application-mobil/`

### 🧠 Analogie
> Le frontend, c’est **la vitrine d’un magasin** : jolie, visible, interactive.  
> GitHub Pages, c’est **la rue commerçante** où se trouve la vitrine.

---

## ⚙️ Étape 2 — Le Backend (le cerveau logique)

Le **backend** est une application **Node.js + Express** hébergée sur **Render.com**.  
C’est lui qui gère :
- les comptes utilisateurs,
- les connexions/déconnexions,
- les données des recettes, frigo, posts...

### 🔄 Communication entre les deux
Le frontend parle au backend via une **API REST**.  
C’est un peu comme si l’application envoyait des SMS à Render pour demander des infos :

```text
📱 "Render, donne-moi les infos du compte user_123 !"
🧠 "Voici ses données !"
```

### 🌍 Hébergement
L’API est en ligne ici :  
👉 `https://edhecx42-application-mobil.onrender.com/api`

---

## 💾 Étape 3 — La Base de Données

Nous utilisons **PostgreSQL**, une base de données relationnelle.

- Chaque utilisateur, post, commentaire… est enregistré sous forme de **table** (comme un tableau Excel).
- Le backend (Render) se connecte à cette base pour lire ou écrire les informations.

### 🧠 Analogie
> PostgreSQL, c’est **le classeur de fiches clients d’un restaurant**.  
> Chaque fiche contient des infos précises, et le serveur (backend) vient les consulter quand un client se présente.

---

## 🧩 Étape 4 — Les Variables d’Environnement

Ces variables permettent d’adapter l’application selon le contexte (dev, test, prod).  
Par exemple :  
- En local → `http://localhost:3000/api`
- En ligne → `https://edhecx42-application-mobil.onrender.com/api`

👉 On peut imaginer ça comme **changer de GPS selon le trajet** :  
- À la maison (développement), on roule dans un quartier fermé.  
- En production, on circule sur l’autoroute publique.

---

## 🧱 Étape 5 — Le Build et le Déploiement

Une fois tout prêt :
1. On construit (`build`) les fichiers web.
2. On les envoie sur GitHub Pages.
3. On vérifie que tout fonctionne (connexion, API, base de données, affichage).

### 🧠 Analogie
> C’est comme **construire une maison** :
> - Le build = poser les briques.
> - Le déploiement = amener la maison sur le terrain.
> - La vérification = s’assurer que l’eau et l’électricité fonctionnent.

---

## 🔐 Étape 6 — Les Cookies et la Reconnexion

Quand un utilisateur se connecte, un **cookie** est sauvegardé dans son navigateur.  
Cela lui permet de rester connecté même après avoir fermé la page.

### 🧠 Analogie
> Le cookie, c’est **le tampon VIP** qu’un client garde pour revenir dans le restaurant sans refaire la queue.

---

## 🧰 Glossaire (définitions simplifiées)

| Terme | Définition simple |
|-------|-------------------|
| **Frontend** | L’interface visible par l’utilisateur |
| **Backend** | La logique et le traitement des données |
| **API** | Un moyen pour deux programmes de communiquer |
| **Base de données** | L’endroit où sont stockées les informations |
| **Node.js** | Un moteur qui fait tourner le code côté serveur |
| **Express** | Un cadre simplifié pour construire des APIs |
| **Render.com** | Un service d’hébergement de backend |
| **GitHub Pages** | Un service d’hébergement de sites statiques (frontend) |
| **Prisma** | Un outil pour interagir avec la base de données |
| **PostgreSQL** | Une base de données fiable et robuste |
| **Build** | La compilation finale du code prêt à être mis en ligne |
| **Déploiement** | L’action d’envoyer le projet sur Internet |
| **CORS** | Un système de sécurité entre frontend et backend |
| **Cookies** | Des petits fichiers qui gardent la session utilisateur |
| **ENV (variables d’environnement)** | Des réglages invisibles qui changent selon le contexte (dev/prod) |

---

## 🏁 En résumé

| Élément | Outil | Rôle |
|----------|--------|------|
| **Frontend** | Expo + React Native + GitHub Pages | Interface de l’app |
| **Backend** | Node.js + Express + Render | Traitement et logique |
| **Base de données** | PostgreSQL | Stockage des données |
| **Déploiement** | Expo export + Render auto-deploy | Mise en ligne |
| **Connexion entre les deux** | API REST sécurisée (CORS activé) | Communication fluide |

---

## 💬 En une phrase simple

> “Le frontend est la **vitrine** hébergée sur **GitHub Pages**,  
> le backend est le **cerveau** hébergé sur **Render**,  
> et la base de données est le **carnet de notes** hébergé sur **Render PostgreSQL**.”

---

# 🗣️ Présentation orale – mise en production devant le jury

## 🎯 Ce que nous devons transmettre
L’objectif n’est pas de rentrer dans les détails techniques, mais de montrer :
1. Qu’on a compris comment notre application est hébergée et reliée.
2. Qu’on a fait des choix cohérents entre coût, fiabilité et simplicité.
3. Qu’on sait diagnostiquer et résoudre les problèmes de mise en ligne.

---

## 🧠 Ce que l’équipe peut dire à l’oral

> “Pour la mise en production, notre priorité a été d’avoir une solution **gratuite, stable et accessible en ligne rapidement**.  
> Nous avons donc séparé notre projet en deux parties :
> - **Le frontend** (l’interface utilisateur), déployé sur **GitHub Pages**, un service très fiable pour héberger du code statique.  
> - **Le backend** (la logique et les données), hébergé sur **Render**, qui nous permet d’exécuter notre serveur Node.js et de connecter une base de données PostgreSQL.
>
> Cette séparation nous permet d’avoir une **architecture claire** : le front interagit avec le back via une **API sécurisée**.  
> Cela facilite la maintenance, le débogage, et nous permet d’évoluer facilement (par exemple ajouter de nouvelles fonctionnalités sans tout redéployer).”

---

## 🧩 Points clés à mentionner
- Variables d’environnement configurées pour différencier le mode local et production.  
- Gestion du **CORS** pour autoriser uniquement notre frontend à communiquer avec Render.  
- Déploiement simple : `npx expo export --platform web` + push sur GitHub Pages.  
- Render redémarre automatiquement le serveur si nécessaire.  
- La base PostgreSQL est hébergée sur le même environnement que le backend (performance).  
- Un fichier `.nojekyll` empêche GitHub de bloquer certains fichiers internes (`_expo/`).

---

## ❓ Questions possibles du jury et réponses

**🟢 Pourquoi Render et GitHub Pages ?**  
> Render est simple, gratuit pour Node.js et PostgreSQL, et fiable.  
> GitHub Pages s’intègre parfaitement à notre dépôt Git et héberge le front statique.

**🟢 Pourquoi séparer frontend et backend ?**  
> Pour avoir une architecture claire, moderne et plus sécurisée.  
> Cela permet aussi de réutiliser le backend avec d’autres applis (mobile native par exemple).

**🟢 Comment communiquent-ils ?**  
> Par une API REST en HTTPS, avec CORS configuré pour n’accepter que notre domaine.

**🟢 Comment les utilisateurs restent connectés ?**  
> Grâce à un cookie ou un token conservé dans le navigateur.

**🟢 Et si Render "dort" ?**  
> Sur l’offre gratuite, le serveur s’endort après une période d’inactivité,  
> mais il se réveille automatiquement au premier accès. Cela cause juste un petit délai.

**🟢 Quelles améliorations futures ?**  
> - Ajouter un système CI/CD pour un déploiement automatisé.  
> - Utiliser un domaine personnalisé (ex. `foodapp.fr`).  
> - Passer sur une offre payante Render pour éviter les délais.  
> - Ajouter un CDN pour les images.

---

## 🧭 En résumé pour l’oral
> “Notre mise en production repose sur une architecture claire et moderne :  
> - Un **frontend statique** sur GitHub Pages,  
> - Un **backend dynamique** sur Render,  
> - Une **base PostgreSQL** connectée à ce backend.  
> Ce choix nous offre un bon équilibre entre **simplicité, stabilité et scalabilité**.”

---

## ⚡ Pitch express (si le temps presse)

> “Nous avons mis en production FoodApp avec une architecture moderne et efficace :  
> le **frontend** est hébergé sur **GitHub Pages**,  
> le **backend** et la **base de données** sur **Render**.  
> Cette approche gratuite et modulaire nous garantit stabilité, sécurité et évolutivité.”

---
