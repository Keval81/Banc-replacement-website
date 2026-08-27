interface SubmitPropertyLocationOptions {
  isLoading: boolean;
  locationInput: string;
  flush: (commit: () => void) => void;
  commitLocation: (location: string | undefined) => void;
  getLatestSearch: () => () => void;
}

export function submitPropertyLocation({
  isLoading,
  locationInput,
  flush,
  commitLocation,
  getLatestSearch,
}: SubmitPropertyLocationOptions): boolean {
  if (isLoading) return false;

  const location = locationInput.trim() || undefined;
  flush(() => commitLocation(location));
  getLatestSearch()();
  return true;
}

export function searchThenClose(
  onSearch: (() => void) | undefined,
  onClose: (() => void) | undefined,
): void {
  onSearch?.();
  onClose?.();
}
