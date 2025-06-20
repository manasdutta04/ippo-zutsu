import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import runnerImage from './assets/runner.svg'
import Dashboard from './components/Dashboard'
import { CivicAuthProvider, useUser, UserButton } from "@civic/auth/react"
import './App.css'

function AppContent() {
  const { user } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // If user is authenticated, show Dashboard
  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-anime text-white tracking-wider">IPPO-ZUTSU</h1>
        <div className="flex gap-2">
          <UserButton />
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
          <UserButton className="btn-primary text-sm md:text-base" />
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
