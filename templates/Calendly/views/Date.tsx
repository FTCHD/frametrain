import type { Config } from "..";
import { getNextSixDates } from "../utils/date";
// import { useFrameConfig, useFrameId } from "@/sdk/hooks";

export default function CoverView(config: Config) {
  //   const [configs, updateConfig] = useFrameConfig<Config>();
  const { ownerName } = config;
  const dates = getNextSixDates();

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
              gap: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ color: "white", fontSize: 32 }}>{ownerName}</div>
            <img
              src={config.ownerImg}
              alt="Circular"
              style={{
                borderRadius: "50%",
                border: "1px solid white",
                width: 68,
                height: 68,
              }}
            />
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
          marginTop: 50,
          fontSize: 36,
        }}
      >
        Choose a date
      </div>
      <div
        style={{
          color: "white",
          display: "flex",
          gap: 10,
          alignItems: "center",
          justifyContent: "flex-start",
          marginTop: 10,
        }}
      >
        {dates.map((date, index) => (
          <div
            key={index}
            style={{
              padding: 30,
              border:
                index.toString() === config.date.toString()
                  ? "none"
                  : "1px solid gray",
              borderRadius: 15,
              backgroundColor:
                index.toString() === config.date.toString() ? "white" : "none",
              color:
                index.toString() === config.date.toString() ? "black" : "white",
            }}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
}
