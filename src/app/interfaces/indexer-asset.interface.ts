export interface IndexerAsset {
  createdAtRound: number;
  index: number;
  params: {
    clawback: string;
    creator: string;
    decimals: number;
    defaultFrozen: boolean;
    freeze: string;
    manager: string;
    name: string;
    nameb64: string;
    reserve: string;
    total: number;
    unitName: string;
    unitNameb64: string;
    url: string;
    urlb64: string;
    metadataIpfs: string;
  };
}