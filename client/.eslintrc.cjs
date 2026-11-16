module.exports = {
  env: { browser: true, es2020: true },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  plugins: ['react'],
  rules: {
    'no-undef': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-vars': 'error'
  }
};
