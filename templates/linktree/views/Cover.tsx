import type { Config } from "..";

export default function CoverView(config: Config) {
  const userData = config.userData;
  const title = config.cover.title;
  const backgroundColor = config.cover.backgroundColor;
  const headerColor = config.cover.titleColor;
  const image = "https://i.postimg.cc/Twf695n1/link-tree-no-bg.png";
  const usernameColor = config.cover.usernameColor;
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        fontSize: 32,
        fontWeight: 600,
        backgroundSize: "cover",
      }}
    >
      <div
        style={{ backgroundColor: backgroundColor }}
        tw={`bg-amber-400 absolute inset-0 flex flex-col items-center justify-center p-6`}
      ></div>

      <div tw="flex flex-col justify-center items-center">
        <p
          style={{ color: headerColor, gap: "1rem" }}
          tw={`text-7xl font-bold text-center w-full flex items-center`}
        >
          {title}
        </p>

        <img src={image} width="100%" height="100%" tw="w-48 h-48" />
      </div>

      <div
        tw="flex gap-2 absolute bottom-10 right-10 items-center px-4 py-4"
        style={{ gap: "10px" }}
      >
        <span tw="text-white text-5xl text-green-700">
          @{userData.username}
        </span>
        <div tw="rounded-full flex w-[80px] h-[80px] overflow-hidden ">
          <img
            src={userData.userImageUrl}
            width={"100%"}
            height={"100%"}
            style={{
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </div>
  );
}
