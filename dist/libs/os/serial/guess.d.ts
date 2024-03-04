import SerialPort from "serialport";
declare const _default: () => Promise<{
    portname: string | undefined;
    ports: SerialPort.PortInfo[];
}>;
export default _default;
