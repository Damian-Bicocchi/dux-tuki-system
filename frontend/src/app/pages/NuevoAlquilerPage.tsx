import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Save, X, Plus, Search, LoaderCircle } from 'lucide-react';
import { SuccessModal } from '../components/SuccessModal';
import { getClientes } from '../data/clientesData';
import { getStocks } from '../data/stockData';
import { ItemRow } from '../components/ItemRow';

const API_URL = 'http://localhost:3001/api';

interface Cliente {
    id: number;
    nombre: string;
    dni: string;
    email?: string;
    telefono?: string;
}

// Interfaz para los artículos que vienen del catálogo/API de stock
interface ArticuloStock {
    id: number;
    nombre: string;
    precio_por_dia: number;
    deposito_garantia: number;
}

// Interfaz acoplada estrictamente para las filas del formulario
interface ItemAlquiler {
    articulo_id: number | '';
    cantidad: number | '';
    precio_unitario_dia: number | '';
    deposito_garantia: number;
    error?: string;
}

const formatearFechaVista = (fechaStr: string): string => {
    if (!fechaStr) return '';
    const [anio, mes, dia] = fechaStr.split('-');
    return `${dia}-${mes}-${anio}`;
};

export default function NuevoAlquilerPage() {
    const navigate = useNavigate();

    const [buscarCliente, setBuscarCliente] = useState('');
    const [clientesLista, setClientesLista] = useState<Cliente[]>([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    
    // Usamos la interfaz local limpia para el catálogo de stock
    const [listaStock, setListaStock] = useState<ArticuloStock[]>([]);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const [items, setItems] = useState<ItemAlquiler[]>([
        { articulo_id: '', cantidad: 1, precio_unitario_dia: '', deposito_garantia: 0 },
    ]);

    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchClientes() {
            try {
                const data = await getClientes();
                setClientesLista(data);
            } catch (error) {
                console.error('Error al cargar los clientes:', error);
            }
        }
        async function fetchStock() {
            try {
                const data = await getStocks();
                // Forzamos el tipado a nuestra interfaz local limpia
                setListaStock(data as unknown as ArticuloStock[]);
            } catch (error) {
                console.error('Error al cargar el stock:', error);
            }
        }
        fetchStock();
        fetchClientes();
    }, []);

    const clientesFiltrados = useMemo(() => {
        if (!buscarCliente.trim()) return [];
        const query = buscarCliente.toLowerCase();
        return clientesLista.filter(
            (c) =>
                c.nombre.toLowerCase().includes(query) ||
                c.dni.toLowerCase().includes(query),
        );
    }, [buscarCliente, clientesLista]);

    useEffect(() => {
        setFocusedIndex(-1);
    }, [clientesFiltrados]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setMostrarDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        async function verificarStockItems() {
            if (!fechaInicio || !fechaFin) return;

            const itemsActualizados = await Promise.all(
                items.map(async (item) => {
                    if (!item.articulo_id || !item.cantidad || Number(item.cantidad) < 1) {
                        return { ...item, error: undefined };
                    }

                    try {
                        const res = await fetch(
                            `${API_URL}/alquileres/disponibilidad?articulo_id=${item.articulo_id}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
                        );
                        console.error("Linea 127 de NuevoAlquilerPage.tsx");
                        if (!res.ok) return { ...item, error: undefined };

                        const data = await res.json();
                        const cantidadSolicitada = Number(item.cantidad);

                        if (data.disponibles < cantidadSolicitada) {
                            const errorMsg = data.disponibles <= 0
                                ? `No hay stock disponible para las fechas seleccionadas.`
                                : `Solo hay stock de ${data.disponibles} unidad(es) disponible(s) para la fecha.`;
                            
                            return { ...item, error: errorMsg };
                        }

                        return { ...item, error: undefined };
                    } catch {
                        return { ...item, error: undefined };
                    }
                })
            );

            // Evitamos bucles comparando cambios reales
            const cambioDetectado = itemsActualizados.some(
                (it, idx) => it.error !== items[idx]?.error
            );

            if (cambioDetectado) {
                setItems(itemsActualizados);
            }
        }

        verificarStockItems();
    }, [fechaInicio, fechaFin, items]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!mostrarDropdown || clientesFiltrados.length === 0) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex((prev) => (prev < clientesFiltrados.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex((prev) => (prev > 0 ? prev - 1 : clientesFiltrados.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedIndex >= 0) seleccionarCliente(clientesFiltrados[focusedIndex]);
                break;
            case 'Escape':
                e.preventDefault();
                setMostrarDropdown(false);
                setFocusedIndex(-1);
                break;
            case 'Tab':
                setMostrarDropdown(false);
                break;
        }
    };

    const seleccionarCliente = (c: Cliente) => {
        setClienteSeleccionado(c);
        setBuscarCliente(`${c.nombre} (${c.dni})`);
        setMostrarDropdown(false);
        setFocusedIndex(-1);
    };

    const diasAlquiler = useMemo(() => {
        if (!fechaInicio || !fechaFin) return 1;
        const inicio = new Date(`${fechaInicio}T00:00:00`);
        const fin = new Date(`${fechaFin}T00:00:00`);
        const diff = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    }, [fechaInicio, fechaFin]);

    const handleAddItem = () => {
        setItems([...items, { articulo_id: '', cantidad: 1, precio_unitario_dia: 0, deposito_garantia: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

   const handleItemChange = (index: number, field: keyof ItemAlquiler, value: string | number) => {
        const newItems = [...items];
        if (field === 'articulo_id') {
            const articuloId = value === '' ? '' : Number(value);
            const art = articuloId === '' ? undefined : listaStock.find((e) => e.id === articuloId);
            newItems[index] = {
                ...newItems[index],
                articulo_id: articuloId,
                precio_unitario_dia: art?.precio_por_dia ?? '',
                deposito_garantia: art?.deposito_garantia ?? 0,
                error: undefined, // Limpia el error al cambiar de equipo
            };
        } else if (field === 'cantidad' || field === 'precio_unitario_dia') {
            newItems[index] = { 
                ...newItems[index], 
                [field]: value === '' ? '' : Number(value),
                error: undefined, // Limpia el error al cambiar cantidad
            };
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setItems(newItems);
    };

    // Resumen dinámico que calcula los globales reactivamente al mutar los items
    const resumen = useMemo(() => {
        const itemsValidos = items.filter((item) => item.articulo_id !== '');
        
        const subtotal = itemsValidos.reduce(
            (acc, curr) =>
                acc + (Number(curr.cantidad) || 0) * (Number(curr.precio_unitario_dia) || 0) * diasAlquiler,
            0,
        );

        // Suma reactiva de los depósitos multiplicados por su cantidad individual
        const depositoGlobalCalculado = itemsValidos.reduce(
            (acc, curr) => acc + (Number(curr.deposito_garantia) || 0) * (Number(curr.cantidad) || 0),
            0,
        );

        return {
            itemsUnicos: itemsValidos.length,
            unidadesTotales: itemsValidos.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0),
            subtotal,
            depositoGlobal: depositoGlobalCalculado,
            totalConDeposito: subtotal + depositoGlobalCalculado,
        };
    }, [items, diasAlquiler]);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const errs: string[] = [];
        if (!clienteSeleccionado) errs.push('Seleccioná un cliente válido antes de continuar.');
        if (items.some((i) => !i.articulo_id)) errs.push('Completá el artículo en todas las filas de dispositivos.');
        if (!fechaInicio) errs.push('Ingresá la fecha de inicio.');
        if (!fechaFin) errs.push('Ingresá la fecha de fin.');
        if (items.some((i) => i.error)) {
            errs.push('Revisá los problemas de stock señalados en color rojo.');
        }
        if (errs.length > 0) {
            setFormErrors(errs);
            return;
        }

        setFormErrors([]);
        setSubmitError(null);
        setSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/alquileres`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cliente_id: clienteSeleccionado!.id,
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin,
                    deposito_garantia: resumen.depositoGlobal, // Mandamos el depósito calculado
                    items: items.map((i) => ({
                        articulo_id: i.articulo_id,
                        cantidad: i.cantidad,
                        precio_unitario_dia: i.precio_unitario_dia,
                        deposito_garantia: i.deposito_garantia,
                    })),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al guardar el alquiler');
            }

            setShowSuccess(true);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Error inesperado');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        if (input.showPicker) {
            input.showPicker(); // abre el calendario nativo
        } else {
            input.focus(); // fallback para navegadores antiguos
        }
    };

    return (
        <div className="px-4 py-4 max-w-6xl mx-auto">
            <SuccessModal
                isOpen={showSuccess}
                title="¡Alquiler creado con éxito!"
                message={clienteSeleccionado ? `El alquiler de ${clienteSeleccionado.nombre} fue registrado correctamente.` : undefined}
                onClose={() => navigate('/app/alquileres')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* COLUMNA FORMULARIO */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

                    {/* Cliente Autocomplete */}
                    <div className="relative" ref={containerRef}>
                        <label htmlFor="cliente-search" className="block text-sm font-bold text-gray-700 mb-2">
                            Cliente <span className="text-xs text-red-600 font-semibold ml-0.5">(obligatorio)</span>
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800" size={18} aria-hidden="true" />
                            <input
                                id="cliente-search"
                                type="text"
                                placeholder="Buscar por nombre o DNI..."
                                value={buscarCliente}
                                onChange={(e) => {
                                    setBuscarCliente(e.target.value);
                                    setMostrarDropdown(true);
                                    if (clienteSeleccionado) setClienteSeleccionado(null);
                                }}
                                onFocus={() => setMostrarDropdown(true)}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                                required={!clienteSeleccionado}
                                role="combobox"
                                aria-expanded={mostrarDropdown && clientesFiltrados.length > 0}
                                aria-autocomplete="list"
                                aria-controls="clientes-listbox"
                                aria-haspopup="listbox"
                                aria-activedescendant={focusedIndex >= 0 ? `opcion-cliente-${focusedIndex}` : undefined}
                            />
                        </div>

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
                                            className={`w-full text-left px-4 py-3 flex justify-between items-center transition-colors focus:outline-none ${
                                                focusedIndex === idx ? 'bg-[#218a72]/10 text-gray-900 font-medium' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div>
                                                <span className="font-semibold block text-gray-800">{c.nombre}</span>
                                                <span className="text-xs text-gray-500">DNI: {c.dni}</span>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {clienteSeleccionado && (
                            <p role="status" aria-live="polite" className="text-xs text-[#218a72] font-semibold mt-1.5 flex items-center gap-1">
                                ✓ Cliente seleccionado correctamente: {clienteSeleccionado.nombre} — DNI: {clienteSeleccionado.dni}
                            </p>
                        )}
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fechaInicio" className="block text-sm font-bold text-gray-700 mb-2">
                                Fecha inicio <span className="text-xs text-red-600 font-semibold ml-0.5">(obligatorio)</span>
                            </label>
                            <input type="date" id="fechaInicio" value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)} 
                                onClick={handleDateClick} 
                                required max={fechaFin}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors" />
                        </div>
                        <div>
                            <label htmlFor="fechaFin" className="block text-sm font-bold text-gray-700 mb-2">
                                Fecha fin <span className="text-xs text-red-600 font-semibold ml-0.5">(obligatorio)</span>
                            </label>
                            <input type="date" id="fechaFin" value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)} 
                                onClick={handleDateClick} 
                                required min={fechaInicio}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors" />
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
                            {items.map((item, index) => (
                                <ItemRow
                                    key={item.articulo_id || index}
                                    item={item}
                                    index={index}
                                    listaStock={listaStock}
                                    disableDelete={items.length === 1}
                                    onChange={handleItemChange}
                                    onRemove={handleRemoveItem}
                                />
                            ))}
                        </div>
                    </div>

                    <button type="button" onClick={handleAddItem}
                        className="text-xs bg-[#218a72]/10 text-[#218a72] hover:bg-[#218a72]/20 px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218a72]">
                        <Plus size={14} aria-hidden="true" /> Añadir equipo
                    </button>

                    <hr className="border-gray-100" />

                    {/* Depósito de garantía global automático */}
                    <div>
                        <label htmlFor="deposito" className="block text-sm font-bold text-gray-700 mb-2">
                            Depósito de garantía (Global - Calculado)
                        </label>
                        <div className="relative max-w-xs">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold" aria-hidden="true">$</span>
                            <input 
                                type="number" 
                                id="deposito" 
                                value={resumen.depositoGlobal} 
                                readOnly
                                disabled
                                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 bg-gray-50 text-gray-500 rounded-xl cursor-not-allowed focus:outline-none shadow-inner font-semibold" 
                            />
                        </div>
                    </div>

                    {/* Errores de validación */}
                    {formErrors.length > 0 && (
                        <div role="alert" aria-live="assertive" className="p-4 rounded-xl border border-red-200 bg-red-50 space-y-1">
                            {formErrors.map((err, i) => (
                                <p key={i} className="text-sm text-red-700 font-medium">{err}</p>
                            ))}
                        </div>
                    )}

                    {/* Error del servidor */}
                    {submitError && (
                        <div role="alert" className="p-4 rounded-xl border border-red-200 bg-red-50">
                            <p className="text-sm text-red-700 font-medium">{submitError}</p>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={submitting}
                            className="flex-1 bg-[#166b58] text-white py-4 px-6 rounded-xl font-bold hover:bg-[#125546] focus:bg-[#125546] transition-colors focus:outline-none focus:ring-4 focus:ring-[#166b58]/30 flex items-center justify-center gap-2 disabled:opacity-60">
                            {submitting ? <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> : <Save size={20} aria-hidden="true" />}
                            {submitting ? 'Guardando...' : 'Guardar alquiler'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/app/')}
                            className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 focus:bg-gray-50 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300 flex items-center gap-2"
                            aria-label="Cancelar creación de alquiler y volver"
                        >
                            <X size={20} aria-hidden="true" />
                            Cancelar
                        </button>
                    </div>
                </form>

                {/* CUADRO DE RESUMEN */}
                <aside className="lg:sticky lg:top-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6" aria-labelledby="titulo-resumen">
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
                                        <span className="text-gray-800 font-mono text-xs">DNI: {clienteSeleccionado.dni}</span>
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
                            <dt className="text-xs font-bold text-gray-800 block uppercase tracking-wider mb-0.5">Unidades Totales</dt>
                            <dd className="text-2xl font-black text-gray-800">{resumen.unidadesTotales}</dd>
                        </div>
                    </dl>

                    <div className="border-t border-gray-100 pt-4">
                        <dl className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-800">
                                <dt>Subtotal equipos ({diasAlquiler} {diasAlquiler === 1 ? 'día' : 'días'}):</dt>
                                <dd className="font-semibold text-gray-800">${resumen.subtotal.toLocaleString('es-AR')}</dd>
                            </div>
                            <div className="flex justify-between text-sm text-gray-800">
                                <dt>Depósito garantía:</dt>
                                <dd className="font-semibold text-gray-800">${resumen.depositoGlobal.toLocaleString('es-AR')}</dd>
                            </div>
                            <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed border-gray-200 text-gray-800"
                                role="status" aria-live="polite" aria-atomic="true">
                                <dt id="label-total-estimado">Total Estimado:</dt>
                                <dd className="text-xl font-extrabold text-[#218a72]"
                                    aria-labelledby="label-total-estimado"
                                    aria-label={`${resumen.totalConDeposito} pesos argentinos`}>
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