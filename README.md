# sgwrsio — fersiwn gyda backend

Mae'r fersiwn hon yn ychwanegu:
- cyfrifon go iawn gyda Supabase Auth
- proffiliau defnyddwyr
- postiadau wedi'u storio yn y gronfa ddata
- adolygu postiadau trwy'r maes `status`
- negeseuon preifat
- realtime ar gyfer negeseuon
- clybiau
- newyddion
- pleidleisiau un-pleidlais-y-defnyddiwr

## Gosod

1. Creu prosiect yn Supabase.
2. Yn Supabase, agor **SQL Editor** a rhedeg `supabase-schema.sql`.
3. Yn Supabase, agor **Project Settings → API** a chopi'r Project URL a'r anon/publishable key.
4. Agor `script.js` a gosod y ddau werth yma:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Cadw'r ffeiliau a'u huploadio i GitHub Pages.

### Pwysig
Mae'r anon/publishable key yn cael ei ddefnyddio mewn gwefan porwr. Mae hyn yn iawn pan mae Row Level Security (RLS) wedi'i osod fel yn `supabase-schema.sql`. **Peidiwch byth â rhoi service_role key yn `script.js`.**

Ar gyfer defnydd ysgol go iawn, dylai staff yr ysgol osod rheolau cofrestru/e-bost priodol, cymedroli, a pholisïau preifatrwydd. Mae'r cod yma yn enghraifft dechnegol ac nid yw'n disodli trefniadau diogelu ysgol.
