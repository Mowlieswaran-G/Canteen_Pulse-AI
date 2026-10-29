import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';
import { CheckCircle2, Megaphone, Send, ShieldCheck, Sparkles, Info, QrCode, Printer } from 'lucide-react';

export const FeedbackFormView: React.FC = () => {
  const { activeOrg, showToast, setActiveView, setIsQrModalOpen } = useApp();

  const [rating, setRating] = useState<number>(4);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [meal, setMeal] = useState<'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>('Lunch');
  const [item, setItem] = useState<string>('Dal Tadka & Rice');
  const [location, setLocation] = useState<string>(activeOrg.locations[0] || 'Central Dining Hall');
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [honeypot, setHoneypot] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Pre-fill from URL query parameters if present (?org=...&item=...&meal=...&location=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mealParam = params.get('meal');
    const itemParam = params.get('item');
    const locParam = params.get('location');
    if (mealParam) {
      const cap = mealParam.charAt(0).toUpperCase() + mealParam.slice(1).toLowerCase();
      if (['Breakfast', 'Lunch', 'Snacks', 'Dinner'].includes(cap)) {
        setMeal(cap as any);
      }
    }
    if (itemParam) {
      setItem(itemParam);
    }
    if (locParam) {
      setLocation(locParam);
    }
  }, []);

  const availableTags = [
    'Cold',
    'Salty',
    'Stale',
    'Oily',
    'Late Queue',
    'Dirty Counter',
    'Delicious',
    'Hot & Fresh',
    'Portion Small',
    'Polite Staff',
  ];

  const menuItems = [
    'Dal Tadka & Rice',
    'Paneer Butter Masala',
    'Idli & Sambar',
    'Chapati & Mixed Veg',
    'Salad Counter',
    'Poori & Potato Masala',
    'Curd Rice & Pickle',
    'Snack & Tea Service',
  ];

  const toggleTag = (t: string) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter(item => item !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const res = api.submitPublicFeedback({
      orgSlug: activeOrg.slug,
      rating,
      tags: selectedTags,
      meal,
      item,
      location,
      comment,
      isAnonymous,
      honeypot,
    });

    if (res.success) {
      setIsSubmitted(true);
      showToast('Thank you! Your feedback has been recorded anonymously.', 'success');
    }
  };

  const emojiList = [
    { value: 1, emoji: '😡', label: 'Terrible' },
    { value: 2, emoji: '🙁', label: 'Poor' },
    { value: 3, emoji: '😐', label: 'Fair' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '🤩', label: 'Excellent' },
  ];

  if (isSubmitted) {
    return (
      <div className="p-6 md:p-12 max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Feedback Received!</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Your dining log has been anonymized and ingested into the mess operational pipeline. Actionable issues will be prioritized and resolved by the kitchen staff.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2 text-left">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy Guaranteed</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {isAnonymous
              ? 'Submitted in 100% anonymous mode. No student roll number, IP address, or identity stored.'
              : 'Submitted with verified student account credentials.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => setActiveView('you_said_we_did')}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>View "You Said, We Did" Public Board</span>
          </button>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setComment('');
              setSelectedTags([]);
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            Submit Another Meal Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6">
      {/* 30-Second Summary Box */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold">Diner QR Feedback Portal:</span> Tap an emoji rating, pick quick chips, and leave an optional multi-language comment. Takes less than 15 seconds.
        </div>
      </div>

      {/* Canteen QR Deployment Standee Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Deploy Canteen Table QR Standees</div>
            <div className="text-[11px] text-slate-400">Print laminated QR code cards for dining tables, roti counters & tray return.</div>
          </div>
        </div>
        <button
          onClick={() => setIsQrModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Launch QR Studio</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">How was your meal today?</h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeOrg.name} · Dining Feedback
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot Anti-Spam (Hidden) */}
          <input
            type="text"
            name="hp_website"
            value={honeypot}
            onChange={e => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* 1. Big Emoji Rating (1-5) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-3 text-center uppercase tracking-wide">
              Tap Your Rating
            </label>
            <div className="flex items-center justify-between gap-2 max-w-sm mx-auto">
              {emojiList.map(item => {
                const isSelected = rating === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRating(item.value)}
                    className={`flex flex-col items-center p-3 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-2 border-emerald-500 scale-110 shadow-sm'
                        : 'hover:bg-slate-50 border border-slate-100 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="text-3xl filter select-none">{item.emoji}</span>
                    <span className={`text-[10px] mt-1.5 font-bold ${isSelected ? 'text-emerald-800' : 'text-slate-400'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Quick-Tag Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Quick Tags (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const isChecked = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isChecked
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Meal & Item Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meal Shift
              </label>
              <select
                value={meal}
                onChange={e => setMeal(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Breakfast">Breakfast Service</option>
                <option value="Lunch">Lunch Service</option>
                <option value="Snacks">Evening Snacks</option>
                <option value="Dinner">Dinner Service</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Menu Item
              </label>
              <select
                value={item}
                onChange={e => setItem(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {menuItems.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dining Location
            </label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {activeOrg.locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Multi-language Comment Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Comments (Optional)
              </label>
              <span className="text-[10px] text-slate-400">English, Hindi, Tamil & any language</span>
            </div>
            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="e.g. Sambar was cold today / दाल ठंडी थी / சாம்பார் சூடாக இல்லை..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 5. Anonymous Toggle (Default ON) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">Submit Anonymously</div>
              <div className="text-[10px] text-slate-500">Your profile and student email will not be shared</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Submit Meal Feedback</span>
          </button>
        </form>
      </div>
    </div>
  );
};
