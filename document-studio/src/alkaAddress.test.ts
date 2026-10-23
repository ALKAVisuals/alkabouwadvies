import { describe, expect, it } from 'vitest';
import { formatAlkaAddress } from './alkaAddress';

describe('formatAlkaAddress', () => {
  it('keeps street and postal city on compact separate lines', () => {
    expect(formatAlkaAddress('Wassenaarweg 40, 6843 NW Arnhem')).toEqual([
      'Wassenaarweg 40',
      '6843 NW Arnhem',
      'Nederland',
    ]);
  });

  it('joins a postal code and city entered on separate lines', () => {
    expect(formatAlkaAddress('Lange Straatnaam 123\n6843 NW\nArnhem\nNederland')).toEqual([
      'Lange Straatnaam 123',
      '6843 NW Arnhem',
      'Nederland',
    ]);
  });

  it('splits a one-line address before the postal code', () => {
    expect(formatAlkaAddress('Wassenaarweg 40 6843NW Arnhem')).toEqual([
      'Wassenaarweg 40',
      '6843 NW Arnhem',
      'Nederland',
    ]);
  });
});
