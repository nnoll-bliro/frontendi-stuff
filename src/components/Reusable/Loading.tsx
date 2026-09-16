import loadingLogo from "@bliro/web-app/assets/loading.svg";

// simple loading graphic
export function Loading({ size = 35, fullScreen = true }: { size?: number; fullScreen?: boolean }) {
  return (
    <div
      className="spinner"
      style={{
        textAlign: "center",
        height: fullScreen ? "100vh" : undefined,
        display: "flex",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center",
        justifyItems: "center",
      }}
    >
      <img width={size} height={size} src={loadingLogo as unknown as string} alt="Loading" />
    </div>
  );
}
