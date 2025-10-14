import {
  Avatar as MantineAvatar,
  AvatarProps as MantineAvatarProps,
} from '@mantine/core';
import { forwardRef } from 'react';

type AvatarProps = MantineAvatarProps;

const Avatar = forwardRef<HTMLDivElement, AvatarProps>((props, ref) => (
  <MantineAvatar ref={ref} {...props} />
));
Avatar.displayName = 'Avatar';

export { Avatar };
