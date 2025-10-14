import {
  Button as MantineButton,
  ButtonProps as MantineButtonProps,
} from '@mantine/core';
import { forwardRef } from 'react';

// const Button = forwardRef<HTMLButtonElement, MantineButtonProps>(
//   (props, ref) => <MantineButton ref={ref} {...props} />
// );
// Button.displayName = 'Button';
type ButtonProps = React.PropsWithChildren<
  React.ComponentPropsWithoutRef<'button'> &
    MantineButtonProps & { type: 'button' | 'submit' | 'reset' }
>;

const Button = (props: ButtonProps) => {
  return <MantineButton {...props}>{props.children}</MantineButton>;
};

export { Button };
