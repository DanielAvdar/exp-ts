// eslint-disable-next-line no-undef
module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml,html,css}': ['prettier --write'],
};
