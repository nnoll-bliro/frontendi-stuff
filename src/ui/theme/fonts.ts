type IFontWeight = Record<string, number>;

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const fontWeight: IFontWeight = {
  regular: 400,
  medium: 500,
  semiBold: isSafari ? 500 : 600,
  bold: isSafari ? 500 : 700,
  extraBold: isSafari ? 500 : 800,
};

export { fontWeight };
