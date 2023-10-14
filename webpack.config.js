const path = require("path")

module.exports = {
    mode: 'production',
    entry: './renderer/src/js/walletConnectV2Adapter.js',
    output: {
        path: path.resolve(__dirname, "renderer/assets/js"),
        filename: 'walletConnectV2Adapter.js'
    },
    module: {
        rules: [{ test: /\.ts$/, use: 'raw-loader' }],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
}