import { Chain } from '@wagmi/core'

export const opBNB = {
    id: 204,
    name: 'opBNB Mainnet',
    network: 'opBNB',
    nativeCurrency: { name: 'opBNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://opbnb-mainnet-rpc.bnbchain.org'],
        },
        public: {
            http: ['https://opbnb-mainnet-rpc.bnbchain.org'],
        }
    },
    blockExplorers: {
        default: {
            name: 'opBNB Explorer',
            url: 'http://mainnet.opbnbscan.com/',
        }
    }
} as const satisfies Chain

