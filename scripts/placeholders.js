/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { toCamelCase } from './aem.js';

/**
 * Resolves the locale folder from the page path (e.g. /en-in/home -> /en-in).
 * @returns {string} Locale path prefix or 'default' for site root
 */
export function getLanguagePath() {
  const segments = window.location.pathname
    .split('/')
    .filter((segment) => segment && !segment.includes('.'));
  const [first] = segments;
  if (first && /^[a-z]{2}(-[a-z]{2})?$/i.test(first)) {
    return `/${first}`;
  }
  return 'default';
}

/**
 * Gets placeholders object.
 * @param {string} [prefix] Location of placeholders; defaults to locale from pathname
 * @returns {Promise<object>} Placeholders keyed in camelCase
 */
// eslint-disable-next-line import/prefer-default-export
export async function fetchPlaceholders(prefix = getLanguagePath()) {
  window.placeholders = window.placeholders || {};
  if (!window.placeholders[prefix]) {
    window.placeholders[prefix] = new Promise((resolve) => {
      const { codeBasePath } = window.hlx;
      const url = prefix === 'default'
        ? `${codeBasePath}/placeholders.json`
        : `${codeBasePath}${prefix}/placeholders.json`;
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
