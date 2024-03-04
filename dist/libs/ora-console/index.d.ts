import { SpinnerName } from "cli-spinners";
import { Color, Ora, PersistOptions, PrefixTextGenerator, Spinner } from "ora";
declare class OraConsole implements Ora {
    color: Color;
    indent: number;
    readonly isSpinning: boolean;
    prefixText: string | PrefixTextGenerator;
    spinner: SpinnerName | Spinner;
    private _text;
    set text(t: string);
    get text(): string;
    constructor(options: any);
    clear(): Ora;
    fail(text?: string): Ora;
    frame(): string;
    info(text?: string): Ora;
    render(): Ora;
    start(text?: string): Ora;
    stop(): Ora;
    stopAndPersist(options?: PersistOptions): Ora;
    succeed(text?: string): Ora;
    warn(text?: string): Ora;
}
declare const create: (option: any) => OraConsole;
export default create;
