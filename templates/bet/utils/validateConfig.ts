import { FrameError } from '@/sdk/error'
import type { Config } from '..'

const requiredFields = ['claim', 'owner', 'opponent', 'arbitrator', 'chain', 'token', 'amount', 'deadline'] as const;

export function validateConfig(config: Config) {
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new FrameError(`No ${field} specified`);
    }
  }
}