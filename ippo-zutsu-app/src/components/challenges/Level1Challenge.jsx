import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import avatarFightingGif from '../../assets/avatar-fighting.gif';
import avatarRunningGif from '../../assets/avatar-running.gif';
import avatarStandingGif from '../../assets/avatar-standing.gif';
import avatarVictoryGif from '../../assets/avatar-victory.gif';
import goblinGif from '../../assets/goblin.gif';


function Level1Challenge({ onBack }) {
  const [steps, setSteps] = useState(0);
  const [targetSteps, setTargetSteps] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [hasMotionPermission, setHasMotionPermission] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [showBattlePopup, setShowBattlePopup] = useState(false);
  const [showVictoryPopup, setShowVictoryPopup] = useState(false);
  const [playerWalletAddress, setPlayerWalletAddress] = useState(null);
  const [isSubmittingReward, setIsSubmittingReward] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const movementTimeoutRef = useRef(null);
  const simulationIntervalRef = useRef(null);
  

useEffect(() => {
  async function getAddress() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setPlayerWalletAddress(accounts[0]);
    }
  }
  getAddress();
}, []);
  
  // Refs for step detection algorithm
  const accelerationRef = useRef({ x: 0, y: 0, z: 0 });
  const lastMagnitudeRef = useRef(0);
  const peakDetectedRef = useRef(false);
  const stepThresholdRef = useRef(1.2); // Adjust based on testing
  const stepCooldownRef = useRef(false);

  // Request permission for Device Motion API
  const requestMotionPermission = async () => {
    try {
      // For iOS devices that require permission
      if (typeof DeviceMotionEvent !== 'undefined' && 
          typeof DeviceMotionEvent.requestPermission === 'function') {
        const permissionState = await DeviceMotionEvent.requestPermission();
        if (permissionState === 'granted') {
          setHasMotionPermission(true);
          setPermissionError(null);
        } else {
          setPermissionError('Motion permission denied');
        }
      } else {
        // For devices that don't require explicit permission
        setHasMotionPermission(true);
      }
    } catch (error) {
      setPermissionError(`Error requesting motion permission: ${error.message}`);
      console.error('Error requesting motion permission:', error);
    }
  };




  // Simulation mode - automatically increase steps
  useEffect(() => {
    if (isRunning) {
      setIsMoving(true);
      
      // Set up interval to increase steps
      simulationIntervalRef.current = setInterval(() => {
        setSteps(prevSteps => {
          const newSteps = prevSteps + 1;
          
          // Check if the user has reached 30 steps to trigger the battle
          if (newSteps === 30 && !showBattlePopup) {
            setIsRunning(false); // Pause the challenge
            setShowBattlePopup(true);
            clearInterval(simulationIntervalRef.current);
            return newSteps;
          }
          
          // Check if the user has reached 50 steps to trigger victory
          if (newSteps >= targetSteps) {
            setIsRunning(false); // Pause the challenge
            setShowVictoryPopup(true);
            clearInterval(simulationIntervalRef.current);
            handleLevelWin();
            return targetSteps; // Cap at target steps
          }
          
          return newSteps;
        });
      }, 500); // Add a step every 500ms
    } else {
      setIsMoving(false);
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    }
    
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isRunning, showBattlePopup, targetSteps]);

  // Set up device motion event listener - keeping this for real device usage
  useEffect(() => {
    if (!isRunning || !hasMotionPermission) return;
    
    const handleMotion = (event) => {
      const { acceleration } = event;
      if (!acceleration || acceleration.x === null) return; // Some browsers may not provide acceleration
      
      // Store current acceleration
      accelerationRef.current = {
        x: acceleration.x || 0,
        y: acceleration.y || 0,
        z: acceleration.z || 0
      };
      
      // Calculate magnitude of acceleration
      const magnitude = Math.sqrt(
        Math.pow(accelerationRef.current.x, 2) +
        Math.pow(accelerationRef.current.y, 2) +
        Math.pow(accelerationRef.current.z, 2)
      );
      
      // Detect significant movement to switch avatar
      if (magnitude > 0.8) { // Lower threshold for movement detection
        setIsMoving(true);
        
        // Clear any existing timeout
        if (movementTimeoutRef.current) {
          clearTimeout(movementTimeoutRef.current);
        }
        
        // Set timeout to switch back to standing after 2 seconds of no significant movement
        movementTimeoutRef.current = setTimeout(() => {
          setIsMoving(false);
        }, 2000);
      }
      
      // Step detection algorithm
      if (!stepCooldownRef.current) {
        if (magnitude > stepThresholdRef.current && !peakDetectedRef.current) {
          peakDetectedRef.current = true;
        }
        
        if (peakDetectedRef.current && magnitude < lastMagnitudeRef.current) {
          // A step is detected when we've seen a peak and now the magnitude is decreasing
          setSteps(prevSteps => {
            const newSteps = prevSteps + 1;
            
            // Check if the user has reached 30 steps to trigger the battle
            if (newSteps === 30 && !showBattlePopup) {
              setIsRunning(false); // Pause the challenge
              setShowBattlePopup(true);
              return newSteps;
            }
            
            // Check if the user has reached 50 steps to trigger victory
            if (newSteps >= targetSteps) {
              setIsRunning(false); // Pause the challenge
              setShowVictoryPopup(true);
              return targetSteps; // Cap at target steps
            }
            
            return newSteps;
          });
          peakDetectedRef.current = false;
          
          // Add cooldown to prevent multiple counts for the same step
          stepCooldownRef.current = true;
          setTimeout(() => {
            stepCooldownRef.current = false;
          }, 300); // 300ms cooldown between steps
        }
      }
      
      lastMagnitudeRef.current = magnitude;
    };
    
    window.addEventListener('devicemotion', handleMotion);
    
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      if (movementTimeoutRef.current) {
        clearTimeout(movementTimeoutRef.current);
      }
    };
  }, [isRunning, hasMotionPermission, showBattlePopup, targetSteps]);

  // Reset isMoving when stopping
  useEffect(() => {
    if (!isRunning) {
      setIsMoving(false);
      if (movementTimeoutRef.current) {
        clearTimeout(movementTimeoutRef.current);
      }
    }
  }, [isRunning]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning]);

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = Math.min((steps / targetSteps) * 100, 100);

  // Handle start/pause button click
  const handleStartPause = () => {
    if (!isRunning && !hasMotionPermission) {
      requestMotionPermission();
    } else {
      setIsRunning(!isRunning);
    }
  };

  // Handle fight button click
  const handleFight = () => {
    // Here you would implement the fight logic
    // For now, just close the popup and continue the challenge
    setShowBattlePopup(false);
    setIsRunning(true);
  };

  // Handle skip button click
  const handleSkip = () => {
    // Close the popup and continue the challenge
    setShowBattlePopup(false);
    setIsRunning(true);
  };

  // Handle continue button click in victory popup
  const handleContinue = () => {
    // Close the popup and go back to dashboard
    setShowVictoryPopup(false);
    onBack();
  };

  // Auto-claim function for users who want to pay gas immediately
  const handleAutoClaim = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected! Please install MetaMask to claim rewards.");
      return;
    }

    setIsClaimingReward(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contractABI = [
        {
          "inputs": [{"internalType": "address", "name": "", "type": "address"}],
          "name": "pendingRewards",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "claimReward",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];
      
      const contractAddress = "0xa47bad07c591b55c83367a078f73261f17bb1ca6";
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Check pending rewards first
      const pendingRewards = await contract.pendingRewards(playerWalletAddress);
      console.log("Pending rewards before claim:", pendingRewards.toString());
      
      if (pendingRewards > 0) {
        console.log("Claiming rewards...");
        const claimTx = await contract.claimReward();
        console.log("Claim transaction sent:", claimTx.hash);
        
        await claimTx.wait();
        console.log("Rewards claimed successfully!");
        alert("🎉 Tokens successfully claimed! Check your wallet balance.");
      } else {
        alert("No pending rewards found. Please try again in a moment.");
      }
    } catch (error) {
      console.error("Error claiming rewards:", error);
      if (error.message.includes("execution reverted")) {
        alert("No pending rewards to claim. They may have already been claimed or are still processing.");
      } else {
        alert(`Error claiming rewards: ${error.message}`);
      }
    } finally {
      setIsClaimingReward(false);
    }
  };

  const handleLevelWin = async () => {
    if (!playerWalletAddress) {
      console.error("No wallet address available");
      return;
    }

    if (isSubmittingReward) {
      console.log("Reward submission already in progress");
      return;
    }

    // Ensure wallet address is valid
    if (!playerWalletAddress.startsWith('0x') || playerWalletAddress.length !== 42) {
      console.error("Invalid wallet address format");
      return;
    }

    setIsSubmittingReward(true);

    // Create payload with the correct field name that backend expects
    const payload = {
      playerAddress: String(playerWalletAddress),
      amount: Number(50)
    };

    console.log("Sending reward payload:", payload);

    try {
      // Step 1: Assign reward through backend
      const response = await fetch("http://localhost:3000/reward", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        result = { error: "Invalid JSON response" };
      }

      if (!response.ok) {
        if (response.status === 409) {
          if (result.code === "TRANSACTION_ALREADY_KNOWN") {
            console.log("Transaction already submitted, treating as success");
          } else if (result.code === "TRANSACTION_PENDING") {
            console.log("Transaction already in progress, waiting...");
            alert("⏳ A reward transaction is already in progress. Please wait a moment and try again.");
            return;
          } else if (result.code === "TRANSACTION_RECENTLY_COMPLETED") {
            console.log("Reward already assigned recently");
            alert("✅ You've already received this reward recently!");
            return;
          }
        } else {
          console.error("Reward error:", result.error || "Unknown error");
          console.error("Status code:", response.status);
          console.error("Response headers:", Object.fromEntries([...response.headers]));
          return;
        }
      } else {
        console.log("Reward processed successfully:", result);
      }

      // Check if tokens were transferred directly (no gas fees) or need claiming
      if (result.gasFreeTansfer) {
        // Tokens transferred directly - user paid ZERO gas fees!
        console.log("🎉 Tokens transferred directly - user paid ZERO fees!");
        alert("🎉 AMAZING! Tokens transferred directly to your wallet with ZERO gas fees for you!");
      } else if (result.requiresManualClaim) {
        // Tokens assigned but need claiming - offer user choice
        console.log("Reward assigned, offering claim options...");
        
        const userChoice = confirm(
          "🎉 Reward assigned! You have 2 options:\n\n" +
          "✅ CLICK OK = Auto-claim now (small gas fee required)\n" +
          "❌ CLICK CANCEL = Claim later anytime (tokens will be pending)\n\n" +
          "Choose your preference:"
        );
        
        if (userChoice) {
          // User chose to auto-claim (pay gas now)
          await handleAutoClaim();
        } else {
          // User chose to claim later (no gas fees now)
          alert("✅ Tokens are pending in your account! You can claim them later from your wallet without any time limit.");
        }
      } else {
        // Default case - show success message
        alert("✅ Reward processed successfully!");
      }

    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setIsSubmittingReward(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-3 sm:p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-8">
        <button 
          className="btn-secondary text-xs sm:text-sm py-1 px-2 sm:py-1.5 sm:px-4 flex items-center"
          onClick={onBack}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back
        </button>
        <h1 className="text-lg sm:text-xl font-anime text-white">Level 1 Challenge</h1>
        <div className="w-12 sm:w-20"></div> {/* Placeholder for balance */}
      </div>

      {/* Battle Popup */}
      {showBattlePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 p-3 sm:p-4">
          <motion.div 
            className="bg-purple-900/90 rounded-xl pixel-border p-4 sm:p-6 max-w-md w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <h2 className="text-lg sm:text-xl font-anime text-center text-white mb-3 sm:mb-4">Battle Encounter!</h2>
            
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="w-1/2 flex justify-center">
                <img 
                  src={avatarFightingGif} 
                  alt="Fighting Avatar" 
                  className="h-50 sm:h-36 object-contain"
                />
              </div>
              <div className="w-1/2 flex justify-center">
                <img 
                  src={goblinGif} 
                  alt="Goblin" 
                  className="h-50 sm:h-32 object-contain"
                />
              </div>
            </div>
            
            <p className="text-center text-purple-200 mb-4 sm:mb-6 text-sm sm:text-base">
              A wild goblin appears! What will you do?
            </p>
            
            <div className="flex justify-between gap-3 sm:gap-4">
              <button 
                className="btn-primary flex-1 py-2 text-sm sm:text-base"
                onClick={handleFight}
              >
                Fight!
              </button>
              <button 
                className="btn-secondary flex-1 py-2 text-sm sm:text-base"
                onClick={handleSkip}
              >
                Skip
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Victory Popup */}
      {showVictoryPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 p-3 sm:p-4">
          <motion.div 
            className="bg-purple-900/90 rounded-xl pixel-border p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <h2 className="text-lg sm:text-xl font-anime text-center text-white mb-3 sm:mb-4">Challenge Complete!</h2>
            
            <div className="flex justify-center mb-4 sm:mb-6">
              <img 
                src={avatarVictoryGif} 
                alt="Victory Avatar" 
                className="h-32 sm:h-40 object-contain"
              />
            </div>
            
            <div className="bg-purple-800/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="text-white font-anime mb-2 text-center text-sm sm:text-base">Rewards:</h3>
              <ul className="space-y-2">
                <li className="flex items-center justify-center text-sm sm:text-base">
                  <span className="text-base sm:text-lg mr-2">🪙</span>
                  <span className="text-purple-200">50 Move Tokens</span>
                  {isClaimingReward ? (
                    <span className="ml-2 text-yellow-300 text-xs sm:text-sm">Claiming...</span>
                  ) : (
                    <span className="ml-2 text-blue-300 text-xs sm:text-sm">✓ Assigned</span>
                  )}
                </li>
                
                <li className="flex items-center justify-center text-sm sm:text-base">
                  <span className="text-base sm:text-lg mr-2">🏆</span>
                  <span className="text-purple-200">Beginner Badge</span>
                </li>
              </ul>
              
              <div className="mt-3 text-center">
                <div className="text-green-300 text-xs sm:text-sm">
                  🎉 Tokens transferred with <strong>ZERO gas fees</strong> for you!
                </div>
                <div className="text-green-200 text-xs mt-1">
                  Check your wallet balance - backend paid all network fees
                </div>
                {isClaimingReward && (
                  <div className="text-yellow-300 text-xs sm:text-sm mt-2">
                    ⏳ Claiming in progress - please confirm the transaction in your wallet!
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button 
                className={`btn-secondary py-2 px-4 sm:px-6 w-full sm:w-auto text-sm sm:text-base ${isClaimingReward ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isClaimingReward && handleAutoClaim()}
                disabled={isClaimingReward}
              >
                {isClaimingReward ? 'Claiming...' : 'Claim Now'}
              </button>
              <button 
                className="btn-primary py-2 px-4 sm:px-6 w-full sm:w-auto text-sm sm:text-base"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Challenge Card */}
      <motion.div 
        className="bg-purple-900/80 rounded-xl pixel-border p-4 sm:p-6 mb-4 sm:mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-anime text-white">Beginner's Path</h2>
          <div className="bg-purple-800 px-2 sm:px-3 py-1 rounded-full text-xs text-yellow-300">
            ★ Easy
          </div>
        </div>
        
        <div className="flex justify-center mb-4 sm:mb-6">
          <img 
            src={isMoving ? avatarRunningGif : avatarStandingGif}
            alt={isMoving ? "Running Avatar" : "Standing Avatar"} 
            className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
          />
        </div>
        
        {/* Permission Error Message */}
        {permissionError && (
          <div className="bg-red-900/50 text-red-200 p-3 rounded-lg mb-4 text-xs sm:text-sm">
            {permissionError}. Please ensure motion sensors are enabled on your device.
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs sm:text-sm text-purple-200 mb-1">
            <span>{steps} steps</span>
            <span>{targetSteps} steps</span>
          </div>
          <div className="h-2 sm:h-3 bg-purple-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(steps / targetSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Start/Pause Button */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <button 
            className={`btn-${isRunning ? 'secondary' : 'primary'} py-2 px-6 sm:px-8 text-sm sm:text-base`}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
        </div>

        {/* Rewards */}
        <div className="bg-purple-800/50 rounded-lg p-3 sm:p-4">
          <h3 className="text-white font-anime mb-2 text-sm sm:text-base">Rewards:</h3>
          <ul className="space-y-2">
            <li className="flex items-center text-sm sm:text-base">
              <span className="text-base sm:text-lg mr-2">🪙</span>
              <span className="text-purple-200">50 Move Tokens</span>
            </li>
            
            <li className="flex items-center text-sm sm:text-base">
              <span className="text-base sm:text-lg mr-2">🏆</span>
              <span className="text-purple-200">Beginner Badge</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Tips Section */}
      <div className="bg-blue-900/30 rounded-xl pixel-border p-4 sm:p-6">
        <h3 className="text-white font-anime mb-3 sm:mb-4 text-sm sm:text-base">Tips for Success</h3>
        <ul className="space-y-2 sm:space-y-3 text-blue-200">
          <li className="flex items-start text-xs sm:text-sm">
            <span className="text-base sm:text-lg mr-2">💡</span>
            <span>Hold your device in your hand or pocket while walking for accurate step counting.</span>
          </li>
          <li className="flex items-start text-xs sm:text-sm">
            <span className="text-base sm:text-lg mr-2">💡</span>
            <span>Take the stairs instead of elevators when possible.</span>
          </li>
          <li className="flex items-start text-xs sm:text-sm">
            <span className="text-base sm:text-lg mr-2">💡</span>
            <span>Park farther away from entrances to add extra steps.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Level1Challenge; 