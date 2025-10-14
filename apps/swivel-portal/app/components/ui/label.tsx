import { Input } from '@mantine/core';
import { forwardRef } from 'react';

const Label = forwardRef<HTMLLabelElement, React.ComponentProps<'label'>>(
  (props, ref) => <Input.Label ref={ref} {...props} />
);
Label.displayName = 'Label';

export { Label };
