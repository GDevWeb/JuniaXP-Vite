import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fonction pour ajouter un délai
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
          // Ajouter un délai de 1 seconde avant l'appel API
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
