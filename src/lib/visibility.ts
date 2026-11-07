/**
 * Decides whether a model part is drawn.
 * Rules: an isolated part hides everything else; otherwise a part is hidden if its layer is off or the part was hidden.
 */
export function isPartVisible(
  partId: string,
  layer: string,
  opts: { hiddenParts: ReadonlySet<string>; isolatedPartId: string | null; visibleLayers: ReadonlySet<string> },
): boolean {
  if (opts.isolatedPartId) return partId === opts.isolatedPartId
  if (!opts.visibleLayers.has(layer)) return false
  return !opts.hiddenParts.has(partId)
}
