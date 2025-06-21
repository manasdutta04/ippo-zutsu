import { Contract, formatUnits } from "ethers";

// Replace with your real contract address
const MOVE_TOKEN_ADDRESS = "0x0DdC4C56F6F26711A013e273b4AbFB3d89723308"; 
const MOVE_TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export const getMoveBalance = async (userAddress, provider) => {
  if (!userAddress || !provider) return null;

  try {
    const contract = new Contract(MOVE_TOKEN_ADDRESS, MOVE_TOKEN_ABI, provider);
    const rawBalance = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();
    const balance = formatUnits(rawBalance, decimals);
    return balance;
  } catch (err) {
    console.error("Failed to fetch MOVE balance:", err);
    return null;
  }
};
