export interface CorvidNft {
  name: string;
  standard: string;
  image: string;
  imageIpfsUrl?: string;
  image_mime_type: string;
  description: string;
  properties: {
    traits: {
      [key: string]: string;
    };
    filters: {
      [key: string]: string;
    };
  };
  extra: {
    siteSettingsMetadata?: SiteSettingsMetadata;
    [key: string]: any;
  };
}

export interface SiteSettingsMetadata {
  walletAddress: string;
  profilePicAsaID: number;
  currentTheme: string;
  soundVolume: number;
  userCvdAsaIDs: number[];
}