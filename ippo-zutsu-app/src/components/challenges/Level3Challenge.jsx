import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import avatarFightingGif from '../../assets/avatar-fighting.gif';
import avatarRunningGif from '../../assets/avatar-running.gif';
import avatarStandingGif from '../../assets/avatar-standing.gif';
import avatarVictoryGif from '../../assets/avatar-victory.gif';
import dragonGif from '../../assets/dragon.gif';

function Level3Challenge({ onBack, onComplete }) {
  const [steps, setSteps] = useState(0);
  const [targetSteps, setTargetSteps] = useState(500);
  const [isRunning, setIsRunning] = useState(false);
  const [hasMotionPermission, setHasMotionPermission] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [showBattlePopup, setShowBattlePopup] = useState(false);
  const [showVictoryPopup, setShowVictoryPopup] = useState(false);
  const movementTimeoutRef = useRef(null);
  const simulationIntervalRef = useRef(null);
  
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
          
          // Check if the user has reached 350 steps to trigger the battle
          if (newSteps === 350 && !showBattlePopup) {
            setIsRunning(false); // Pause the challenge
            setShowBattlePopup(true);
            clearInterval(simulationIntervalRef.current);
            return newSteps;
          }
          
          // Check if the user has reached 500 steps to trigger victory
          if (newSteps >= targetSteps) {
            setIsRunning(false); // Pause the challenge
            setShowVictoryPopup(true);
            clearInterval(simulationIntervalRef.current);
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
            
            // Check if the user has reached 350 steps to trigger the battle
            if (newSteps === 350 && !showBattlePopup) {
              setIsRunning(false); // Pause the challenge
              setShowBattlePopup(true);
              return newSteps;
            }
            
            // Check if the user has reached 500 steps to trigger victory
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
    // Mark level as completed
    if (onComplete) {
      onComplete();
    }
    // Close the popup and go back to dashboard
    setShowVictoryPopup(false);
    onBack();
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
        <h1 className="text-lg sm:text-xl font-anime text-white">Level 3 Challenge</h1>
        <div className="w-12 sm:w-20"></div> {/* Placeholder for balance */}
      </div>

      {/* Battle Popup */}
      {showBattlePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <motion.div 
            className="bg-purple-900/90 rounded-xl pixel-border p-6 max-w-md w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <h2 className="text-xl font-anime text-center text-white mb-4">Battle Encounter!</h2>
            
            <div className="flex justify-between items-center mb-6">
              <div className="w-1/2 flex justify-center">
                <img 
                  src={avatarFightingGif} 
                  alt="Fighting Avatar" 
                  className="h-32 object-contain"
                />
              </div>
              <div className="w-1/2 flex justify-center">
                <img 
                  src={dragonGif} 
                  alt="Goblin" 
                  className="h-32 object-contain"
                />
              </div>
            </div>
            
            <p className="text-center text-purple-200 mb-6">
              A Fire Dragon appears! What will you do?
            </p>
            
            <div className="flex justify-between gap-4">
              <button 
                className="btn-primary flex-1 py-2"
                onClick={handleFight}
              >
                Fight!
              </button>
              <button 
                className="btn-secondary flex-1 py-2"
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <motion.div 
            className="bg-purple-900/90 rounded-xl pixel-border p-6 max-w-md w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <h2 className="text-xl font-anime text-center text-white mb-4">Challenge Complete!</h2>
            
            <div className="flex justify-center mb-6">
              <img 
                src={avatarVictoryGif} 
                alt="Victory Avatar" 
                className="h-40 object-contain"
              />
            </div>
            
            <div className="bg-purple-800/50 rounded-lg p-4 mb-6">
              <h3 className="text-white font-anime mb-2 text-center">Rewards Earned:</h3>
              <ul className="space-y-2">
                <li className="flex items-center justify-center">
                  <span className="text-lg mr-2">🪙</span>
                  <span className="text-purple-200">500 Move Tokens</span>
                </li>
                
                <li className="flex items-center justify-center">
                  <span className="text-lg mr-2">🏆</span>
                  <span className="text-purple-200">Expert Badge</span>
                </li>
              </ul>
            </div>
            
            <div className="flex justify-center">
              <button 
                className="btn-primary py-2 px-8"
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
        className="bg-purple-900/80 rounded-xl pixel-border p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-anime text-white">Expert's Path</h2>
          <div className="bg-purple-800 px-3 py-1 rounded-full text-xs text-yellow-300">
            ★ ★ ★ Hard
          </div>
        </div>
        
        <div className="flex justify-center mb-6">
          <img 
            src={isMoving ? avatarRunningGif : avatarStandingGif}
            alt={isMoving ? "Running Avatar" : "Standing Avatar"} 
            className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
          />
        </div>
        
        {/* Permission Error Message */}
        {permissionError && (
          <div className="bg-red-900/50 text-red-200 p-3 rounded-lg mb-4 text-sm">
            {permissionError}. Please ensure motion sensors are enabled on your device.
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-purple-200 mb-1">
            <span>{steps} steps</span>
            <span>{targetSteps} steps</span>
          </div>
          <div className="h-3 bg-purple-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Timer */}
        {/* <div className="flex justify-between items-center mb-6">
          <div className="text-purple-200">
            <span className="text-sm">Time Remaining:</span>
            <span className="ml-2 text-lg font-bold">{formatTime(timeRemaining)}</span>
          </div>
          <button 
            className={`btn-${isRunning ? 'secondary' : 'primary'} text-sm py-1.5 px-4`}
            onClick={handleStartPause}
          >
            {!hasMotionPermission ? 'Enable Motion' : isRunning ? 'Pause' : 'Start'}
          </button>
        </div> */}

        {/* Start/Pause Button */}
        <div className="flex justify-center mb-6">
          <button 
            className={`btn-${isRunning ? 'secondary' : 'primary'} py-2 px-6`}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
        </div>

        {/* Rewards */}
        <div className="bg-purple-800/50 rounded-lg p-4">
          <h3 className="text-white font-anime mb-2">Rewards:</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="text-lg mr-2">🪙</span>
              <span className="text-purple-200">500 Move Tokens</span>
            </li>
            
            <li className="flex items-center">
              <span className="text-lg mr-2">🏆</span>
              <span className="text-purple-200">Expert Badge</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Tips Section */}
      <div className="bg-blue-900/30 rounded-xl pixel-border p-6">
        <h3 className="text-white font-anime mb-4">Tips for Success</h3>
        <ul className="space-y-3 text-blue-200">
          <li className="flex items-start">
            <span className="text-lg mr-2">💡</span>
            <span>Hold your device in your hand or pocket while walking for accurate step counting.</span>
          </li>
          <li className="flex items-start">
            <span className="text-lg mr-2">💡</span>
            <span>Take the stairs instead of elevators when possible.</span>
          </li>
          <li className="flex items-start">
            <span className="text-lg mr-2">💡</span>
            <span>Park farther away from entrances to add extra steps.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Level3Challenge; 