import { ArrowLeft } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface InfoPageProps {
  title: string;
  settingKey: string;
  defaultContent: string;
  onBack: () => void;
}

export default function InfoPage({ title, settingKey, defaultContent, onBack }: InfoPageProps) {
  const { settings } = useSettings();
  
  const content = (settings as any)[settingKey] || defaultContent;

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

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 md:p-12">
          <h1 className="text-4xl font-serif text-stone-900 mb-6">{title}</h1>
          <div className="prose prose-stone max-w-none">
            <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
