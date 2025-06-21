import { useState } from 'react';
import { motion } from 'framer-motion';
// Using internet profile icon instead of local asset
import glovesImage from '../assets/gloves.png';
import swordImage from '../assets/sword.png';

function Inventory({ onBack }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [equippedItems, setEquippedItems] = useState({
    weapon: null,
    armor: null
  });
  
  // Inventory items data
  const inventoryItems = [
    { 
      id: 1, 
      name: 'Fire Gloves', 
      type: 'armor',
      rarity: 'Legendary', 
      image: glovesImage, 
      attack: 15,
      defense: 8,
      speed: 5,
      description: 'Enchanted gloves that channel the power of fire. Increases attack damage and provides moderate protection.',
      equipped: equippedItems.armor === 1
    },
    { 
      id: 2, 
      name: 'Ice Sword', 
      type: 'weapon',
      rarity: 'Epic', 
      image: swordImage, 
      attack: 20,
      defense: 3,
      speed: 12,
      description: 'A mystical blade forged in the frozen mountains. Deals devastating ice damage to enemies.',
      equipped: equippedItems.weapon === 2
    }
  ];
  
  const handleEquip = (item) => {
    if (item.equipped) {
      // Unequip the item
      setEquippedItems(prev => ({
        ...prev,
        [item.type]: null
      }));
    } else {
      // Equip the item
      setEquippedItems(prev => ({
        ...prev,
        [item.type]: item.id
      }));
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Epic': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Rare': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-green-500/20 text-green-300 border-green-500/30';
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
      
      {/* Inventory Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
  <h2 className="text-xl sm:text-2xl font-anime text-white">Your Inventory</h2>

  {/* Wrapper ensures right alignment on mobile */}
  <div className="w-full sm:w-auto flex justify-end">
    <button 
      className="btn-primary text-sm py-2 px-4 flex items-center justify-center"
      onClick={onBack}
    >
      <svg 
        className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      <span>Back</span>
    </button>
  </div>
</div>


        {/* Character Stats Overview */}
        <div className="bg-purple-900/30 rounded-lg pixel-border p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-white font-anime mb-3 sm:mb-4 text-lg sm:text-xl">Character Stats</h3>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl text-red-400 font-bold">
                {inventoryItems.reduce((total, item) => item.equipped ? total + item.attack : total, 25)}
              </div>
              <div className="text-white/80 text-sm">Attack</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl text-blue-400 font-bold">
                {inventoryItems.reduce((total, item) => item.equipped ? total + item.defense : total, 15)}
              </div>
              <div className="text-white/80 text-sm">Defense</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl text-green-400 font-bold">
                {inventoryItems.reduce((total, item) => item.equipped ? total + item.speed : total, 10)}
              </div>
              <div className="text-white/80 text-sm">Speed</div>
            </div>
          </div>
        </div>
        
        {/* Equipment Slots */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-white font-anime mb-3 sm:mb-4 text-lg sm:text-xl">Equipped Items</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-purple-900/50 rounded-lg p-4 text-center">
              <h4 className="text-white font-semibold mb-2">Weapon Slot</h4>
              {equippedItems.weapon ? (
                <div className="flex items-center justify-center">
                  <img 
                    src={inventoryItems.find(item => item.id === equippedItems.weapon)?.image} 
                    alt="Equipped Weapon"
                    className="w-12 h-12 mr-2"
                  />
                  <span className="text-purple-200">{inventoryItems.find(item => item.id === equippedItems.weapon)?.name}</span>
                </div>
              ) : (
                <div className="text-purple-400 italic">No weapon equipped</div>
              )}
            </div>
            <div className="bg-purple-900/50 rounded-lg p-4 text-center">
              <h4 className="text-white font-semibold mb-2">Armor Slot</h4>
              {equippedItems.armor ? (
                <div className="flex items-center justify-center">
                  <img 
                    src={inventoryItems.find(item => item.id === equippedItems.armor)?.image} 
                    alt="Equipped Armor"
                    className="w-12 h-12 mr-2"
                  />
                  <span className="text-purple-200">{inventoryItems.find(item => item.id === equippedItems.armor)?.name}</span>
                </div>
              ) : (
                <div className="text-purple-400 italic">No armor equipped</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Inventory Items Grid */}
        <h3 className="text-white font-anime mb-3 sm:mb-4 text-lg sm:text-xl">Available Items</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {inventoryItems.map(item => (
            <motion.div 
              key={item.id}
              className="bg-purple-900/50 rounded-lg p-4 sm:p-6 pixel-border overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.id * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Item Image */}
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                  <div className="bg-gradient-to-br from-purple-700 to-purple-900 w-24 h-24 sm:w-32 sm:h-32 rounded-lg flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                    />
                  </div>
                </div>
                
                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2 sm:gap-0">
                    <h3 className="text-white text-lg sm:text-xl font-bold">{item.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded border ${getRarityColor(item.rarity)}`}>
                      {item.rarity}
                    </span>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <div className="text-red-400 font-bold text-sm sm:text-base">+{item.attack}</div>
                      <div className="text-white/60 text-xs">ATK</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold text-sm sm:text-base">+{item.defense}</div>
                      <div className="text-white/60 text-xs">DEF</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-bold text-sm sm:text-base">+{item.speed}</div>
                      <div className="text-white/60 text-xs">SPD</div>
                    </div>
                  </div>
                  
                  <p className="text-purple-200 text-sm mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <button 
                    className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                      item.equipped 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    onClick={() => handleEquip(item)}
                  >
                    {item.equipped ? 'Unequip' : 'Equip'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Inventory; 