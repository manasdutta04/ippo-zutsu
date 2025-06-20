import { useState } from 'react'
import { motion } from 'framer-motion'
import runnerImage from './assets/runner.svg'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoginOpen(false);
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-anime text-white tracking-wider">IPPO-ZUTSU</h1>
        <div className="flex gap-2">
          <button 
            className="btn-primary text-xs md:text-sm"
            onClick={() => setIsLoginOpen(true)}
          >
            Login
          </button>
          <button 
            className="btn-secondary text-xs md:text-sm"
            onClick={() => setIsLoginOpen(true)}
          >
            Sign Up
          </button>
        </div>
      </header>
      
      <main className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mt-16 md:mt-0">
        <motion.div 
          className="text-center md:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-anime text-white mb-4">
            Let's start stepping...
          </h2>
          <p className="text-lg md:text-xl text-purple-200 max-w-md mb-8">
            Turn your real-world movement into in-game adventure. 
            Walk, jog, or exercise to level up your character and defeat bosses!
          </p>
          <button 
            className="btn-primary text-sm md:text-base"
            onClick={() => setIsLoginOpen(true)}
          >
            Start Your Adventure
          </button>
        </motion.div>

        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="w-64 h-64 md:w-80 md:h-80 bg-purple-500/20 rounded-full absolute -inset-4 animate-pulse-slow"></div>
          <img 
            src={runnerImage} 
            alt="Runner character" 
            className="w-56 h-56 md:w-72 md:h-72 object-contain relative z-10 pixel-border bg-purple-900/50 rounded-xl"
          />
        </motion.div>
      </main>

      {isLoginOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLoginOpen(false);
          }}
        >
          <motion.div 
            className="bg-purple-900 p-6 rounded-xl pixel-border w-full max-w-md"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
          >
            <h2 className="text-xl font-anime text-white mb-6 text-center">Join the Adventure</h2>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full p-3 bg-purple-800 text-white rounded-lg border-2 border-purple-700 focus:border-game-accent outline-none"
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full p-3 bg-purple-800 text-white rounded-lg border-2 border-purple-700 focus:border-game-accent outline-none"
              />
              <div className="flex gap-4 mt-6">
                <button 
                  className="btn-primary flex-1"
                  onClick={handleLogin}
                >
                  Login
                </button>
                <button 
                  className="btn-secondary flex-1"
                  onClick={handleLogin}
                >
                  Sign Up
                </button>
              </div>
              <button 
                className="text-purple-300 hover:text-white text-sm block mx-auto mt-4"
                onClick={() => setIsLoginOpen(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default App
