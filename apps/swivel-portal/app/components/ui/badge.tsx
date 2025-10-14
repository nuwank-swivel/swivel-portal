import {
  Badge as MantineBadge,
  BadgeProps as MantineBadgeProps,
} from '@mantine/core';
import { forwardRef } from 'react';

type BadgeProps = MantineBadgeProps;

const Badge = forwardRef<HTMLDivElement, BadgeProps>((props, ref) => (
  <MantineBadge ref={ref} {...props} />
));
Badge.displayName = 'Badge';

export { Badge };
