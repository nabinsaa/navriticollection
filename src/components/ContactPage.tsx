import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface ContactPageProps {
  onBack: () => void;
}

export default function ContactPage({ onBack }: ContactPageProps) {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Shop</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">
            {settings.contact_title || 'Get in Touch'}
          </h1>
          <p className="text-lg text-stone-600">
            {settings.contact_subtitle || 'We\'d love to hear from you'}
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {settings.contact_email && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Email Us</h3>
              <a
                href={`mailto:${settings.contact_email}`}
                className="text-stone-600 hover:text-amber-600 transition-colors"
              >
                {settings.contact_email}
              </a>
            </div>
          )}

          {settings.contact_phone && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Call Us</h3>
              <a
                href={`tel:${settings.contact_phone}`}
                className="text-stone-600 hover:text-amber-600 transition-colors"
              >
                {settings.contact_phone}
              </a>
            </div>
          )}

          {settings.contact_address && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Visit Us</h3>
              <p className="text-stone-600">{settings.contact_address}</p>
            </div>
          )}

          {settings.contact_hours && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Business Hours</h3>
              <p className="text-stone-600 whitespace-pre-line">{settings.contact_hours}</p>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 md:p-12">
          <h2 className="text-2xl font-serif text-stone-900 mb-6">Send Us a Message</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Subject</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="How can we help?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder="Your message..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
