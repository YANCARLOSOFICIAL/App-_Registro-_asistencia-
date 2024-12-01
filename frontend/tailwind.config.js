/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // Incluye el archivo HTML principal
    "./src/**/*.{js,ts,jsx,tsx}", // Incluye todos los archivos de React en src
  ],
  theme: {
    extend: {}, // Aquí puedes personalizar el tema si lo necesitas
  },
  plugins: [], // Plugins opcionales
};
