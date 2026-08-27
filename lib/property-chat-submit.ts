export type SingleFlightRunner = <T>(action: () => Promise<T>) => Promise<boolean>;

export function createSingleFlightRunner(): SingleFlightRunner {
  let inFlight = false;

  return async <T>(action: () => Promise<T>): Promise<boolean> => {
    if (inFlight) return false;
    inFlight = true;
    try {
      await action();
      return true;
    } finally {
      inFlight = false;
    }
  };
}
