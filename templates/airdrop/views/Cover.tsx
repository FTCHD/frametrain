import type { Config } from "..";

export default function Cover(config: Config) {
  const cover = config.cover;
  const { background, headerColor, subHeaderColor, subHeaderText } = cover;
  const backgroundProp: Record<string, string> = {};

  if (background) {
    if (background.startsWith("#")) {
      backgroundProp["backgroundColor"] = background;
    } else {
      backgroundProp["backgroundImage"] = background;
    }
  } else {
    backgroundProp["backgroundImage"] =
      "linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)";
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: "30px",
        ...backgroundProp,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "30px",
          borderRadius: "10px",
          color: headerColor,
          fontSize: "100px",
          textAlign: "center",
          fontWeight: "900",
          lineHeight: "1.4",
        }}
      >
        {config.cover.headerText}
      </div>
      <div
        style={{
          fontSize: "50px",
          color: subHeaderColor,
        }}
      >
        {config.cover.subHeaderText}
      </div>
    </div>
  );
}
