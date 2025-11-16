/**
 * ChainId determines which Algorand network your dApp uses.
 * - MainNet: 416001
 * - TestNet: 416002
 * - BetaNet: 416003
 * - All Networks: 4160
 */
export enum AlgorandChainIDs {
  MainNet = 416001,
  TestNet = 416002,
  BetaNet = 416003,
  All = 4160
}

export interface PeraWalletConnectOptions {
  shouldShowSignTxnToast?: boolean;
  chainId?: AlgorandChainIDs;
}