import { z } from 'zod'

const buttonActionSchema = z.enum(['post', 'post_redirect', 'mint', 'link'])
const aspectRatioSchema = z.enum(['1:1', '1.91:1'])

const createButtonSchemas = () => {
    const schemas: Record<string, z.ZodString | z.ZodOptional<z.ZodString>> = {}

    for (let i = 1; i <= 4; i++) {
        schemas[`fc:frame:button:${i}`] = z.string().optional()
        schemas[`fc:frame:button:${i}:action`] = buttonActionSchema.optional()
        schemas[`fc:frame:button:${i}:target`] = z
            .string()
            .optional()
            .refine((value) => new Blob([value!]).size <= 256, {
                message: 'button target has maximum size of 256 bytes',
            })
    }

    return schemas
}

export const vNextSchema = z
    .object({
        'fc:frame': z.string().regex(/vNext/, { message: '"fc:frame" must be "vNext"' }),
        'fc:frame:image': z.string(),
        'og:image': z.string(),
        ...createButtonSchemas(),
        'fc:frame:post_url': z
            .string()
            .optional()
            .refine((value) => new Blob([value!]).size <= 256, {
                message: 'post_url has maximum size of 256 bytes',
            }),
        'fc:frame:input:text': z
            .string()
            .optional()
            .refine((value) => new Blob([value!]).size <= 32, {
                message: 'input:text has maximum size of 32 bytes',
            }),
        'fc:frame:image:aspect_ratio': aspectRatioSchema.optional(),
        'fc:frame:state': z
            .string()
            .optional()
            .refine((value) => new Blob([value!]).size <= 4096, {
                message: 'frame:state has maximum size of 4096 bytes',
            }),
    })
    .refine(
        (data) => {
            for (let i = 2; i <= 4; i++) {
                if (data[`fc:frame:button:${i}`] && !data[`fc:frame:button:${i - 1}`]) {
                    return false
                }
            }
            return true
        },
        { message: 'Button index values must be in sequence, starting at 1.' }
    )

export type FrameVNext = z.infer<typeof vNextSchema>
