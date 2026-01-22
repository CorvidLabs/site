import { IndexerAsset } from "./indexer-asset.interface";

export interface CreatedAssetsResponse {
  assets: IndexerAsset[];
  currentRound: number;
  nextToken: string;
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