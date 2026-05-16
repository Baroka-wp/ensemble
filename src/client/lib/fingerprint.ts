import FingerprintJS, { type GetResult } from '@fingerprintjs/fingerprintjs';

let agentPromise: Promise<{ get: () => Promise<GetResult> }> | null = null;

export async function getVisitorId(): Promise<string> {
  // Override pour tests E2E : injecter un fingerprint déterministe
  const override = (window as { __TEST_FINGERPRINT?: string }).__TEST_FINGERPRINT;
  if (override) return override;

  if (!agentPromise) agentPromise = FingerprintJS.load();
  const agent = await agentPromise;
  const { visitorId } = await agent.get();
  return visitorId;
}
