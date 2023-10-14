"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opBNB = void 0;
exports.opBNB = {
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
};
