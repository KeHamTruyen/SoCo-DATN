import { describe, expect, it } from 'vitest';
import { embedTextLocal } from '../../src/services/elasticsearch.service.js';

function cosineSimilarity(left, right) {
  return left.reduce((sum, item, index) => sum + item * right[index], 0);
}

describe('local RAG embedding', () => {
  it('creates deterministic normalized vectors for Vietnamese text', () => {
    const accented = embedTextLocal('Tư vấn đặt hàng và thanh toán');
    const unaccented = embedTextLocal('Tu van dat hang va thanh toan');
    const repeated = embedTextLocal('Tư vấn đặt hàng và thanh toán');

    expect(accented).toHaveLength(128);
    expect(repeated).toEqual(accented);
    expect(cosineSimilarity(accented, unaccented)).toBeGreaterThan(0.95);

    const magnitude = Math.sqrt(accented.reduce((sum, item) => sum + item * item, 0));
    expect(magnitude).toBeGreaterThan(0.99);
    expect(magnitude).toBeLessThan(1.01);
  });

  it('returns a zero vector for empty text', () => {
    expect(embedTextLocal('').every((item) => item === 0)).toBe(true);
  });
});
