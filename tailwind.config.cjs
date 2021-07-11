module.exports = {
  mode: 'jit',
  purge: ['src/content/**/*.html', 'src/content/**/*.md', 'src/layouts/**/*.hbs'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      mono: ['ibmvga8', 'monospace'],
    },
    colors: {
      'transparent': 'transparent',
      'black': 'var(--color-black)',
      'blue': 'var(--color-blue)',
      'green': 'var(--color-green)',
      'cyan': 'var(--color-cyan)',
      'red': 'var(--color-red)',
      'magenta': 'var(--color-magenta)',
      'brown': '#var(--color-brown)',
      'light-gray': 'var(--color-light-gray)',
      'dark-gray': 'var(--color-dark-gray)',
      'light-blue': 'var(--color-light-blue)',
      'light-green': 'var(--color-light-green)',
      'light-cyan': 'var(--color-light-cyan)',
      'light-red': 'var(--color-light-red)',
      'light-magenta': 'var(--color-light-magenta)',
      'yellow': 'var(--color-yellow)',
      'white': 'var(--color-white)',
    },
    fontSize: {
      'base': ['1rem', '1rem'],
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
