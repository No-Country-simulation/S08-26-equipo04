/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#17252A',
        'text-secondary': '#405157',
        'text-muted': '#6B797F',
        canvas: '#F4F7F6',
        surface: '#FFFFFF',
        border: '#DCE3E0',
        primary: {
          DEFAULT: '#0D6C7C',
          tint: '#E0F0F2',
        },
        success: {
          DEFAULT: '#287758',
          light: '#E5F3EC',
        },
        warning: {
          DEFAULT: '#855500',
          light: '#FFF1CF',
        },
        info: {
          DEFAULT: '#2E6D97',
          light: '#E6F0F7',
        },
        error: {
          DEFAULT: '#A43F37',
          light: '#FBEAE8',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '51px', fontWeight: '600' }],
        'h1': ['30px', { lineHeight: '38px', fontWeight: '600' }],
        'h2': ['20px', { lineHeight: '26px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '23px', fontWeight: '400' }],
        'label': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'metadata': ['13px', { lineHeight: '19px', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'lg': '8px',
        'xl': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'modal': '0 4px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
