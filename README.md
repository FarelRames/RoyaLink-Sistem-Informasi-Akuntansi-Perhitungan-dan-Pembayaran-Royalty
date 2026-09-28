# Royalty Accounting System

Web app sederhana untuk Sistem Informasi Akuntansi Perhitungan dan Pembayaran Royalty pada Usaha Penerbitan Buku.

## Teknologi
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

## Catatan keamanan
Versi ini adalah MVP untuk tugas kuliah. Jika aplikasi dipublikasikan, aktifkan Row Level Security (RLS), buat policy yang sesuai, dan jangan pernah menaruh service_role key di frontend.
