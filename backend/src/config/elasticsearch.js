import { Client } from '@elastic/elasticsearch';

let client = null;

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

export function isElasticsearchConfigured() {
  return Boolean(process.env.ELASTICSEARCH_URL || process.env.ELASTICSEARCH_CLOUD_ID);
}

export function getSearchIndexPrefix() {
  return process.env.ELASTICSEARCH_INDEX_PREFIX || 'soco';
}

export const SEARCH_INDEXES = {
  products: `${getSearchIndexPrefix()}_products`,
  users: `${getSearchIndexPrefix()}_users`,
  posts: `${getSearchIndexPrefix()}_posts`,
  groups: `${getSearchIndexPrefix()}_groups`,
  ragDocuments: `${getSearchIndexPrefix()}_rag_documents`,
};

export function getElasticsearchClient() {
  if (!isElasticsearchConfigured()) return null;
  if (client) return client;

  const options = process.env.ELASTICSEARCH_CLOUD_ID
    ? { cloud: { id: process.env.ELASTICSEARCH_CLOUD_ID } }
    : { node: process.env.ELASTICSEARCH_URL };

  if (process.env.ELASTICSEARCH_API_KEY) {
    options.auth = { apiKey: process.env.ELASTICSEARCH_API_KEY };
  } else if (process.env.ELASTICSEARCH_USERNAME || process.env.ELASTICSEARCH_PASSWORD) {
    options.auth = {
      username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD || '',
    };
  }

  if (process.env.ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED !== undefined) {
    options.tls = {
      rejectUnauthorized: toBoolean(process.env.ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED, true),
    };
  }

  client = new Client(options);
  return client;
}
