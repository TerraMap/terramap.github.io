import i18next from 'i18next';
import { beforeAll, describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import zhCN from '../i18n/zh-CN.json';

const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.init({
    resources: { en: { translation: en }, es: { translation: es }, 'zh-CN': { translation: zhCN } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
});

// StatusBar renders a Status as t(`status.${key}`, { value }).
describe('status messages', () => {
  it('render fixed, progress and count messages in English', () => {
    const t = i18n.getFixedT('en');
    expect(t('status.reading_header', { value: undefined })).toBe('Reading world header...');
    expect(t('status.rendering_progress', { value: 42 })).toBe('Rendering world... 42%');
    expect(t('status.loaded_tiles', { value: 11520000 })).toBe('Loaded 11,520,000 tiles');
  });

  it('render in other languages', () => {
    const t = i18n.getFixedT('zh-CN');
    expect(t('status.reading_header', { value: undefined })).toBe('正在读取世界信息...');
    expect(t('status.rendering_progress', { value: 42 })).toBe('正在绘制地图... 42%');
    expect(t('status.loaded_tiles', { value: 11520000 })).toBe('已加载 11,520,000 个方块');
  });

  it("format numbers in the app's language", () => {
    expect(i18n.getFixedT('es')('status.loaded_tiles', { value: 11520000 })).toBe('11.520.000 bloques cargados');
  });
});
