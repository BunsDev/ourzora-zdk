import { GraphQLClient } from 'graphql-request';
import {
  getSdk,
  Chain,
  Network,
  NetworkInput,
  SortDirection,
  TokenInput,
  TokensQueryInput,
  TokensQueryFilter,
  CollectionsQueryInput,
  CollectionSortKeySortInput,
  TokenSortInput,
  CollectionSortKey,
  TokenSortKey,
  AggregateAttributesQueryVariables,
  OwnersByCountQueryVariables,
  SalesVolumeQueryVariables,
  EventsQueryInput,
  EventsQueryFilter,
  EventSortKeySortInput,
  EventSortKey,
  MarketSortKeySortInput,
  MarketsQueryFilter,
  MarketsQueryInput,
  MarketSortKey,
  MintsQueryFilter,
  MintsQueryInput,
  MintSortKey,
  MintSortKeySortInput,
  FloorPriceQueryVariables,
  NftCountQueryVariables,
  SearchQueryVariables,
  SaleSortKey,
  SalesQueryInput,
  SaleSortKeySortInput,
  SalesQueryFilter,
  OwnerCountQueryVariables,
  PaginationInput,
} from './queries/queries-sdk';

// Export chain and network for API users
export { Chain as ZDKChain, Network as ZDKNetwork };

export type OverrideNetworksOption = NetworkInput[];

export type OverridePaginationOptions = PaginationInput;
type SharedQueryParams = {
  networks?: NetworkInput[];
  pagination?: OverridePaginationOptions;
};

export type CollectionsQueryArgs = {
  where: CollectionsQueryInput;
  includeFullDetails?: boolean;
  sort: CollectionSortKeySortInput;
} & SharedQueryParams;

export type TokensQueryArgs = {
  where: TokensQueryInput;
  filter?: TokensQueryFilter;
  sort?: TokenSortInput;
  includeFullDetails?: boolean;
  includeSalesHistory?: boolean;
} & SharedQueryParams;

export type EventsQueryArgs = {
  where: EventsQueryInput;
  sort?: EventSortKeySortInput;
  filter?: EventsQueryFilter;
} & SharedQueryParams;

export type MarketQueryArgs = {
  where: MarketsQueryInput;
  sort: MarketSortKeySortInput;
  filter: MarketsQueryFilter;
  includeFullDetails: boolean;
} & SharedQueryParams;

export type MintsQueryArgs = {
  where: MintsQueryInput;
  sort?: MintSortKeySortInput;
  filter?: MintsQueryFilter;
  includeFullDetails?: boolean;
  includeMarkets?: boolean;
} & SharedQueryParams;

export type SalesQueryArgs = {
  where: SalesQueryInput;
  sort: SaleSortKeySortInput;
  filter: SalesQueryFilter;
  includeFullDetails: boolean;
} & SharedQueryParams;

export type CollectionStatsAggregateQuery = {
  collectionAddress: string;
  network: NetworkInput;
};

export type TokenQueryArgs = {
  network?: NetworkInput;
  token: TokenInput;
  includeFullDetails?: boolean;
};

export type CollectionQueryArgs = {
  address: string;
  network?: NetworkInput;
  includeFullDetails?: boolean;
};

export interface ListOptions<SortInput> {
  networks?: OverrideNetworksOption;
  pagination?: OverridePaginationOptions;
  sort?: SortInput;
  includeFullDetails?: boolean;
}

export interface AggregateOptions {
  networks?: OverrideNetworksOption;
}

export type TokenQueryList = TokenInput;

type OptionalNetwork<K> = Omit<K, 'networks'> & {
  networks?: OverrideNetworksOption;
};

const DEFAULT_PROD_ENDPOINT = 'https://api.zora.co/graphql';

/**
 * Main ZDK Class
 * 
 * @name zdk
 * 
 */
export class ZDK {
  endpoint: string;
  defaultNetworks: OverrideNetworksOption;
  defaultMaxPageSize: number = 200;

  public sdk: ReturnType<typeof getSdk>;

  constructor(
    endpoint: string = DEFAULT_PROD_ENDPOINT,
    networks: OverrideNetworksOption = [
      { network: Network.Ethereum, chain: Chain.Mainnet },
    ]
  ) {
    this.endpoint = endpoint;
    this.defaultNetworks = networks;
    this.sdk = getSdk(new GraphQLClient(this.endpoint));
  }

  private getNetworksOption = (networks?: OverrideNetworksOption) => {
    return {
      networks: networks ?? this.defaultNetworks,
    };
  };

  private getPaginationOptions = ({ limit, after }: PaginationInput = {}) => {
    return {
      pagination: {
        limit: limit || this.defaultMaxPageSize,
        after: after || null,
      },
    };
  };

  public tokens = async ({
    where,
    filter,
    pagination,
    networks,
    sort,
    includeFullDetails = false,
    includeSalesHistory = false,
  }: TokensQueryArgs) =>
    this.sdk.tokens({
      where,
      filter,
      sort: {
        sortDirection: sort?.sortDirection || SortDirection.Asc,
        sortKey: sort?.sortKey || TokenSortKey.Transferred,
        sortAxis: sort?.sortAxis,
      },
      includeFullDetails,
      includeSalesHistory,
      ...this.getPaginationOptions(pagination),
      ...this.getNetworksOption(networks),
    });

  /**
   * Fetches a singlar NFT token
   * 
   * @param args.token Token parameters
   * @param {string} args.token.address address of the token (req'd)
   * @param {string} args.token.tokenId string ID of the token (req'd)
   * @param {string} args.network the network to use to retrieve the token
   * @param {string} args.network.chain Chain to use (default ETHEREUM)
   * @param {string} args.network.network Network on the given chain to use (default MAINNET)
   * @param {boolean} args.includeFullDetails should full details be added to the response 
   * @returns {Promise<TokenQuery>} Token graphql response
   */
  public token = async ({
    token,
    network = this.defaultNetworks[0],
    includeFullDetails = false,
  }: OptionalNetwork<TokenQueryArgs>) =>
    await this.sdk.token({
      token,
      network,
      includeFullDetails,
    });

  public events = async ({
    networks,
    filter,
    pagination,
    sort,
    where,
  }: EventsQueryArgs) =>
    this.sdk.events({
      filter,
      where,
      ...this.getPaginationOptions(pagination),
      ...this.getNetworksOption(networks),
      sort: {
        sortDirection: sort?.sortDirection || SortDirection.Desc,
        sortKey: sort?.sortKey || EventSortKey.Created,
      },
    });

  public markets = async ({
    networks,
    filter,
    pagination,
    sort,
    where,
    includeFullDetails = false,
  }: MarketQueryArgs) =>
    this.sdk.markets({
      filter,
      where,
      includeFullDetails,
      ...this.getPaginationOptions(pagination),
      ...this.getNetworksOption(networks),
      sort: {
        sortDirection: sort?.sortDirection || SortDirection.Desc,
        sortKey: sort?.sortKey || MarketSortKey.None,
      },
    });

  public mints = async ({
    networks,
    filter,
    pagination,
    sort,
    where,
    includeFullDetails = false,
    includeMarkets = false,
  }: MintsQueryArgs) =>
    this.sdk.mints({
      filter,
      where,
      ...this.getPaginationOptions(pagination),
      ...this.getNetworksOption(networks),
      sort: {
        sortDirection: sort?.sortDirection || SortDirection.Desc,
        sortKey: sort?.sortKey || MintSortKey.None,
      },
      includeFullDetails,
      includeMarkets,
    });

  public sales = async ({
    where,
    pagination,
    networks,
    sort,
    filter,
    includeFullDetails = false,
  }: SalesQueryArgs) =>
    this.sdk.sales({
      where,
      filter,
      ...this.getPaginationOptions(pagination),
      ...this.getNetworksOption(networks),
      sort: {
        sortDirection: sort?.sortDirection || SortDirection.Desc,
        sortKey: sort?.sortKey || SaleSortKey.Time,
      },
      includeFullDetails,
    });

  public collections = async ({
    where,
    pagination,
    networks,
    sort,
    includeFullDetails = false,
  }: CollectionsQueryArgs) =>
    this.sdk.collections({
      where,
      includeFullDetails,
      ...this.getPaginationOptions(pagination),
      ...this.getNetworksOption(networks),
      sort: {
        sortDirection: sort?.sortDirection || SortDirection.Desc,
        sortKey: sort?.sortKey || CollectionSortKey.Created,
      },
    });

  public collectionStatsAggregate = async ({
    collectionAddress,
    network,
  }: CollectionStatsAggregateQuery) =>
    this.sdk.collectionStatsAggregate({
      collectionAddress,
      ...this.getNetworksOption(network ? [network] : undefined),
    });

  public collection = async ({
    address,
    network,
    includeFullDetails = true,
  }: CollectionQueryArgs) => {
    const collectionsResponse = await this.sdk.collections({
      where: {
        collectionAddresses: [address],
      },
      pagination: {
        limit: 2,
        after: null,
      },
      sort: {
        sortKey: CollectionSortKey.Created,
        sortDirection: SortDirection.Asc,
      },
      includeFullDetails,
      ...this.getNetworksOption(network ? [network] : undefined),
    });

    const items = collectionsResponse.collections.nodes;
    if (items.length === 0) {
      throw new Error('No collections found');
    }
    if (items.length === 2) {
      throw new Error('Invariant: multiple collections found, expecting 1');
    }
    return items[0];
  };

  public ownersByCount = async ({
    where,
    pagination,
    networks = this.defaultNetworks,
  }: OptionalNetwork<OwnersByCountQueryVariables>) =>
    this.sdk.ownersByCount({
      where,
      networks,
      pagination,
    });

  public aggregateAttributes = async ({
    where,
    networks = this.defaultNetworks,
  }: OptionalNetwork<AggregateAttributesQueryVariables>) =>
    this.sdk.aggregateAttributes({ where, networks });

  public salesVolume = async ({
    where,
    networks = this.defaultNetworks,
    timeFilter,
  }: OptionalNetwork<SalesVolumeQueryVariables>) =>
    this.sdk.salesVolume({
      where,
      networks,
      timeFilter,
    });

  public ownerCount = async ({
    where,
    networks = this.defaultNetworks,
  }: OptionalNetwork<OwnerCountQueryVariables>) =>
    this.sdk.ownerCount({
      where,
      networks,
    });

  public floorPrice = async ({
    where,
    networks = this.defaultNetworks,
  }: OptionalNetwork<FloorPriceQueryVariables>) =>
    this.sdk.floorPrice({
      where,
      networks,
    });

  public nftCount = async ({
    where,
    networks = this.defaultNetworks,
  }: OptionalNetwork<NftCountQueryVariables>) =>
    this.sdk.nftCount({
      where,
      networks,
    });

  public search = async ({ pagination, query, filter }: SearchQueryVariables) =>
    this.sdk.search({
      pagination,
      filter,
      query,
    });
}
