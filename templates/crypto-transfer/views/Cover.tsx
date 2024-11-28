import type { Config } from '..'

export default function CoverView(config: Config) {
    function truncateWalletAddress(
        walletAddress: string,
        prefixLength = 12,
        suffixLength = 6
    ): string {
        // Check if the wallet address is valid
        if (typeof walletAddress !== 'string' || walletAddress.length < prefixLength + suffixLength)
            return walletAddress // Return the original address if it's invalid or too short

        // Extract the prefix and suffix parts of the address
        const prefix = walletAddress.substring(0, prefixLength)
        const suffix = walletAddress.substring(walletAddress.length - suffixLength)

        // Generate the truncated address with prefix, ellipsis, and suffix
        const truncatedAddress = `${prefix}...${suffix}`

        return truncatedAddress
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                background: config.background,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontFamily: 'Roboto',
                fontSize: '50px',
                padding: '20px',
                color: '#ffffff',
            }}
        >
            {config?.address && (
                <p
                    style={{
                        color: config.color,
                        fontWeight: 500,
                        margin: 0,
                    }}
                >
                    {truncateWalletAddress(config.address)}
                </p>
            )}
            {config?.message && (
                <p
                    style={{
                        color: config.color,
                        margin: 0,
                        width: '100%',
                    }}
                >
                    {config.message}
                </p>
            )}
        </div>
    )
}
