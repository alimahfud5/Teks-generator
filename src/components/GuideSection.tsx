import React from 'react';

export const GuideSection: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 max-w-4xl">
      <div className="pb-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          Panduan Resmi Teks Warna &amp; Format di WhatsApp
        </h2>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed max-w-2xl">
          Memahami cara kerja warna dan tipografi di WhatsApp membantu pesan Anda tampil rapi di
          Android, iPhone, maupun WhatsApp Web tanpa huruf kotak rusak.
        </p>
      </div>

      <div className="divide-y divide-slate-200">
        <article className="py-5">
          <h3 className="text-sm font-semibold text-slate-900">
            01. Teks Biru Kotak (Huruf Regional Indicator)
          </h3>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            WhatsApp menampilkan karakter huruf regional Unicode (🇦–🇿) sebagai kotak biru cerah.
            Secara bawaan, jika dua huruf berdekatan membentuk kode negara (seperti I+D menjadi
            bendera 🇮🇩), ponsel akan menggabungkannya. WarnaWA otomatis menyisipkan pemisah
            tak terlihat (<code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">U+200B</code>)
            di antara huruf agar seluruh kata tetap tampil sebagai kotak biru yang konsisten.
          </p>
        </article>

        <article className="py-5">
          <h3 className="text-sm font-semibold text-slate-900">
            02. Teks Biru Hashtag (#Tagar_Pesan)
          </h3>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            Setiap kata yang diawali tanda pagar (<code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">#</code>)
            otomatis diwarnai biru oleh WhatsApp dan dapat diklik untuk pencarian chat. Mengubah
            spasi menjadi garis bawah (<code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">#Promo_Minggu_Ini</code>)
            membuat seluruh kalimat tampil berwarna biru penuh.
          </p>
        </article>

        <article className="py-5">
          <h3 className="text-sm font-semibold text-slate-900">
            03. Warna Selain Biru (Merah, Emas, Hijau, Gradien)
          </h3>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            Aplikasi WhatsApp tidak menyediakan kode warna teks RGB di dalam balon chat biasa.
            Untuk pesan beraneka warna atau gradien penuh, gunakan tab{' '}
            <strong className="font-semibold text-slate-800">Kartu &amp; Stiker</strong> di aplikasi
            ini untuk mengekspor gambar PNG berlatar transparan atau kartu warna siap kirim.
          </p>
        </article>

        <article className="py-5 pb-1">
          <h3 className="text-sm font-semibold text-slate-900">
            04. Ringkasan Format Bawaan WhatsApp
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2 pr-4">Gaya</th>
                  <th className="py-2 pr-4">Simbol Ketik</th>
                  <th className="py-2">Contoh Hasil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 pr-4 font-medium">Tebal (Bold)</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">*teks*</td>
                  <td className="py-2.5 font-bold">teks</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium">Miring (Italic)</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">_teks_</td>
                  <td className="py-2.5 italic">teks</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium">Coret (Strikethrough)</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">~teks~</td>
                  <td className="py-2.5 line-through">teks</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium">Monospace</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">```teks```</td>
                  <td className="py-2.5 font-mono text-xs">teks</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium">Kutipan (Quote)</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">&gt; teks</td>
                  <td className="py-2.5 text-slate-600">Kutipan terindentasi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
  );
};
