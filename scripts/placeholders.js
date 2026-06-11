import { toCamelCase } from './aem.js';

/**
 * Resolves the language folder from the page path for placeholder lookup.
 * Paths like /en/page or /de/page return the locale segment; otherwise 'default'.
 * @returns {string} Language folder name or 'default' for root placeholders
 */
export function getLanguagePath() {
  const segments = window.location.pathname
    .split('/')
    .filter((segment) => segment && !segment.includes('.'));
  const [first] = segments;
  if (first && /^[a-z]{2}(-[a-z]{2})?$/i.test(first)) {
    return first;
  }
  return 'default';
}

/**
 * Gets placeholders object for a language folder.
 * @param {string} [prefix] Location of placeholders ('default' for root)
 * @returns {Promise<object>} Placeholders keyed in camelCase
 */
export async function fetchPlaceholders(prefix = 'default') {
  window.placeholders = window.placeholders || {};
  if (!window.placeholders[prefix]) {
    window.placeholders[prefix] = new Promise((resolve) => {
      const { codeBasePath } = window.hlx;
      const url = prefix === 'default'
        ? `${codeBasePath}/placeholders.json`
        : `${codeBasePath}/${prefix}/placeholders.json`;
      fetch(url)
        .then((resp) => (resp.ok ? resp.json() : {}))
        .then((json) => {
          const placeholders = {};
          json.data
            ?.filter((placeholder) => placeholder.Key)
            .forEach((placeholder) => {
              placeholders[toCamelCase(placeholder.Key)] = placeholder.Text;
            });
          window.placeholders[prefix] = placeholders;
          resolve(window.placeholders[prefix]);
        })
        .catch(() => {
          window.placeholders[prefix] = {};
          resolve(window.placeholders[prefix]);
        });
    });
  }
  return window.placeholders[prefix];
}
