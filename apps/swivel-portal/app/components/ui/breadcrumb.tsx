import {
  Breadcrumbs as MantineBreadcrumbs,
  BreadcrumbsProps,
} from '@mantine/core';
import { forwardRef, ReactNode } from 'react';

type BreadcrumbProps = BreadcrumbsProps & { children?: ReactNode };

const Breadcrumb = forwardRef<HTMLDivElement, BreadcrumbProps>((props, ref) => (
  <MantineBreadcrumbs ref={ref} {...props} />
));
Breadcrumb.displayName = 'Breadcrumb';

export { Breadcrumb };
