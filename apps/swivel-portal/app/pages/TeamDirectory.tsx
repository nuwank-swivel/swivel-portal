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
import { PencilIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { getTeams, updateTeam, createTeam, deleteTeam } from '../lib/api/team';
import { Team } from '@swivel-portal/types';
import { searchUsers } from '../lib/api/user';
import { useUIContext } from '@/lib/UIContext';
import { useAuthContext } from '@/lib/AuthContext';

export default function TeamDirectory() {
  const { user } = useAuthContext();
  const azureAdId = user?.azureAdId;

  // Delete dialog state
  const [deleteTeamId, setDeleteTeamId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState('');
  // Member search loading state
  const [createMemberLoading, setCreateMemberLoading] = React.useState(false);
  const [editMemberLoading, setEditMemberLoading] = React.useState(false);
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
    { value: string; label: string }[]
  >([]);
  const [createMemberSearch, setCreateMemberSearch] = React.useState('');
  const [createSelectedMembers, setCreateSelectedMembers] = React.useState<
    string[]
  >([]);

  const [editMemberOptions, setEditMemberOptions] = React.useState<
    { value: string; label: string }[]
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

  const handleCreateMemberSearch = React.useCallback(() => {
    if (createMemberSearch) {
      setCreateMemberLoading(true);
      searchUsers(createMemberSearch)
        .then((results: string[]) => {
          setCreateMemberOptions(
            results.map((u) => ({
              value: u,
              label: u,
            }))
          );
        })
        .finally(() => setCreateMemberLoading(false));
    } else {
      setCreateMemberOptions([]);
      setCreateMemberLoading(false);
    }
  }, [createMemberSearch]);

  useDebouncedEffect(handleCreateMemberSearch, [createMemberSearch], 350);

  const handleEditMemberSearch = React.useCallback(() => {
    if (editMemberSearch) {
      setEditMemberLoading(true);
      searchUsers(editMemberSearch)
        .then((results: string[]) => {
          setEditMemberOptions(
            results.map((u) => ({
              value: u,
              label: u,
            }))
          );
        })
        .finally(() => setEditMemberLoading(false));
    } else {
      setEditMemberOptions([]);
      setEditMemberLoading(false);
    }
  }, [editMemberSearch]);

  useDebouncedEffect(handleEditMemberSearch, [editMemberSearch], 350);

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
        members: createSelectedMembers,
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
    setEditMembers(team.members || []);
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
        members: editMembers,
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
                  {azureAdId === team.ownerId && (
                    <ActionIcon
                      variant="light"
                      color="red"
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 44,
                        zIndex: 2,
                      }}
                      onClick={() => setDeleteTeamId(team._id as string)}
                      aria-label="Delete team"
                    >
                      <Trash2Icon size={18} />
                    </ActionIcon>
                  )}
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
                  <Text size="sm" color="dimmed">
                    {team.members?.length || 0} member
                    {team.members?.length === 1 ? '' : 's'}
                  </Text>
                </Card>
              </Grid.Col>
            ))}
            {/* Delete Team Confirmation Modal */}
            <Modal
              opened={!!deleteTeamId}
              onClose={() => setDeleteTeamId(null)}
              title="Delete Team"
              centered
            >
              <div>
                <Text mb="md">
                  Are you sure you want to delete this team? This action cannot
                  be undone.
                </Text>
                {deleteError && (
                  <Text color="red" mb="md">
                    {deleteError}
                  </Text>
                )}
                <Group mt="md">
                  <Button
                    color="red"
                    loading={deleting}
                    onClick={async () => {
                      if (!deleteTeamId) return;
                      setDeleting(true);
                      setDeleteError('');
                      try {
                        await deleteTeam(deleteTeamId);
                        setTeams((prev) =>
                          prev.filter((t) => t._id !== deleteTeamId)
                        );
                        setDeleteTeamId(null);
                      } catch (err) {
                        if (err instanceof Error) setDeleteError(err.message);
                        else setDeleteError('Failed to delete team');
                      } finally {
                        setDeleting(false);
                      }
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteTeamId(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                </Group>
              </div>
            </Modal>
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
              data={createMemberOptions}
              searchable
              value={createSelectedMembers}
              onChange={setCreateSelectedMembers}
              onSearchChange={setCreateMemberSearch}
              searchValue={createMemberSearch}
              placeholder="Search and select members"
              mb="md"
              rightSection={createMemberLoading ? <Loader size={16} /> : null}
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
              data={editMemberOptions}
              searchable
              value={editMembers}
              onChange={setEditMembers}
              onSearchChange={setEditMemberSearch}
              searchValue={editMemberSearch}
              placeholder="Search and select members"
              mb="md"
              rightSection={editMemberLoading ? <Loader size={16} /> : null}
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
