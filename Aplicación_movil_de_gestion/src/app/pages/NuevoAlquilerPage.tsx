import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Save, X, Plus, Search } from 'lucide-react';
import { SuccessModal } from '../components/SuccessModal';

const CLIENTES_MOCK = [
  { id: '1', nombre: 'Juan Pérez', numero: 'CLI-001', documento: '35444888' },
  { id: '2', nombre: 'María Rodríguez', numero: 'CLI-002', documento: '40123456' },
  { id: '3', nombre: 'Lucas Gómez', numero: 'CLI-003', documento: '22333444' },
  { id: '4', nombre: 'Ana Martínez', numero: 'CLI-004', documento: '28999111' },
];

const EQUIPOS_DISPONIBLES = [
  { id: 'camara-sony-a7', nombre: 'Cámara Sony A7 III', precioSugerido: 15000 },
  { id: 'camara-canon-5d', nombre: 'Cámara Canon 5D Mark IV', precioSugerido: 18000 },
  { id: 'microfono-rode', nombre: 'Micrófono Rode NTG3', precioSugerido: 5000 },
  { id: 'tripode-manfrotto', nombre: 'Trípode Manfrotto', precioSugerido: 3000 },
  { id: 'luces-led', nombre: 'Kit de luces LED', precioSugerido: 7000 },
];

interface ItemAlquiler {
  equipoId: string;
  cantidad: number;
  precioUnitario: number;
}

const formatearFechaVista = (fechaStr: string): string => {
  if (!fechaStr) return '';
  const [anio, mes, dia] = fechaStr.split('-');
  return `${dia}-${mes}-${anio}`;
};

export default function NuevoAlquilerPage() {
  const navigate = useNavigate();

  // Estados de cliente
  const [buscarCliente, setBuscarCliente] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<typeof CLIENTES_MOCK[0] | null>(null);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  
  // ÍNDICE ACTIVO PARA NAVEGACIÓN POR TECLADO
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [deposito, setDeposito] = useState('');

  const [items, setItems] = useState<ItemAlquiler[]>([
    { equipoId: '', cantidad: 1, precioUnitario: 0 }
  ]);

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const clientesFiltrados = useMemo(() => {
    if (!buscarCliente.trim()) return [];
    const query = buscarCliente.toLowerCase();
    return CLIENTES_MOCK.filter(
      (c) =>
        c.nombre.toLowerCase().includes(query) ||
        c.numero.toLowerCase().includes(query) ||
        c.documento.includes(query)
    );
  }, [buscarCliente]);

  // Resetear el índice del teclado cuando cambian los resultados de búsqueda
  useEffect(() => {
    setFocusedIndex(-1);
  }, [clientesFiltrados]);

  // Cerrar el dropdown si el usuario hace click fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // MANEJADOR DE EVENTOS DE TECLADO (Keydown)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mostrarDropdown || clientesFiltrados.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault(); // Evita que el cursor se mueva en el input
        setFocusedIndex((prevIndex) => 
          prevIndex < clientesFiltrados.length - 1 ? prevIndex + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : clientesFiltrados.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault(); // Evita el submit accidental del formulario
        if (focusedIndex >= 0 && focusedIndex < clientesFiltrados.length) {
          seleccionarCliente(clientesFiltrados[focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setMostrarDropdown(false);
        setFocusedIndex(-1);
        break;
      case 'Tab':
        // Si el usuario presiona Tab, simplemente cerramos la lista y dejamos que continúe el flujo nativo
        setMostrarDropdown(false);
        break;
    }
  };

  const seleccionarCliente = (c: typeof CLIENTES_MOCK[0]) => {
    setClienteSeleccionado(c);
    setBuscarCliente(`${c.nombre} (${c.documento})`);
    setMostrarDropdown(false);
    setFocusedIndex(-1);
  };

  const diasAlquiler = useMemo(() => {
    if (!fechaInicio || !fechaFin) return 1;
    const inicio = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T00:00:00`);
    const diferenciaTiempo = fin.getTime() - inicio.getTime();
    const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));
    return diferenciaDias > 0 ? diferenciaDias : 1;
  }, [fechaInicio, fechaFin]);

  const handleAddItem = () => {
    setItems([...items, { equipoId: '', cantidad: 1, precioUnitario: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof ItemAlquiler, value: string | number) => {
    const newItems = [...items];
    if (field === 'equipoId') {
      const equipoSelected = EQUIPOS_DISPONIBLES.find((e) => e.id === value);
      newItems[index] = {
        ...newItems[index],
        equipoId: value as string,
        precioUnitario: equipoSelected ? equipoSelected.precioSugerido : 0
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const resumen = useMemo(() => {
    const itemsValidos = items.filter((item) => item.equipoId !== '');
    const itemsUnicos = itemsValidos.length;
    const unidadesTotales = itemsValidos.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);
    const subtotal = itemsValidos.reduce((acc, curr) => {
      return acc + ((Number(curr.cantidad) || 0) * (Number(curr.precioUnitario) || 0) * diasAlquiler);
    }, 0);
    return { itemsUnicos, unidadesTotales, subtotal, totalConDeposito: subtotal + (Number(deposito) || 0) };
  }, [items, deposito, diasAlquiler]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!clienteSeleccionado) errs.push('Seleccioná un cliente válido antes de continuar.');
    if (items.some(i => !i.equipoId)) errs.push('Completá el equipo en todas las filas de dispositivos.');
    if (errs.length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors([]);
    setShowSuccess(true);
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <SuccessModal
        isOpen={showSuccess}
        title="¡Alquiler creado con éxito!"
        message={clienteSeleccionado ? `El alquiler de ${clienteSeleccionado.nombre} fue registrado correctamente.` : undefined}
        onClose={() => navigate('/app/alquileres')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* COLUMNA FORMULARIO */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          
          {/* Cliente Autocomplete Operable por Teclado */}
          <div className="relative" ref={containerRef}>
            <label htmlFor="cliente-search" className="block text-sm font-bold text-gray-700 mb-2">
              Cliente *
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800" size={18} aria-hidden="true" />
              <input
                id="cliente-search"
                type="text"
                placeholder="Buscar por nombre o nro de cliente..."
                value={buscarCliente}
                onChange={(e) => {
                  setBuscarCliente(e.target.value);
                  setMostrarDropdown(true);
                  if (clienteSeleccionado) setClienteSeleccionado(null);
                }}
                onFocus={() => setMostrarDropdown(true)}
                onKeyDown={handleKeyDown} // Escucha las flechas y Enter
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                required={!clienteSeleccionado}
                
                // Atributos ARIA Dinámicos para indicar el estado del teclado al lector de pantalla
                role="combobox"
                aria-expanded={mostrarDropdown && clientesFiltrados.length > 0}
                aria-autocomplete="list"
                aria-controls="clientes-listbox"
                aria-haspopup="listbox"
                aria-activedescendant={focusedIndex >= 0 ? `opcion-cliente-${focusedIndex}` : undefined}
              />
            </div>

            {/* Listbox de resultados */}
            {mostrarDropdown && clientesFiltrados.length > 0 && (
              <ul 
                id="clientes-listbox"
                role="listbox" 
                aria-label="Resultados de búsqueda de clientes"
                className="absolute z-10 w-full bg-white mt-1 border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100"
              >
                {clientesFiltrados.map((c, idx) => (
                  <li key={c.id} role="none">
                    <button
                      id={`opcion-cliente-${idx}`}
                      type="button"
                      role="option"
                      aria-selected={focusedIndex === idx}
                      onClick={() => seleccionarCliente(c)}
                      // Cambiamos el estilo si el elemento está enfocado por el teclado
                      className={`w-full text-left px-4 py-3 flex justify-between items-center transition-colors focus:outline-none ${
                        focusedIndex === idx ? 'bg-[#218a72]/10 text-gray-900 font-medium' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <span className="font-semibold block text-gray-800">{c.nombre}</span>
                        <span className="text-xs text-gray-500">Doc: {c.documento}</span>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">{c.numero}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {clienteSeleccionado && (
              <p role="status" aria-live="polite" className="text-xs text-[#218a72] font-semibold mt-1.5 flex items-center gap-1">
                ✓ Cliente seleccionado correctamente: {clienteSeleccionado.nombre}.
              </p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-bold text-gray-700 mb-2">
                Fecha inicio *
              </label>
              <input
                type="date"
                id="fechaInicio"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
                max={fechaFin}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="fechaFin" className="block text-sm font-bold text-gray-700 mb-2">
                Fecha fin *
              </label>
              <input
                type="date"
                id="fechaFin"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
                min={fechaInicio}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Listado de Equipos */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 id="titulo-dispositivos" className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Dispositivos a Alquilar
              </h2>
              
            </div>

            <div className="space-y-3" role="group" aria-labelledby="titulo-dispositivos">
              {items.map((item, index) => {
                const equipoInputId = `equipo-select-${index}`;
                const cantidadInputId = `equipo-cantidad-${index}`;
                const precioInputId = `equipo-precio-${index}`;

                return (
                  <div 
                    key={index} 
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 items-end relative"
                  >
                    <div className="sm:col-span-5">
                      <label htmlFor={equipoInputId} className="block text-xs font-bold text-gray-800 mb-1">
                        Equipo * (Fila {index + 1})
                      </label>
                      <select
                        id={equipoInputId}
                        value={item.equipoId}
                        onChange={(e) => handleItemChange(index, 'equipoId', e.target.value)}
                        required
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-[#218a72]"
                      >
                        <option value="">Seleccionar equipo</option>
                        {EQUIPOS_DISPONIBLES.map((eq) => (
                          <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
                      <div className="sm:col-span-3">
                        <label htmlFor={cantidadInputId} className="block text-xs font-bold text-gray-800 mb-1">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          id={cantidadInputId}
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value) || 0)}
                          required
                          // bg-white: Fondo blanco explícito
                          // focus:ring-4 focus:ring-[#218a72]/20: Anillo de enfoque igual a los demás inputs
                          // [appearance:textfield]...: Oculta las flechas internas nativas de los inputs numéricos
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      {/* Precio Unitario */}
                      <div className="sm:col-span-3">
                        <label htmlFor={precioInputId} className="block text-xs font-bold text-gray-800 mb-1">
                          Precio Unit. *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden="true">$</span>
                          <input
                            type="number"
                            id={precioInputId}
                            min="0"
                            value={item.precioUnitario}
                            onChange={(e) => handleItemChange(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                            required
                            // Ajustamos pl-7 para que el texto empiece un poco después del símbolo $
                            className="w-full pl-7 pr-3 py-2 border-2 border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>

                    <div className="sm:col-span-1 flex justify-center sm:justify-end pb-1">
                      <button
                        type="button"
                        disabled={items.length === 1}
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`Eliminar fila ${index + 1}`}
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
          <button
                type="button"
                onClick={handleAddItem}
                className="text-xs bg-[#218a72]/10 text-[#218a72] hover:bg-[#218a72]/20 px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218a72]"
              >
                <Plus size={14} aria-hidden="true" /> Añadir equipo
              </button>

          <hr className="border-gray-100" />

          {/* Depósito de garantía */}
          <div>
            <label htmlFor="deposito" className="block text-sm font-bold text-gray-700 mb-2">
              Depósito de garantía (Global, Opcional)
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 font-semibold" aria-hidden="true">$</span>
              <input
                type="number"
                id="deposito"
                value={deposito}
                onChange={(e) => setDeposito(e.target.value)}
                min="0"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                placeholder="0"
              />
            </div>
          </div>

          {/* Errores de validación */}
          {formErrors.length > 0 && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-4 rounded-xl border border-red-200 bg-red-50 space-y-1"
            >
              {formErrors.map((err, i) => (
                <p key={i} className="text-sm text-red-700 font-medium">{err}</p>
              ))}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#166b58] text-white py-4 px-6 rounded-xl font-bold hover:bg-[#125546] focus:bg-[#125546] transition-colors focus:outline-none focus:ring-4 focus:ring-[#166b58]/30 flex items-center justify-center gap-2"
            >
              <Save size={20} aria-hidden="true" />
              Guardar alquiler
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/')}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 focus:bg-gray-50 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
              aria-label="Cancelar creación de alquiler y volver"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* CUADRO DE RESUMEN BLANCO */}
        <aside 
          className="lg:sticky lg:top-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6"
          aria-labelledby="titulo-resumen"
        >
          <h2 id="titulo-resumen" className="text-lg font-bold border-b border-gray-100 pb-3 text-[#145a4a]">
            Resumen del Alquiler
          </h2>

          <dl className="space-y-4">
            <div className="space-y-1">
              <dt className="text-xs font-bold text-gray-800 block uppercase tracking-wider">Cliente</dt>
              <dd className="text-sm font-medium">
                {clienteSeleccionado ? (
                  <>
                    <span className="block text-base font-bold text-gray-800">{clienteSeleccionado.nombre}</span>
                    <span className="text-gray-800 font-mono text-xs">Número: {clienteSeleccionado.numero} — Documento: {clienteSeleccionado.documento}</span>
                  </>
                ) : (
                  <span className="text-gray-800 italic">Ningún cliente seleccionado</span>
                )}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-bold text-gray-800 block uppercase tracking-wider">Periodo</dt>
              <dd className="text-sm font-medium">
                {fechaInicio || fechaFin ? (
                  <div className="text-gray-600 space-y-1">
                    <p>Desde: <span className="font-semibold text-gray-800">{formatearFechaVista(fechaInicio) || 'No especificada'}</span></p>
                    <p>Hasta: <span className="font-semibold text-gray-800">{formatearFechaVista(fechaFin) || 'No especificada'}</span></p>
                    <p className="text-xs bg-[#218a72]/10 text-[#218a72] font-bold px-2 py-1 rounded inline-block">
                      {diasAlquiler} {diasAlquiler === 1 ? 'día' : 'días'} de alquiler
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-800 italic">Fechas sin definir</span>
                )}
              </dd>
            </div>
          </dl>

          <dl className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <dt className="text-xs font-bold text-gray-800 block uppercase tracking-wider mb-0.5">Items Únicos</dt>
              <dd className="text-2xl font-black text-gray-800">{resumen.itemsUnicos}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-gray-800 block uppercase tracking-wider mb-0.5">Unidades Totales</dt>
              <dd className="text-2xl font-black text-gray-800">{resumen.unidadesTotales}</dd>
            </div>
          </dl>

          <div className="border-t border-gray-100 pt-4">
            <dl className="space-y-2">
              <div className="flex justify-between text-sm text-gray-800">
                <dt>Subtotal equipos ({diasAlquiler} {diasAlquiler === 1 ? 'día' : 'días'}):</dt>
                <dd className="font-semibold text-gray-800" aria-label={`${resumen.subtotal} pesos`}>
                  ${resumen.subtotal.toLocaleString('es-AR')}
                </dd>
              </div>
              <div className="flex justify-between text-sm text-gray-800">
                <dt>Depósito garantía:</dt>
                <dd className="font-semibold text-gray-800" aria-label={`${Number(deposito) || 0} pesos`}>
                  ${(Number(deposito) || 0).toLocaleString('es-AR')}
                </dd>
              </div>
              
              <div 
                className="flex justify-between text-base font-bold pt-2 border-t border-dashed border-gray-200 text-gray-800"
                role="status" 
                aria-live="polite" 
                aria-atomic="true"
              >
                <dt id="label-total-estimado">Total Estimado:</dt>
                <dd 
                  className="text-xl font-extrabold text-[#218a72]" 
                  aria-labelledby="label-total-estimado"
                  aria-label={`${resumen.totalConDeposito} pesos argentinos`}
                >
                  ${resumen.totalConDeposito.toLocaleString('es-AR')}
                </dd>
              </div>
            </dl>
          </div>

        </aside>
      </div>
    </div>
  );
}