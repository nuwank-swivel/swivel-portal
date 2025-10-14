import { Radio } from '@mantine/core';
import { forwardRef } from 'react';

const RadioGroup = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Radio.Group>
>((props, ref) => <Radio.Group ref={ref} {...props} />);
RadioGroup.displayName = 'RadioGroup';

const RadioGroupItem = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Radio>
>((props, ref) => <Radio ref={ref} {...props} />);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
