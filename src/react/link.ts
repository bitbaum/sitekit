/**
 * The one framework seam in the package.
 *
 * The chrome needs to render links, and every framework has its own Link with
 * its own prefetching. Rather than depending on any of them, components that
 * link accept a `Link` component and default to a plain anchor — correct
 * everywhere, and a Next.js consumer passes `next/link` to get client-side
 * navigation back.
 */

import { createElement, type ComponentType, type ReactNode } from 'react';

export interface LinkProps {
  href: string;
  className?: string;
  'aria-current'?: 'page';
  children?: ReactNode;
}

export type LinkLike = ComponentType<LinkProps>;

export const DefaultLink: LinkLike = (props) => createElement('a', props);
