# Super Plugin Vite - L'IA qui Débugue vos Erreurs JS ! 🚀

Ce plugin Vite analyse le code JavaScript pour détecter les erreurs pendant le processus de build et utilise l'API OpenAI (ChatGPT) pour suggérer des solutions. Les réponses sont affichées dans le terminal, stockées dans des fichiers temporaires, et peuvent également apparaître dans la console des DevTools du navigateur.

---

## 📝 Fonctionnalités

1. **Analyse Automatique des Erreurs :**  
   Le plugin analyse votre code pendant le build et capture les erreurs JavaScript.

2. **Débogage avec ChatGPT :**  
   Les erreurs sont envoyées à l'API OpenAI avec un prompt contenant le message d'erreur et le code concerné.

3. **Affichage des Solutions :**
   - Affiche les suggestions de ChatGPT directement dans le terminal.
   - Stocke la réponse dans un fichier temporaire.
   - Affiche la solution dans les DevTools du navigateur.

---

## 🛠️ Installation

### 1. Prérequis

- **Node.js** et **pnpm** doivent être installés sur votre machine.
- Un compte OpenAI avec une clé API valide.

### 2. Créer un Projet Vite

```bash
pnpm create vite super-plugin-vite
cd super-plugin-vite
pnpm install
```

### 3. Installer les Dépendances

```bash
pnpm add openai dotenv
pnpm add -D vite
```

---

## ⚙️ Configuration

### 1. Ajouter le Plugin

Créez le fichier `vite-plugin-debugger.js` à la racine du projet :

```javascript
import "dotenv/config";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function superPluginDebugger() {
  return {
    name: "vite-plugin-debugger",
    async transform(code, id) {
      try {
        new Function(code);
      } catch (err) {
        console.error(`Erreur détectée dans le fichier ${id}:`, err.message);

        const prompt = `Voici une erreur JavaScript : ${err.message}\nVoici le code :\n${code}\nComment résoudre cette erreur ?`;

        try {
          await delay(1000);

          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
          });

          const solution = response.choices[0].message.content;
          console.log("Réponse de ChatGPT :", solution);

          const errorFileName = path.basename(id).replace(".js", "");
          const outputDir = path.resolve("debug-responses");
          const outputPath = path.join(outputDir, `${errorFileName}-error.txt`);

          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
          }

          fs.writeFileSync(outputPath, solution, "utf-8");
        } catch (apiError) {
          console.error(
            "Erreur lors de la communication avec OpenAI :",
            apiError.message
          );
        }
      }
      return { code };
    },
  };
}
```

### 2. Configurer Vite

Créez ou modifiez le fichier `vite.config.js` :

```javascript
import { defineConfig } from "vite";
import superPluginDebugger from "./vite-plugin-debugger";

export default defineConfig({
  plugins: [superPluginDebugger()],
});
```

### 3. Ajouter la Clé API OpenAI

Créez un fichier `.env` à la racine du projet :

```plaintext
OPENAI_API_KEY=your_openai_api_key
```

---

## 🚀 Utilisation

Lancez le projet avec :

```bash
pnpm run dev
```

Pendant le build, si une erreur JavaScript est détectée :

1. **Le terminal affiche :**

   - Le message d'erreur.
   - La réponse de ChatGPT.
   - Le chemin du fichier où la solution est sauvegée.

2. **Les solutions sont stockées dans le dossier `debug-responses`.**

3. **Bonus :** Les solutions peuvent être affichées dans les DevTools du navigateur via `console.log()`.

---

## ⚠️ Limitations

- **Quota OpenAI :** Assurez-vous de ne pas dépasser votre quota d'API OpenAI.
- **Délai d'Appel :** Un délai de 1 seconde est ajouté entre les requêtes pour éviter un dépassement de quota.

---

## 📄 Licence

MIT License.

---

## 💬 Contact

Pour des questions ou des suggestions, n'hésitez pas à ouvrir une issue !

---

🎉 **Happy Debugging avec Vite et ChatGPT !**

---

### Instructions pour le Déploiement

- Ajoutez le fichier `.env` à votre `.gitignore` pour éviter de versionner votre clé API.
- Vous pouvez personnaliser le délai entre les appels API et le modèle utilisé (`gpt-3.5-turbo`, `gpt-4`, etc.).
