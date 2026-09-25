// Everything the profile says lives here. The SVGs are drawn from this file
// plus live GitHub data by scripts/build.mjs; edit this, not the images.
//
// Element matchers (all optional, any hit counts the repo as "using" it):
//   lang     GitHub linguist language names
//   deps     package.json dependencies ("@scope/*" matches a whole scope)
//   composer composer.json requirements
//   files    file names at the repo root
//   topics   repository topics
//   homepage RegExp tested against the repo homepage URL
//   any      true = every public repo counts
//   chip     false = never shown as a project chip or a glowing element

export default {
  login: 'dev-kohako',
  name: 'Joseph Kawe',
  location: 'Brazil',
  kicker: '琥珀 kohako — japanese for amber',

  // Typed, erased and retyped in the header, one at a time.
  roles: [
    'full-stack developer',
    'TypeScript, front to back',
    'shipping to the edge on Cloudflare',
    'building 3D worlds for the web',
    'powered by cafézinho',
  ],

  // The periodic table. The first category fills the tall left columns, the
  // last one the tall right columns, and the rest sit in the 3-row middle.
  categories: [
    {
      id: 'lang', label: 'languages', elements: [
        { s: 'Ts', n: 'TypeScript', lang: ['TypeScript'] },
        { s: 'Js', n: 'JavaScript', lang: ['JavaScript'] },
        { s: 'Py', n: 'Python', lang: ['Python'] },
        { s: 'Ph', n: 'PHP', lang: ['PHP'] },
        { s: 'Jv', n: 'Java', lang: ['Java'] },
        { s: 'Ht', n: 'HTML', lang: ['HTML'] },
        { s: 'Cs', n: 'CSS', lang: ['CSS', 'SCSS'] },
        { s: 'Sq', n: 'SQL', lang: ['PLpgSQL', 'TSQL', 'SQL'], deps: ['pg', 'postgres', 'drizzle-orm', 'prisma', '@prisma/client', '@neondatabase/serverless', 'mysql2', 'better-sqlite3'] },
        { s: 'Sh', n: 'Shell', lang: ['Shell'] },
      ],
    },
    {
      id: 'front', label: 'frontend', elements: [
        { s: 'Re', n: 'React', deps: ['react'], topics: ['react'] },
        { s: 'Nx', n: 'Next.js', deps: ['next'], topics: ['nextjs'] },
        { s: 'Vu', n: 'Vue', deps: ['vue'], topics: ['vue', 'vuejs'] },
        { s: 'Nu', n: 'Nuxt', deps: ['nuxt'] },
        { s: 'Ng', n: 'Angular', deps: ['@angular/core'] },
        { s: 'Rn', n: 'React Native', deps: ['react-native'] },
        { s: 'Xp', n: 'Expo', deps: ['expo'] },
        { s: 'Tw', n: 'Tailwind', deps: ['tailwindcss'], topics: ['tailwindcss'] },
        { s: 'Sc', n: 'shadcn/ui', files: ['components.json'] },
        { s: 'Mo', n: 'Motion', deps: ['motion', 'framer-motion'], topics: ['framermotion'] },
        { s: 'Gs', n: 'GSAP', deps: ['gsap'] },
        { s: 'Th', n: 'Three.js', deps: ['three'], topics: ['threejs', 'react-three-fiber'] },
      ],
    },
    {
      id: 'state', label: 'state & schema', elements: [
        { s: 'Tn', n: 'TanStack', deps: ['@tanstack/*'] },
        { s: 'Zu', n: 'Zustand', deps: ['zustand'], topics: ['zustand'] },
        { s: 'Rx', n: 'Redux', deps: ['redux', '@reduxjs/toolkit'] },
        { s: 'Zd', n: 'Zod', deps: ['zod'], topics: ['zod'] },
        { s: 'Gq', n: 'GraphQL', deps: ['graphql'], topics: ['graphql'] },
        { s: 'Ap', n: 'Apollo', deps: ['@apollo/*', 'apollo-server-express', 'apollo-server'], topics: ['apollo', 'apollo-client', 'apollo-server'] },
      ],
    },
    {
      id: 'back', label: 'backend', elements: [
        { s: 'No', n: 'Node.js', chip: false, files: ['package.json'] },
        { s: 'Ex', n: 'Express', deps: ['express'], topics: ['express'] },
        { s: 'Ns', n: 'NestJS', deps: ['@nestjs/core'] },
        { s: 'Lv', n: 'Laravel', composer: ['laravel/framework'], topics: ['laravel'] },
        { s: 'In', n: 'Inertia', deps: ['@inertiajs/*'], composer: ['inertiajs/inertia-laravel'], topics: ['inertiajs'] },
        { s: 'Ba', n: 'Better Auth', deps: ['better-auth'] },
      ],
    },
    {
      id: 'data', label: 'data', elements: [
        { s: 'Pg', n: 'PostgreSQL', deps: ['pg', 'postgres', '@neondatabase/serverless', '@vercel/postgres'], topics: ['postgresql'] },
        { s: 'Dz', n: 'Drizzle', deps: ['drizzle-orm'] },
        { s: 'Ne', n: 'Neon', deps: ['@neondatabase/serverless'] },
        { s: 'Rd', n: 'Redis', deps: ['redis', 'ioredis', '@upstash/redis'] },
        { s: 'Sl', n: 'SQLite', deps: ['better-sqlite3', 'sqlite3', '@libsql/client'] },
        { s: 'Fb', n: 'Firebase', deps: ['firebase', 'firebase-admin'] },
      ],
    },
    {
      id: 'ops', label: 'cloud & tooling', elements: [
        { s: 'Cf', n: 'Cloudflare', deps: ['wrangler', '@cloudflare/*', '@opennextjs/cloudflare'], files: ['wrangler.jsonc', 'wrangler.json', 'wrangler.toml'] },
        { s: 'Vc', n: 'Vercel', deps: ['@vercel/*'], homepage: /\.vercel\.app/ },
        { s: 'Gc', n: 'Google Cloud', deps: ['@google-cloud/*'] },
        { s: 'Dk', n: 'Docker', lang: ['Dockerfile'], files: ['Dockerfile', 'docker-compose.yml', 'compose.yaml'] },
        { s: 'Gt', n: 'Git', chip: false, any: true },
        { s: 'Vt', n: 'Vite', chip: false, deps: ['vite'] },
        { s: 'Vi', n: 'Vitest', chip: false, deps: ['vitest'] },
        { s: 'Je', n: 'Jest', chip: false, deps: ['jest'] },
        { s: 'Es', n: 'ESLint', chip: false, deps: ['eslint'] },
      ],
    },
  ],

  // Project cards, in order. `blurb` overrides the repo description.
  featured: [
    { repo: 'van-gogh-universe', blurb: 'An interactive 3D gallery inspired by Vincent van Gogh, built with Next.js, React Three Fiber and Motion.' },
    { repo: 'kwk-stars', blurb: 'A bilingual atlas of the universe: 204 celestial bodies with verified data, credited images and trivia.' },
    { repo: 'kwk-analytics', blurb: 'No-code analytics for restaurants: managers build their own analyses, save dashboards and get automatic insights.' },
    { repo: 'kwk-events', blurb: 'A full-stack event platform: Laravel and Inertia on the server, Vue and Tailwind on the client.' },
  ],

  socials: [
    { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@dev_kohako' },
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/kohako.dev/' },
    { id: 'email', label: 'Email', url: 'mailto:josephkawe000@gmail.com' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/josephkawe/' },
  ],
};
