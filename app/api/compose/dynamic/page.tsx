
'use client'

import Script from 'next/script'

export default function DynamicPage() {
    return (
        // <embed
        //     src={url}
        //     style={{
        //         width: '100vw',
        //         height: '100vh',
        //         border: 'none',
        //         position: 'fixed',
        //         top: 0,
        //         left: 0,
        //     }}
        //     title="Dynamic Content"
        // />
        <div
            className="calendly-inline-widget w-screen h-screen bg-red-500"
            data-url="https://calendly.com/acmesales"
        >
            <Script src="https://assets.calendly.com/assets/external/widget.js" />
        </div>
    )
}
