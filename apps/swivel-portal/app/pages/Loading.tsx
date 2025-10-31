import { Alert, Loader } from '@mantine/core';

export function Loading({ error }: { error?: string }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center ">
      <Loader size="md" color="gray" className="mb-4" />
      <div className="mb-4 text-2xl font-semibold text-gray-700 text-center">
        Swivel Portal
        {error ? (
          <Alert variant="light" color="red">
            {error}
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
