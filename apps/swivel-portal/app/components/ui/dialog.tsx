import { Modal, ModalProps, Group, Text } from '@mantine/core';
import { forwardRef } from 'react';

// Dialog is now a wrapper for Mantine Modal
const Dialog = forwardRef<HTMLDivElement, ModalProps>((props, ref) => (
  <Modal ref={ref} {...props} />
));
Dialog.displayName = 'Dialog';

// For compatibility, export Modal as DialogContent
const DialogContent = Dialog;

// Simple header/footer/title/description helpers using Mantine primitives
const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <Group mb="md">{children}</Group>
);
const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <Group mt="md" justify="flex-end">
    {children}
  </Group>
);
const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <Text size="lg" fw={700}>
    {children}
  </Text>
);
const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <Text c="dimmed" size="sm">
    {children}
  </Text>
);

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
