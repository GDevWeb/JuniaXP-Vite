import { defineConfig } from "vite";
import superPluginDebugger from "./vite-plugin-debugger";

export default defineConfig({
  plugins: [superPluginDebugger()],
});
