export async function api(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    }
  });
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    const payload = contentType.includes('application/json') ? await response.json().catch(() => ({})) : { message: await response.text() };
    throw new Error(payload.message || payload.error || `Request failed with status ${response.status}`);
  }
  return contentType.includes('application/json') ? response.json() : response;
}

export function download(path) {
  window.location.href = `/api${path}`;
}

export function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}
