export function success<T>(data: T) {
  return { success: true, data };
}

export function fail(message: string, code = 500) {
  return { success: false, error: message, code };
}
