import { Alert as MantineAlert } from '@mantine/core';
import { ReactNode, forwardRef } from 'react';

type AlertProps = {
  title?: ReactNode;
  children?: ReactNode;
  color?: 'red' | 'yellow' | 'blue' | 'green' | 'teal' | 'gray';
  icon?: ReactNode;
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ title, children, color = 'blue', icon, ...props }, ref) => (
    <MantineAlert ref={ref} color={color} title={title} icon={icon} {...props}>
      {children}
    </MantineAlert>
  )
);
Alert.displayName = 'Alert';

export { Alert };
