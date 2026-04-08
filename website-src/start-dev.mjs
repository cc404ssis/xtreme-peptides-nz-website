import { createServer } from 'vite';

const server = await createServer({
  root: '/Users/chrisclegg/Desktop/xtreme-peptides-nz-website/website-src',
  server: { port: 5173 },
});
await server.listen();
server.printUrls();
