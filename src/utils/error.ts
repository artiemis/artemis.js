export class CommandError extends Error {}

export function isCommandError(error: any): error is CommandError {
  return error instanceof CommandError;
}

export function isError(error: any): error is Error {
  return error instanceof Error;
}
