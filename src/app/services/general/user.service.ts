import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { SiteSettingsMetadata } from "../../interfaces/corvid-nft.interface";
import { SoundEffectService } from "./sound-effect.service";
import { ThemeService } from "./theme.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  
  // TODO: Figure out the ipfs gateway and how to extract the CID from the ipft url from the api list response
  // https://nodely.io/swagger/index.html?url=/swagger/api/4160/indexer.oas3.yml#/common/makeHealthCheck ????????
  // IPFS GATEWAY https://nodely.io/ipfs-gateway ?????
  private corvid_asa_token_id: string = "3225439167";
  private indexer_url = 'https://mainnet-idx.4160.nodely.dev';
  private ipfsGateway = 'https://ipfs.algonode.xyz/ipfs/';
  private algod_url: string = "https://mainnet-api.4160.nodely.dev";
  private corvid_wallet = environment.corvid_wallet;

  private serverUrl: string = environment.serverUrl;

  private httpClient: HttpClient = inject(HttpClient);
  private themeService: ThemeService = inject(ThemeService);
  private soundService: SoundEffectService = inject(SoundEffectService);

  constructor() {}

  saveUserSettings(userWallet: string) {
    const userSettings: SiteSettingsMetadata = {
      walletAddress: userWallet,
      currentTheme: this.themeService.getCurrentTheme()?.id ?? 'dark',
      soundVolume: 50,
      profilePicAsaID: 746557618,
      userCvdAsaIDs: [746557618]
    }
    
    return this.httpClient.post(this.serverUrl + '/user/saveSettings', userSettings); 
  }

  test() {
    return this.httpClient.post(this.serverUrl + '/api/echo', { message: 'Hello world' });
  }

  fetchUserNfts(userWallet: string): Observable<FetchNFTsResponse> {
    return this.httpClient.get<FetchNFTsResponse>(`${this.algod_url}/v2/accounts/${userWallet}/assets`);
  }
}

export interface FetchNFTsResponse {
  "asset-holdings": AssetHoldings[],
  round: number
}

export interface AssetHoldings {
  "asset-holding": { [key: string]: any };
  "asset-params": { 
    creator: string,
    decimals: number,
    "default-frozen": boolean,
    freeze: string,
    manager: string,
    name: string,
    "name-b64": string,
    reserve: string,
    total: number,
    "unit-name": string,
    "unit-name-b64": string,
    url: string,
    "url-b64": string
  };
}