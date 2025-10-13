import { Card } from '@/components/ui/card';
import { Calendar, Users, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';

import LogoutButton from '../components/LogoutButton';

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Company Portal
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Select a tool to get started.
            </p>
          </div>
          <div>
            {/* Logout button */}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => tool.path !== '#' && navigate(tool.path)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent">
                    <Icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {tool.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
