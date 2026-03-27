const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');

const redactUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return raw;
  try {
    const u = new URL(raw);
    if (u.username || u.password) {
      u.username = u.username ? '***' : '';
      u.password = u.password ? '***' : '';
    }
    if (u.searchParams.has('api_key')) {
      u.searchParams.set('api_key', '***');
    }
    return u.toString();
  } catch (_err) {
    return raw.replace(/:\/\/[^@]+@/g, '://***:***@');
  }
};

const prisma = new PrismaClient();

// Prisma internals are not part of the public API, but are useful for debugging this issue.
const engineName = prisma?._engine?.constructor?.name;
const engineKeys = prisma?._engine ? Object.getOwnPropertyNames(prisma._engine).sort() : [];
const engineType =
  prisma?._engineConfig?.generator?.config?.engineType ||
  prisma?._engineConfig?.engineType ||
  undefined;
const engineConfigKeys = prisma?._engineConfig ? Object.keys(prisma._engineConfig).sort() : [];

console.log('Prisma debug:');
console.log('- PRISMA_CLIENT_ENGINE_TYPE=', process.env.PRISMA_CLIENT_ENGINE_TYPE);
console.log('- engineType (config)=', engineType);
console.log('- engine (class)=', engineName);
console.log('- _engine keys=', engineKeys.join(', '));
console.log('- _engine.name=', prisma?._engine?.name);
console.log('- _engine.protocol=', prisma?._engine?.protocol);
console.log('- _engine.host=', prisma?._engine?.host);
console.log('- _engineConfig.flags=', JSON.stringify(prisma?._engineConfig?.flags));
console.log('- _engineConfig keys=', engineConfigKeys.join(', '));
console.log('- activeProvider=', prisma?._engineConfig?.activeProvider);
console.log('- isBundled=', prisma?._engineConfig?.isBundled);
console.log('- inlineDatasources=', JSON.stringify(prisma?._engineConfig?.inlineDatasources, null, 2));
console.log('- engineEndpoint=', prisma?._engineConfig?.engineEndpoint);
console.log('- prismaPath=', prisma?._engineConfig?.prismaPath);
console.log('- DATABASE_URL=', redactUrl(process.env.DATABASE_URL));

prisma
  .$disconnect()
  .catch(() => {
    // ignore
  });
