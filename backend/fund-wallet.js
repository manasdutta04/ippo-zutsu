require("dotenv").config();
const { ethers } = require("ethers");

async function fundBackendWallet() {
  const amount = process.argv[2] || "1000"; // Default 1000 tokens
  
  try {
    console.log(`🔄 Funding backend wallet with ${amount} tokens...`);
    
    const response = await fetch("http://localhost:3000/admin/fund-backend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: parseInt(amount) })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ Success:", result.message);
      console.log("📊 Transaction Hash:", result.txHash);
      console.log("💰 New Backend Balance:", result.newBalance, "tokens");
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Network Error:", error.message);
  }
}

// Check if backend server is running
async function checkBackendStatus() {
  try {
    const response = await fetch("http://localhost:3000/debug/contract-info");
    const result = await response.json();
    
    if (response.ok) {
      console.log("📋 Backend Status: ✅ Running");
      console.log("💰 Current Backend Balance:", result.contractInfo.backendBalance, "tokens");
      console.log("🏦 Backend Wallet:", result.contractInfo.walletAddress);
      return true;
    }
  } catch (error) {
    console.log("❌ Backend Status: Not running or not accessible");
    console.log("💡 Please start the backend server first: npm start");
    return false;
  }
}

async function main() {
  console.log("🚀 Backend Wallet Funding Tool");
  console.log("===============================");
  
  const isBackendRunning = await checkBackendStatus();
  
  if (isBackendRunning) {
    console.log("\n📤 Funding wallet...");
    await fundBackendWallet();
  }
}

main().catch(console.error); 