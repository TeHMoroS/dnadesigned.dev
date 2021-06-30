module.exports = {
  mode: 'jit',
  purge: ['src/**/*.html', 'src/**/*.md', 'layouts/**/*.hbs'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      mono: ['ibmvga8', 'monospace'],
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
