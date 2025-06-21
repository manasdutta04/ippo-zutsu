import { useState } from 'react';
import { motion } from 'framer-motion';
// Using internet profile icon instead of local asset
import glovesImage from '../assets/gloves.png';
import swordImage from '../assets/sword.png';
import shieldImage from '../assets/shield.png';
import luckyCharmImage from '../assets/lucky-charm.png';

function Store({ onBack, onOpenWallet }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newlyMintedNFT, setNewlyMintedNFT] = useState(null);
  
  // Store items data
  const storeItems = [
    { 
      id: 1, 
      name: 'Fire Gloves', 
      rarity: 'Legendary', 
      image: glovesImage, 
      attack: 15,
      defense: 8,
      speed: 5,
      boost: '+15 Attack, +8 Defense, +5 Speed',
      price: 50,
      description: 'Enchanted gloves that channel the power of fire. Perfect for close combat.',
      nftUri:'bafkreihvdf2nofh3qsbqzwsuvvwjpo6wmeztam4uqadoxwzzymrfkdq35q'
    },
    { 
      id: 2, 
      name: 'Ice Sword', 
      rarity: 'Epic', 
      image: swordImage, 
      attack: 20,
      defense: 3,
      speed: 12,
      boost: '+20 Attack, +3 Defense, +12 Speed',
      price: 50,
      description: 'A mystical blade forged in the frozen mountains. Deals ice damage.',
      nftUri:'bafkreiddqzzdulic4hjatzqv7w3esbqhrkibpgns44nbfpcoz52h23i2wu'
    },
    { 
      id: 3, 
      name: 'Iron Shield', 
      rarity: 'Rare', 
      image: shieldImage, 
      attack: 2,
      defense: 15,
      speed: 1,
      boost: '+2 Attack, +15 Defense, +1 Speed',
      price: 50,
      description: 'A sturdy shield that provides excellent protection against attacks.',
      nftUri:'bafkreieydbxr4oq2zg5ua7ydiuejy5nxa56ti7zxjzm5fnaf3qphq47qle'
    },
    { 
      id: 4, 
      name: 'Lucky Charm', 
      rarity: 'Uncommon', 
      image: luckyCharmImage, 
      attack: 3,
      defense: 3,
      speed: 8,
      boost: '+3 Attack, +3 Defense, +8 Speed',
      price: 30,
      description: 'A magical charm that brings good fortune and increased agility.',
      nftUri:'bafkreibhse243vcr7rm5oecl6izhjedhjfxvfghr3th6hjisuxmsc2t3bi'
    }
  ];
  
  const handlePurchase = async (item) => {
  const playerAddress = window.ethereum.selectedAddress; // or pass as prop

  if (!playerAddress) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/claim-nft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        playerAddress,
        nftUri: `ipfs://${item.nftUri}`, // Customize this
        requiredMoveTokens: item.price
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert(`✅ ${item.name} claimed! TX: ${result.txHash}`);
      // Optional: convert IPFS to HTTP link for fetching metadata
  const metadataUrl = item.nftUri.startsWith("ipfs://")
    ? item.nftUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    : item.nftUri;

  // Fetch the actual metadata (name, image, description)
  const metadata = await fetch(metadataUrl).then(res => res.json());

  // Add the item to your local inventory state
  setInventory(prev => [
    ...prev,
    {
      tokenUri: item.nftUri,
      metadata,
      txHash: result.txHash
    }
  ]);
    } else {
      alert(`❌ Failed: ${result.error}`);
    }

  } catch (err) {
    console.error("Claim Error:", err);
    alert("Something went wrong!");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Navbar */}
      <nav className="bg-purple-900/80 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center border-b border-purple-700 sticky top-0 z-50">
        <div className="flex items-center">
          <h1 className="text-lg sm:text-xl font-anime text-white mr-2 sm:mr-4">IPPO ZUTSU</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          
          
          <div className="relative">
            <button 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-700 pixel-border border-2 flex items-center justify-center overflow-hidden"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80" 
                alt="Profile" 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
              />
            </button>
            
            {isProfileOpen && (
              <motion.div 
                className="absolute right-0 mt-2 w-40 sm:w-48 bg-purple-900 pixel-border rounded-lg shadow-lg py-2 z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <button 
                  className="w-full text-left block px-4 py-2 text-white hover:bg-purple-800 text-sm"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Store Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-anime text-white">Gear Shop</h2>
          <button 
            className="btn-primary text-sm py-2 px-4 flex items-center w-full sm:w-auto justify-center"
            onClick={onBack}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-purple-900/30 rounded-lg pixel-border p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-anime">Your Balance</p>
              <p className="text-white text-xl sm:text-2xl font-bold mt-1">600.00</p>
            </div>
            <div className="text-2xl sm:text-3xl">💰</div>
          </div>
        </div>
        
        {/* Store Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {storeItems.map(item => (
            <motion.div 
              key={item.id}
              className="bg-purple-900/50 rounded-lg p-4 sm:p-5 pixel-border overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.id * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-gradient-to-br from-purple-700 to-purple-900 w-full aspect-square rounded-lg flex items-center justify-center mb-3 sm:mb-4 p-3">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-34 h-34 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain"
                />
              </div>
              
              <h3 className="text-white text-lg sm:text-xl font-bold mb-2">{item.name}</h3>
              
              <div className="flex flex-col gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded self-start ${
                  item.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                  item.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-300' :
                  item.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {item.rarity}
                </span>
                
                {/* Individual Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-red-400 font-bold text-sm">+{item.attack}</div>
                    <div className="text-white/60 text-xs">ATK</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-bold text-sm">+{item.defense}</div>
                    <div className="text-white/60 text-xs">DEF</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-bold text-sm">+{item.speed}</div>
                    <div className="text-white/60 text-xs">SPD</div>
                  </div>
                </div>
              </div>
              
              <p className="text-purple-200 text-sm mb-4 min-h-[40px] sm:min-h-[48px] overflow-hidden leading-relaxed">
                {item.description}
              </p>
              
              <div className="flex flex-col gap-3 mt-auto">
                <div className="text-yellow-300 font-bold flex items-center justify-center">
                  <span className="text-lg mr-1">🪙</span>
                  <span className="text-lg">{item.price} Coins</span>
                </div>
                <button 
                  className="bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-anime text-sm py-2 px-4 rounded-lg transition-colors w-full transform hover:scale-105"
                  onClick={() => handlePurchase(item)}
                >
                  Purchase Item
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Store; 