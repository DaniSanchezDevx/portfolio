type ContactResponse = {
  error?: string
}

export async function submitContactForm(form: HTMLFormElement) {
  const formData = new FormData(form)
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      botField: formData.get('bot-field'),
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ContactResponse
    throw new Error(body.error ?? 'Could not send the message.')
  }
}
