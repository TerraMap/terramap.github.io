import i18next from 'i18next';
import { beforeAll, describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import zhCN from '../i18n/zh-CN.json';
import { translateStatus } from '../lib/statusText';

const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.init({
    resources: { en: { translation: en }, 'zh-CN': { translation: zhCN } },
    lng: 'zh-CN',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
});

describe('translateStatus', () => {
  it('translates fixed and progress messages', () => {
    expect(translateStatus('Reading world header...', i18n.t)).toBe('正在读取世界信息...');
    expect(translateStatus('Rendering world... 42%', i18n.t)).toBe('正在绘制地图... 42%');
    expect(translateStatus('Loaded 11,520,000 tiles', i18n.t)).toBe('已加载 11,520,000 个方块');
  });

  it('returns unknown messages unchanged', () => {
    expect(translateStatus('Something else', i18n.t)).toBe('Something else');
  });

  it('round-trips to the original text in English', async () => {
    await i18n.changeLanguage('en');
    expect(translateStatus('Reading tiles... 7%', i18n.t)).toBe('Reading tiles... 7%');
    await i18n.changeLanguage('zh-CN');
  });
});
