import type { InlineKeyboardMarkup } from './bot';

/**
 * Menú Principal de ValisHub
 */
export function getMainMenuKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '🟢 ValisFin (Finanzas)', callback_data: 'menu:valisfin' },
        { text: '🔴 ValisBiz (Ventas)', callback_data: 'menu:valisbiz' },
      ],
      [
        { text: '🔵 ValisAN (Institución)', callback_data: 'menu:valisan' },
        { text: '📊 Resumen General', callback_data: 'valishub:resumen' },
      ],
      [
        { text: '💡 Ayuda y Atajos', callback_data: 'valishub:ayuda' },
      ],
    ],
  };
}

/**
 * Submenú de ValisFin
 */
export function getValisFinKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '💳 Pagos Pendientes', callback_data: 'valisfin:pagos' },
        { text: '🛒 Gastos del Mes', callback_data: 'valisfin:gastos' },
      ],
      [
        { text: '🚗 Autos & Mantenimiento', callback_data: 'valisfin:carros' },
        { text: '🎯 Metas de Ahorro', callback_data: 'valisfin:metas' },
      ],
      [
        { text: '🛠️ Tareas del Hogar', callback_data: 'valisfin:hogar' },
      ],
      [
        { text: '🔙 Volver al Menú Principal', callback_data: 'menu:main' },
      ],
    ],
  };
}

/**
 * Submenú de ValisBiz
 */
export function getValisBizKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '📈 Métricas del Mes', callback_data: 'valisbiz:metricas' },
        { text: '👥 Por Vendedor', callback_data: 'valisbiz:vendedores' },
      ],
      [
        { text: '📍 Visitas a Locales', callback_data: 'valisbiz:visitas' },
      ],
      [
        { text: '🔙 Volver al Menú Principal', callback_data: 'menu:main' },
      ],
    ],
  };
}

/**
 * Submenú de ValisAN
 */
export function getValisANKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '📋 Reportes AIPP', callback_data: 'valisan:reportes' },
        { text: '👥 Personal BD-RH', callback_data: 'valisan:bdrh_stats' },
      ],
      [
        { text: '🔍 Cómo buscar por Cédula/CIP', callback_data: 'valisan:buscar_ayuda' },
      ],
      [
        { text: '🔙 Volver al Menú Principal', callback_data: 'menu:main' },
      ],
    ],
  };
}

/**
 * Botón para regresar al submódulo o al menú principal
 */
export function getBackKeyboard(module?: 'valisfin' | 'valisbiz' | 'valisan'): InlineKeyboardMarkup {
  const keyboard: any[] = [];
  if (module === 'valisfin') {
    keyboard.push([{ text: '↩️ Volver a ValisFin', callback_data: 'menu:valisfin' }]);
  } else if (module === 'valisbiz') {
    keyboard.push([{ text: '↩️ Volver a ValisBiz', callback_data: 'menu:valisbiz' }]);
  } else if (module === 'valisan') {
    keyboard.push([{ text: '↩️ Volver a ValisAN', callback_data: 'menu:valisan' }]);
  }
  keyboard.push([{ text: '🏠 Menú Principal (ValisHub)', callback_data: 'menu:main' }]);

  return { inline_keyboard: keyboard };
}
