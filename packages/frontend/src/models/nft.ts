export type NFTMetaData = {
  name: string;
  description: string;
  external_link: string;
  image: string;
  image_url: string;
  animation_url: string;
};

export type NFTItem = {
  token_address: string;
  token_id: string;
  amount: string;
  owner_of: string;
  block_number: string;
  block_number_minted: string;
  contract_type: string;
  token_uri: string;
  metadata: string | NFTMetaData;
  synced_at: string;
  name: string;
  symbol: string;
};

export type GetNFTResponse = {
  total: number;
  page: number;
  page_size: number;
  result: NFTItem[];
  status: string;
};
