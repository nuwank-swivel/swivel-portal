import React, { useEffect } from 'react';
import CoreLayout from '../components/CoreLayout';
import {
  Card,
  Modal,
  Button,
  TextInput,
  ColorInput,
  Group,
  Text,
  MultiSelect,
} from '@mantine/core';
import { getTeams, updateTeam } from '../lib/api/team';
import { Team } from '@swivel-portal/types';
import { createTeam } from '../lib/api/team';

export default function TeamDirectory() {
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showCreate, setShowCreate] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newColor, setNewColor] = React.useState('#000000');
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState('');

  const [editTeam, setEditTeam] = React.useState<Team | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editColor, setEditColor] = React.useState('#000000');
  const [editMembers, setEditMembers] = React.useState<string[]>([]);
  const [editing, setEditing] = React.useState(false);
  const [editError, setEditError] = React.useState('');

  // Placeholder: member options, to be integrated later
  const memberOptions = [
    { value: 'user1', label: 'User One' },
    { value: 'user2', label: 'User Two' },
    { value: 'user3', label: 'User Three' },
  ];

  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      setError('');
      try {
        const data = await getTeams();
        setTeams(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error fetching teams');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const team = await createTeam({ name: newName, color: newColor });
      setTeams((prev) => [...prev, team]);
      setShowCreate(false);
      setNewName('');
      setNewColor('#000000');
    } catch (err) {
      if (err instanceof Error) setCreateError(err.message);
      else setCreateError('Failed to create team');
    } finally {
      setCreating(false);
    }
  }

  function openEditModal(team: Team) {
    setEditTeam(team);
    setEditName(team.name);
    setEditColor(team.color);
    setEditMembers(team.memberIds || []);
    setEditError('');
  }

  async function handleEditTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!editTeam) return;
    setEditing(true);
    setEditError('');
    try {
      // Only update name, color, and members for now
      const updated = await updateTeam({
        _id: editTeam._id,
        name: editName,
        color: editColor,
        memberIds: editMembers,
        ownerId: editTeam.ownerId,
      });
      setTeams((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
      setEditTeam(null);
    } catch (err) {
      if (err instanceof Error) setEditError(err.message);
      else setEditError('Failed to update team');
    } finally {
      setEditing(false);
    }
  }

  return (
    <CoreLayout>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Team Directory
      </h1>
      <div>
        {loading ? (
          <Card p="lg" style={{ marginBottom: 16 }}>
            <div>Loading teams...</div>
          </Card>
        ) : error ? (
          <Card p="lg" style={{ marginBottom: 16 }}>
            <div style={{ color: 'red' }}>{error}</div>
          </Card>
        ) : teams.length === 0 ? (
          <Card p="lg" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600 }}>No teams found.</div>
          </Card>
        ) : (
          teams.map((team) => (
            <Card key={team._id} p="lg" style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600 }}>{team.name}</div>
              <div style={{ color: team.color }}>Color: {team.color}</div>
              <Group mt="sm">
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => openEditModal(team)}
                >
                  Edit
                </Button>
              </Group>
            </Card>
          ))
        )}
        <Group style={{ marginTop: 32 }}>
          <Button
            onClick={() => setShowCreate(true)}
            variant="filled"
            color="blue"
          >
            + Create Team
          </Button>
        </Group>
        {/* Create Team Modal */}
        <Modal
          opened={showCreate}
          onClose={() => setShowCreate(false)}
          title="Create Team"
          centered
        >
          <form onSubmit={handleCreateTeam}>
            <TextInput
              label="Team Name"
              value={newName}
              onChange={(e) => setNewName(e.currentTarget.value)}
              required
              mb="md"
            />
            <ColorInput
              label="Team Color"
              value={newColor}
              onChange={setNewColor}
              mb="md"
            />
            <MultiSelect
              label="Members"
              data={memberOptions}
              searchable
              value={[]}
              // onChange={() => {}}
              placeholder="Select members (integration later)"
              mb="md"
              disabled
            />
            {createError && (
              <Text color="red" mb="md">
                {createError}
              </Text>
            )}
            <Group mt="md">
              <Button type="submit" loading={creating} color="blue">
                Create
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
            </Group>
          </form>
        </Modal>
        {/* Edit Team Modal */}
        <Modal
          opened={!!editTeam}
          onClose={() => setEditTeam(null)}
          title="Edit Team"
          centered
        >
          <form onSubmit={handleEditTeam}>
            <TextInput
              label="Team Name"
              value={editName}
              onChange={(e) => setEditName(e.currentTarget.value)}
              required
              mb="md"
            />
            <ColorInput
              label="Team Color"
              value={editColor}
              onChange={setEditColor}
              mb="md"
            />
            <MultiSelect
              label="Members"
              data={memberOptions}
              searchable
              value={editMembers}
              onChange={setEditMembers}
              placeholder="Select members (integration later)"
              mb="md"
            />
            {editError && (
              <Text color="red" mb="md">
                {editError}
              </Text>
            )}
            <Group mt="md">
              <Button type="submit" loading={editing} color="blue">
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTeam(null)}
              >
                Cancel
              </Button>
            </Group>
          </form>
        </Modal>
      </div>
    </CoreLayout>
  );
}
