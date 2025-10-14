import { ActionIcon, Tooltip } from '@mantine/core';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { FC } from 'react';

interface BackButtonProps {
  to?: string;
  label?: string;
}

/**
 * Global back button for navigation, defaults to dashboard.
 */
const BackButton: FC<BackButtonProps> = ({
  to = '/',
  label = 'Back to dashboard',
}) => {
  const navigate = useNavigate();
  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        variant="subtle"
        size="lg"
        aria-label={label}
        onClick={() => navigate(to)}
        style={{ marginRight: 8 }}
      >
        <ChevronLeft size={24} />
      </ActionIcon>
    </Tooltip>
  );
};

export default BackButton;
