import Login from "../obnizio/login";
import User from "../obnizio/user";
import * as Storage from "../storage";

import { getOra } from "../ora-console/getora";
const ora = getOra();

export default async (app?: { id: string; token: string }) => {
  let spinner = ora(`Singin...`).start();
  const token = await Login((text) => {
    spinner.text = text;
  }, app);
  spinner.succeed(`Authenticated.`);
  spinner = ora(`Getting User Information`).start();
  const user = await User(token);
  if (!user) {
    spinner.fail("Get user information failed");
    return;
  }
  Storage.set("token", token);
  spinner.succeed(`Sign in as "${user.email}"`);
};
