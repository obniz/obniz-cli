export default class WiFi {
    stdout: any;
    onerror: any;
    constructor(obj: {
        stdout: any;
        onerror: any;
    });
    setNetwork(configs: any, duplicate?: boolean, signal?: AbortSignal): Promise<void>;
    private setForUnder350Devices;
    /**
     * setting configration for OS3.5.0 or older
     * @param spinner Ora object
     * @param configs json user set
     * @returns
     */
    private setForEqualOrOver350Devices;
    private isSettingMode;
    private sendReset;
    /**
     * リセットリクエストを送りWi-Fi設定モードに遷移させる
     * @returns
     */
    private createResetData;
    /**
     * ネットワーク設定を送る
     * @param type
     * @param setting
     * @returns
     */
    private createSettingData;
    private scanObnizWiFi;
}
