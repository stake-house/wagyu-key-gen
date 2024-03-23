/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tw-",
  content: ['./src/react/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        gray1: "#F1F6FE",
        gray2: "#E3EBF7",
        gray3: "#d0dae8",
        gray4: "#ACBED5",
        darkGray: "#A9A9A9",
        textDark: "#0B1E58",
        primaryBlue: "#3366FF",
        primaryBlueDark: "#174BE6",
        darkBlue: "#0f4c75",
        mediumBlue: "#3282b8",
        lightBlue: "#bbe1fa",
        white: "#FFFFFF",
        red: "#fa1e0e",
        lightGreen: "#52b788",
        background: "#1B262C",
        backgroundLight: "#354D5A",
        buttonColor: "#bbe1fa",
        buttonHover: "#52b788",
        heading:  "#3282b8",
        mainContent: "#d0dae8",
        mainContentAlert: "#fa1e0e",
        black: "#000000",
        disabledButton: "#0f4c75",
        yellow: "#FFA600",
        orange: "#F2994A",
      }
    },
  },
  plugins: [],
}
