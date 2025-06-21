import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import walkingGif from './assets/walking.gif'
import glovesImage from './assets/gloves.png'
import shieldImage from './assets/shield.png'
import swordImage from './assets/sword.png'
import luckyCharmImage from './assets/lucky-charm.png'
import Dashboard from './components/Dashboard'
import { CivicAuthProvider, useUser, UserButton } from "@civic/auth/react"
import './App.css'

function AppContent() {
  const { user } = useUser();
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { number: "10K+", label: "Steps Rewarded" },
    { number: "500+", label: "Active Players" },
    { number: "50+", label: "Bosses Defeated" },
    { number: "100+", label: "Items Collected" }
  ];

  const features = [
    {
      icon: glovesImage,
      title: "Real Movement, Real Rewards",
      description: "Every step you take in the real world powers up your character"
    },
    {
      icon: swordImage,
      title: "Epic Boss Battles",
      description: "Face challenging bosses that require real fitness dedication to defeat"
    },
    {
      icon: shieldImage,
      title: "Collect Rare Items",
      description: "Earn powerful equipment and rare collectibles through your workouts"
    },
    {
      icon: luckyCharmImage,
      title: "Level Up System",
      description: "Progress through challenging levels that adapt to your fitness journey"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // If user is authenticated, show Dashboard
  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-x-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-3 sm:p-4 md:p-6 z-10">
        <motion.h1 
          className="text-lg sm:text-xl md:text-2xl font-anime text-white tracking-wider"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          IPPO ZUTSU
        </motion.h1>
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <UserButton className="bg-gradient-to-r from-pink-200 to-purple-300 hover:from-pink-400 hover:to-purple-400 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-white/20 backdrop-blur-sm hover:shadow-pink-500/25 hover:shadow-xl" />
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-16 min-h-screen p-3 sm:p-4 pt-16 sm:pt-20">
        <motion.div 
          className="text-center md:text-left max-w-lg px-2 sm:px-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-anime text-white mb-4 sm:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Turn Steps Into
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 block sm:inline">
              Epic Battles
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-purple-200 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience the world's first fitness RPG where your real-world movement 
            becomes magical power. Walk, run, and exercise to level up your character, 
            collect rare items, and defeat epic bosses!
          </motion.p>

          

          {/* Dynamic Stats */}
          <motion.div 
            className="text-center md:text-left mt-4 sm:mt-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div 
              key={currentStat}
              className="inline-block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-400">{stats[currentStat].number}</span>
              <span className="text-purple-300 ml-2 text-sm sm:text-base">{stats[currentStat].label}</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Character Image */}
        <motion.div 
          className="relative mt-6 md:mt-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {/* Animated background circles */}
          <div className="absolute inset-0">
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-purple-500/20 rounded-full absolute -inset-4 animate-pulse-slow"></div>
            <div className="w-36 h-36 sm:w-42 sm:h-42 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-pink-500/20 rounded-full absolute inset-0 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-48 lg:h-48 bg-indigo-500/20 rounded-full absolute inset-8 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <motion.img 
            src={walkingGif} 
            alt="Walking character" 
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-72 lg:h-72 object-contain relative z-10 pixel-border bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl backdrop-blur-sm"
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-anime text-white mb-3 sm:mb-4">
              Game Features
            </h3>
            <p className="text-purple-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 sm:px-0">
              Discover what makes IPPO ZUTSU the ultimate fitness gaming experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6 text-center hover:bg-white/20 transition-all duration-300 border border-purple-500/20 min-h-[180px] sm:min-h-[200px]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 opacity-90"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                />
                <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base md:text-lg">
                  {feature.title}
                </h4>
                <p className="text-purple-200 text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

            {/* Call to Action */}
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 pb-16 sm:pb-20">
        <motion.div
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 sm:p-8 md:p-12 backdrop-blur-sm border border-purple-500/20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-anime text-white mb-4 sm:mb-6">
            Ready to Start Your Adventure?
          </h3>
          <p className="text-purple-200 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0 leading-relaxed">
            Join thousands of players who are already turning their daily walks into epic quests. 
            Your fitness journey starts here!
          </p>
          <UserButton className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-xl font-bold text-sm sm:text-base md:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-white/30 backdrop-blur-sm hover:shadow-pink-500/50 hover:border-white/50 relative overflow-hidden group min-h-[48px] w-full sm:w-auto">
            <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">Start Your Quest</span>
          </UserButton>
        </motion.div>
      </section>
    </div>
  )
}

function App() {
  return (
    <CivicAuthProvider clientId="095874a3-aac4-4b3d-a334-77e407083def">
      <AppContent />
    </CivicAuthProvider>
  )
}

export default App
