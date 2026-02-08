import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import algosdk from "algosdk";
import { CID } from 'multiformats/cid';
import * as Digest from "multiformats/hashes/digest";
import { forkJoin, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment.local';
import { CorvidNft, SiteSettingsMetadata } from '../interfaces/corvid-nft.interface';
import { AssetHoldings, CreatedAssetsResponse, FetchNFTsResponse } from '../interfaces/asset.interfaces';
import { SoundEffectService } from './general/sound-effect.service';
import { ThemeService } from './general/theme.service';

export enum MembershipStatus {
  LICENSED,
  NFT_HOLDER,
  UNLICENSED
}

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  
  // TODO: Change name of this service to asset service
  private corvid_asa_token_id: string = "3225439167";
  private indexer_url = 'https://mainnet-idx.4160.nodely.dev';
  private ipfsGateway = 'https://ipfs.algonode.xyz/ipfs/';
  private algod_url: string = "https://mainnet-api.4160.nodely.dev";
  private corvid_wallet = environment.corvid_wallet;

  private ipfsFallbacks = ["https://ipfs.io/ipfs/", "https://ipfs.filebase.io/ipfs/", "https://dweb.link/ipfs/"];
  private currentIpfsFallbackIndex = 0;

  private httpClient: HttpClient = inject(HttpClient);
  private themeService: ThemeService = inject(ThemeService);
  private soundService: SoundEffectService = inject(SoundEffectService);

  constructor() {}

  listCreatedAssets(pageSize: number, nextToken: string | null, fallback: boolean = false): Observable<CreatedAssetsResponse>  {
    let params: HttpParams = new HttpParams();
    params = params.append('limit', pageSize);

    let gateway = this.ipfsGateway;

    if (fallback) {
      gateway = this.ipfsFallbacks[this.currentIpfsFallbackIndex];
      this.currentIpfsFallbackIndex = (this.currentIpfsFallbackIndex + 1) % this.ipfsFallbacks.length;
    }

    if (nextToken) {
      params = params.append('next', nextToken);
    }
    
    return this.httpClient.get<any>(`${this.indexer_url}/v2/accounts/${this.corvid_wallet}/created-assets`, { params }).pipe(
      map(rawResponse => {
        const createdAssetsResponse: CreatedAssetsResponse = {
          currentRound: rawResponse['current-round'],
          nextToken: rawResponse['next-token'] ?? null,
          assets: rawResponse.assets.map((asset: any) => {
            let cid = this.extractCidFromReserveAddress(asset.params.reserve);
            const metadataIpfs = `${gateway}${cid}`;

            return {
              createdAtRound: asset['created-at-round'],
              index: asset.index,
              params: {
                clawback: asset.params.clawback,
                creator: asset.params.creator,
                decimals: asset.params.decimals,
                defaultFrozen: asset.params['default-frozen'],
                freeze: asset.params.freeze,
                manager: asset.params.manager,
                name: asset.params.name,
                nameb64: asset.params['name-b64'],
                reserve: asset.params.reserve,
                total: asset.params.total,
                unitName: asset.params['unit-name'],
                unitNameb64: asset.params['unit-name-b64'],
                url: asset.params.url,
                urlb64: asset.params['url-b64'],
                metadataIpfs: metadataIpfs
              }
            };
          })
        };

        return createdAssetsResponse;
      })
    );
  }

  listCorvidNftsFromCreatedAssets(createdAssetsResponse: CreatedAssetsResponse): Observable<CorvidNft[]> {
    if (!createdAssetsResponse || createdAssetsResponse.assets.length === 0) {
      console.log('No assets found.');
      return of([]); // Return an observable of an empty array
    }

    const metadataUrls = createdAssetsResponse.assets.map(asset => asset.params.metadataIpfs);
    const metadataRequests: Observable<CorvidNft>[] = metadataUrls.map(url =>
      this.httpClient.get<CorvidNft>(url)
    );

    return forkJoin(metadataRequests).pipe(
      map(nfts => {
        nfts.forEach(nft => {
          nft.imageIpfsUrl = nft.image.replace('ipfs://', this.ipfsGateway);
        });
        
        return nfts;
      })
    );
  }

  private extractCidFromReserveAddress(reserveAddress: string): string {
    const decodedReserve = algosdk.decodeAddress(reserveAddress)?.publicKey;
    const multihash = Digest.create(0x12, decodedReserve);
    const cid = CID.create(1, 0x55, multihash); // 0x55 is the code for raw binary
    return cid.toString() ?? '';
  }

  private checkHolderConfig(walletAddress: string, corvidNFTs: AssetHoldings[]): Observable<MembershipStatus> {
    // Get metadata from reserve addresses of all CorvidNfts of the user
    const reserveAddresses = corvidNFTs.map(nft => nft['asset-params'].reserve);
    
    return this.getMetadataFromReserveAddresses(reserveAddresses).pipe(
      map(nfts => {
        // Check if any NFT has the user's wallet address in its siteSettingsMetadata
        const nftWithConfig = nfts.find(nft => nft.extra?.siteSettingsMetadata?.walletAddress === walletAddress);

        // If found, load the holder settings
        if (nftWithConfig) {
          this.loadHolderSettings(nftWithConfig.extra.siteSettingsMetadata as SiteSettingsMetadata);
        }

        // Return Holder status since user has Corvid NFTs
        return MembershipStatus.NFT_HOLDER;
      })
    );
  }

  private getMetadataFromReserveAddresses(reserveAddresses: string[]): Observable<CorvidNft[]> {
    const metadataRequests: Observable<CorvidNft>[] = reserveAddresses.map(address =>
      this.httpClient.get<CorvidNft>(`${this.ipfsGateway}${this.extractCidFromReserveAddress(address)}`)
    );

    return forkJoin(metadataRequests).pipe(
      map(nfts => {
        nfts.forEach(nft => {
          nft.imageIpfsUrl = nft.image.replace('ipfs://', this.ipfsGateway);
        });

        return nfts;
      })
    );
  }

  // TODO: Make a database check of people with wallet but without any Corvid NFT
  // Check for purchased premium licenses etc
  private checkNonHolderLicense(walletAddress: string): Observable<MembershipStatus> {
    // Implement your license checking logic here
    return of(MembershipStatus.UNLICENSED);
  }

  // Load holder settings into the application state
  private loadHolderSettings(siteSettingsMetadata: SiteSettingsMetadata): void {
    console.log('Loading holder settings:', siteSettingsMetadata);

    const theme = siteSettingsMetadata.currentTheme || 'dark';
    this.themeService.setTheme(theme);

    const soundVolume = siteSettingsMetadata.soundVolume || 50;
    this.soundService.setVolume(soundVolume);

    const profilePicture = siteSettingsMetadata.profilePicAsaID;
    // this.userService.setProfilePicture(profilePicture);

    
    // Implement your logic to load the settings into the application state
  }
}