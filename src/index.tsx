import { type CSSProperties } from 'react';
import {
  createShadowLayer,
  shadowToCss,
  validateShadow,
  type ShadowLayer,
  type ShadowValue,
} from './engine.js';

export * from './engine.js';

export interface ShadowEditorProps {
  value: ShadowValue;
  onChange: (value: ShadowValue) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function ShadowEditor({
  value,
  onChange,
  disabled = false,
  className = '',
  style,
  'aria-label': label = 'Shadow editor',
}: ShadowEditorProps) {
  const errors = validateShadow(value);
  const css = errors.length ? '' : shadowToCss(value);
  const update = (index: number, patch: Partial<ShadowLayer>) =>
    onChange({
      ...value,
      layers: value.layers.map((layer, i) => (i === index ? { ...layer, ...patch } : layer)),
    });
  return (
    <section className={`lpsh-editor ${className}`} style={style} aria-label={label}>
      <p>Layers are ordered front to back. All lengths are pixels.</p>
      {value.layers.map((layer, index) => (
        <fieldset disabled={disabled} key={layer.id}>
          <legend>Shadow {index + 1}</legend>
          {(['x', 'y', 'blur', 'spread', 'opacity'] as const).map((key) => (
            <label key={key}>
              {`Shadow ${index + 1} ${key}`}
              <input
                type="number"
                step={key === 'opacity' ? 0.01 : 1}
                min={key === 'opacity' || key === 'blur' ? 0 : -1000}
                max={key === 'opacity' ? 1 : 1000}
                value={layer[key]}
                onChange={(event) => {
                  if (Number.isFinite(event.target.valueAsNumber))
                    update(index, { [key]: event.target.valueAsNumber });
                }}
              />
            </label>
          ))}
          <label>
            Shadow {index + 1} color
            <input
              value={layer.color}
              onChange={(event) => update(index, { color: event.target.value })}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={layer.inset}
              onChange={(event) => update(index, { inset: event.target.checked })}
            />
            Shadow {index + 1} inset
          </label>
          <button
            type="button"
            onClick={() =>
              onChange({ ...value, layers: value.layers.filter((_, i) => i !== index) })
            }
          >
            Remove shadow {index + 1}
          </button>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => {
              const layers = [...value.layers];
              [layers[index - 1], layers[index]] = [layers[index], layers[index - 1]];
              onChange({ ...value, layers });
            }}
          >
            Move shadow {index + 1} forward
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={disabled || value.layers.length >= 16}
        onClick={() => {
          let n = 1;
          while (value.layers.some((layer) => layer.id === `shadow-${n}`)) n++;
          onChange({ ...value, layers: [...value.layers, createShadowLayer(`shadow-${n}`)] });
        }}
      >
        Add shadow
      </button>
      <div className="lpsh-preview" aria-label="Shadow preview">
        <div style={{ boxShadow: css }}>Preview</div>
      </div>
      {errors.length > 0 && <p role="alert">{errors.join(' ')}</p>}
      <label>
        CSS export
        <textarea rows={4} readOnly value={css ? `box-shadow: ${css};` : ''} />
      </label>
    </section>
  );
}
