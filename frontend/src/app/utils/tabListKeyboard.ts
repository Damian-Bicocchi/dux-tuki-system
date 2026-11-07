import type React from 'react';

/**
 * Navegación por teclado para tablists con role="tab".
 * Usa activación automática: al mover el foco con las flechas también se
 * selecciona la pestaña, siguiendo el patrón de ARIA Authoring Practices.
 */
export function handleTabListKeyDown(
  event: React.KeyboardEvent<HTMLElement>,
) {
  const tabs = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
  ).filter((tab) => !tab.disabled);

  if (tabs.length === 0) return;

  const currentIndex = tabs.indexOf(
    document.activeElement as HTMLButtonElement,
  );

  const focusTab = (index: number) => {
    event.preventDefault();
    const tab = tabs[index];

    if (!tab) return;

    tab.focus();
    tab.click();
  };

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      focusTab(currentIndex < 0 ? 0 : (currentIndex + 1) % tabs.length);
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      focusTab(
        currentIndex < 0
          ? tabs.length - 1
          : (currentIndex - 1 + tabs.length) % tabs.length,
      );
      break;
    case 'Home':
      focusTab(0);
      break;
    case 'End':
      focusTab(tabs.length - 1);
      break;
  }
}
