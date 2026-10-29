import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  Building2,
  MapPin,
  Utensils,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Grid3X3,
  X
} from 'lucide-react';

interface CanteenQrGeneratorProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const CanteenQrGenerator: React.FC<CanteenQrGeneratorProps> = ({ onClose, isModal = false }) => {
  const { activeOrg, showToast } = useApp();

  const [selectedLocation, setSelectedLocation] = useState<string>(activeOrg.locations[0] || 'Central Dining Hall');
  const [stationName, setStationName] = useState<string>('Dining Table');
  const [tableNumber, setTableNumber] = useState<string>('Table #12');
  const [selectedMeal, setSelectedMeal] = useState<string>('Dynamic');
  const [specificItem, setSpecificItem] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [batchQrs, setBatchQrs] = useState<{ name: string; url: string; qrData: string }[]>([]);

  const printRef = useRef<HTMLDivElement>(null);

  const stationsList = [
    'Dining Table',
    'Salad Counter',
    'Roti Station',
    'Main Steam Table',
    'Snack & Beverage Bar',
    'Tray Return & Exit Portal',
    'Entrance Standee',
  ];

  // Construct deep link URL
  const getDeployUrl = (loc: string, station: string, table: string, meal: string, item: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://canteenpulse.ai';
    const params = new URLSearchParams();
    params.set('org', activeOrg.slug || activeOrg.id);
    params.set('location', `${loc} - ${station} (${table})`);
    if (meal && meal !== 'Dynamic') {
      params.set('meal', meal);
    }
    if (item && item.trim()) {
      params.set('item', item.trim());
    }
    return `${origin}/?${params.toString()}`;
  };

  const currentDeployUrl = getDeployUrl(selectedLocation, stationName, tableNumber, selectedMeal, specificItem);

  // Generate QR code whenever parameters change
  useEffect(() => {
    QRCode.toDataURL(currentDeployUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then(url => {
        setQrDataUrl(url);
      })
      .catch(err => {
        console.error('QR code generation failed:', err);
      });
  }, [currentDeployUrl]);

  // Generate batch QR codes for common canteen stations
  useEffect(() => {
    if (batchMode) {
      const itemsToBatch = stationsList.map((st, idx) => {
        const url = getDeployUrl(selectedLocation, st, `Station ${idx + 1}`, 'Dynamic', '');
        return { name: st, url };
      });

      Promise.all(
        itemsToBatch.map(item =>
          QRCode.toDataURL(item.url, {
            width: 320,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' },
          }).then(qrData => ({ ...item, qrData }))
        )
      ).then(res => setBatchQrs(res));
    }
  }, [batchMode, selectedLocation]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentDeployUrl);
    setCopied(true);
    showToast('Deployment deep-link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `canteen_qr_${activeOrg.slug}_${stationName.toLowerCase().replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('High-resolution QR code downloaded (PNG)', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`space-y-6 ${isModal ? 'p-6' : 'p-8 max-w-[1400px] mx-auto'}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <QrCode className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Canteen QR Code Deployment Studio
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate location-encoded tabletop standees, station labels, and deep-link posters for <strong>{activeOrg.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setBatchMode(!batchMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              batchMode
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>{batchMode ? 'Single Standee Mode' : 'Batch All Stations'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Standee Cards</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Grid */}
      {!batchMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Controls Configuration (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Context & Station Placement
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Parameters are embedded directly into the QR code link.
              </p>
            </div>

            {/* Dining Location Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Dining Facility Location</span>
              </label>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {activeOrg.locations.map(loc => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Station / Deployment Spot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-slate-400" />
                <span>Station Type</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {stationsList.slice(0, 4).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStationName(st)}
                    className={`p-2 rounded-xl text-xs font-medium text-left truncate transition cursor-pointer border ${
                      stationName === st
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table / Spot Label */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Spot / Table Label
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={e => setTableNumber(e.target.value)}
                  placeholder="e.g. Table #12, Counter A"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pre-Lock Meal Shift
                </label>
                <select
                  value={selectedMeal}
                  onChange={e => setSelectedMeal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium cursor-pointer"
                >
                  <option value="Dynamic">Dynamic (Any Shift)</option>
                  <option value="Breakfast">Breakfast Service</option>
                  <option value="Lunch">Lunch Service</option>
                  <option value="Dinner">Dinner Service</option>
                </select>
              </div>
            </div>

            {/* Specific Item Tag (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pre-selected Menu Item (Optional)
              </label>
              <input
                type="text"
                value={specificItem}
                onChange={e => setSpecificItem(e.target.value)}
                placeholder="e.g. Salad Counter, Dosa, Rice, Fish Curry"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Leave empty for diner-selected items on the menu.
              </span>
            </div>

            {/* Live Deep-Link Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Encoded Link:</span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-[10px] text-slate-500 break-all bg-white p-2 rounded-lg border border-slate-200 select-all">
                {currentDeployUrl}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={handleDownloadPng}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Standee</span>
              </button>
            </div>
          </div>

          {/* Right Live Standee Print Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Physical Table-Tent / Standee Preview (A6 / 4x6" Aspect Ratio)
            </div>

            {/* Printable Card container with print styling */}
            <div
              ref={printRef}
              className="bg-white rounded-3xl p-8 border-2 border-slate-800/10 shadow-xl max-w-sm w-full text-center space-y-4 print:shadow-none print:border-none print:w-full print:max-w-none print:m-0"
            >
              {/* Canteen Brand Mark */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-sm">
                  <div className="grid grid-cols-2 gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </div>
                </div>
                <div className="text-left leading-none">
                  <div className="font-extrabold text-slate-900 text-sm tracking-tight">CanteenPulse</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 font-medium">{activeOrg.name}</div>
                </div>
              </div>

              {/* Title Call to Action */}
              <div className="space-y-0.5 pt-1">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600">
                  Daily Dining Quality
                </div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  How was your meal today?
                </h1>
                <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto">
                  Open your phone camera to scan and share instant meal feedback.
                </p>
              </div>

              {/* Scannable QR Code Image */}
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-900/5 shadow-inner inline-block mx-auto relative group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Canteen Feedback QR"
                    className="w-48 h-48 mx-auto object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
                {/* Visual clover centered badge over QR */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 p-1.5 flex items-center justify-center text-emerald-400 shadow-md">
                    <div className="grid grid-cols-2 gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Context Pill */}
              <div className="py-1 px-3 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1.5 border border-slate-200">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{selectedLocation} · {stationName} ({tableNumber})</span>
              </div>

              {/* Diner Emoji Preview */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-xl select-none">
                <span>😡</span>
                <span>🙁</span>
                <span>😐</span>
                <span>🙂</span>
                <span>🤩</span>
              </div>

              {/* Privacy Footer Guarantee */}
              <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Takes 15s · 100% Anonymous · Reviewed Daily by Mess Committee</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Batch Station Grid Mode */
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950">
            <div>
              <strong>Batch Print Mode: </strong>
              <span>Generating printable cards for all {batchQrs.length} key stations at <strong>{selectedLocation}</strong>. Click Print to produce laminated table tents for the entire dining hall.</span>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition cursor-pointer shrink-0"
            >
              Print All {batchQrs.length} Standees
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {batchQrs.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs text-center space-y-3"
              >
                <div className="font-bold text-xs text-slate-900">{item.name}</div>
                <div className="text-[10px] text-slate-400">{selectedLocation} · Spot #{idx + 1}</div>

                <div className="p-2 bg-slate-50 rounded-xl inline-block mx-auto border border-slate-100">
                  <img src={item.qrData} alt={item.name} className="w-36 h-36 mx-auto object-contain" />
                </div>

                <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 py-1 rounded-lg">
                  Instant Diner Feedback
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
