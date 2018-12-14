"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const child_process_1 = require("child_process");
class GPIOUtil {
    async setDriveStrength(driveStrength = 7) {
        util_1.log("setting drive strength to " + driveStrength);
        const executePromise = new Promise((resolve, reject) => {
            child_process_1.exec("gpio drive 0 " + driveStrength, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
        try {
            await executePromise;
        }
        catch (err) {
            util_1.log("error while setting drive strength:\n" + err);
        }
    }
}
exports.default = new GPIOUtil();
//# sourceMappingURL=gpioUtil.js.map