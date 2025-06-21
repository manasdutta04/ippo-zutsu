require("dotenv").config();

const express = require("express");
const { ethers } = require("ethers");
const ABI = require("./MoveTokenABI.json");
const cors = require("cors");



const app = express();
app.use(cors());
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

    const tx = await contract.assignReward(player, amountInWei);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error("Error assigning reward:", err);
    res.status(500).json({ error: err.message });
  }
});

app.use(cors({
  origin: "http://localhost:5173"
}));

app.listen(process.env.PORT, () => {
  console.log(`Reward backend running on port ${process.env.PORT}`);
});
