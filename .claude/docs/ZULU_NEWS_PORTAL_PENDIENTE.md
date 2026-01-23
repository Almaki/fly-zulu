# Zulu News Portal - Proyecto Pendiente

## Resumen
Portal de noticias ciudadanas + curación comunitaria para aviación, separado de FlyZulu pero compartiendo la misma base de datos Supabase.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE (Compartido)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   users     │  │  zulu_news  │  │ news_comments│              │
│  │ (auth)      │  │  (noticias) │  │ likes, etc  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
          ▲                              ▲
          │                              │
          │ Auth compartido              │ Datos compartidos
          │                              │
┌─────────────────────┐      ┌─────────────────────────────────────┐
│   FLY-ZULU (PWA)    │      │     ZULU NEWS PORTAL                │
│   fly-zulu.com      │ ───► │     (dominio por definir)           │
│                     │click │                                      │
│ • App para crews    │      │ • Portal de noticias completo       │
│ • Vista preview     │      │ • Artículos completos               │
│ • RSS en tiempo real│      │ • Comentarios, likes, compartir     │
│                     │      │ • Reporteros ciudadanos             │
└─────────────────────┘      └─────────────────────────────────────┘
```

## Secciones del Portal

### 1. Breaking News (Noticias Serias)
- RSS Live Feed automático (BBC, CNN, Bloomberg, Milenio)
- Noticias Zulu oficiales del admin
- Contenido verificado
- Tiempo real

### 2. Reporteros Zulu (Contenido de Usuarios)
- **Historia original**: Contenido exclusivo de usuarios
- **Curación de link**: Compartir link externo + comentario/análisis
- **Fotos/Videos**: Media original de operaciones, spotting, etc.

### 3. Meme News / Opiniones (Casual)
- Contenido más casual y humor de la industria
- Opiniones de la comunidad
- Memes relacionados con aviación

## Moderación
- Filtro automático de malas palabras
- Detección de contenido ofensivo
- No se publican posts que no pasen el filtro
- Sistema de reportes de la comunidad

## Sistema de Credibilidad
- Reputación por historias verificadas
- Upvotes de la comunidad
- Badges: "Piloto Verificado", "Sobrecargo", "Controller", etc.

## Tablas Nuevas para Supabase

```sql
-- Posts de usuarios (historias, links compartidos)
CREATE TABLE user_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('story', 'link_share', 'media', 'meme')),
  title TEXT NOT NULL,
  content TEXT,
  external_url TEXT,
  image_urls TEXT[],
  airport_code TEXT,
  category TEXT,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sistema de reputación
CREATE TABLE user_reputation (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  points INT DEFAULT 0,
  badge TEXT,
  posts_count INT DEFAULT 0,
  verified_posts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Votos en posts
CREATE TABLE post_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES user_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Palabras prohibidas para moderación
CREATE TABLE banned_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Tipos de Posts

| Tipo | Descripción |
|------|-------------|
| RSS Feed | Noticia externa automática |
| Link + Opinion | Usuario comparte link + texto |
| Historia | Contenido original del usuario |
| Foto/Video | Media original |
| Meme | Contenido casual/humor |
| Zulu Official | Breaking news del admin |

## Integración con FlyZulu

### Cambios necesarios en FlyZulu:
1. Agregar variable de entorno:
   ```env
   NEXT_PUBLIC_NEWS_PORTAL_URL=https://[dominio-por-definir]
   ```

2. Modificar el link de noticias RSS para apuntar al portal:
   ```typescript
   // En parseRSS() - src/features/news/services/index.ts
   link: `${process.env.NEXT_PUBLIC_NEWS_PORTAL_URL}/news/${generateNewsId(getTag('link'))}`,
   ```

## Ventajas de la Arquitectura

1. **SSO (Single Sign-On)**: Usuarios de FlyZulu ya autenticados en Supabase
2. **Datos compartidos**: Comentarios, likes, bookmarks accesibles desde ambos proyectos
3. **RSS compartido**: Ambos consumen los mismos feeds
4. **Zulu News**: Breaking news del admin aparece en ambos lugares

## Stack Tecnológico Sugerido

- **Framework**: Next.js 16 (igual que FlyZulu)
- **Base de datos**: Supabase (compartido)
- **Auth**: Supabase Auth (compartido)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Notas Adicionales

- El dominio está por definir
- Considerar subdominios: news.fly-zulu.com o zulunews.com
- La moderación debe ser estricta pero no invasiva
- Priorizar contenido de calidad sobre cantidad

---

*Documento creado: Enero 2026*
*Última actualización: Pendiente de inicio del proyecto*
