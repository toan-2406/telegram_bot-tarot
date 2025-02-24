/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          primary: '#2C1810', // Deep brown
          secondary: '#8B4513', // Saddle brown
          accent: '#D4AF37', // Metallic gold
          light: '#FDF5E6', // Old lace
          dark: '#1C1810', // Dark vintage brown
          paper: '#F5E6D3', // Antique paper
          gold: '#FFD700', // Gold
          cream: '#FFFDD0', // Cream
          sepia: '#704214', // Sepia
          rust: '#B7410E', // Rust
        },
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'cormorant': ['Cormorant Garamond', 'serif'],
      },
      boxShadow: {
        'vintage': '0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(44, 24, 16, 0.1)',
        'vintage-hover': '0 4px 8px rgba(0, 0, 0, 0.2), 0 12px 24px rgba(44, 24, 16, 0.15)',
      },
      backgroundImage: {
        'vintage-pattern': "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
      },
    },
  },
  plugins: [],
}