/** Source-map decoration cleanup; live player bees are rendered separately. */
export function cleanImportedPart(part) {
  if (/(?:^|\/)Bee\d+(?:\/|$)/.test(part.path)) return null;
  if (/(?:^|\/)Hive\d+\/Cells\/[^/]+\/Backplate$/.test(part.path))
    return { ...part, decals: [] };
  return part;
}
