import { describe, expect, it } from 'vitest';
import { mergeImportedLines, parseQuoteText } from './quoteImport';
import type { ServiceLine } from './types';

describe('offerte-import', () => {
  it('leest klant-, project-, regel- en btw-gegevens uit een tabel', () => {
    const result = parseQuoteText([
      'Offerte aan',
      'Ruben van Rhee',
      'Wassenaarweg 40',
      '6843 NW Arnhem',
      'Nederland',
      '15-10-2026',
      'Project Dakopbouw',
      'OMSCHRIJVING',
      'Vergunningsaanvraag en tekenwerk',
      'Omschrijving\tAantal\tPrijs\tTotaal',
      'Bouwtekeningen\t2\t€ 250,00\t€ 500,00',
      'Korting\t1\t€ 50,00\t€ 50,00',
      'Subtotaal\t€ 450,00',
      'Btw (21%)\t€ 94,50',
      'Totaal incl. btw\t€ 544,50',
    ]);

    expect(result.client).toBe('Ruben van Rhee');
    expect(result.clientAddress).toBe('Wassenaarweg 40\n6843 NW Arnhem\nNederland');
    expect(result.project).toBe('Dakopbouw');
    expect(result.description).toBe('Vergunningsaanvraag en tekenwerk');
    expect(result.lines).toEqual([
      { name: 'Bouwtekeningen', description: 'Bouwtekeningen', quantity: 2, unitPrice: 250 },
      { name: 'Korting', description: 'Korting', quantity: 1, unitPrice: -50 },
    ]);
    expect(result.vatRate).toBe(21);
    expect(result.warnings).toEqual([]);
  });

  it('leest het geadresseerdeblok naast de offertenummerkolom', () => {
    const result = parseQuoteText([
      'Offerte aan\tOFFERTENUMMER',
      'Ruben van Rhee\tO-18102026-A',
      'Wassenaarweg 40',
      '6843 NW Arnhem',
      'Nederland',
      '18-10-2026',
      'Project Dakopbouw',
      'Subtotaal\t€ 100,00',
      'Btw (21%)\t€ 21,00',
      'Totaal incl. btw\t€ 121,00',
    ]);
    expect(result.client).toBe('Ruben van Rhee');
    expect(result.clientAddress).toBe('Wassenaarweg 40\n6843 NW Arnhem\nNederland');
  });

  it('neemt een pakketprijs eenmaal over', () => {
    const result = parseQuoteText([
      'Opdrachtgever: Studio Noord',
      'Projectnaam: Interieur woning',
      'Afgesproken totaalprijs € 1.250,00',
      'Btw 21%',
    ]);
    expect(result.priceMode).toBe('package');
    expect(result.packagePrice).toBe(1250);
    expect(result.lines).toEqual([]);
  });

  it('bewaart dienstregels bij een totaalpakketprijs zonder dubbele optelling', () => {
    const result = parseQuoteText([
      'Opdrachtgever: Studio Noord',
      'Projectnaam: Interieur woning',
      'Omschrijving\tAantal',
      'Interieurrenders\t4',
      '3D-vloerplannen\t1',
      'Subtotaal\t€ 1.250,00',
      'Btw (21%)\t€ 262,50',
      'Totaal incl. btw\t€ 1.512,50',
    ]);
    expect(result.priceMode).toBe('package');
    expect(result.packagePrice).toBe(1250);
    expect(result.lines).toHaveLength(2);
    expect(result.lines[0]).toMatchObject({ name: 'Interieurrenders', quantity: 4, unitPrice: 0 });
  });

  it('koppelt bekende diensten en bewaart onbekende regels', () => {
    const existing: ServiceLine[] = [{ id: 'a', name: 'Bouwtekeningen', description: 'Bouwtekeningen', selected: false, quantity: 1, unitPrice: 0 }];
    const result = mergeImportedLines(existing, [
      { name: 'Bouwtekeningen', description: 'Uitwerking bouwtekeningen', quantity: 2, unitPrice: 300 },
      { name: 'Projectkorting', description: 'Projectkorting', quantity: 1, unitPrice: -75 },
    ], () => 'nieuw');
    expect(result[0]).toMatchObject({ id: 'a', selected: true, quantity: 2, unitPrice: 300 });
    expect(result[1]).toMatchObject({ id: 'nieuw', name: 'Projectkorting', selected: true, custom: true, unitPrice: -75 });
  });

  it('kan bedragen en vervolgregels uit een afwijkende Word-tabel herstellen', () => {
    const result = parseQuoteText([
      'Opdrachtgever:\tSander Klein Hesselink',
      'Projectadres:\tSpijkerhofweg 10',
      '6566CM Millingen aan de Rijn',
      'Omschrijving opdracht',
      'Constructieve berekening en beoordeling.',
      'Omschrijving\tAantal\tPrijs\tTotaal',
      'Constructieve berekening stalen portaal\t1\t€ 661 ,1 6\t€ 661 ,1 6',
      'Rapport met aanvullende conclusies en berekening\tinbegrepen',
      'Subtotaal',
      '661 ,1 6',
      'Btw (21 %)\t€ 1 38,84',
      'Totaal (incl. btw)\t€ 800,00',
    ]);
    expect(result.client).toBe('Sander Klein Hesselink');
    expect(result.projectAddress).toBe('Spijkerhofweg 10\n6566CM Millingen aan de Rijn');
    expect(result.lines[0]).toMatchObject({ quantity: 1, unitPrice: 661.16 });
    expect(result.lines[0].description).toContain('Rapport met aanvullende conclusies');
    expect(result.vatRate).toBe(21);
    expect(result.warnings).toContain('Projectnaam niet met zekerheid herkend.');
  });
});
