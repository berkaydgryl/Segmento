/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(240 10% 3.9%)",
                foreground: "hsl(0 0% 98%)",
                card: "hsl(240 10% 6%)",
                border: "hsl(240 3.7% 15.9%)",
                input: "hsl(240 3.7% 15.9%)",
                primary: {
                    DEFAULT: "hsl(142.1 70.6% 45.3%)",
                    foreground: "hsl(144.9 80.4% 10%)",
                },
                secondary: {
                    DEFAULT: "hsl(240 3.7% 15.1%)",
                    foreground: "hsl(0 0% 98%)",
                },
                muted: {
                    DEFAULT: "hsl(240 3.7% 15.9%)",
                    foreground: "hsl(240 5% 64.9%)",
                },
                accent: {
                    DEFAULT: "hsl(240 3.7% 15.9%)",
                    foreground: "hsl(0 0% 98%)",
                },
            },
            borderRadius: {
                lg: "0.5rem",
                md: "calc(0.5rem - 2px)",
                sm: "calc(0.5rem - 4px)",
            },
            animation: {
                "pulse-fast": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }
        },
    },
    plugins: [],
}
