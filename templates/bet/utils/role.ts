import type { Config } from '..'

export function getRoleByFid(config: Config, fid: number): 'owner' | 'opponent' | 'arbitrator' | 'user' {
  const roles = {
    owner: config.owner?.fid,
    opponent: config.opponent?.fid,
    arbitrator: config.arbitrator?.fid,
  }

  for (const [role, roleFid] of Object.entries(roles)) {
    if (roleFid === fid) {
      return role as 'owner' | 'opponent' | 'arbitrator'
    }
  }

  return 'user'
}