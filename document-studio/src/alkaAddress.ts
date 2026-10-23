const DUTCH_POSTCODE = /\b([1-9]\d{3}\s?[A-Za-z]{2})\b/;

export function formatAlkaAddress(value: string): string[] {
  const parts = value
    .split(/\r?\n|,\s*/)
    .map(part => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter(part => !/^nederland$/i.test(part));

  const lines: string[] = [];

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const postcode = DUTCH_POSTCODE.exec(part);

    if (!postcode) {
      lines.push(part);
      continue;
    }

    const before = part.slice(0, postcode.index).trim();
    let postalCity = part.slice(postcode.index).trim();

    if (before) lines.push(before);

    if (postalCity.replace(/\s/g, '').toUpperCase() === postcode[1].replace(/\s/g, '').toUpperCase()) {
      const city = parts[index + 1];
      if (city && !DUTCH_POSTCODE.test(city)) {
        postalCity = `${postalCity} ${city}`;
        index += 1;
      }
    }

    lines.push(postalCity.replace(/^([1-9]\d{3})\s*([A-Za-z]{2})\b/, '$1 $2'));
  }

  return [...lines, 'Nederland'];
}
