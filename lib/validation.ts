import { validateFramesPost } from '@xmtp/frames-validator';
import { LensFrameRequest, validateLensFrame } from './lens-frames';
import { FramePayloadValidated, FrameRequest, validatePayload as validateFarcasterPayload } from './farcaster';

export async function validateFramePayload(payload: FrameRequest): Promise<FramePayloadValidated> {
    switch (payload.clientProtocol) {
        case 'farcaster':
            return await validateFarcasterPayload(payload);
        case 'lens':
            const lensValidation = await validateLensFrame(payload as LensFrameRequest);
            if (!lensValidation.isValid || !lensValidation.validatedPayload) {
                throw new Error(lensValidation.error || 'Invalid Lens frame message');
            }
            return lensValidation.validatedPayload;
        case 'xmtp':
            const xmtpValidation = await validateFramesPost(payload);
            if (!xmtpValidation.valid) {
                throw new Error('Invalid XMTP frame message');
            }
            return {
                ...payload.untrustedData,
                interactor: {
                    fid: 0,
                    username: xmtpValidation.verifiedWalletAddress,
                },
            } as FramePayloadValidated;
        case 'anonymous':
            return payload.untrustedData as FramePayloadValidated;
        default:
            throw new Error('Unsupported client protocol');
    }
}