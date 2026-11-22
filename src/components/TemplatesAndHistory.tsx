import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, Trash2 } from 'lucide-react';
import { MESSAGE_TEMPLATES, MessageTemplate } from '../data/presets';
import { ColorFrameId, TextStyleId, transformText } from '../utils/whatsappTextEngine';

export interface HistoryItem {
  id: string;
  rawText: string;
  outputText: string;
  styleId: TextStyleId;
  styleName: string;
  frameId: ColorFrameId;
  createdAt: number;
}

interface TemplatesAndHistoryProps {
  history: HistoryItem[];
  onApplyTemplate: (template: MessageTemplate) => void;
  onLoadHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onSwitchToGenerator: () => void;
}

export const TemplatesAndHistory: React.FC<TemplatesAndHistoryProps> = ({
  history,
  onApplyTemplate,
  onLoadHistory,
  onDeleteHistory,
  onClearHistory,
  onSwitchToGenerator,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');

  const categories = ['Semua', ...Array.from(new Set(MESSAGE_TEMPLATES.map((t) => t.category)))];
  const filteredTemplates =
    categoryFilter === 'Semua'
      ? MESSAGE_TEMPLATES
      : MESSAGE_TEMPLATES.filter((t) => t.category === categoryFilter);

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <div className="space-y-8">
      {/* Templates Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Template Pesan Siap Pakai
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Pilih contoh pesan untuk langsung dimuat ke editor atau disalin ke WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          {filteredTemplates.map((tpl) => {
            const preview = transformText(tpl.text, tpl.styleId, {
              frameId: tpl.frameId,
              blueSpaced: true,
            });
            return (
              <article
                key={tpl.id}
                className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="text-xs text-slate-500 mb-1">{tpl.category}</div>
                  <h3 className="text-sm font-semibold text-slate-900">{tpl.title}</h3>
                  <pre className="mt-3 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed line-clamp-5 bg-white p-3 rounded-lg border border-slate-200/80">
                    {preview}
                  </pre>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleCopyText(tpl.id, preview)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copiedId === tpl.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#0D7A5F]" aria-hidden="true" />
                        Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        Salin
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onApplyTemplate(tpl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0D7A5F] hover:bg-[#0A644E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Gunakan Template
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Saved History Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Riwayat Teks Tersimpan
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Tersimpan otomatis di browser ini (<span className="tabular-nums">{history.length}</span> item).
            </p>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              Hapus Semua
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-slate-900">
              Belum ada riwayat tersimpan
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Buat pesan di Generator Teks lalu klik tombol Simpan Riwayat untuk menyimpan
              kombinasi favorit Anda.
            </p>
            <button
              type="button"
              onClick={onSwitchToGenerator}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0D7A5F] hover:bg-[#0A644E] rounded-lg transition-colors cursor-pointer"
            >
              Buat Teks Pertama
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {history.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{item.styleName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {new Date(item.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-900 whitespace-pre-wrap line-clamp-2 break-words">
                    {item.outputText}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyText(item.id, item.outputText)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#0D7A5F]" aria-hidden="true" />
                        Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        Salin
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onLoadHistory(item)}
                    className="px-3 py-1.5 text-xs font-medium text-[#0D7A5F] bg-[#0D7A5F]/10 hover:bg-[#0D7A5F]/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Edit Ulang
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteHistory(item.id)}
                    aria-label="Hapus item riwayat"
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
