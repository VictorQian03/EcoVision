// scripts/interact.js
const { ethers } = require("hardhat");

async function main() {
    console.log('Getting the EcoNFT contract...\n');
    const contractAddress = '0x79E8AB29Ff79805025c9462a2f2F12e9A496f81d';
    const ecoNFT = await ethers.getContractAt('EcoNFT', contractAddress);
    const signers = await ethers.getSigners();
    // name()
    console.log('Querying NFT collection name...');
    const name = await ecoNFT.name();
    console.log(`Token Collection Name: ${name}\n`);

    // symbol()
    console.log('Querying NFT collection symbol...');
    const symbol = await ecoNFT.symbol();
    console.log(`Token Collection Symbol: ${symbol}\n`);

    // Mint new NFTs from the collection using custom function mintCollectionNFT()
    const contractOwner = signers[0].address;
    console.log('Minting a new NFT from the collection to the contractOwner...');
    const initialMintCount = 100; // Number of NFTs to mint
    let initialMint = [];
    for (let i = 91; i <= initialMintCount; i++) {
        let tx = await ecoNFT.mintCollectionNFT(signers[0].address, i.toString());
        await tx.wait(); // wait for this tx to finish to avoid nonce issues
        initialMint.push(i.toString());
    }
    console.log(`${symbol} NFT with tokenIds ${initialMint} and minted to: ${contractOwner}\n`);

    // balanceOf()
    console.log(`Querying the balance count of contractOwner ${contractOwner}...`);
    let contractOwnerBalances = await ecoNFT.balanceOf(contractOwner);
    console.log(`${contractOwner} has ${contractOwnerBalances} NFTs from this ${symbol} collection\n`)

    // ownerOf()
    const NFT3 = initialMint[0];
    console.log(`Querying the owner of ${symbol}#${NFT3}...`);
    const owner = await ecoNFT.ownerOf(NFT3);
    console.log(`Owner of NFT ${symbol} ${NFT3}: ${owner}\n`);

    const collector = signers[3].address;
    let collectorBalances = await ecoNFT.balanceOf(collector);
    console.log(`${collector} has ${collectorBalances} NFTs from this ${symbol} collection\n`)

    // safeTransferFrom()
    console.log(`Transferring ${symbol}#${NFT3} from ${contractOwner} to collector ${collector}...`);
    // safeTransferFrom() is overloaded (ie. multiple functions with same name) hence differing syntax
    await ecoNFT["safeTransferFrom(address,address,uint256)"](contractOwner, collector, NFT3);
    console.log(`${symbol}#${NFT3} transferred from ${contractOwner} to ${collector}`);

    console.log(`Querying the owner of ${symbol}#${NFT3}...`);
    let NFT3Owner = await ecoNFT.ownerOf(NFT3);
    console.log(`Owner of ${symbol}#${NFT3}: ${NFT3Owner}\n`);
    // console.log(`${collector} has ${collectorBalances} NFTs from this ${symbol} collection\n`)
    let newContractOwnerBalances = await ecoNFT.balanceOf(contractOwner);
    console.log(`${contractOwner} has ${newContractOwnerBalances} NFTs from this ${symbol} collection\n`)
    let newCollectorBalances = await ecoNFT.balanceOf(collector);
    console.log(`${collector} has ${newCollectorBalances} NFTs from this ${symbol} collection\n`)

    // approve()
    console.log(`Approving contractOwner to spend collector ${symbol}#${NFT3}...`);
    // Creates a new instance of the contract connected to the collector
    const collectorContract = ecoNFT.connect(signers[3]); 
    await collectorContract.approve(contractOwner, NFT3);
    console.log(`contractOwner ${contractOwner} has been approved to 
    spend collector ${collector} ${symbol}#${NFT3}\n`);

    // getApproved()
    console.log(`Getting the account approved to spend ${symbol}#${NFT3}...`);
    let NFT3Spender = await ecoNFT.getApproved(NFT3);
    console.log(`${NFT3Spender} has the approval to spend ${symbol}#${NFT3}\n`);

    console.log(`Transferring ${symbol}#${NFT3} from ${collector} to collector ${contractOwner}...`);
    await ecoNFT["safeTransferFrom(address,address,uint256)"](collector, contractOwner, NFT3);
    console.log(`${symbol}#${NFT3} transferred from ${collector} to ${contractOwner}`);
    
    let newOwner = await ecoNFT.ownerOf(NFT3);
    console.log(`Owner of ${symbol}#${NFT3}: ${newOwner}\n`);
    let finalContractOwnerBalances = await ecoNFT.balanceOf(contractOwner);
    console.log(`${contractOwner} has ${finalContractOwnerBalances} NFTs from this ${symbol} collection\n`)
    let finalCollectorBalances = await ecoNFT.balanceOf(collector);
    console.log(`${collector} has ${finalCollectorBalances} NFTs from this ${symbol} collection\n`)

    // setApprovalForAll()
    console.log(`Approving collector to spend all of contractOwner ${symbol} NFTs...`);
    // Using the contractOwner contract instance as the caller of the function
    await ecoNFT.setApprovalForAll(collector, true) // The second parameter can be set to false to remove operator
    console.log(`collector ${collector} has been approved to spend all of contractOwner ${contractOwner} ${symbol} NFTs\n`)

    // isApprovedForAll()
    console.log(`Checking if collector has been approved to spend all of contractOwner ${symbol} NFTs`);
    const approvedForAll = await ecoNFT.isApprovedForAll(contractOwner, collector);
    console.log(`Is collector ${collector} approved to spend all of contractOwner ${contractOwner} ${symbol} NFTs: ${approvedForAll}\n`);

    // safeTransferFrom() with valid isApprovedForAll()
    console.log(`Validating collector has approval to transfer all of contractOwner NFTs...`);
    // contractOwner NFT count before transfer
    let contractOwnerBalances1 = await ecoNFT.balanceOf(contractOwner);
    console.log(`BEFORE: ${contractOwner} has ${contractOwnerBalances1} NFTs from this ${symbol} collection`);
    let collectorBalances1 = await ecoNFT.balanceOf(collector);
    console.log(`BEFORE: ${collector} has ${collectorBalances1} NFTs from this ${symbol} collection`);
    console.log(`Collector transferring all contractOwner NFTs to collector wallet`);
    for (let i = 0; i < initialMint.length; i++) {
        // Using the collector wallet to call the transfer
        await collectorContract["safeTransferFrom(address,address,uint256)"](contractOwner, collector, initialMint[i]);
    }
    console.log(`NFT transfer completed`);
    contractOwnerBalances1 = await ecoNFT.balanceOf(contractOwner);
    console.log(`AFTER: ${contractOwner} has ${contractOwnerBalances1} NFTs from this ${symbol} collection`);
    collectorBalances1 = await ecoNFT.balanceOf(collector);
    console.log(`AFTER: ${collector} has ${collectorBalances1} NFTs from this ${symbol} collection`);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });