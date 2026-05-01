import { createFileRoute } from '@tanstack/react-router'

type ContactPayload = {
  name?: unknown
  email?: unknown
  message?: unknown
  botField?: unknown
}

const MAX_NAME_LENGTH = 120
const MAX_EMAIL_LENGTH = 320
const MAX_MESSAGE_LENGTH = 4000

export const Route = createFileRoute('/api/contact')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: ContactPayload

        try {
          payload = (await request.json()) as ContactPayload
        } catch {
          return Response.json({ error: 'Invalid request body.' }, { status: 400 })
        }

        const name = normalize(payload.name)
        const email = normalize(payload.email)
        const message = normalize(payload.message)
        const botField = normalize(payload.botField)

        if (botField) {
          return Response.json({ ok: true })
        }

        if (!name || !email || !message) {
          return Response.json(
            { error: 'Please complete all required fields.' },
            { status: 400 },
          )
        }

        if (!isValidEmail(email)) {
          return Response.json(
            { error: 'Please enter a valid email address.' },
            { status: 400 },
          )
        }

        if (
          name.length > MAX_NAME_LENGTH ||
          email.length > MAX_EMAIL_LENGTH ||
          message.length > MAX_MESSAGE_LENGTH
        ) {
          return Response.json(
            { error: 'Your message is too long.' },
            { status: 400 },
          )
        }

        const resendApiKey = process.env.RESEND_API_KEY
        const to = process.env.CONTACT_TO_EMAIL
        const from = process.env.CONTACT_FROM_EMAIL ?? 'Portfolio <onboarding@resend.dev>'

        if (!resendApiKey || !to) {
          return Response.json(
            { error: 'Contact form is not configured yet.' },
            { status: 500 },
          )
        }

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to,
            subject: `Portfolio contact from ${name}`,
            html: buildEmailHtml({ name, email, message }),
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
          }),
        })

        if (!response.ok) {
          const resendError = await response.text()
          console.error('[api/contact] Resend send failed', {
            status: response.status,
            body: resendError,
          })

          return Response.json(
            { error: getContactErrorMessage(response.status, resendError) },
            { status: 502 },
          )
        }

        return Response.json({ ok: true })
      },
    },
  },
})

function normalize(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function getContactErrorMessage(status: number, body: string) {
  if (status === 403 && body.includes('resend.dev')) {
    return 'Resend needs your account email or a verified domain before this form can send messages.'
  }

  if (status === 403 && body.includes('testing emails')) {
    return 'Resend can only send test emails to the email address of your Resend account until you verify a domain.'
  }

  if (status === 403 && body.includes('API key')) {
    return 'The Resend API key is invalid. Please create a new key and update Vercel.'
  }

  if (body.includes('domain is not verified')) {
    return 'The sender domain is not verified in Resend.'
  }

  return 'Could not send the message. Please try again later.'
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function buildEmailHtml({
  name,
  email,
  message,
}: {
  name: string
  email: string
  message: string
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>New portfolio contact</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replaceAll('\n', '<br>')}</p>
    </div>
  `
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
