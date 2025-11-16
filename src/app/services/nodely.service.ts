import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import algosdk from "algosdk";
import { CID } from 'multiformats/cid';
import * as Digest from "multiformats/hashes/digest";
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment.local';
import { CorvidNft } from '../interfaces/corvid-nft.interface';
import { IndexerAsset } from '../interfaces/indexer-asset.interface';


export interface CreatedAssetsResponse {
  assets: IndexerAsset[];
  currentRound: number;
  nextToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class NodelyService {
  
  // TODO: Figure out the ipfs gateway and how to extract the CID from the ipft url from the api list response
  // https://nodely.io/swagger/index.html?url=/swagger/api/4160/indexer.oas3.yml#/common/makeHealthCheck ????????
  // IPFS GATEWAY https://nodely.io/ipfs-gateway ?????
  private url = 'https://mainnet-idx.4160.nodely.dev';
  private ipfsGateway = 'https://ipfs.algonode.xyz/ipfs/';
  private corvid_wallet = environment.corvid_wallet;

  constructor(
    private httpClient: HttpClient
  ) {}

  listCreatedAssets(pageSize: number, nextToken: string | null): Observable<CreatedAssetsResponse>  {
    let params: HttpParams = new HttpParams();
    params = params.append('limit', pageSize);
    
    if (nextToken) {
      params = params.append('next', nextToken);
    }
    
    return this.httpClient.get<any>(`${this.url}/v2/accounts/${this.corvid_wallet}/created-assets`, { params }).pipe(
      map(rawResponse => {
        const createdAssetsResponse: CreatedAssetsResponse = {
          currentRound: rawResponse['current-round'],
          nextToken: rawResponse['next-token'] ?? null,
          assets: rawResponse.assets.map((asset: any) => {
            let cid = this.extractCidFromReserveAddress(asset.params.reserve);
            const metadataIpfs = `${this.ipfsGateway}${cid}`;

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
}