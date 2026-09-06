import { Inngest } from 'inngest';

// Create Inngest client for dispatching and receiving workflow events
export const inngest = new Inngest({
  id: 'ai-decision-flow',
  name: 'AI Decision Flow Engine',
});
