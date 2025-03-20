module.exports = { 
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", 
    "./components/**/*.{js,ts,jsx,tsx}"
  ], 
  theme: { 
    extend: { 
      fontFamily: {
        sans: ['var(--font-cosmic-grotesk)'],
      },
      keyframes: { 
        "star-movement-top": { 
          "0%": { transform: "translateX(0)" }, 
          "100%": { transform: "translateX(500%)" } 
        }, 
        "star-movement-bottom": { 
          "0%": { transform: "translateX(0)" }, 
          "100%": { transform: "translateX(-500%)" } 
        } 
      }, 
      animation: { 
        "star-movement-top": "star-movement-top 8s linear infinite", 
        "star-movement-bottom": "star-movement-bottom 8s linear infinite" 
      } 
    } 
  } 
}
