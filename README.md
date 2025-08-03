# React + TypeScript + Vite

## 📸 Captures d'écran de l'application

<div align="center">
  <img src="./capturesEcran/aaa1.png" alt="Capture d'écran 1" width="300" style="margin: 10px;">
  <img src="./capturesEcran/aaa2.png" alt="Capture d'écran 2" width="300" style="margin: 10px;">
  <img src="./capturesEcran/aaa3.png" alt="Capture d'écran 3" width="300" style="margin: 10px;">
  <img src="./capturesEcran/aaa4.png" alt="Capture d'écran 4" width="300" style="margin: 10px;">
  <img src="./capturesEcran/aaa5.png" alt="Capture d'écran 5" width="300" style="margin: 10px;">
</div>

---

Ce modèle fournit une configuration minimale pour faire fonctionner React avec Vite, incluant HMR et quelques règles ESLint.

Actuellement, deux plugins officiels sont disponibles :

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) utilise [Babel](https://babeljs.io/) pour le Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) utilise [SWC](https://swc.rs/) pour le Fast Refresh

## Étendre la configuration ESLint

Si vous développez une application de production, nous recommandons de mettre à jour la configuration pour activer les règles de linting basées sur les types :

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Autres configurations...

      // Supprimez tseslint.configs.recommended et remplacez par ceci
      ...tseslint.configs.recommendedTypeChecked,
      // Alternativement, utilisez ceci pour des règles plus strictes
      ...tseslint.configs.strictTypeChecked,
      // Optionnellement, ajoutez ceci pour les règles stylistiques
      ...tseslint.configs.stylisticTypeChecked,

      // Autres configurations...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // autres options...
    },
  },
])
```

Vous pouvez également installer [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) et [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) pour les règles de linting spécifiques à React :

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Autres configurations...
      // Activer les règles de linting pour React
      reactX.configs['recommended-typescript'],
      // Activer les règles de linting pour React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // autres options...
    },
  },
])
```
