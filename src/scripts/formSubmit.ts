export interface FormSubmitResult {
  ok: boolean;
  error?: string;
}

export async function submitFormToFormspree(
  form: HTMLFormElement,
  endpoint: string
): Promise<FormSubmitResult> {
  const data = new FormData(form);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });

    if (res.ok) return { ok: true };

    const json = await res.json().catch(() => null);
    const message =
      json?.errors?.map((e: { message: string }) => e.message).join(', ') ||
      'Something went wrong. Please try again or call (314) 764-9222.';
    return { ok: false, error: message };
  } catch {
    return {
      ok: false,
      error: 'Network error — please try again or call (314) 764-9222.',
    };
  }
}
