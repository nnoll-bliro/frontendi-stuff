import logoLottie from "@bliro/web-app/assets/logo-lottie.json";
import Lottie from "lottie-react";

interface ILoadingWithLogoProps {
  size?: number;
}

export const LoadingWithLogo = ({ size = 200 }: ILoadingWithLogoProps) => {
  return <Lottie style={{ width: `${size}px` }} animationData={logoLottie} loop={true} />;
};
