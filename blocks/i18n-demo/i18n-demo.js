import { fetchPlaceholders } from '../../scripts/placeholders.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function applyName(template, name) {
  if (!template) return '';
  if (!name) {
    return template
      .replaceAll('{name}, ', '')
      .replaceAll('{name} ', '')
      .replaceAll('{name}', '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
  return template.replaceAll('{name}', name);
}

/**
 * loads and decorates the i18n demo block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const {
    i18nDemoTitle,
    i18nDemoGreeting,
    i18nDemoDescription,
    i18nDemoCta,
    i18nDemoLocaleLabel,
  } = placeholders;

  const [guestRow] = [...block.children];
  const guestName = guestRow?.textContent?.trim() || '';

  const panel = document.createElement('div');
  panel.className = 'i18n-demo-panel';
  if (guestRow) moveInstrumentation(guestRow, panel);

  const locale = document.createElement('p');
  locale.className = 'i18n-demo-locale';
  const localeLabel = i18nDemoLocaleLabel || 'Locale';
  locale.textContent = `${localeLabel}: ${lang === 'default' ? 'en (default)' : lang}`;

  const title = document.createElement('h2');
  title.className = 'i18n-demo-title';
  title.textContent = i18nDemoTitle || '[missing: i18n-demo-title]';

  const greeting = document.createElement('p');
  greeting.className = 'i18n-demo-greeting';
  greeting.textContent = applyName(i18nDemoGreeting, guestName) || '[missing: i18n-demo-greeting]';

  const description = document.createElement('p');
  description.className = 'i18n-demo-description';
  description.textContent = i18nDemoDescription || '[missing: i18n-demo-description]';

  const actions = document.createElement('p');
  actions.className = 'i18n-demo-actions';
  const cta = document.createElement('a');
  cta.className = 'button primary';
  cta.href = '#';
  cta.textContent = i18nDemoCta || '[missing: i18n-demo-cta]';
  actions.append(cta);

  panel.append(locale, title, greeting, description, actions);
  block.replaceChildren(panel);
}
