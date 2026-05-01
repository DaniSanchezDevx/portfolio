import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Mail, Send } from 'lucide-react'
import { submitContactForm } from '@/lib/contact-form'

export const Route = createFileRoute('/contact')({
  component: Contact,
})

function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Message Sent!
          </h2>
          <p className="text-gray-600 mb-6">
            Thanks for reaching out. I'll get back to you as soon as possible.
          </p>
          <button
            onClick={() => {
              setError('')
              setSubmitted(false)
            }}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact</h1>
        <p className="text-gray-600 mb-8">
          Have a question or want to work together? Drop me a message.
        </p>

        <form
          name="contact"
          method="POST"
          onSubmit={async (e) => {
            e.preventDefault()
            setIsSubmitting(true)
            setError('')

            try {
              await submitContactForm(e.currentTarget)
              setSubmitted(true)
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : 'Could not send the message.',
              )
            } finally {
              setIsSubmitting(false)
            }
          }}
          className="space-y-6"
        >
          <p hidden>
            <label>
              Don't fill this out: <input name="bot-field" />
            </label>
          </p>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              placeholder="Your message..."
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send size={16} />
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}
