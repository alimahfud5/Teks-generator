import React, { useState } from 'react';
import { Check, Copy, Download, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallControl: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (isInstalled) {
    return null;
  }

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const bubblewrapCmd = `npm i -g @bubblewrap/cli && bubblewrap init --manifest=${appUrl}/manifest.webmanifest && bubblewrap build`;

  const handleCopyCmd = async () => {
    try {
      await navigator.clipboard.writeText(bubblewrapCmd);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 1800);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        {isInstallable ? (
          <button
            type="button"
            onClick={install}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Pasang Aplikasi
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#0D7A5F]" aria-hidden="true" />
            Pasang di HP (PWA / APK)
          </button>
        )}
      </div>

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200">
              <h2 id="pwa-guide-title" className="text-base font-semibold text-slate-900">
                Pasang WarnaWA di Perangkat Anda
              </h2>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Tutup panduan instalasi"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm text-slate-600 leading-relaxed">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-1">
                  {isIOS ? 'Cara Pasang di iPhone / iPad (Safari)' : 'Cara Pasang Langsung di Android (Chrome)'}
                </h3>
                {isIOS ? (
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Buka halaman aplikasi ini langsung di Safari (bukan pratinjau tersemat).</li>
                    <li>Ketuk ikon <strong>Bagikan (Share)</strong> di bilah bawah Safari.</li>
                    <li>Pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</li>
                  </ol>
                ) : (
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Buka tautan aplikasi ini di <strong>Google Chrome Android</strong>.</li>
                    <li>Ketuk menu titik tiga (⋮) di pojok kanan atas browser.</li>
                    <li>Pilih <strong>Tambahkan ke layar utama</strong> atau <strong>Instal aplikasi</strong> agar berjalan penuh seperti aplikasi Android dan mendukung mode offline.</li>
                  </ol>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-slate-900 mb-1">
                  Ingin Mengemas Menjadi File .APK (Android TWA)?
                </h3>
                <p className="text-xs text-slate-600 mb-2">
                  Lingkungan web ini tidak memiliki Android SDK/Gradle untuk mengompilasi file{' '}
                  <code className="font-mono bg-slate-100 px-1 rounded">.apk</code> secara langsung.
                  Setelah aplikasi dipublikasikan, Anda dapat mengemas manifest PWA ini menjadi APK
                  melalui <strong>PWABuilder.com</strong> atau menjalankan perintah Bubblewrap di komputer Anda:
                </p>
                <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <code className="text-[11px] font-mono text-slate-800 break-all">
                    {bubblewrapCmd}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyCmd}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 shrink-0 cursor-pointer"
                  >
                    {copiedCmd ? (
                      <>
                        <Check className="w-3 h-3 text-[#0D7A5F]" aria-hidden="true" />
                        Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" aria-hidden="true" />
                        Salin
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0D7A5F] hover:bg-[#0A644E] rounded-lg transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Mode Offline — Data tersimpan tetap dapat digunakan.</span>
    </div>
  );
};
