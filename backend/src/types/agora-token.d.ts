declare module 'agora-token' {
  export class RtcTokenBuilder {
    static buildTokenWithUid(
      appId: string,
      appCertificate: string,
      channelName: string,
      uid: number,
      role: number,
      tokenExpire: number,
      privilegeExpire?: number
    ): string;
  }
  
  export enum RtcRole {
    PUBLISHER = 1,
    SUBSCRIBER = 2,
  }
}
