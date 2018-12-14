export declare type DriveStrength = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
declare class GPIOUtil {
    setDriveStrength(driveStrength?: DriveStrength): Promise<void>;
}
declare const _default: GPIOUtil;
export default _default;
