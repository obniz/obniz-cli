export default function flash(obj: {
    portname: string;
    hardware: string;
    version: string;
    baud: number;
    debugserial: any;
    stdout: any;
}): Promise<unknown>;
