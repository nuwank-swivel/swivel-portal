import { type SVGProps } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { useTheme } from '@/lib/ThemeContext';

function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tooltip
      label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      withArrow
      openDelay={400}
      closeDelay={150}
    >
      <ActionIcon
        aria-label="Toggle color scheme"
        size="lg"
        variant="subtle"
        color={isDark ? 'yellow' : 'blue'}
        onClick={toggleColorScheme}
      >
        {isDark ? (
          <SunIcon width={18} height={18} />
        ) : (
          <MoonIcon width={18} height={18} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}
