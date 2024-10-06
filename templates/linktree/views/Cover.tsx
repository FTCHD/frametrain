import type { Config } from "..";

export default function CoverView(config: Config) {

  const userData = config.userData;
  const title = config.cover.title;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: config.cover.backgroundColor,
        fontSize: 32,
        fontWeight: 600,
        backgroundSize: "cover",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p
          style={{
            color: config.cover.titleColor,
            gap: "1rem",
            fontSize: "4.5rem",
            fontWeight: "bold",
            textAlign: "center",
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {title}
        </p>

        <img
          src={"https://i.postimg.cc/Twf695n1/link-tree-no-bg.png"}
          width="100%"
          height="100%"
          style={{
            width: "12rem",
            height: "12rem",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          position: "absolute",
          bottom: "2.5rem",
          right: "2.5rem",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        <span
          style={{
            color: "#15803d",
            fontSize: "3rem",
          }}
        >
          @{userData.username}
        </span>
        <div
          style={{
            borderRadius: "9999px",
            display: "flex",
            width: "80px",
            height: "80px",
            overflow: "hidden",
          }}
        >
          <img
            src={userData.userImageUrl}
            width="80px"
            height="80px"
            style={{
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </div>
  );
}
