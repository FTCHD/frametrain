import type { Config } from "..";
// import { useFrameConfig, useFrameId } from "@/sdk/hooks";

export default function CoverView(config: Config) {
  //   const [configs, updateConfig] = useFrameConfig<Config>();
  const { ownerName } = config;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        // justifyContent: "center",

        width: "100%",
        height: "100%",
        backgroundColor: "black",
        padding: 50,
        fontSize: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 64,
            }}
          >
            CalCast
          </div>
          <div
            style={{
              color: "white",
              display: "flex",
            }}
          >
            <img
              src="https://calcast.vercel.app/calendar.png"
              width={64}
              height={64}
              alt="calendar"
            />
          </div>
        </div>
        <div
          style={{
            color: "gray",
            fontSize: 40,
          }}
        >
          Scheduling Infrastructure for Farcaster
        </div>
      </div>
      <div
        style={{
          color: "white",
          display: "flex",
          flexDirection: "column",
          marginTop: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 60,
              marginBottom: 8,
            }}
          >
            {config.ownerName}
          </div>
          <hr
            style={{
              borderColor: "white",
              width: 70,
              transform: "rotate(-65deg)",
              margin: 0,
              borderWidth: 1,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={config.ownerImg}
              alt="Circular"
              style={{
                borderRadius: "50%",
                border: "1px solid white",
                width: 80,
                height: 80,
              }}
            />
          </div>
        </div>
        <div
          style={{
            fontSize: 30,
            marginTop: 8,
            alignSelf: "flex-end",
            color: "gray",
          }}
        >
          {config.desc}
        </div>
      </div>
      <div
        style={{
          color: "white",
          alignSelf: "flex-start",
          fontSize: 38,
          marginTop: 10,
        }}
      >
        schedule a call for ?
      </div>
    </div>
  );
}
