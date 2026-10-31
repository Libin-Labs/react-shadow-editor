export interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export interface ShadowValue {
  layers: ShadowLayer[];
}

export function createShadowLayer(id = 'shadow-1'): ShadowLayer {
  if (typeof id !== 'string' || !id || id.length > 64)
    throw new RangeError('Layer id must contain 1-64 characters.');
  return { id, x: 0, y: 4, blur: 12, spread: 0, color: '#000000', opacity: 0.2, inset: false };
}

export function createShadow(): ShadowValue {
  return { layers: [createShadowLayer()] };
}

export function validateShadow(value: ShadowValue): string[] {
  const errors: string[] = [];
  if (value.layers.length > 16) errors.push('At most 16 shadow layers are supported.');
  const ids = new Set<string>();
  for (const layer of value.layers) {
    if (typeof layer.id !== 'string' || !layer.id || layer.id.length > 64 || ids.has(layer.id))
      errors.push('Layer ids must be unique strings of 1-64 characters.');
    ids.add(layer.id);
    for (const key of ['x', 'y', 'spread'] as const) {
      if (!Number.isFinite(layer[key]) || Math.abs(layer[key]) > 1000)
        errors.push(`${key} must be -1000 to 1000 px.`);
    }
    if (!Number.isFinite(layer.blur) || layer.blur < 0 || layer.blur > 1000)
      errors.push('Blur must be 0-1000 px.');
    if (!Number.isFinite(layer.opacity) || layer.opacity < 0 || layer.opacity > 1)
      errors.push('Opacity must be in [0,1].');
    if (!/^#[0-9a-f]{6}$/i.test(layer.color)) errors.push('Color must be a six-digit hex color.');
    if (typeof layer.inset !== 'boolean') errors.push('Inset must be boolean.');
  }
  return errors;
}

export function shadowToCss(value: ShadowValue): string {
  const errors = validateShadow(value);
  if (errors.length) throw new RangeError(errors.join(' '));
  if (!value.layers.length) return 'none';
  return value.layers
    .map((layer) => {
      const r = parseInt(layer.color.slice(1, 3), 16);
      const g = parseInt(layer.color.slice(3, 5), 16);
      const b = parseInt(layer.color.slice(5, 7), 16);
      return `${layer.inset ? 'inset ' : ''}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px rgba(${r}, ${g}, ${b}, ${layer.opacity})`;
    })
    .join(', ');
}
