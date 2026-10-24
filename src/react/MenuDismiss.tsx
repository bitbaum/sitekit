'use client';
import { useEffect } from 'react';

/** Native details works without JS; this adds Escape, outside click and route dismissal. */
export function MenuDismiss({ currentPath }: { currentPath: string }) {
  useEffect(() => {
    const menus = Array.from(document.querySelectorAll<HTMLDetailsElement>('[data-sitekit-menu]'));
    for (const menu of menus) menu.open = false;
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      for (const menu of menus)
        if (menu.open) {
          menu.open = false;
          menu.querySelector('summary')?.focus();
        }
    };
    const outside = (event: PointerEvent) => {
      for (const menu of menus) if (!menu.contains(event.target as Node)) menu.open = false;
    };
    const follow = (event: MouseEvent) => {
      if ((event.target as Element).closest('a')) for (const menu of menus) menu.open = false;
    };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    for (const menu of menus) menu.addEventListener('click', follow);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', outside);
      for (const menu of menus) menu.removeEventListener('click', follow);
    };
  }, [currentPath]);
  return null;
}
