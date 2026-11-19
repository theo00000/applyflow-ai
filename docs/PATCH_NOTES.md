# How to merge the audit fixes into the existing Windows project

The supplied ZIP was a **partial snapshot** rather than an entire repository. Therefore:

1. **Back up** your complete `D:\Projects\applyflow-ai` project and database first.
2. Extract the sanitized ZIP into a **separate folder**. Do not replace the entire original directory.
3. Compare the modified files, particularly `db/init.sql`, `app/api/*`, `scripts/evaluate-groundedness-live.mjs`, `scripts/index-documents.mjs`, `package.json` and `app/layout.tsx`.
4. You can try the accompanying `applyflow-mvp.patch` from the original project root on a clean Git working tree:

   ```powershell
   git status --short
   git apply --check .\applyflow-mvp.patch
   git apply .\applyflow-mvp.patch
   ```

   If `git apply --check` fails, **do not force**; merge differences manually. The patch was generated against exactly the uploaded ZIP version, which may not match your latest local repository.
5. Existing PostgreSQL data isn't modified by extracting these files. Docker's init scripts only run when PostgreSQL starts with an **empty data volume**. Apply any needed SQL changes intentionally after checking the existing schema.
6. Your original database backup was not copied into this release ZIP. Preserve it separately.
7. Install dependencies and generate `package-lock.json`, then run local verification in the README before committing and deploying.

A passing unit test is not equivalent to the Next.js build, live PostgreSQL integration, or successful external deployment.
