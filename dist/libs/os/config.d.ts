import { DeepPartial } from "utility-types";
import { ConfigParam } from "./configure";
export declare function deviceConfigValidate(args: Readonly<any>, obj?: DeepPartial<ConfigParam>, logging?: boolean): Promise<void>;
export declare function networkConfigValidate(args: Readonly<any>, obj?: DeepPartial<ConfigParam>, logging?: boolean): Promise<void>;
export declare function validate(args: Readonly<any>, obj?: DeepPartial<ConfigParam>, logging?: boolean): Promise<void>;
declare const _default: {
    help: string;
    execute(args: any, proceed?: ((i: number) => void) | undefined): Promise<void>;
};
export default _default;
