import React, { useState } from 'react';
import { Check, CheckCheck, Copy, ExternalLink, Moon, BookmarkPlus, Sun } from 'lucide-react';
import { parseWhatsAppLine } from '../utils/whatsappTextEngine';

interface WhatsAppPreviewProps {
  outputText: string;
  styleName: string;
  onCopy: () => void;
  copied: boolean;
  onSaveHistory: () => void;
  savedNotice: boolean;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  outputText,
  styleName,
  onCopy,
  copied,
  onSaveHistory,
  savedNotice,
}) => {
  const [chatTheme, setChatTheme] = useState<'light' | 'dark'>('light');

  const lines = outputText ? outputText.split('\n') : [];
  const charCount = Array.from(outputText).length;
  const wordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;
  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const waShareHref = `https://wa.me/?text=${encodeURIComponent(outputText)}`;

  return (
    <section
      aria-label="Pratinjau Pesan WhatsApp"
      className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Top Preview Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-200">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 truncate">
            Pratinjau Chat WhatsApp
          </h2>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {styleName} · <span className="tabular-nums">{charCount}</span> karakter ·{' '}
            <span className="tabular-nums">{wordCount}</span> kata
          </p>
        </div>

        <div
          role="group"
          aria-label="Tema pratinjau chat"
          className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0"
        >
          <button
            type="button"
            onClick={() => setChatTheme('light')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              chatTheme === 'light'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" aria-hidden="true" />
            Terang
          </button>
          <button
            type="button"
            onClick={() => setChatTheme('dark')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              chatTheme === 'dark'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" aria-hidden="true" />
            Gelap
          </button>
        </div>
      </div>

      {/* Simulated WhatsApp Frame */}
      <div
        className={`flex-1 flex flex-col min-h-[340px] ${
          chatTheme === 'light' ? 'wa-chat-pattern-light' : 'wa-chat-pattern-dark'
        }`}
      >
        {/* Contact Header Strip */}
        <div
          className={`flex items-center justify-between px-4 py-2.5 border-b ${
            chatTheme === 'light'
              ? 'bg-[#075E54] text-white border-[#064E46]'
              : 'bg-[#202C33] text-[#E9EDEF] border-[#2A3942]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-semibold shrink-0"
              aria-hidden="true"
            >
              WA
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium leading-tight truncate">
                Grup &amp; Kontak WhatsApp
              </div>
              <div className="text-[11px] opacity-80 leading-tight truncate">
                Tampilan pesan terkirim
              </div>
            </div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-5 flex flex-col justify-end gap-3 overflow-y-auto max-h-[420px]">
          {/* Incoming subtle context bubble */}
          <div className="self-start max-w-[82%]">
            <div
              className={`px-3.5 py-2 rounded-lg rounded-tl-xs text-xs leading-relaxed shadow-xs ${
                chatTheme === 'light'
                  ? 'bg-white text-slate-700'
                  : 'bg-[#202C33] text-[#D1D7DB]'
              }`}
            >
              Ketik pesan di editor untuk melihat hasil teks warna dan format langsung di sini.
            </div>
          </div>

          {/* Outgoing user preview bubble */}
          <div className="self-end max-w-[90%] min-w-[180px]">
            <div
              className={`px-3.5 py-2.5 rounded-lg rounded-tr-xs shadow-xs text-[14.5px] leading-[1.45] break-words ${
                chatTheme === 'light'
                  ? 'bg-[#D9FDD3] text-[#111B21]'
                  : 'bg-[#005C4B] text-[#E9EDEF]'
              }`}
            >
              {lines.length > 0 && outputText.trim().length > 0 ? (
                <div className="space-y-1">
                  {lines.map((line, lineIdx) => {
                    const parsed = parseWhatsAppLine(line);
                    const renderedSegments = parsed.segments.map((seg, segIdx) => {
                      if (seg.type === 'bold') {
                        return (
                          <strong key={segIdx} className="font-bold">
                            {seg.text}
                          </strong>
                        );
                      }
                      if (seg.type === 'italic') {
                        return (
                          <em key={segIdx} className="italic">
                            {seg.text}
                          </em>
                        );
                      }
                      if (seg.type === 'strike') {
                        return (
                          <del key={segIdx} className="line-through">
                            {seg.text}
                          </del>
                        );
                      }
                      if (seg.type === 'mono' || seg.type === 'codeblock') {
                        return (
                          <code
                            key={segIdx}
                            className={`font-mono text-[13px] px-1 py-0.5 rounded ${
                              chatTheme === 'light'
                                ? 'bg-black/5 text-[#0F172A]'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            {seg.text}
                          </code>
                        );
                      }
                      if (seg.type === 'hashtag') {
                        return (
                          <span
                            key={segIdx}
                            className={`font-medium underline-offset-2 hover:underline ${
                              chatTheme === 'light' ? 'text-[#027EB5]' : 'text-[#53BDEB]'
                            }`}
                          >
                            {seg.text}
                          </span>
                        );
                      }
                      return <React.Fragment key={segIdx}>{seg.text}</React.Fragment>;
                    });

                    if (parsed.isQuote) {
                      return (
                        <div
                          key={lineIdx}
                          className={`pl-2.5 py-0.5 rounded-xs text-[13.5px] ${
                            chatTheme === 'light'
                              ? 'bg-black/5 text-[#3B4A54]'
                              : 'bg-white/10 text-[#D1D7DB]'
                          }`}
                        >
                          {renderedSegments}
                        </div>
                      );
                    }

                    if (parsed.isBullet) {
                      return (
                        <div key={lineIdx} className="flex items-start gap-2">
                          <span aria-hidden="true">•</span>
                          <span>{renderedSegments}</span>
                        </div>
                      );
                    }

                    return (
                      <div key={lineIdx} className="min-h-[1.25em]">
                        {renderedSegments}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p
                  className={`text-sm italic ${
                    chatTheme === 'light' ? 'text-slate-500' : 'text-slate-300'
                  }`}
                >
                  Hasil teks akan muncul di sini...
                </p>
              )}

              {/* Bubble Timestamp & Double Blue Check */}
              <div className="flex items-center justify-end gap-1 mt-1.5 select-none">
                <span
                  className={`text-[11px] tabular-nums ${
                    chatTheme === 'light' ? 'text-[#667781]' : 'text-[#8696A0]'
                  }`}
                >
                  {currentTime}
                </span>
                <CheckCheck
                  className={`w-4 h-4 ${
                    chatTheme === 'light' ? 'text-[#53BDEB]' : 'text-[#53BDEB]'
                  }`}
                  aria-label="Dibaca"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveHistory}
            disabled={!outputText.trim()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 disabled:pointer-events-none rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0D7A5F]" aria-hidden="true" />
                Tersimpan
              </>
            ) : (
              <>
                <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
                Simpan Riwayat
              </>
            )}
          </button>

          <a
            href={outputText.trim() ? waShareHref : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!outputText.trim()}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 transition-colors whitespace-nowrap shrink-0 ${
              outputText.trim()
                ? 'text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                : 'text-slate-400 pointer-events-none opacity-50'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            Kirim ke WhatsApp
          </a>
        </div>

        <button
          type="button"
          onClick={onCopy}
          disabled={!outputText.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0D7A5F] hover:bg-[#0A644E] disabled:opacity-45 disabled:pointer-events-none rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              Berhasil Disalin
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              Salin Teks
            </>
          )}
        </button>
      </div>
    </section>
  );
};
