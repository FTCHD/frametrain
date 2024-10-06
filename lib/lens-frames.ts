import { FramePayloadValidated } from './farcaster';

export interface LensFrameRequest {
    clientProtocol: 'lens';
    untrustedData: {
        profileId: string;
        pubId: string;
        url: string;
        unixTimestamp: number;
        buttonIndex: number;
        inputText?: string;
        deadline?: number;
        state?: string;
        actionResponse?: string;
    };
    trustedData: {
        messageBytes: string;
        identityToken?: string;
        signerType?: 'owner' | 'delegatedExecutor';
        signer?: string;
    };
}



export interface LensFrameValidationResult {
    isValid: boolean;
    validatedPayload?: FramePayloadValidated;
    error?: string;
}



export async function validateLensFrame(request: LensFrameRequest): Promise<LensFrameValidationResult> {
    try {
        const lensValidation = await validateLensFrameMessage(request.trustedData.messageBytes);

        if (!lensValidation.valid) {
            return {
                isValid: false,
                error: 'Invalid Lens frame message',
            };
        }
 
        const validatedPayload: FramePayloadValidated = {
            object: 'validated_frame_action',
            url: request.untrustedData.url,
            interactor: {
                object: 'user',
                fid: parseInt(request.untrustedData.profileId), 
                custody_address: request.trustedData.signer || '',
                username: '', 
                display_name: '', 
                pfp_url: '', 
                profile: {
                    bio: {
                        text: '',
                        mentioned_profiles: [],
                    },
                },
                follower_count: 0,
                following_count: 0,
                verifications: [],
                verified_addresses: {
                    eth_addresses: [],
                    sol_addresses: [],
                },
                active_status: 'inactive',
                power_badge: false,
                viewer_context: {
                    following: false,
                    followed_by: false,
                },
            },
            tapped_button: { index: request.untrustedData.buttonIndex },
            state: {
                serialized: request.untrustedData.state || '',
            },
            cast: {
                object: 'cast',
                hash: request.untrustedData.pubId,
                fid: parseInt(request.untrustedData.profileId),
                author: {
                    object: 'user',
                    fid: parseInt(request.untrustedData.profileId),
                    custody_address: request.trustedData.signer || '',
                    username: '',
                    display_name: '',
                    pfp_url: '',
                    profile: {
                        bio: {
                            text: '',
                            mentioned_profiles: [],
                        },
                    },
                    follower_count: 0,
                    following_count: 0,
                    verifications: [],
                    verified_addresses: {
                        eth_addresses: [],
                        sol_addresses: [],
                    },
                    active_status: 'inactive',
                    power_badge: false,
                },
                text: '',
                timestamp: new Date(request.untrustedData.unixTimestamp).toISOString(),
                embeds: [],
                reactions: { likes_count: 0, recasts_count: 0, likes: [], recasts: [] },
                replies: { count: 0 },
                mentioned_profiles: [],
                viewer_context: { liked: false, recasted: false },
            },
            timestamp: new Date(request.untrustedData.unixTimestamp).toISOString(),
            signer: {
                client: {
                    object: 'user',
                    fid: parseInt(request.untrustedData.profileId),
                    custody_address: request.trustedData.signer || '',
                    username: '',
                    display_name: '',
                    pfp_url: '',
                    profile: {
                        bio: {
                            text: '',
                            mentioned_profiles: [],
                        },
                    },
                    follower_count: 0,
                    following_count: 0,
                    verifications: [],
                    verified_addresses: {
                        eth_addresses: [],
                        sol_addresses: [],
                    },
                    active_status: 'inactive',
                    power_badge: false,
                },
            },
        };

        if (request.untrustedData.inputText) {
            validatedPayload.input = {
                text: request.untrustedData.inputText,
            };
        }

        return {
            isValid: true,
            validatedPayload,
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Unknown error during Lens frame validation',
        };
    }
}