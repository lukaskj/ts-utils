// https://gist.github.com/JBlond/2fea43a3049b38287e5e9cefc87b2124

const __reset = "\x1b[0m";

enum COLORS_MAP {
  black = "\x1b[0;30m",
  red = "\x1b[0;31m",
  green = "\x1b[0;32m",
  yellow = "\x1b[0;33m",
  blue = "\x1b[0;34m",
  purple = "\x1b[0;35m",
  cyan = "\x1b[0;36m",
  white = "\x1b[0;37m",

  blackBright = "\x1b[0;90m",
  redBright = "\x1b[0;91m",
  greenBright = "\x1b[0;92m",
  yellowBright = "\x1b[0;93m",
  blueBright = "\x1b[0;94m",
  purpleBright = "\x1b[0;95m",
  cyanBright = "\x1b[0;96m",
  whiteBright = "\x1b[0;97m",

  redBold = "\x1b[1;31m",
  greenBold = "\x1b[1;32m",
  yellowBold = "\x1b[1;33m",
  blueBold = "\x1b[1;34m",
  purpleBold = "\x1b[1;35m",
  cyanBold = "\x1b[1;36m",
  whiteBold = "\x1b[1;37m",

  blackUnderline = "\x1b[4;30m",
  redUnderline = "\x1b[4;31m",
  greenUnderline = "\x1b[4;32m",
  yellowUnderline = "\x1b[4;33m",
  blueUnderline = "\x1b[4;34m",
  purpleUnderline = "\x1b[4;35m",
  cyanUnderline = "\x1b[4;36m",
  whiteUnderline = "\x1b[4;37m",

  bgBlack = "\x1b[40m",
  bgRed = "\x1b[41m",
  bgGreen = "\x1b[42m",
  bgYellow = "\x1b[43m",
  bgBlue = "\x1b[44m",
  bgPurple = "\x1b[45m",
  bgCyan = "\x1b[46m",
  bgWhite = "\x1b[47m",

  bgBlackBright = "\x1b[100m",
  bgRedBright = "\x1b[101m",
  bgGreenBright = "\x1b[102m",
  bgYellowBright = "\x1b[103m",
  bgBlueBright = "\x1b[104m",
  bgPurpleBright = "\x1b[105m",
  bgCyanBright = "\x1b[106m",
  bgWhiteBright = "\x1b[107m",
}

function wrap(color: string) {
  return (data: unknown) => `${color}${data}${__reset}`;
}

const colors: Record<keyof typeof COLORS_MAP, ReturnType<typeof wrap>> = {} as any;

for (const [colorName, colorValue] of Object.entries(COLORS_MAP)) {
  colors[colorName as keyof typeof COLORS_MAP] = wrap(colorValue);
}

export default colors;
