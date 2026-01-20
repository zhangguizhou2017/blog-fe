import {
  createPublicClient,
  http
} from 'viem'
import {
  mainnet
} from 'viem/chains';

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://mainnet.infura.io/v3/4013d92584b14f69a0128110b7c76be4'),
})
