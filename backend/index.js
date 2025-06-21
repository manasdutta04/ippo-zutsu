require("dotenv").config();

const express = require("express");
const { ethers } = require("ethers");
const ABI = require("./MoveTokenABI.json");
const cors = require("cors");

// Load ABIs
const NFTABI = require("./abi/NFTABI.json");

const bodyParser = require("body-parser");


const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(bodyParser.json());

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.TOKEN_ADDRESS, ABI, wallet);
const nftContract=new ethers.Contract(process.env.NFT_CONTRACT_ADDRESS, NFTABI, wallet);



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

    console.log(`Processing reward for ${playerAddress}: ${amount} tokens (${amountInWei.toString()} wei)`);

    // Check backend wallet balances
    const backendBalance = await contract.balanceOf(wallet.address);
    const nativeBalance = await provider.getBalance(wallet.address);
    
    console.log(`Backend wallet balance: ${ethers.formatUnits(backendBalance, decimals)} tokens`);
    console.log(`Backend native balance: ${ethers.formatEther(nativeBalance)} ETH`);

    // Check if backend has enough native tokens for gas
    if (nativeBalance < ethers.parseEther("0.001")) {
      console.error("❌ Backend wallet has insufficient native tokens for gas fees");
      // Mark transaction as completed to prevent retries
      recentTransactions.set(txKey, Date.now());
      
      return res.status(500).json({ 
        error: "Backend wallet needs native tokens for gas fees. Please fund the backend wallet.",
        code: "INSUFFICIENT_GAS_FUNDS"
      });
    }

    // If backend has enough tokens, do direct transfer (NO GAS for user)
    if (backendBalance >= amountInWei) {
      console.log("✅ Backend has sufficient balance - doing direct transfer (user pays ZERO gas)");
      
      try {
        const nonce = await wallet.getNonce();
        const transferTx = await contract.transfer(playerAddress, amountInWei, {
          nonce: nonce,
          gasLimit: 100000 // Set explicit gas limit
        });
        
        console.log(`Direct transfer sent with nonce ${nonce}: ${transferTx.hash}`);
        const transferReceipt = await transferTx.wait();
        console.log(`✅ Direct transfer confirmed: ${transferTx.hash} (Block: ${transferReceipt.blockNumber})`);
        
        // Mark transaction as completed
        recentTransactions.set(txKey, Date.now());
        
        res.json({ 
          success: true, 
          txHash: transferTx.hash,
          blockNumber: transferReceipt.blockNumber,
          message: "🎉 Tokens transferred directly to your wallet - ZERO gas fees for you!",
          gasFreeTansfer: true
        });
      } catch (transferError) {
        console.error("❌ Direct transfer failed:", transferError.message);
        
        // Fall back to assign/claim method
        console.log("🔄 Falling back to assign/claim method...");
        
        try {
          const nonce = await wallet.getNonce();
          const assignTx = await contract.assignReward(playerAddress, amountInWei, {
            nonce: nonce,
            gasLimit: 150000
          });
          
          console.log(`Assign transaction sent with nonce ${nonce}: ${assignTx.hash}`);
          const assignReceipt = await assignTx.wait();
          console.log(`Assign transaction confirmed: ${assignTx.hash} (Block: ${assignReceipt.blockNumber})`);

          // Mark transaction as completed
          recentTransactions.set(txKey, Date.now());
          
          res.json({ 
            success: true, 
            txHash: assignTx.hash,
            blockNumber: assignReceipt.blockNumber,
            message: "Reward assigned! You can claim tokens anytime (small one-time gas fee required).",
            requiresManualClaim: true
          });
        } catch (assignError) {
          console.error("❌ Assign transaction also failed:", assignError.message);
          throw assignError; // This will be caught by the outer catch block
        }
      }
      
    } else {
      // Backend doesn't have enough tokens - use assign/claim method
      console.log("⚠️ Backend wallet has insufficient token balance - using assign/claim method");
      
      const nonce = await wallet.getNonce();
      
      const assignTx = await contract.assignReward(playerAddress, amountInWei, {
        nonce: nonce,
        gasLimit: 150000
      });
      
      console.log(`Assign transaction sent with nonce ${nonce}: ${assignTx.hash}`);
      const assignReceipt = await assignTx.wait();
      console.log(`Assign transaction confirmed: ${assignTx.hash} (Block: ${assignReceipt.blockNumber})`);

      // Mark transaction as completed
      recentTransactions.set(txKey, Date.now());
      
      res.json({ 
        success: true, 
        txHash: assignTx.hash,
        blockNumber: assignReceipt.blockNumber,
        message: "Reward assigned! You can claim tokens anytime (small one-time gas fee required).",
        requiresManualClaim: true
      });
    }
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
        error: "Backend wallet has insufficient native tokens for gas fees. Please contact support.", 
        code: "INSUFFICIENT_FUNDS" 
      });
    }
    
    if (err.message && err.message.includes("nonce too low")) {
      return res.status(409).json({ 
        error: "Transaction nonce conflict. Please try again.", 
        code: "NONCE_TOO_LOW" 
      });
    }

    if (err.message && err.message.includes("execution reverted")) {
      console.error("❌ Contract execution reverted. This could mean:");
      console.error("   - Backend wallet is not the contract owner");
      console.error("   - Contract doesn't have enough tokens in reward pool");
      console.error("   - Function call parameters are invalid");
      
      return res.status(500).json({ 
        error: "Contract execution failed. This usually means the backend wallet lacks permissions or the contract needs funding.", 
        code: "EXECUTION_REVERTED",
        details: "Please contact support - the backend needs configuration."
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
    const backendBalance = await contract.balanceOf(wallet.address);
    const nativeBalance = await provider.getBalance(wallet.address);
    
    const info = { 
      owner, 
      decimals: Number(decimals), 
      name, 
      symbol, 
      totalSupply: totalSupply.toString(),
      backendBalance: ethers.formatUnits(backendBalance, decimals),
      nativeBalance: ethers.formatEther(nativeBalance),
      walletAddress: wallet.address,
      isOwner: wallet.address.toLowerCase() === owner.toLowerCase()
    };
    
    console.log("Contract debug info:", info);
    
    res.json({ 
      success: true,
      contractInfo: {
        ...info,
        backendBalanceWei: backendBalance.toString(),
        nativeBalanceWei: nativeBalance.toString()
      }
    });
  } catch (err) {
    console.error("Error getting contract info:", err);
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint to check if backend can perform operations
app.get("/debug/test-permissions", async (req, res) => {
  try {
    const owner = await contract.owner();
    const isOwner = wallet.address.toLowerCase() === owner.toLowerCase();
    const backendBalance = await contract.balanceOf(wallet.address);
    const nativeBalance = await provider.getBalance(wallet.address);
    
    const checks = {
      isOwner,
      hasNativeTokens: nativeBalance > ethers.parseEther("0.001"),
      hasContractTokens: backendBalance > 0,
      canAssignRewards: isOwner,
      canDirectTransfer: backendBalance > 0
    };
    
    console.log("Permission checks:", checks);
    
    res.json({ 
      success: true,
      checks,
      recommendations: {
        needsNativeFunding: !checks.hasNativeTokens,
        needsTokenFunding: !checks.hasContractTokens,
        needsOwnership: !checks.isOwner
      }
    });
  } catch (err) {
    console.error("Error checking permissions:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to fund backend wallet (admin only)
app.post("/admin/fund-backend", async (req, res) => {
  const { amount } = req.body;
  
  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  try {
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);
    
    console.log(`Funding backend wallet with ${amount} tokens...`);
    
    // Use fundRewardPool or transfer tokens to backend wallet
    const nonce = await wallet.getNonce();
    const fundTx = await contract.fundRewardPool(amountInWei, {
      nonce: nonce
    });
    
    console.log(`Fund transaction sent: ${fundTx.hash}`);
    const receipt = await fundTx.wait();
    console.log(`Fund transaction confirmed: ${fundTx.hash} (Block: ${receipt.blockNumber})`);
    
    // Check new balance
    const newBalance = await contract.balanceOf(wallet.address);
    const formattedBalance = ethers.formatUnits(newBalance, decimals);
    
    res.json({ 
      success: true, 
      txHash: fundTx.hash,
      blockNumber: receipt.blockNumber,
      message: `Backend wallet funded with ${amount} tokens. New balance: ${formattedBalance}`,
      newBalance: formattedBalance
    });
  } catch (err) {
    console.error("Error funding backend wallet:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/claim-nft", async (req, res) => {
  const { playerAddress, nftUri, requiredMoveTokens } = req.body;

  if (!playerAddress || !nftUri || !requiredMoveTokens) {
    return res.status(400).json({ error: "Player address, URI, and required MOVE amount are needed" });
  }

  try {
    const decimals = await contract.decimals(); // use the actual decimals of MOVE token
    const balance = await contract.balanceOf(playerAddress);
    const required = ethers.parseUnits(requiredMoveTokens.toString(), decimals);

    if (balance < required) {
      return res.status(400).json({ error: "Not enough MOVE tokens" });
    }

    const tx = await nftContract.mintItem(playerAddress, nftUri);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error("❌ NFT Claim Error:", error); // Log full error
    res.status(500).json({ error: error.message || "NFT claim failed" });
  }
});



app.listen(process.env.PORT, () => {
  console.log(`Reward backend running on port ${process.env.PORT}`);
});
