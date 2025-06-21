require("dotenv").config();

const express = require("express");
const { ethers } = require("ethers");
const ABI = require("./MoveTokenABI.json");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.TOKEN_ADDRESS, ABI, wallet);

// Assign reward to a player
app.post("/reward", async (req, res) => {
  const { playerAddress, amount } = req.body;
  if (!playerAddress || !amount) {
    return res.status(400).json({ error: "Player address and amount are required" });
  }

  try {
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);

    const tx = await contract.assignReward(playerAddress, amountInWei);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error("Error assigning reward:", err);
    
    // Handle specific blockchain errors
    if (err.message && err.message.includes("already known")) {
      return res.status(409).json({ 
        error: "Transaction already submitted. Please wait for confirmation.", 
        code: "TRANSACTION_ALREADY_KNOWN" 
      });
    }
    
    if (err.message && err.message.includes("insufficient funds")) {
      return res.status(400).json({ 
        error: "Insufficient funds in the reward wallet.", 
        code: "INSUFFICIENT_FUNDS" 
      });
    }
    
    res.status(500).json({ error: err.message });
  }
});

// Check pending rewards for a player
app.get("/pending-rewards/:playerAddress", async (req, res) => {
  const { playerAddress } = req.params;
  
  try {
    const pendingRewards = await contract.pendingRewards(playerAddress);
    const decimals = await contract.decimals();
    const formattedAmount = ethers.formatUnits(pendingRewards, decimals);
    
    res.json({ 
      success: true, 
      pendingRewards: formattedAmount,
      pendingRewardsWei: pendingRewards.toString()
    });
  } catch (err) {
    console.error("Error checking pending rewards:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Reward backend running on port ${process.env.PORT}`);
});
