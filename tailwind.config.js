/** @type {import('tailwindcss').Config} */
export const content = [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
    extend: {
        typography: {
            DEFAULT: {
                css: {
                    h1: { fontSize: '2.25rem', fontWeight: '700' },
                    h2: { fontSize: '1.875rem', fontWeight: '600' },
                    h3: { fontSize: '1.5rem', fontWeight: '600' },
                    a: { color: '#3b82f6', textDecoration: 'underline' },
                },
            },
        },
    },
};
export const plugins = [require('@tailwindcss/typography')];
