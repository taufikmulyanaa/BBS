import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Kebijakan Privasi | Bapak-Bapak Sepedahan',
  description: 'Kebijakan privasi aplikasi komunitas Bapak-Bapak Sepedahan',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#111111] text-[#F5F5F5] pt-24 pb-16">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-amber-500 hover:text-amber-400 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl overflow-hidden relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-8 md:p-12 border-b border-white/10">
            <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white mb-4">
              Kebijakan Privasi
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Terakhir diperbarui: <span className="font-medium text-amber-500">Agustus 2026</span>
            </p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-12">
            
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-4 font-heading">
                1. Informasi yang Kami Kumpulkan
              </h2>
              <p className="text-gray-300 mb-3 leading-relaxed">
                Saat Anda mendaftar dan menggunakan aplikasi Bapak-Bapak Sepedahan, kami mengumpulkan informasi berikut:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300 leading-relaxed">
                <li>Nama lengkap dan alamat email (saat registrasi)</li>
                <li>Foto profil (jika Anda memilih untuk mengunggahnya)</li>
                <li>Konten yang Anda buat: rute, Open Ride, post forum, dan komentar</li>
                <li>Data penggunaan aplikasi untuk meningkatkan layanan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-4 font-heading">
                2. Bagaimana Kami Menggunakan Informasi
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-300 leading-relaxed">
                <li>Menyediakan dan memelihara layanan aplikasi</li>
                <li>Mengirim notifikasi terkait Open Ride yang Anda ikuti</li>
                <li>Meningkatkan pengalaman pengguna</li>
                <li>Menjaga keamanan komunitas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-4 font-heading">
                3. Penyimpanan Data
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Data Anda disimpan di server Supabase (berbasis di Singapura) dengan enkripsi standar industri. File yang Anda unggah (foto, GPX) disimpan selama akun Anda aktif.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-4 font-heading">
                4. Berbagi Data dengan Pihak Ketiga
              </h2>
              <p className="text-gray-300 mb-3 leading-relaxed">
                Kami <strong className="text-white">tidak menjual</strong> data pribadi Anda. Data hanya dibagikan dalam konteks berikut:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300 leading-relaxed">
                <li>Nama dan foto profil Anda terlihat oleh sesama anggota komunitas</li>
                <li>Penyedia layanan infrastruktur (Supabase, Firebase) untuk keperluan teknis operasional</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-4 font-heading">
                5. Hak Anda
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-300 leading-relaxed">
                <li>Mengakses dan memperbarui informasi profil Anda</li>
                <li>Menghapus konten yang Anda buat</li>
                <li>Meminta penghapusan akun — hubungi admin melalui email atau grup WhatsApp komunitas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-4 font-heading">
                6. Keamanan
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Kami menggunakan Row Level Security (RLS) di database untuk memastikan setiap pengguna hanya bisa mengakses dan mengubah data miliknya sendiri. Komunikasi antara aplikasi dan server dienkripsi menggunakan HTTPS.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-4 font-heading">
                7. Perubahan Kebijakan
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan diinformasikan melalui aplikasi atau grup WhatsApp komunitas.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-4 font-heading">
                8. Kontak
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Jika ada pertanyaan tentang kebijakan privasi ini, hubungi kami melalui grup WhatsApp komunitas atau email admin.
              </p>
            </section>

          </div>
        </div>

      </main>
    </div>
  );
}
