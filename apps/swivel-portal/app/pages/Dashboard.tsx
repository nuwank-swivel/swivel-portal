import { Card } from '@mantine/core';
import { Calendar, Users, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import CoreLayout from '../components/CoreLayout';
import { useAuthContext } from '@/lib/UseAuthContext';

const tools = [
  {
    id: 'seat-booking',
    name: 'Seat Booking',
    description: 'Reserve your workspace',
    icon: Calendar,
    path: '/seat-booking',
    color: 'text-primary',
  },
  {
    id: 'team',
    name: 'Team Directory',
    description: 'Find your colleagues',
    icon: Users,
    path: '#',
    color: 'text-secondary',
  },
  {
    id: 'documents',
    name: 'Documents',
    description: 'Access company files',
    icon: FileText,
    path: '#',
    color: 'text-muted-foreground',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Manage your preferences',
    icon: Settings,
    path: '#',
    color: 'text-muted-foreground',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  return (
    <CoreLayout>
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ color: '#6B7280', marginTop: 4 }}>
          Welcome back, {user?.name}! Select a tool to get started.
        </h3>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
        }}
      >
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.id}
              p="lg"
              style={{
                cursor: tool.path !== '#' ? 'pointer' : 'default',
                opacity: tool.path !== '#' ? 1 : 0.6,
                filter: tool.path !== '#' ? 'none' : 'grayscale(1)',
                transition: 'box-shadow 0.2s',
                boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
              }}
              onClick={() => tool.path !== '#' && navigate(tool.path)}
              withBorder
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: 16 }}>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: '#F1F5F9',
                  }}
                >
                  <Icon size={24} color="#2563EB" />
                </div>
                <div>
                  <h2
                    style={{ fontSize: 20, fontWeight: 600, color: '#111827' }}
                  >
                    {tool.name}
                  </h2>
                  <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
                    {tool.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </CoreLayout>
  );
}
