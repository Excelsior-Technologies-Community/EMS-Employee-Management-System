// Simulates an async API round-trip so components behave exactly like they
// will once real axios calls replace these — same shape, same delay-driven
// loading states, same thrown-error path for failures.
export const mockRequest = (payload, { delay = 400, fail = false, message = 'Something went wrong.' } = {}) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject({ response: { data: { message } } });
      else resolve({ data: { success: true, data: payload } });
    }, delay);
  });
