import guessPort from "./guess";

export default async function waitForPort() {
  while (true) {
    const portPath = (await guessPort()).portname;
    if (portPath) {
      return portPath;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }
}
