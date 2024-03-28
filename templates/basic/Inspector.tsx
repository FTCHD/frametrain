'use client'
import { Button, Stack } from '@mui/joy'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import 'filepond/dist/filepond.min.css'
import { useState } from 'react'
import { FilePond, registerPlugin } from 'react-filepond'
import type { Config } from '.'

registerPlugin(FilePondPluginImagePreview)

export default function Inspector({
    config,
    update,
}: { config: Config; update: (props: any) => void }) {
    const [files, setFiles] = useState<any>([])
    return (
        <Stack width={'100%'} height={'100%'} gap={5}>
            Add Images
            <FilePond
                files={files}
                onupdatefiles={setFiles}
                allowMultiple={true}
                maxFiles={3}
                server="/api"
                name="files" /* sets the file input name, it's filepond by default */
                labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                credits={false}
            />
            <Button onClick={() => update({ vote: { buttons: [] } })}>Delete All</Button>
        </Stack>
    )
}
