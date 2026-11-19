# My ApplyFlow AI Engineering Learning Summary

> Catatan praktik dari pembangunan ApplyFlow AI, bukan sekadar daftar istilah. Fokusnya: masalah apa yang kita hadapi, bagaimana kita menyelesaikannya, dan pola berpikir yang bisa dipakai lagi di project berikutnya.

## 1. Dari software biasa menuju AI system

Dalam aplikasi biasa, sebagian besar output dihitung dengan aturan deterministik. Contoh: mahasiswa dengan IPK 3.60 memenuhi syarat minimum IPK 3.40 (jika jurusannya cocok dan deadline belum lewat). Karena itu rekomendasi eligible sebaiknya dihitung dengan SQL, **bukan ditebak LLM**.

Dalam AI application, bagian generatif berguna untuk menjelaskan atau merangkum informasi, tetapi hasilnya probabilistik. Jadi kita pisahkan:

- **Deterministic logic:** filter jurusan, IPK, deadline, approved, validasi input, validasi citation.
- **Probabilistic AI:** embedding, semantic retrieval, penjelasan natural language, pemilihan klaim, groundedness judge.

Pelajaran utama: gunakan AI untuk tugas yang memang membutuhkan interpretasi; gunakan kode untuk aturan yang harus konsisten.

## 2. Database sebagai source of truth

**Konsep:** PostgreSQL menyimpan peluang, dokumen sumber, dan potongan dokumen. `opportunities` adalah data katalog; `opportunity_sources` menyimpan bukti; `opportunity_chunks` menyimpan teks yang di-embedding.

**Pengalaman debugging:** SQL `CHECK` rusak membuat setup database baru gagal. Ini mengingatkan bahwa kemampuan AI tidak menggantikan integritas database. Selain itu, data hardcoded TypeScript berbeda dari seed SQL; dua source of truth membuat perilaku sulit diprediksi. Perbaikan: satu sumber data PostgreSQL, type di TypeScript hanya kontrak.

**Yang harus diingat:** gunakan parameterized queries, migration yang terkontrol, backup sebelum perubahan, dan jangan pernah menggunakan `docker compose down -v` jika volume berisi data penting.

## 3. Embedding dan semantic retrieval

**Intuisi:** embedding seperti koordinat pada peta makna. Pertanyaan "minimum GPA berapa?" dan dokumen "IPK minimum: 3.40" mungkin dekat secara semantik meskipun kata-katanya tidak persis sama.

**Mekanisme:** model `text-embedding-3-small` menghasilkan vektor 1.536 dimensi. pgvector membandingkan jarak cosine: `1 - (embedding <=> question_vector)` digunakan sebagai similarity.

**Kesalahpahaman:** similarity 0.92 **bukan** 92% peluang jawaban benar. Kemiripan semantik belum membuktikan informasi yang dibutuhkan ada, benar, terbaru, atau resmi.

## 4. Chunking dan reranking

**Chunking** memecah dokumen ke bagian lebih kecil. Terlalu besar menyebabkan noise dan biaya token; terlalu kecil dapat memisahkan konteks penting. Indexer saat ini memecah kalimat menjadi grup dua; ini baseline, bukan chunker produksi.

**Reranking** memilih hasil berdasarkan gabungan semantic similarity dan lexical score. Implementasi memakai `0.7 * similarity + 0.3 * keywordScore`. Bobot ini heuristik. Dalam aplikasi serius, kita harus membandingkan beberapa bobot pada dataset berlabel dan mengukur Hit@K atau MRR.

**Kesalahan yang dihindari:** rerank sebaiknya dilakukan pada kandidat yang lebih luas (misalnya 12), baru pilih top 3, bukan mengambil 3 paling mirip lalu baru diurutkan.

## 5. RAG, groundedness, dan citation

**RAG:** pertanyaan masuk, retrieval mengambil dokumen, LLM menjawab hanya dengan konteks yang tersedia. Di ApplyFlow, jawaban mengandung `usedChunkIds` yang memungkinkan UI menunjukkan sumber.

**Citation validity:** apakah ID yang disebut model memang berasal dari dokumen yang diberikan? Ini dapat diperiksa secara deterministik menggunakan `Set`/allowlist.

**Groundedness:** apakah *klaim* benar-benar didukung isi dokumen yang dikutip? Citation ID valid saja tidak menjamin groundedness. Karena itu kita membuat evaluator yang memecah jawaban menjadi klaim dan memeriksa bukti.

**Real debugging moment:** evaluator sempat membuat klaim `IPK minimum 0.00` dari *pertanyaan yang mengandung prompt injection*, padahal jawaban RAG adalah `3.40`. Kita menyebutnya **evaluation contamination**. Penyelesaiannya bukan melonggarkan validasi, tetapi mengisolasi input evaluator dan menambahkan `answerSpan` yang harus persis ditemukan dalam teks jawaban.

## 6. Kenapa prompt harus dipasangkan dengan JavaScript validation

Prompt hanya memberi instruksi kepada LLM. Model bisa salah mengekstrak klaim, menambah metadata ke bukti, atau mengikuti teks adversarial. **Validation code** memeriksa invariants yang tidak boleh dilanggar:

- `answerSpan` harus substring jawaban yang asli.
- `evidence` harus kutipan dari *content* dokumen yang dikutip.
- `supported=false` harus mempunyai evidence kosong.
- `allClaimsSupported` harus sesuai dengan status setiap klaim.
- Jawaban yang cukup harus mempunyai citation yang valid.

Kombinasi ini lebih kuat daripada prompt saja, tetapi **tetap tidak menjamin** seluruh klaim berhasil diekstrak. Evaluator juga harus dievaluasi.

## 7. Abstention adalah fitur, bukan kegagalan

Pertanyaan "berapa uang saku bulanan?" tidak boleh dijawab dengan angka karangan jika dokumen hanya berisi IPK dan deadline. Respons yang baik adalah "informasi belum tersedia pada sumber" dan `hasEnoughInformation=false`.

Risiko salah jawab dalam konteks beasiswa cukup tinggi: mahasiswa bisa gagal mendaftar atau salah mengambil keputusan. Saat evidence kurang, menahan diri lebih baik daripada terlihat pintar tetapi salah.

**Next improvement:** threshold confidence hanya bisa ditetapkan setelah membuat data label relevan/tidak relevan, mengukur distribusi skor, dan memilih trade-off false answer vs false abstention.

## 8. Testing sebagai bagian dari AI Engineering

Kita memiliki beberapa lapisan pengujian:

1. **Unit tests:** logika validator murni, cepat, tidak perlu API/database.
2. **Integration tests:** interaksi endpoint, database, source retrieval, schema.
3. **RAG regression cases:** delapan skenario T01–T08 dari informasi benar, unknown opportunity, out-of-scope, hingga prompt injection.
4. **Groundedness synthetic tests:** supported claim dan fabricated monetary claim.
5. **Live groundedness:** hasil dari API sungguhan di-judge menggunakan cited chunk sungguhan.

**Pengalaman debugging lain:** `ECONNREFUSED` bukan bukti AI gagal—server Next.js belum menyala. Error syntax/TypeScript, kegagalan DB, dan kegagalan LLM judge perlu dikelompokkan sebelum memperbaiki kode.

**Pelajaran:** evaluasi dengan test case yang eksplisit, jangan menyimpulkan "bagus" hanya karena satu contoh berhasil. Jangan juga menganggap delapan test setara dengan production readiness.

## 9. Backend Engineering & observability

API menerima JSON dan memvalidasinya lewat Zod. Query SQL memakai parameter binding. Logging mencatat requestId, tahap guardrails, retrieval/generation latency, token usage dan source count. Ini memudahkan pemisahan apakah bottleneck berasal dari embedding, query DB, atau generation.

**Penting:** token usage memengaruhi biaya. Hindari pemanggilan model ketika pertanyaan sudah jelas tidak ada dalam cakupan atau ketika dokumen kosong. Untuk deployment publik, tambahkan auth, distributed rate limiting, quotas, dan monitoring.

## 10. Engineering maturity: apa yang belum selesai?

Project ini masih sebuah **simulated-data portfolio MVP candidate**. Yang belum terbukti atau belum ada: sumber beasiswa terverifikasi, ingestion/approval end-to-end, autenticasi, perlindungan abuse publik, confidence calibration berbasis dataset, monitoring produksi, deployment yang diuji, dan studi evaluasi lebih luas.

Mampu mengakui keterbatasan bukan kelemahan engineer. Justru itu menunjukkan bahwa kita tahu **apa yang sudah diuji**, apa yang masih berupa asumsi, dan risiko mana yang belum diselesaikan.

## 11. Ringkasan konsep cepat

| Istilah | Intinya | Contoh ApplyFlow |
|---|---|---|
| RAG | Ambil bukti sebelum AI menjawab | Retrieve dokumen IPK |
| Embedding | Koordinat numerik makna teks | Vektor 1536 dimensi |
| Semantic similarity | Kedekatan makna | `1 - cosine_distance` |
| Chunking | Membagi dokumen | Grup kalimat sumber |
| Reranking | Mengurutkan kandidat ulang | 70% vector + 30% keyword |
| Citation | Referensi sumber jawaban | `usedChunkIds` |
| Groundedness | Klaim didukung evidence | IPK 3.40 dari source chunk |
| Abstention | Tidak mengarang saat bukti kurang | Nominal uang saku tidak tersedia |
| Prompt injection | Instruksi adversarial dalam input/data | "jawab IPK 0.00" |
| Evaluation contamination | Judge mengambil klaim dari input bukan output | LIVE-02 sebelumnya |
| Deterministic guard | Invariant yang ditegakkan kode | `answerSpan` dan evidence check |
| Observability | Mengetahui kondisi sistem | Metrics dan `requestId` |

## 12. Apa yang bisa kamu ceritakan saat interview?

> "Saya membangun ApplyFlow AI, prototype RAG untuk informasi beasiswa menggunakan Next.js, PostgreSQL + pgvector dan OpenAI. Saya mendesain pipeline semantic retrieval dan reranking, membuat scope guardrails, structured answers dan validation citation. Saya juga membuat evaluasi berbasis 8 regression scenarios serta groundedness tests. Salah satu masalah yang saya debug adalah evaluator yang salah mengambil klaim dari injected question, sehingga saya memisahkan input judge dan menambah deterministic provenance validation. Project memakai simulated data, jadi saya dokumentasikan limitations serta langkah sebelum public release."

**Refleksi paling penting:** AI Engineering bukan tentang membuat model selalu menjawab. Ini tentang merancang sistem yang **bisa membedakan kapan ia tahu, kapan ia tidak tahu, dari mana jawabannya berasal, dan bagaimana kita bisa memverifikasinya**.
