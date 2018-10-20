import { log } from "util";
import { exec } from "child_process";

export type DriveStrength = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

class GPIO {
  async setDriveStrength(driveStrength: DriveStrength = 7) {
    log("setting drive strength to " + driveStrength);

    const executePromise = new Promise((resolve, reject) => {
      exec("gpio drive 0 " + driveStrength, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    try {
      await executePromise;
    } catch (err) {
      log("error while setting drive strength:\n" + err);
    }
  }
}

export default new GPIO();