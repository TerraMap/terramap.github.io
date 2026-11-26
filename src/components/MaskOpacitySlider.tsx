import { Slider } from 'antd';
import { useTranslation } from 'react-i18next';

/**
 * Sets how dark the mask over everything but highlighted blocks and wires is.
 * Shown inside the View menu, so clicks must not reach the menu (which would close it).
 */
export function MaskOpacitySlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const { t } = useTranslation();
  const percent = Math.round(value * 100);

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
      {t('mask_opacity', { value: percent })}
      <Slider
        min={0}
        max={100}
        step={5}
        value={percent}
        onChange={(v) => onChange(v / 100)}
        tooltip={{ open: false }}
        style={{ margin: '4px 4px 0' }}
      />
    </div>
  );
}
