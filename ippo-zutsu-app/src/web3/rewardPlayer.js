import { ethers } from 'ethers';

const distributorAddress = '0xYourDistributorContractAddress'; // Replace this
const distributorAbi = [
  "function rewardPlayer(address player, uint256 amount) external",
];

export const rewardPlayer = async (playerAddress, amount) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not found");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(distributorAddress, distributorAbi, signer);

    // Convert amount to token decimals (assume 18 decimals for ERC20)
    const rewardAmount = ethers.parseUnits(amount.toString(), 18);
    
    const tx = await contract.rewardPlayer(playerAddress, rewardAmount);
    await tx.wait(); // Wait for transaction to be mined
    console.log(`🎉 Reward sent! TX: ${tx.hash}`);
    return tx;
  } catch (err) {
    console.error("❌ Failed to reward player:", err);
    throw err;
  }
};
