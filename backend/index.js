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

// Transaction management
const pendingTransactions = new Map(); // Track pending transactions
const recentTransactions = new Map(); // Track recent transactions to prevent duplicates

// Helper function to create a unique transaction key
function createTransactionKey(playerAddress, amount) {
  return `${playerAddress.toLowerCase()}-${amount}`;
}

// Helper function to cleanup old transactions
function cleanupOldTransactions() {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  
  for (const [key, timestamp] of recentTransactions.entries()) {
    if (now - timestamp > maxAge) {
      recentTransactions.delete(key);
    }
  }
}

// Assign reward to a player
app.post("/reward", async (req, res) => {
  const { playerAddress, amount } = req.body;
  if (!playerAddress || !amount) {
    return res.status(400).json({ error: "Player address and amount are required" });
  }

  // Create unique transaction key
  const txKey = createTransactionKey(playerAddress, amount);
  
  // Clean up old transactions periodically
  cleanupOldTransactions();
  
  // Check if there's already a pending transaction for this player/amount
  if (pendingTransactions.has(txKey)) {
    return res.status(409).json({ 
      error: "Transaction already in progress for this player/amount combination.", 
      code: "TRANSACTION_PENDING" 
    });
  }
  
  // Check if this exact transaction was recently completed
  if (recentTransactions.has(txKey)) {
    return res.status(409).json({ 
      error: "This reward was already assigned recently.", 
      code: "TRANSACTION_RECENTLY_COMPLETED" 
    });
  }

  // Mark transaction as pending
  pendingTransactions.set(txKey, Date.now());

  try {
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);

    // Get the current nonce to ensure transaction uniqueness
    const nonce = await wallet.getNonce();
    
    // Option 1: Direct transfer (user pays no gas)
    const tx = await contract.transfer(playerAddress, amountInWei, {
      nonce: nonce
    });
    
    // Option 2: Keep using assignReward (user pays gas to claim)
    // const tx = await contract.assignReward(playerAddress, amountInWei, {
    //   nonce: nonce
    // });
    
    console.log(`Transaction sent with nonce ${nonce}: ${tx.hash}`);
    await tx.wait();
    
    console.log(`Transaction confirmed: ${tx.hash}`);

    // Mark transaction as completed
    recentTransactions.set(txKey, Date.now());
    
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error("Error assigning reward:", err);
    
    // Handle specific blockchain errors
    if (err.error && err.error.code === -32000 && err.error.message === "already known") {
      // Transaction with same nonce already exists
      console.log("Transaction already known, treating as success");
      recentTransactions.set(txKey, Date.now());
      return res.status(409).json({ 
        error: "Transaction already submitted. Please wait for confirmation.", 
        code: "TRANSACTION_ALREADY_KNOWN" 
      });
    }
    
    if (err.message && err.message.includes("already known")) {
      console.log("Transaction already known (string match), treating as success");
      recentTransactions.set(txKey, Date.now());
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
    
    if (err.message && err.message.includes("nonce too low")) {
      return res.status(409).json({ 
        error: "Transaction nonce conflict. Please try again.", 
        code: "NONCE_TOO_LOW" 
      });
    }
    
    res.status(500).json({ error: err.message });
  } finally {
    // Always remove from pending transactions
    pendingTransactions.delete(txKey);
  }
});

// Check pending rewards for a player
app.get("/pending-rewards/:playerAddress", async (req, res) => {
  const { playerAddress } = req.params;
  
  try {
    console.log(`Checking pending rewards for: ${playerAddress}`);
    const pendingRewards = await contract.pendingRewards(playerAddress);
    const decimals = await contract.decimals();
    const formattedAmount = ethers.formatUnits(pendingRewards, decimals);
    
    console.log(`Pending rewards: ${formattedAmount} MOVE (${pendingRewards.toString()} wei)`);
    
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

// Debug endpoint to check contract state
app.get("/debug/contract-info", async (req, res) => {
  try {
    const owner = await contract.owner();
    const decimals = await contract.decimals();
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    
    console.log("Contract debug info:", { owner, decimals, name, symbol, totalSupply: totalSupply.toString() });
    
    res.json({ 
      success: true,
      contractInfo: {
        owner,
        decimals,
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        walletAddress: wallet.address
      }
    });
  } catch (err) {
    console.error("Error getting contract info:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Reward backend running on port ${process.env.PORT}`);
});
