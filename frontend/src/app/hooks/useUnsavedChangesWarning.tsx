import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useBlocker, useLocation } from 'react-router';

const UNSAVED_CHANGES_MESSAGE =
  'Si salís ahora, los cambios que hiciste se van a perder.';

interface UnsavedChangesContextValue {
  register: (id: string, isDirty: boolean) => void;
  unregister: (id: string) => void;
  allowNavigation: () => void;
}

const UnsavedChangesContext =
  createContext<UnsavedChangesContextValue | null>(null);

function UnsavedChangesModal({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  const stayButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => stayButtonRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onStay();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (element) =>
          !element.hasAttribute('disabled') &&
          element.getAttribute('aria-hidden') !== 'true',
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onStay]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onStay}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        aria-describedby="unsaved-changes-description"
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 pb-8 sm:pb-6"
      >
        <div
          className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4"
          aria-hidden="true"
        >
          <svg
            className="w-7 h-7 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3h.008M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78a1.5 1.5 0 0 0 1.29-2.25L13.71 3.86a1.5 1.5 0 0 0-2.58 0Z"
            />
          </svg>
        </div>

        <h2
          id="unsaved-changes-title"
          className="text-xl font-bold text-gray-900 text-center mb-2"
        >
          Cambios sin guardar
        </h2>
        <p
          id="unsaved-changes-description"
          className="text-sm text-gray-600 text-center leading-relaxed mb-6"
        >
          {UNSAVED_CHANGES_MESSAGE}
        </p>

        <div className="flex flex-col gap-3">
          <button
            ref={stayButtonRef}
            type="button"
            onClick={onStay}
            className="w-full py-3.5 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-colors"
          >
            Seguir editando
          </button>

          <button
            type="button"
            onClick={onLeave}
            className="w-full py-3.5 px-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-colors"
          >
            Salir sin guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const allowNavigationRef = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    if (previousPathRef.current === location.pathname) return;
    previousPathRef.current = location.pathname;
    allowNavigationRef.current = false;
  }, [location.pathname]);

  const register = useCallback((id: string, isDirty: boolean) => {
    setDirtyIds((previous) => {
      const hasId = previous.has(id);

      if (isDirty && !hasId) {
        const next = new Set(previous);
        next.add(id);
        return next;
      }

      if (!isDirty && hasId) {
        const next = new Set(previous);
        next.delete(id);
        return next;
      }

      return previous;
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setDirtyIds((previous) => {
      if (!previous.has(id)) return previous;
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
  }, []);

  const allowNavigation = useCallback(() => {
    allowNavigationRef.current = true;
  }, []);

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        dirtyIds.size > 0 &&
        !allowNavigationRef.current &&
        currentLocation.pathname !== nextLocation.pathname,
      [dirtyIds.size],
    ),
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setIsModalOpen(true);
    }
  }, [blocker.state]);

  useEffect(() => {
    if (dirtyIds.size === 0) {
      setIsModalOpen(false);
    }
  }, [dirtyIds.size]);

  useEffect(() => {
    if (dirtyIds.size === 0) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = UNSAVED_CHANGES_MESSAGE;
      return UNSAVED_CHANGES_MESSAGE;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirtyIds.size]);

  const handleStay = useCallback(() => {
    setIsModalOpen(false);
    blocker.reset?.();
  }, [blocker]);

  const handleLeave = useCallback(() => {
    setIsModalOpen(false);
    blocker.proceed?.();
  }, [blocker]);

  const value = useMemo(
    () => ({ register, unregister, allowNavigation }),
    [register, unregister, allowNavigation],
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      <UnsavedChangesModal
        open={isModalOpen}
        onStay={handleStay}
        onLeave={handleLeave}
      />
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChangesWarning(isDirty: boolean) {
  const context = useContext(UnsavedChangesContext);
  const id = useId();

  useEffect(() => {
    if (!context) return;
    context.register(id, isDirty);
  }, [context, id, isDirty]);

  useEffect(() => {
    if (!context) return;
    return () => context.unregister(id);
  }, [context, id]);

  return {
    allowNavigation: context?.allowNavigation ?? (() => {}),
  };
}
