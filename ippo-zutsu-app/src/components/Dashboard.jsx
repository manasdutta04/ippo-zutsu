import { useState,useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Using internet profile icon instead of local asset
import Store from './Store';
import Inventory from './Inventory';
import { useUser, UserButton } from '@civic/auth/react';
import Level1Challenge from './challenges/Level1Challenge';
import Level2Challenge from './challenges/Level2Challenge';
import Level3Challenge from './challenges/Level3Challenge';

import { BrowserProvider } from 'ethers';
import { getMoveBalance } from '../web3/getMoveBalance';


function Dashboard() {
  const { user, signOut } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [teamOption, setTeamOption] = useState(null); // 'join' or 'create'
  const [teamCode, setTeamCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [activeWalletTab, setActiveWalletTab] = useState('tokens'); // 'tokens' or 'nfts'
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress,setWalletAddress]=useState("");
  const [activeChallenge, setActiveChallenge] = useState(null); // null, 'level1', 'level2', 'level3'
  
  const [moveBalance, setMoveBalance] = useState(0);
  

  useEffect(()=>{
    getConnectedWallet();
    addWalletListener();
  })

  // Mock wallet data
  const walletData = {
    balance: '2,450.75',
    tokens: [
      { id: 1, name: 'STEP', amount: '1,250', icon: '👣', value: '$625.00' },
      { id: 2, name: 'ENERGY', amount: '750', icon: '⚡', value: '$375.00' },
      { id: 3, name: 'QUEST', amount: '450', icon: '🏆', value: '$225.00' }
    ],
    nfts: [
      { id: 1, name: 'Fire Gloves', rarity: 'Legendary', image: '🧤', boost: '+15% attack' },
      { id: 2, name: 'Ice Sword', rarity: 'Epic', image: '🗡', boost: '+10% attack' },
      { id: 3, name: 'Iron Shield', rarity: 'Rare', image: '🛡️', boost: '+5% defense' },
      { id: 4, name: 'Lucky Charm', rarity: 'Uncommon', image: '🍀', boost: '+2% rewards' }
    ]
  };
  
  const handleLogout = () => {
    setIsProfileOpen(false);
    signOut();
  };
  
  const handleTeamAction = (action) => {
    if (action === 'join') {
      alert(`Joining team with code: ${teamCode}`);
    } else if (action === 'create') {
      alert(`Creating team: ${teamName}`);
    }
    setTeamOption(null);
    setTeamCode('');
    setTeamName('');
    setIsTeamsModalOpen(false);
  };

const connectWallet = async() => {
  if(typeof window!=undefined && typeof window.ethereum!=undefined){
      try {
        const accounts=await window.ethereum.request({method:"eth_requestAccounts"});
        console.log(accounts[0]);
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error(error.message);
      }
    }else{
        console.log("Please install metamask");
    }
    
    setIsWalletConnected(true);
  };
  const getConnectedWallet = async() => {
    if(typeof window!=undefined && typeof window.ethereum!=undefined){
        try {
            const accounts=await window.ethereum.request({method:"eth_accounts"});
            if(accounts.length>0){
                console.log(accounts[0]);
                setWalletAddress(accounts[0]);
            }else{
                console.log("Connect to metamask using connect button");
            }
        } catch (error) {
            console.error(error.message);
        }
    }else{
        console.log("Please install metamask");
    }
    
    setIsWalletConnected(true);
  };

  const addWalletListener = async() => {
    if(typeof window!=undefined && typeof window.ethereum!=undefined){
        window.ethereum.on("accountsChanged",(accounts)=>{
            console.log(accounts[0]);
            setWalletAddress(accounts[0]);
        })
    }else{
        setWalletAddress("");
        console.log("Please install metamask");
    }
    
    setIsWalletConnected(true);
  };
  
  const handlePurchase = (item) => {
    alert(`Purchased ${item.name} for ${item.price} coins!`);
  };
  
  // Updated cards data
  const cards = [
    {
      id: 1,
      title: 'Quest',
      value: 'Challenge',
      icon: '⚔️',
      color: 'from-blue-500 to-blue-600',
      increase: '3 active quests',
      onClick: () => setIsChallengeModalOpen(true)
    },
    {
      id: 2,
      title: 'Inventory',
      value: '16 items',
      icon: '📦',
      color: 'from-purple-500 to-purple-600',
      increase: '3 new items',
      onClick: () => setIsInventoryOpen(true)
    },
    {
      id: 3,
      title: 'Teams',
      value: 'Explore Teams',
      icon: '🧑‍🤝‍🧑',
      color: 'from-green-500 to-green-600',
      increase: '5 members',
      onClick: () => setIsTeamsModalOpen(true)
    },
    {
      id: 4,
      title: 'Store',
      value: 'Buy Gears',
      icon: '👛',
      color: 'from-yellow-500 to-yellow-600',
      increase: '3 available',
      onClick: () => setIsStoreOpen(true)
    }
  ];
useEffect(() => {
  const fetchMoveBalance = async () => {
    if (walletAddress && window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      const balance = await getMoveBalance(walletAddress, provider);
      setMoveBalance(balance); // <- Save to state
      console.log("MOVE Balance:", balance);
    }
  };

  fetchMoveBalance();
}, [walletAddress]);


  // If store is open, show the store component
  if (isStoreOpen) {
    return (
      <Store 
        onBack={() => setIsStoreOpen(false)} 
        onOpenWallet={() => setIsWalletModalOpen(true)} 
      />
    );
  }

  // If inventory is open, show the inventory component
  if (isInventoryOpen) {
    return (
      <Inventory 
        onBack={() => setIsInventoryOpen(false)} 
      />
    );
  }

  // If a challenge is active, show the corresponding challenge component
  if (activeChallenge === 'level1') {
    return <Level1Challenge onBack={() => setActiveChallenge(null)} />;
  }
  
  if (activeChallenge === 'level2') {
    return <Level2Challenge onBack={() => setActiveChallenge(null)} />;
  }
  
  if (activeChallenge === 'level3') {
    return <Level3Challenge onBack={() => setActiveChallenge(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Navbar */}
      <nav className="bg-purple-900/80 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center border-b border-purple-700 sticky top-0 z-50">
        <div className="flex items-center">
          <h1 className="text-lg sm:text-xl font-anime text-white mr-2 sm:mr-4">IPPO ZUTSU</h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {walletAddress && walletAddress.length > 0 && (
            <button 
              className="btn-secondary text-xs py-1 px-2 sm:py-1.5 sm:px-4 flex items-center"
              onClick={() => setIsWalletModalOpen(true)}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              <span className="hidden sm:inline">Wallet</span>
            </button>
          )}

          {walletAddress && walletAddress.length > 0 ? (
            <div className="bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 sm:px-4 sm:py-2 border border-purple-500/30">
              <span className="text-emerald-300 text-xs sm:text-sm font-medium">{`${walletAddress.substring(0,4)}...${walletAddress.substring(38)}`}</span>
            </div>
          ) : (
            <button 
              className="btn-primary text-xs py-1 px-2 sm:py-1.5 sm:px-4 flex items-center"
              onClick={connectWallet}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
              </svg>
              <span className="hidden sm:inline">Connect</span>
            </button>
          )}

          {/* Profile button */}
          <div className="relative">
            <button 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-700 pixel-border border-2 flex items-center justify-center overflow-hidden"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              {user && user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name || "Profile"} 
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                />
              ) : (
                              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80" 
                alt="Profile" 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
              />
              )}
            </button>

            {isProfileOpen && (
              <motion.div 
                className="absolute right-0 mt-2 w-48 sm:w-64 bg-purple-900 pixel-border rounded-lg shadow-lg py-2 z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {user && (
                  <div className="px-4 py-2 border-b border-purple-800">
                    <p className="text-white font-medium text-sm">{user.name || "User"}</p>
                    {user.email && <p className="text-purple-300 text-xs">{user.email}</p>}
                  </div>
                )}
                <button 
                  className="w-full text-left block px-4 py-2 text-white hover:bg-purple-800 text-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      
      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-anime text-white mb-4 sm:mb-6">Explore the World</h2>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card) => (
            <motion.div 
              key={card.id}
              className={`bg-gradient-to-br ${card.color} pixel-border rounded-lg p-3 sm:p-4 shadow-lg cursor-pointer min-h-[100px] sm:min-h-[120px]`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.id * 0.1 }}
              whileHover={{ scale: 1.03 }}
              onClick={card.onClick}
            >
              <div className="flex justify-between items-start h-full">
                <div className="flex-1">
                  <p className="text-white/80 text-xs sm:text-sm font-anime">{card.title}</p>
                  <p className="text-white text-lg sm:text-2xl font-bold mt-1">{card.value}</p>
                  <p className="text-white/80 text-xs mt-1 sm:mt-2">{card.increase}</p>
                </div>
                <div className="text-2xl sm:text-3xl">{card.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Adventure Stats Section - Redesigned */}
        <div className="mt-6 sm:mt-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-anime text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              ⚡ Adventure Chronicle
            </h3>
            <div className="flex items-center space-x-2 text-purple-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-anime">Live Updates</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-purple-900/40 rounded-xl pixel-border p-4 sm:p-6 backdrop-blur-sm">
            <div className="grid gap-4 sm:gap-6">
              
              {/* Achievement Card */}
              <motion.div 
                className="relative overflow-hidden bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg pixel-border p-4 sm:p-5 border-2 border-yellow-500/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400/10 rounded-full blur-xl"></div>
                <div className="relative flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-xl sm:text-2xl">🏆</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-white font-bold text-sm sm:text-base">Achievement Unlocked!</p>
                      <div className="px-2 py-1 bg-yellow-500/20 rounded-full">
                        <span className="text-yellow-300 text-xs font-anime">LEGENDARY</span>
                      </div>
                    </div>
                    <p className="text-yellow-200 text-sm sm:text-base font-semibold">10,000 Steps Marathon</p>
                    <p className="text-yellow-300/80 text-xs sm:text-sm">+500 XP • +100 Gold Coins</p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-300 text-xs sm:text-sm font-anime">2 hours ago</div>
                    <div className="text-yellow-400 text-xs">🔥 Hot Streak!</div>
                  </div>
                </div>
              </motion.div>

              {/* Boss Battle Card */}
              <motion.div 
                className="relative overflow-hidden bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-lg pixel-border p-4 sm:p-5 border-2 border-red-500/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-400/10 rounded-full blur-xl"></div>
                <div className="relative flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-xl sm:text-2xl">⚔️</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-white font-bold text-sm sm:text-base">Epic Boss Defeated!</p>
                      <div className="px-2 py-1 bg-red-500/20 rounded-full">
                        <span className="text-red-300 text-xs font-anime">EPIC</span>
                      </div>
                    </div>
                    <p className="text-red-200 text-sm sm:text-base font-semibold">Lazy Lounger - Level 5</p>
                    <p className="text-red-300/80 text-xs sm:text-sm">+300 XP • Fire Gloves Unlocked</p>
                  </div>
                  <div className="text-right">
                    <div className="text-red-300 text-xs sm:text-sm font-anime">Yesterday</div>
                    <div className="text-red-400 text-xs">💀 Boss Slayer</div>
                  </div>
                </div>
              </motion.div>

              {/* Item Acquired Card */}
              <motion.div 
                className="relative overflow-hidden bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg pixel-border p-4 sm:p-5 border-2 border-green-500/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-400/10 rounded-full blur-xl"></div>
                <div className="relative flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-xl sm:text-2xl">🎁</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-white font-bold text-sm sm:text-base">Rare Item Acquired!</p>
                      <div className="px-2 py-1 bg-green-500/20 rounded-full">
                        <span className="text-green-300 text-xs font-anime">RARE</span>
                      </div>
                    </div>
                    <p className="text-green-200 text-sm sm:text-base font-semibold">Speed Boots</p>
                    <p className="text-green-300/80 text-xs sm:text-sm">+5% Movement Speed • +10 Agility</p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-300 text-xs sm:text-sm font-anime">3 days ago</div>
                    <div className="text-green-400 text-xs">⚡ Speed Boost</div>
                  </div>
                </div>
              </motion.div>

              {/* Stats Summary Bar */}
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-800/30 to-indigo-800/30 rounded-lg pixel-border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-white text-lg sm:text-xl font-bold">47</div>
                    <div className="text-purple-300 text-xs sm:text-sm font-anime">Achievements</div>
                  </div>
                  <div>
                    <div className="text-white text-lg sm:text-xl font-bold">12</div>
                    <div className="text-purple-300 text-xs sm:text-sm font-anime">Bosses Defeated</div>
                  </div>
                  <div>
                    <div className="text-white text-lg sm:text-xl font-bold">89</div>
                    <div className="text-purple-300 text-xs sm:text-sm font-anime">Items Collected</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Modal */}
      <AnimatePresence>
        {isChallengeModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 sm:p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsChallengeModalOpen(false);
            }}
          >
            <motion.div
              className="bg-purple-900 p-4 sm:p-6 rounded-xl pixel-border w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-anime text-white">Select Challenge Level</h2>
                <button 
                  className="text-white hover:text-purple-300 text-xl"
                  onClick={() => setIsChallengeModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-anime py-3 sm:py-4 px-4 sm:px-6 rounded-lg pixel-border flex items-center justify-between transition-all duration-300"
                  onClick={() => {
                    setIsChallengeModalOpen(false);
                    setActiveChallenge('level1');
                  }}
                >
                  <span className="text-base sm:text-lg">Level 1</span>
                  <div className="flex items-center">
                    <span className="text-yellow-300 mr-1">★</span>
                    <span className="text-gray-400">★★</span>
                  </div>
                </button>
                
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-anime py-3 sm:py-4 px-4 sm:px-6 rounded-lg pixel-border flex items-center justify-between transition-all duration-300"
                  onClick={() => {
                    setIsChallengeModalOpen(false);
                    setActiveChallenge('level2');
                  }}
                >
                  <span className="text-base sm:text-lg">Level 2</span>
                  <div className="flex items-center">
                    <span className="text-yellow-300 mr-1">★★</span>
                    <span className="text-gray-400">★</span>
                  </div>
                </button>
                
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-anime py-3 sm:py-4 px-4 sm:px-6 rounded-lg pixel-border flex items-center justify-between transition-all duration-300"
                  onClick={() => {
                    setIsChallengeModalOpen(false);
                    setActiveChallenge('level3');
                  }}
                >
                  <span className="text-base sm:text-lg">Level 3</span>
                  <div className="flex items-center">
                    <span className="text-yellow-300">★★★</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teams Modal */}
      <AnimatePresence>
        {isTeamsModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsTeamsModalOpen(false);
                setTeamOption(null);
              }
            }}
          >
            <motion.div
              className="bg-purple-900 p-6 rounded-xl pixel-border w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-anime text-white">Team Options</h2>
                <button 
                  className="text-white hover:text-purple-300"
                  onClick={() => {
                    setIsTeamsModalOpen(false);
                    setTeamOption(null);
                  }}
                >
                  ✕
                </button>
              </div>
              
              {!teamOption ? (
                <div className="space-y-4">
                  <button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-anime py-4 px-6 rounded-lg pixel-border flex items-center justify-between transition-all duration-300"
                    onClick={() => setTeamOption('join')}
                  >
                    <span className="text-lg">Join a Team</span>
                    <div className="text-2xl">🤝</div>
                  </button>
                  
                  <button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-anime py-4 px-6 rounded-lg pixel-border flex items-center justify-between transition-all duration-300"
                    onClick={() => setTeamOption('create')}
                  >
                    <span className="text-lg">Create a Team</span>
                    <div className="text-2xl">✨</div>
                  </button>
                </div>
              ) : teamOption === 'join' ? (
                <div className="space-y-4">
                  <h3 className="text-white font-anime text-center mb-4">Enter Team Code</h3>
                  <input 
                    type="text" 
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    placeholder="Enter team code" 
                    className="w-full p-3 bg-purple-800 text-white rounded-lg border-2 border-purple-700 focus:border-green-500 outline-none pixel-border"
                  />
                  <div className="flex gap-3 mt-6">
                    <button 
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-anime py-2 px-4 rounded-lg pixel-border"
                      onClick={() => setTeamOption(null)}
                    >
                      Back
                    </button>
                    <button 
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white font-anime py-2 px-4 rounded-lg pixel-border"
                      onClick={() => handleTeamAction('join')}
                      disabled={!teamCode.trim()}
                    >
                      Join
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-white font-anime text-center mb-4">Create New Team</h3>
                  <input 
                    type="text" 
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name" 
                    className="w-full p-3 bg-purple-800 text-white rounded-lg border-2 border-purple-700 focus:border-green-500 outline-none pixel-border"
                  />
                  <div className="flex gap-3 mt-6">
                    <button 
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-anime py-2 px-4 rounded-lg pixel-border"
                      onClick={() => setTeamOption(null)}
                    >
                      Back
                    </button>
                    <button 
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white font-anime py-2 px-4 rounded-lg pixel-border"
                      onClick={() => handleTeamAction('create')}
                      disabled={!teamName.trim()}
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Modal */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsWalletModalOpen(false);
            }}
          >
            <motion.div
              className="bg-purple-900 p-6 rounded-xl pixel-border w-full max-w-4xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-anime text-white">Your Wallet</h2>
                <button 
                  className="text-white hover:text-purple-300"
                  onClick={() => setIsWalletModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              
              {/* Wallet Balance */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-lg pixel-border mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-anime">Total Balance</p>
                    <p className="text-white text-3xl font-bold mt-1">{moveBalance ? `${moveBalance} MOVE` : 'Fetching MOVE balance...'}</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-purple-700 mb-6">
                <button 
                  className={`py-2 px-6 font-anime text-sm ${activeWalletTab === 'tokens' ? 'text-white border-b-2 border-game-accent' : 'text-purple-300 hover:text-white'}`}
                  onClick={() => setActiveWalletTab('tokens')}
                >
                  Tokens
                </button>
                <button 
                  className={`py-2 px-6 font-anime text-sm ${activeWalletTab === 'nfts' ? 'text-white border-b-2 border-game-accent' : 'text-purple-300 hover:text-white'}`}
                  onClick={() => setActiveWalletTab('nfts')}
                >
                  NFTs
                </button>
              </div>
              
              {/* Tokens Tab */}
              {activeWalletTab === 'tokens' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 text-purple-300 text-sm font-anime px-4 py-2">
                    <div>Token</div>
                    <div>Amount</div>
                    <div>Value</div>
                    <div className="text-right">Actions</div>
                  </div>
                  
                  {walletData.tokens.map(token => (
                    <div 
                      key={token.id}
                      className="grid grid-cols-4 items-center bg-purple-800/50 rounded-lg px-4 py-3 hover:bg-purple-800/70 transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{token.icon}</span>
                        <span className="text-white font-semibold">{token.name}</span>
                      </div>
                      <div className="text-white">{token.amount}</div>
                      <div className="text-white">{token.value}</div>
                      <div className="flex justify-end space-x-2">
                        <button className="bg-purple-700 hover:bg-purple-600 text-white text-xs py-1 px-2 rounded">
                          Swap
                        </button>
                        <button className="bg-purple-700 hover:bg-purple-600 text-white text-xs py-1 px-2 rounded">
                          Send
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* NFTs Tab */}
              {activeWalletTab === 'nfts' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {walletData.nfts.map(nft => (
                    <div 
                      key={nft.id}
                      className="bg-purple-800/50 rounded-lg p-4 hover:bg-purple-800/70 transition-colors pixel-border"
                    >
                      <div className="bg-gradient-to-br from-purple-700 to-purple-900 w-full aspect-square rounded-lg flex items-center justify-center mb-3">
                        <span className="text-5xl">{nft.image}</span>
                      </div>
                      <h3 className="text-white font-semibold">{nft.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          nft.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                          nft.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-300' :
                          nft.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {nft.rarity}
                        </span>
                        <span className="text-white/80 text-xs">{nft.boost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard; 