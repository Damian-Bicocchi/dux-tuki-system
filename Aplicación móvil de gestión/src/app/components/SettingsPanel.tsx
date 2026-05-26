import { X, Type, Contrast, Maximize2, Zap, Eye } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'normal' | 'large' | 'xlarge';
  contrast: 'normal' | 'high';
  spacing: 'compact' | 'normal' | 'relaxed';
  reduceMotion: boolean;
  colorBlindMode: boolean;
}

export default function SettingsPanel({ isOpen, onClose, settings, onSettingsChange }: SettingsPanelProps) {
  if (!isOpen) return null;

  const fontSizeOptions = [
    { value: 'small' as const, label: 'Pequeño', size: '14px' },
    { value: 'normal' as const, label: 'Normal', size: '16px' },
    { value: 'large' as const, label: 'Grande', size: '18px' },
    { value: 'xlarge' as const, label: 'Extra grande', size: '20px' },
  ];

  const contrastOptions = [
    { value: 'normal' as const, label: 'Normal' },
    { value: 'high' as const, label: 'Alto contraste' },
  ];

  const spacingOptions = [
    { value: 'compact' as const, label: 'Compacto' },
    { value: 'normal' as const, label: 'Normal' },
    { value: 'relaxed' as const, label: 'Amplio' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="settings-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 id="settings-title" className="text-xl font-bold text-gray-900">
            Configuración de Accesibilidad
          </h2>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
            aria-label="Cerrar configuración"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Tamaño de fuente */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Type size={20} className="text-[#218a72]" aria-hidden="true" />
              <h3 className="font-bold text-gray-900 text-base">Tamaño de letra</h3>
            </div>
            <div className="space-y-2">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSettingsChange({ ...settings, fontSize: option.value })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 ${
                    settings.fontSize === option.value
                      ? 'border-[#218a72] bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  aria-pressed={settings.fontSize === option.value}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{option.size}</div>
                    </div>
                    {settings.fontSize === option.value && (
                      <div className="w-6 h-6 rounded-full bg-[#218a72] flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contraste */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Contrast size={20} className="text-[#218a72]" aria-hidden="true" />
              <h3 className="font-bold text-gray-900 text-base">Contraste de colores</h3>
            </div>
            <div className="space-y-2">
              {contrastOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSettingsChange({ ...settings, contrast: option.value })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 ${
                    settings.contrast === option.value
                      ? 'border-[#218a72] bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  aria-pressed={settings.contrast === option.value}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    {settings.contrast === option.value && (
                      <div className="w-6 h-6 rounded-full bg-[#218a72] flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Espaciado */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Maximize2 size={20} className="text-[#218a72]" aria-hidden="true" />
              <h3 className="font-bold text-gray-900 text-base">Espaciado</h3>
            </div>
            <div className="space-y-2">
              {spacingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSettingsChange({ ...settings, spacing: option.value })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 ${
                    settings.spacing === option.value
                      ? 'border-[#218a72] bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  aria-pressed={settings.spacing === option.value}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    {settings.spacing === option.value && (
                      <div className="w-6 h-6 rounded-full bg-[#218a72] flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reducir movimiento */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Zap size={20} className="text-[#218a72]" aria-hidden="true" />
              <h3 className="font-bold text-gray-900 text-base">Animaciones</h3>
            </div>
            <button
              onClick={() => onSettingsChange({ ...settings, reduceMotion: !settings.reduceMotion })}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 ${
                settings.reduceMotion
                  ? 'border-[#218a72] bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              role="switch"
              aria-checked={settings.reduceMotion}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Reducir movimiento</div>
                  <div className="text-sm text-gray-500 mt-1">Minimiza animaciones y transiciones</div>
                </div>
                <div
                  className={`w-12 h-7 rounded-full transition-colors ${
                    settings.reduceMotion ? 'bg-[#218a72]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform ${
                      settings.reduceMotion ? 'ml-6' : 'ml-1'
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Modo daltónico */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Eye size={20} className="text-[#218a72]" aria-hidden="true" />
              <h3 className="font-bold text-gray-900 text-base">Colores</h3>
            </div>
            <button
              onClick={() => onSettingsChange({ ...settings, colorBlindMode: !settings.colorBlindMode })}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 ${
                settings.colorBlindMode
                  ? 'border-[#218a72] bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              role="switch"
              aria-checked={settings.colorBlindMode}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Modo para daltonismo</div>
                  <div className="text-sm text-gray-500 mt-1">Usa colores alternativos más distinguibles</div>
                </div>
                <div
                  className={`w-12 h-7 rounded-full transition-colors ${
                    settings.colorBlindMode ? 'bg-[#218a72]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform ${
                      settings.colorBlindMode ? 'ml-6' : 'ml-1'
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Botón restablecer */}
          <button
            onClick={() => onSettingsChange({
              fontSize: 'normal',
              contrast: 'normal',
              spacing: 'normal',
              reduceMotion: false,
              colorBlindMode: false
            })}
            className="w-full p-4 rounded-xl border-2 border-gray-300 bg-white text-gray-900 font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            Restablecer valores predeterminados
          </button>
        </div>
      </div>
    </>
  );
}
