import type { Config } from ".."

export default function PendingApprovalView(config: Config) {
    const tokenName = config.tokenName ?? "Tokens"
    return (
        <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        }}
      >
      <div tw="absolute inset-0 flex flex-col items-center justify-center bg-[#21064e] p-6">
      <p
        tw="text-7xl font-bold text-center w-full mb-12 text-[#c8adff]"
        style={{ gap: "1rem" }}
      >
       Approve Our Operator to spend your ${tokenName}
      </p>
    </div>
      </div>
    )
}