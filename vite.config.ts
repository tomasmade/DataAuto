import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Plugin pour renommer index.css en content.css, copier popup.html et copier le manifest
const postBuildPlugin = () => {
  return {
    name: 'post-build-plugin',
    closeBundle() {
      const distPath = resolve(__dirname, 'dist');
      
      // 1. Vérifier que content.css existe (Vite peut le générer directement)
      const assetsDir = resolve(distPath, 'assets');
      const contentCSS = resolve(distPath, 'assets/content.css');
      
      // Chercher index.css, shared.css, ou content.css
      let sourceCSS: string | null = null;
      const indexCSS = resolve(assetsDir, 'index.css');
      const sharedCSS = resolve(assetsDir, 'shared.css');
      
      if (existsSync(contentCSS)) {
        // content.css existe déjà, pas besoin de renommer
        console.log('✅ content.css existe déjà');
      } else if (existsSync(indexCSS)) {
        sourceCSS = indexCSS;
        copyFileSync(sourceCSS, contentCSS);
        console.log(`✅ CSS renommé: ${sourceCSS.split('/').pop()} → assets/content.css`);
      } else if (existsSync(sharedCSS)) {
        sourceCSS = sharedCSS;
        copyFileSync(sourceCSS, contentCSS);
        console.log(`✅ CSS renommé: ${sourceCSS.split('/').pop()} → assets/content.css`);
      } else {
        console.warn('⚠️ Aucun fichier CSS trouvé (content.css, index.css ou shared.css)');
      }
      
      // 2. Copier popup.html dans dist et ajuster le chemin du script
      const popupHtmlSource = resolve(__dirname, 'popup.html');
      const popupHtmlDest = resolve(distPath, 'popup.html');
      
      if (existsSync(popupHtmlSource)) {
        let popupContent = readFileSync(popupHtmlSource, 'utf-8');
        // Ajuster le chemin du script pour pointer vers assets/popup.js
        popupContent = popupContent.replace(
          'src="/popup.tsx"',
          'src="assets/popup.js"'
        );
        writeFileSync(popupHtmlDest, popupContent, 'utf-8');
        console.log('✅ popup.html copié et mis à jour');
      }
      
      // 3. Copier le manifest.json et ajouter les chunks partagés si nécessaire
      const rootManifest = resolve(__dirname, 'manifest.json');
      const publicManifest = resolve(__dirname, 'public/manifest.json');
      const distManifest = resolve(distPath, 'manifest.json');
      
      let manifestContent = '';
      if (existsSync(rootManifest)) {
        manifestContent = readFileSync(rootManifest, 'utf-8');
      } else if (existsSync(publicManifest)) {
        manifestContent = readFileSync(publicManifest, 'utf-8');
      }
      
      if (manifestContent) {
        // Chercher les fichiers shared-*.js dans dist/assets
        const assetsDir = resolve(distPath, 'assets');
        const sharedFiles: string[] = [];
        if (existsSync(assetsDir)) {
          try {
            const files = readdirSync(assetsDir);
            files.forEach((file: string) => {
              if (file.startsWith('shared-') && file.endsWith('.js')) {
                sharedFiles.push(`assets/${file}`);
              }
            });
          } catch (e) {
            console.warn('⚠️ Erreur lors de la lecture du dossier assets:', e);
          }
        }
        
        // Plus besoin de gérer les chunks partagés - tout est dans content.js
        
        writeFileSync(distManifest, manifestContent, 'utf-8');
        console.log('✅ Manifest.json copié et mis à jour');
      }
      
      
    }
  };
};

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement depuis le fichier .env (s'il existe)
  // Le 3ème argument '' permet de charger TOUTES les variables, pas seulement celles commençant par VITE_
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), postBuildPlugin()],
    // Cette section remplace process.env.DISABLE_GEMINI et process.env.API_BASE_URL par les vraies valeurs lors du build
    // Note: La clé API Gemini n'est plus injectée ici, elle est gérée côté serveur
    define: {
      'process.env.DISABLE_GEMINI': JSON.stringify(env.DISABLE_GEMINI || 'false'),
      'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL || 'http://localhost:3000'),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          content: resolve(__dirname, 'content_entry.tsx'),
          popup: resolve(__dirname, 'popup.tsx'),
        },
        // Permettre à Rollup de modifier les signatures d'entrée pour mieux bundler
        preserveEntrySignatures: false,
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name].[ext]',
          format: 'es',
          // Forcer tout dans content.js (pas de chunks partagés)
          // Chrome ne peut pas résoudre les imports relatifs entre chunks
          manualChunks: undefined
        }
      }
    }
    }
  };
});