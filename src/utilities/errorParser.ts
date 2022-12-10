export function parseError(errorIn: unknown): Error {
  const errorOut = new Error()

  if (errorIn instanceof Error) {
    errorOut.message = errorIn.message
    errorOut.name = errorIn.name
    errorOut.stack = errorIn.stack
  }

  return errorOut
}
