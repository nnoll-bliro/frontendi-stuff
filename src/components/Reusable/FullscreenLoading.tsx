import { LoadingWithLogo } from "./LoadingWithLogo";

export const FullscreenLoading = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LoadingWithLogo size={300} />
    </div>
  );
};
