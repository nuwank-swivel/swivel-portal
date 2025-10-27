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
  ActionIcon,
  Grid,
  Loader,
} from '@mantine/core';
import { PencilIcon, PlusCircleIcon } from 'lucide-react';
import { getTeams, updateTeam } from '../lib/api/team';
import { Team } from '@swivel-portal/types';
import { createTeam } from '../lib/api/team';
import { searchUsers, UserSearchResult } from '../lib/api/user';
import { useUIContext } from '@/lib/UIContext';

export default function TeamDirectory() {
  const { setCurrentModule } = useUIContext();

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

  // Member search state
  const [createMemberOptions, setCreateMemberOptions] = React.useState<
    UserSearchResult[]
  >([]);
  const [createMemberSearch, setCreateMemberSearch] = React.useState('');
  const [createSelectedMembers, setCreateSelectedMembers] = React.useState<
    string[]
  >([]);

  const [editMemberOptions, setEditMemberOptions] = React.useState<
    UserSearchResult[]
  >([]);
  const [editMemberSearch, setEditMemberSearch] = React.useState('');

  // Debounce helpers
  function useDebouncedEffect(
    effect: () => void,
    deps: React.DependencyList,
    delay: number
  ) {
    React.useEffect(() => {
      const handler = setTimeout(() => effect(), delay);
      return () => clearTimeout(handler);
    }, [...deps, delay, effect]);
  }

  useDebouncedEffect(
    () => {
      if (createMemberSearch) {
        searchUsers(createMemberSearch).then(setCreateMemberOptions);
      } else {
        setCreateMemberOptions([]);
      }
    },
    [createMemberSearch],
    350
  );

  useDebouncedEffect(
    () => {
      if (editMemberSearch) {
        searchUsers(editMemberSearch).then(setEditMemberOptions);
      } else {
        setEditMemberOptions([]);
      }
    },
    [editMemberSearch],
    350
  );

  useEffect(() => {
    setCurrentModule('Team Directory');
  }, [setCurrentModule]);

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
      const team = await createTeam({
        name: newName,
        color: newColor,
        memberIds: createSelectedMembers,
      });
      setTeams((prev) => [...prev, team]);
      setShowCreate(false);
      setNewName('');
      setNewColor('#000000');
      setCreateSelectedMembers([]);
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
    setEditMemberSearch('');
    setEditMemberOptions([]);
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
      <div>
        {loading ? (
          <Card p="lg" style={{ marginBottom: 16 }}>
            <Loader />
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
          <Grid gutter={24} mt={8}>
            <Grid.Col span={3}>
              <Button
                p="lg"
                w="100%"
                style={{ position: 'relative', minHeight: 120 }}
                onClick={() => setShowCreate(true)}
                variant="default"
              >
                <PlusCircleIcon size={18} className="mr-2" /> Create Team
              </Button>
            </Grid.Col>
            {teams.map((team) => (
              <Grid.Col key={team._id} span={3}>
                <Card
                  p="lg"
                  className="cursor-pointer"
                  style={{ position: 'relative', minHeight: 120 }}
                  withBorder
                >
                  <ActionIcon
                    variant="light"
                    color="blue"
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 2,
                    }}
                    onClick={() => openEditModal(team)}
                    aria-label="Edit team"
                  >
                    <PencilIcon size={18} />
                  </ActionIcon>
                  <Group
                    className="flex flex-row items-center"
                    style={{ marginBottom: 8 }}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>
                      {team.name}
                    </div>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
        {/* <Group style={{ marginTop: 32 }}>
          <Button
            onClick={() => setShowCreate(true)}
            variant="filled"
            color="blue"
          >
            + Create Team
          </Button>
        </Group> */}
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
              data={createMemberOptions.map((u) => ({
                value: u._id,
                label: u.name + ' (' + u.email + ')',
              }))}
              searchable
              value={createSelectedMembers}
              onChange={setCreateSelectedMembers}
              onSearchChange={setCreateMemberSearch}
              searchValue={createMemberSearch}
              placeholder="Search and select members"
              mb="md"
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
              data={editMemberOptions.map((u) => ({
                value: u._id,
                label: u.name + ' (' + u.email + ')',
              }))}
              searchable
              value={editMembers}
              onChange={setEditMembers}
              onSearchChange={setEditMemberSearch}
              searchValue={editMemberSearch}
              placeholder="Search and select members"
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
