## Architecture finale
```
src/app/
  ├── components/  
    ├── header/
    ├── header-card/
  ├── pages/ 
    ├── home/
    ├── country/
    ├── not-found/
  ├── core/
    ├── services/
    ├── models/
```

## Les composants
Les composants Header et HeaderCard sont des composants réutilisables qui permettent aux pages de créer leur header simplement en leur passant des paramètres.
Le HeaderCard prend un titre et un nombre en paramètres. Il affiche ensuite une carte de données avec ces deux éléments.
Le Header prend un titre et une liste de HeaderCard en paramètres. Il affiche ensuite le titre de la page ainsi que les HeaderCard associées.

Les composants Home, Country et Not-found récupèrent les données dont ils ont besoin depuis le service, utilisent les composants réutilisables et gèrent la page qui leur est associée.

## Le service
Le service centralise les données de l'application. Il fonctionne comme un Singleton, donc n'a qu'une seule instance.
Toutes manipulations des données se font depuis ce service et les différents éléments de l'application récupèrent les données directement depuis celui-ci.

Actuellement, les données sont obtenues depuis un fichier JSON, mais la mise en place de ce service facilite le futur changement de source pour une API, surtout si les données récupérées depuis celle-ci respectent la structure des interfaces créées.