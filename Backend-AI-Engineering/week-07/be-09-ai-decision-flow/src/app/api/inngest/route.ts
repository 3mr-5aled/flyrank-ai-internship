import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { inngestFunctions } from '@/inngest/functions';

// App Router API Route for Inngest webhook communication and Dev Server sync
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
