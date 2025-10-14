import { Loader } from '@mantine/core';

export function Loading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center ">
      <Loader size="md" color="gray" className="mb-4" />
      <div className="mb-4 text-2xl font-semibold text-gray-700">
        Swivel Portal
      </div>
    </div>
  );
}
