# RoyaLink - Sistem Informasi Akuntansi Royalti Buku
Tentang Sistem:
RoyaLink adalah aplikasi berbasis web yang dirancang untuk membantu usaha penerbitan buku dalam mengelola data penulis, data buku, perhitungan royalti, serta pencatatan pembayaran royalti secara terstruktur dan terintegrasi.

Sistem ini menggunakan Supabase sebagai database untuk menyimpan dan mengelola data, serta menyediakan antarmuka yang memudahkan pengguna dalam memantau informasi royalti dan menyusun laporan.

# Akses Aplikasi

Live Demo: [Klik untuk membuka live demo](https://farelrames.github.io/RoyaLink-Sistem-Informasi-Akuntansi-Perhitungan-dan-Pembayaran-Royalty/)

# Fitur Utama
Dashboard — Menampilkan ringkasan informasi dan status pembayaran royalti.

Manajemen Penulis — Mengelola data penulis, termasuk nama, email, dan nomor telepon.

Manajemen Buku — Mengelola informasi buku, harga jual, persentase royalti, dan tanggal terbit.

Perhitungan Royalti — Mencatat jumlah buku terjual, total penjualan, nominal royalti, dan periode perhitungan.

Pembayaran Royalti — Mencatat status pembayaran dan tanggal pembayaran royalti.

Laporan Royalti — Menampilkan rekapitulasi royalti berdasarkan data penulis, buku, periode, dan status pembayaran.

Cetak Laporan — Mendukung pencetakan laporan untuk keperluan dokumentasi dan administrasi.

## Teknologi yang digunakan
- Frontend: HTML, CSS, JavaScript
- Backend/database: Supabase
- DBMS: PostgreSQL

## Struktur
backend/
  database/
    schema.sql

frontend/
  HTML/
    index.html
  CSS/
    style.css
  JS/
    config.js
    supabase.js
    app.js

## Instalasi

1. Buat project di Supabase.
2. Buka SQL Editor.
3. Jalankan seluruh isi `backend/database/schema.sql`.
4. Buka Project Settings > API.
5. Salin Project URL dan publishable/anon key.
6. Masukkan ke `frontend/JS/config.js`.
7. Jalankan `frontend/HTML/index.html` menggunakan local server (disarankan VS Code Live Server).
