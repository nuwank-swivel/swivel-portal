import {
  Card as MantineCard,
  CardSection,
  CardProps as MantineCardProps,
  Text,
  Group,
} from '@mantine/core';
import { forwardRef, ReactNode } from 'react';

type CardProps = MantineCardProps & { children?: ReactNode };

const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => (
  <MantineCard ref={ref} {...props} />
));
Card.displayName = 'Card';

// Mantine CardSection can be used for header/footer/content as needed
export { Card, CardSection };
