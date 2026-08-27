interface SubmitPropertyLocationOptions {
  isLoading: boolean;
  getLocationInput: () => string;
  flush: (commit: () => void) => void;
  commitLocation: (location: string | undefined) => void;
  getLatestSearch: () => () => void;
}

export function submitPropertyLocation({
  isLoading,
  getLocationInput,
  flush,
  commitLocation,
  getLatestSearch,
}: SubmitPropertyLocationOptions): boolean {
  if (isLoading) return false;

  const location = getLocationInput().trim() || undefined;
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
