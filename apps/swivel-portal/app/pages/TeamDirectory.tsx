import CoreLayout from '../components/CoreLayout';
import { Card } from '@mantine/core';
import { useEffect } from 'react';

export default function TeamDirectory() {
  // Placeholder: Fetch teams from API in future steps
  return (
    <CoreLayout>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Team Directory
      </h1>
      <div>
        {/* TODO: List teams here */}
        <Card p="lg" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600 }}>No teams found.</div>
        </Card>
        {/* TODO: Admin actions (create, edit, delete) will go here */}
      </div>
    </CoreLayout>
  );
}
