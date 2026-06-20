/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './*.js',
    './membership-site/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#a855f7',
          hover: '#9333ea',
          glow: 'rgba(168,85,247,0.2)',
          light: 'rgba(168,85,247,0.1)',
          lighter: 'rgba(168,85,247,0.06)'
        },
        ink: {
          900: '#000',
          800: '#0a0a0a',
          700: '#111',
          600: '#161616',
          500: '#1f1f1f',
          400: '#2a2a2a'
        },
        vtext: {
          DEFAULT: '#fafafa',
          muted: '#aaa',
          dim: '#888'
        }
      },
      fontFamily: {
        sans: ['Geist', 'Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Geist', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '12px',
        pill: '100px'
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(168,85,247,0.15)',
        'glow': '0 0 20px rgba(168,85,247,0.2)',
        'glow-lg': '0 0 40px rgba(168,85,247,0.08)'
      },
      letterSpacing: {
        'tight-2': '-0.02em',
        'tight-3': '-0.03em'
      },
      transitionDuration: {
        DEFAULT: '200ms'
      }
    }
  },
  plugins: []
}
