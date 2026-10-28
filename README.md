# Sirata Gueye · Portfolio

Site personnel de Sirata Gueye, analyste financière (crédit et financement d'entreprise).

Site en ligne : https://sirata-gueye.vercel.app/
Version anglaise : https://sirata-gueye.vercel.app/?lang=en

## Structure

```
index.html          Contenu du site (français et anglais)
css/style.css       Mise en page
js/main.js          Choix de la langue
assets/docs/        CV en PDF
assets/images/      Icône et image de partage
```

## Modifier le contenu

Chaque texte existe en deux versions dans `index.html` :

```html
<span lang="fr">Texte français</span><span lang="en">English text</span>
```

Modifier les deux, puis publier :

```
git add .
git commit -m "Mise à jour du contenu"
git push
```

Le site se met à jour en une à deux minutes.
