import { Divider } from '@mantine/core';
import { forwardRef } from 'react';

const Separator = forwardRef<
  HTMLDivElement,
  { orientation?: 'horizontal' | 'vertical' }
>((props, ref) => (
  <Divider ref={ref} orientation={props.orientation || 'horizontal'} />
));
Separator.displayName = 'Separator';

export { Separator };
