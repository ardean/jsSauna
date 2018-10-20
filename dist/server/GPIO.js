"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const child_process_1 = require("child_process");
class GPIO {
    setDriveStrength(driveStrength = 7) {
        return __awaiter(this, void 0, void 0, function* () {
            util_1.log("setting drive strength to " + driveStrength);
            const executePromise = new Promise((resolve, reject) => {
                child_process_1.exec("gpio drive 0 " + driveStrength, (err) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
            try {
                yield executePromise;
            }
            catch (err) {
                util_1.log("error while setting drive strength:\n" + err);
            }
        });
    }
}
exports.default = new GPIO();
//# sourceMappingURL=GPIO.js.map