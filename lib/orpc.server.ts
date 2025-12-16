import 'server-only';

import { router } from '@/app/router';
import { createRouterClient } from '@orpc/server';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

globalThis.$client = createRouterClient(router, {});
