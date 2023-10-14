const nftContractAddress = "0xb6Ad71ded9C092Aa4105fB367950647ca4B67bC0";
const mintNftButton = document.getElementById("mintNft");
const processingMintNftButton = document.getElementById('processingMintNft');

const mintNft = async(callback) => {

    mintNftButton.classList.add("d-none");
    processingMintNftButton.classList.remove("d-none");

    setTimeout(async() => {
        await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(nftContractAddress, bscNftAbi, signer);
        const contractWithSigner = nftContract.connect(signer);
        const txResponse = await contractWithSigner.mintArtwork();

        const receipt = await txResponse.wait();

        console.log('Transaction confirmed with block number:', receipt.blockNumber);

        const event = receipt.events.find(e => e.event === "ArtworkMinted");

        if (event) {
            const mintedId = event.args[0];
            console.log('Minted ID:', mintedId.toString());
        }
        callback(mintNftButton, processingMintNftButton);
    }, 1000);
}

const getNft = async() => {

    setTimeout(async() => {
        // const provider = new ethers.providers.Web3Provider(window.ethereum);
        // const signer = provider.getSigner();
        // const nftContract = new ethers.Contract(nftContractAddress, bscNftAbi, signer);
        const nftContract = await contract(bscNftAbi, nftContractAddress, signer);
        // const contractWithSigner = nftContract.connect(signer);
        // console.log('contractWithSigner: ', contractWithSigner);
        const hasMinted = await nftContract.hasMinted(selectedAccount);

        if (hasMinted) {

            mintNftButton.classList.add('d-none');

            const mintedToken = await nftContract.mintedToken(selectedAccount);
            let tokenURI = await nftContract.tokenURI(mintedToken);
            tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');

            const response = await fetch(tokenURI);
            const json = await response.json();
            let nftImage = json.image;
            nftImage = nftImage.replace('ipfs://', 'https://ipfs.io/ipfs/');
            document.getElementById('nftImage').src = nftImage;

            // ipfs://bafybeihvzofteqs4tkn62bndf7uqjq2fh3jpsu3xae6gwljpbvrfune4ci/0.json
            // https://ipfs.io/ipfs/bafybeihvzofteqs4tkn62bndf7uqjq2fh3jpsu3xae6gwljpbvrfune4ci/0.json
        }
    }, 1000);

}

mintNftButton.addEventListener("click", async() => {
    try {
        await mintNft((mintBtn, processingBtn) => {
            mintBtn.classList.remove("d-none");
            processingBtn.classList.add("d-none");
        });

        await getNft();
    } catch (error) {
        console.log(`Mint NFT error. ${error.message}`);
    }
});

document.addEventListener('DOMContentLoaded', async() => {
    await getNft();
});