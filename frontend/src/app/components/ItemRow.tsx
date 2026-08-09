import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';

export interface ItemAlquiler {
    id: string; // 👈 Agregar ID único
    articulo_id: number | '';
    cantidad: number | '';
    precio_unitario_dia: number | '';
    deposito_garantia: number;
    error?: string;
}

export interface StockItem {
    id: number | string;
    nombre: string;
}

interface ItemRowProps {
    item: ItemAlquiler;
    index: number;
    listaStock: StockItem[];
    disableDelete: boolean;
    onChange: (index: number, field: keyof ItemAlquiler, value: string | number) => void;
    onRemove: (index: number) => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({
    item,
    index,
    listaStock,
    disableDelete,
    onChange,
    onRemove,
}) => {
    const equipoInputId = `equipo-select-${index}`;
    const cantidadInputId = `equipo-cantidad-${index}`;
    const precioInputId = `equipo-precio-${index}`;
    const errorId = `error-item-${index}`;

    const MAX_VALUE_QUANTITY = 999;

    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const seleccionado = listaStock.find((eq) => String(eq.id) === String(item.articulo_id));
        if (seleccionado) {
            setSearchTerm(seleccionado.nombre);
        } else if (!item.articulo_id) {
            setSearchTerm('');
        }
    }, [item.articulo_id, listaStock]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                const seleccionado = listaStock.find((eq) => String(eq.id) === String(item.articulo_id));
                setSearchTerm(seleccionado ? seleccionado.nombre : '');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [item.articulo_id, listaStock]);

    const listaFiltrada = listaStock.filter((eq) =>
        eq.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectOption = (eq: StockItem) => {
        onChange(index, 'articulo_id', eq.id);
        setSearchTerm(eq.nombre);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setIsOpen(true);

        if (value.trim() === '') {
            onChange(index, 'articulo_id', '');
        }
    };

    // Determinar si hay error para este item
    const hasError = !!item.error;

    return (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end relative">
                
                {/* Equipo / Artículo */}
                <div className="sm:col-span-5 relative" ref={dropdownRef}>
                    <label htmlFor={equipoInputId} className="block text-xs font-bold text-gray-800 mb-1">
                        Equipo (Fila {index + 1}) <span className="text-xs text-red-600 font-semibold ml-0.5">(obligatorio)</span>
                    </label>

                    <div className="relative">
                        <input
                            id={equipoInputId}
                            type="text"
                            placeholder="Buscar o seleccionar equipo..."
                            value={searchTerm}
                            onChange={handleInputChange}
                            onFocus={() => setIsOpen(true)}
                            required={!item.articulo_id}
                            autoComplete="off"
                            aria-invalid={hasError}
                            aria-describedby={hasError ? errorId : undefined}
                            className={`w-full px-3 py-2 border-2 rounded-xl text-sm pr-8 focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors ${
                                hasError
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 bg-white'
                            }`}
                        />
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Menú Desplegable */}
                    {isOpen && (
                        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm">
                            {listaFiltrada.length > 0 ? (
                                listaFiltrada.map((eq) => (
                                    <li
                                        key={eq.id}
                                        onClick={() => handleSelectOption(eq)}
                                        className={`px-3 py-2 cursor-pointer transition-colors hover:bg-[#218a72]/10 hover:text-[#218a72] ${
                                            String(eq.id) === String(item.articulo_id)
                                                ? 'bg-[#218a72]/10 text-[#218a72] font-semibold'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        {eq.nombre}
                                    </li>
                                ))
                            ) : (
                                <li className="px-3 py-2 text-gray-400 text-xs italic text-center">
                                    No se encontraron resultados
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                {/* Cantidad */}
                <div className="sm:col-span-3">
                    <label htmlFor={cantidadInputId} className="block text-xs font-bold text-gray-800 mb-1">
                        Cantidad <span className="text-xs text-red-600 font-semibold ml-0.5">(obligatorio)</span>
                    </label>
                    <input
                        type="number"
                        id={cantidadInputId}
                        min="1"
                        max={MAX_VALUE_QUANTITY}
                        value={item.cantidad}
                        onChange={(e) => {
                            if (e.target.value === '') {
                                onChange(index, 'cantidad', '');
                                return;
                            }
                            const parsedVal = parseInt(e.target.value) || 0;
                            const clampedVal = Math.min(parsedVal, MAX_VALUE_QUANTITY);
                            onChange(index, 'cantidad', clampedVal);
                        }}
                        required
                        aria-invalid={hasError}
                        aria-describedby={hasError ? errorId : undefined}
                        className={`w-full px-3 py-2 border-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                            hasError
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300 bg-white'
                        }`}
                    />
                </div>

                {/* Precio unitario */}
                <div className="sm:col-span-3">
                    <label htmlFor={precioInputId} className="block text-xs font-bold text-gray-800 mb-1">
                        Precio unit. <span className="text-xs text-red-600 font-semibold ml-0.5">(obligatorio)</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden="true">$</span>
                        <input
                            type="number"
                            id={precioInputId}
                            min="0"
                            value={item.precio_unitario_dia}
                            onChange={(e) => onChange(index, 'precio_unitario_dia', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                            required
                            aria-invalid={hasError}
                            aria-describedby={hasError ? errorId : undefined}
                            className={`w-full pl-7 pr-3 py-2 border-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                hasError
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 bg-white'
                            }`}
                        />
                    </div>
                </div>

                {/* Botón eliminar */}
                <div className="sm:col-span-1 flex justify-center sm:justify-end pb-1">
                    <button
                        type="button"
                        disabled={disableDelete}
                        onClick={() => onRemove(index)}
                        className="p-2 text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`Eliminar fila ${index + 1}`}
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Mensaje de error con accesibilidad mejorada */}
            {item.error && (
                <div role="alert" aria-live="assertive" className="p-3 rounded-xl border border-red-200 bg-red-50">
                    <p id={errorId} className="text-sm text-red-700 font-medium">
                        {item.error}
                    </p>
                </div>
            )}
        </div>
    );
};