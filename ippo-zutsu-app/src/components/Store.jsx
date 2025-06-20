import { useState } from 'react';
import { motion } from 'framer-motion';
import profileIcon from '../assets/profile-icon.svg';

function Store({ onBack, onOpenWallet }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Store items data
  const storeItems = [
    { 
      id: 1, 
      name: 'Fire Gloves', 
      rarity: 'Legendary', 
      image: '🧤', 
      boost: '+15% attack',
      price: 1200,
      description: 'Throw fireballs at your enemies.'
    },
    { 
      id: 2, 
      name: 'Ice Sword', 
      rarity: 'Epic', 
      image: '🗡', 
      boost: '+10% attack',
      price: 850,
      description: 'A blade forged in the frozen mountains.'
    },
    { 
      id: 3, 
      name: 'Iron Shield', 
      rarity: 'Rare', 
      image: '🛡️', 
      boost: '+5% defense',
      price: 500,
      description: 'A sturdy shield that provides protection.'
    },
    { 
      id: 4, 
      name: 'Lucky Charm', 
      rarity: 'Uncommon', 
      image: '🍀', 
      boost: '+2% rewards',
      price: 300,
      description: 'A magical charm that add luck.'
    }
  ];
  
  const handlePurchase = (item) => {
    alert(`Purchased ${item.name} for ${item.price} coins!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Navbar */}
      <nav className="bg-purple-900/80 backdrop-blur-sm px-4 py-3 flex justify-between items-center border-b border-purple-700 sticky top-0 z-50">
        <div className="flex items-center">
          <h1 className="text-xl font-anime text-white mr-4">IPPO ZUTSU</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            className="btn-secondary text-xs py-1.5 px-4 flex items-center"
            onClick={onOpenWallet}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            Wallet
          </button>
          
          <button className="btn-primary text-xs py-1.5 px-4 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
            </svg>
            Connect Wallet
          </button>
          
          <div className="relative">
            <button 
              className="w-10 h-10 rounded-full bg-purple-700 pixel-border border-2 flex items-center justify-center overflow-hidden"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <img 
                src={profileIcon} 
                alt="Profile" 
                className="w-8 h-8"
              />
            </button>
            
            {isProfileOpen && (
              <motion.div 
                className="absolute right-0 mt-2 w-48 bg-purple-900 pixel-border rounded-lg shadow-lg py-2 z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <button 
                  className="w-full text-left block px-4 py-2 text-white hover:bg-purple-800"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Store Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-anime text-white">Gear Shop</h2>
          <button 
            className="btn-primary text-sm py-2 px-4 flex items-center"
            onClick={onBack}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-purple-900/30 rounded-lg pixel-border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-anime">Your Balance</p>
              <p className="text-white text-2xl font-bold mt-1">$2,450.75</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
        
        {/* Store Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {storeItems.map(item => (
            <motion.div 
              key={item.id}
              className="bg-purple-900/50 rounded-lg p-5 pixel-border overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.id * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-gradient-to-br from-purple-700 to-purple-900 w-full aspect-square rounded-lg flex items-center justify-center mb-4">
                <span className="text-6xl">{item.image}</span>
              </div>
              
              <h3 className="text-white text-xl font-bold">{item.name}</h3>
              
              <div className="flex justify-between items-center mt-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded ${
                  item.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                  item.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-300' :
                  item.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {item.rarity}
                </span>
                <span className="text-white/80 text-xs">{item.boost}</span>
              </div>
              
              <p className="text-purple-200 text-sm mb-4 h-12 overflow-hidden">
                {item.description}
              </p>
              
              <div className="flex justify-between items-center mt-auto">
                <div className="text-yellow-300 font-bold flex items-center">
                  <span className="text-lg mr-1">🪙</span>
                  {item.price}
                </div>
                <button 
                  className="bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-anime text-sm py-1.5 px-4 rounded-lg transition-colors"
                  onClick={() => handlePurchase(item)}
                >
                  Buy
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