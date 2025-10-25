let dragging;
let interval;
let armDraggingEnabled = true; // Flag to enable/disable arm dragging

// Create an audio element at the top level
const audioPlayer = document.createElement('audio');
audioPlayer.crossOrigin = 'anonymous';
audioPlayer.loop = true;
document.body.appendChild(audioPlayer);

// Global variables for DOM elements
let powerButton = null;
let volumeSlider = null;
let turntable = null;
let recordLabel = null;
let startSound = null;

// Get category from URL parameters or sessionStorage
const urlParams = new URLSearchParams(window.location.search);
let category = urlParams.get('category');

// If no URL parameter, check sessionStorage
if (!category) {
  const storedCategory = sessionStorage.getItem('selectedCategory');
  if (storedCategory) {
    // Map stored category names to display names
    const categoryMap = {
      'classical': 'Classical',
      'lofi': 'Lo-Fi Jazz',
      'stream': 'Stream',
      'rain': 'Rain'
    };
    category = categoryMap[storedCategory] || storedCategory;
    
    // Clear sessionStorage
    sessionStorage.removeItem('selectedCategory');
    sessionStorage.removeItem('autoPlay');
  }
}

// Initialize start sound at the top level
startSound = new Audio('audio/start.mp3');
startSound.volume = 0.5;

// Preload the start sound
startSound.load();

// Audio source configuration - copied from script.js
const audioSources = {
    classical: {
        chill: {
            'bridgerton.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052324/bridgerton_rllu0f.mp3',
            'calm.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052333/calm_z5cmi8.mp3',
            'ghibli.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052332/ghibli_fjtgck.mp3'
        },
        deadline: {
            'Hans Zimmer.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052330/Hans_Zimmer_hiohab.mp3',
            'moozart.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052287/moozart_jkkyil.mp3',
            'ode2joy.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052257/ode2joy_van6m8.mp3',
            'black_swan.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052252/black_swan_tutm6n.mp3'
        }
    },
    lofi: {
        chill: {
            'jazz1.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052304/jazz1_hfwubr.mp3',
            'jazz2.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052330/jazz2_agdae0.mp3',
            'jazz3.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052324/jazz3_kdmywz.mp3'
        },
        deadline: {
            'lofijazz1.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052272/lofijazz1_hsp8dg.mp3',
            'lofijazz2.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052323/lofijazz2_s1hj2a.mp3'
        }
    },
    nature: {
        rain: {
            'rain.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052903/rain_vda074.mp3'
        },
        stream: {
            'stream.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052745/stream_v6kpdc.mp3'
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded, initializing record player");
  
  // Initialize global DOM references
  powerButton = document.getElementById('power');
  volumeSlider = document.querySelector('#volume .slider');
  turntable = document.getElementById('turntable');
  recordLabel = document.getElementById('label');
  
  // Initialize components
  initializeRecordPlayer();
  
  // Setup arm dragging with vanilla JavaScript
  setupArmDragging();
  
  // Add vanilla JavaScript replacement
  setupRecordCenterVanilla();
  
  // Set up the record player functionality
  console.log('Setting up record player functionality...');
  setupRecordPlayer();
  
  // Set up initial playlist if category exists
  if (category) {
    console.log('Category found:', category);
    const playlist = getPlaylistForCategory(category);
    if (playlist.length > 0) {
      console.log('Playlist found with', playlist.length, 'tracks');
      audioPlayer.src = playlist[0];
      audioPlayer.load();
      audioPlayer.volume = volumeSlider.value / 100 || 0.7;
      
      // Create a tooltip to guide the user
      const tooltip = document.createElement('div');
      tooltip.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        font-size: 18px;
        z-index: 1000;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `;
      tooltip.innerHTML = `
        <div style="margin-bottom: 15px;">Click the Start/Stop button to begin playing ${category}</div>
        <div style="font-size: 14px; opacity: 0.8;">(This is required by your browser)</div>
      `;
      
      // Add the tooltip to the document
      document.body.appendChild(tooltip);
      
      // Remove tooltip when user clicks anywhere
      const removeTooltip = () => {
        tooltip.remove();
        document.removeEventListener('click', removeTooltip);
      };
      document.addEventListener('click', removeTooltip);
      
      // When a track ends, play the next one
      audioPlayer.addEventListener('ended', function() {
        console.log('Track ended, playing next one');
        currentTrack = (currentTrack + 1) % playlist.length;
        audioPlayer.src = playlist[currentTrack];
        audioPlayer.load();
        audioPlayer.play().catch(error => {
          console.error('Error playing next track:', error);
        });
      });
    }
  } else {
    console.warn('No category found in URL parameters');
  }
});

// Brand new arm dragging implementation
function setupArmDragging() {
  console.log("Setting up spatial arm dragging");
  
  // Elements
  const arm = document.getElementById('arm');
  const armHead = document.querySelector('#arm .head');
  const armElement = document.querySelector('#arm .arm');
  const record = document.querySelector('#record');
  
  if (!arm || !armHead || !record) {
    console.error("Could not find required elements");
    return;
  } else {
    console.log("Found all required elements for dragging");
  }
  
  // Variables
  let isDragging = false;
  let lastX = 0;
  let targetAngle = 0;  // Target angle for smooth interpolation
  let currentAnimFrame = null; // For animation loop
  
  // Start dragging on mousedown
  armHead.addEventListener('mousedown', startDrag);
  armElement.addEventListener('mousedown', startDrag);
  
  // Touch support
  armHead.addEventListener('touchstart', startDrag, { passive: false });
  armElement.addEventListener('touchstart', startDrag, { passive: false });
  
  // Mouse move
  document.addEventListener('mousemove', dragMove);
  
  // Touch move
  document.addEventListener('touchmove', dragMove, { passive: false });
  
  // Stop dragging
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
  document.addEventListener('touchcancel', stopDrag);
  
  function startDrag(e) {
    if (!armDraggingEnabled) return;
    
    e.preventDefault();
    isDragging = true;
    
    // Get start position
    lastX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    
    // Get current angle from CSS
    const style = getComputedStyle(document.documentElement);
    targetAngle = parseFloat(style.getPropertyValue('--arm-angle')) || 0;
    
    // Remove transition for smooth dragging
    document.documentElement.style.setProperty('--arm-transition-duration', '0s');
    
    // Start animation loop for smooth movement
    if (currentAnimFrame === null) {
      currentAnimFrame = requestAnimationFrame(updateArmPosition);
    }
    
    console.log("Arm drag started at X:", lastX);
  }
  
  function dragMove(e) {
    if (!isDragging || !armDraggingEnabled) return;
    
    e.preventDefault();
    
    // Get current X position
    const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    
    // Detect movement direction
    const movingRight = currentX > lastX;
    const movingLeft = currentX < lastX;
    
    // Adjust target angle based on direction
    // Moving LEFT = lower arm (more negative angle)
    // Moving RIGHT = raise arm (more positive angle)
    const sensitivity = 0.3; // Increased slightly for more responsive feel
    const changeAmount = Math.abs(currentX - lastX) * sensitivity;
    
    if (movingLeft) {
      // Moving left - lower arm (more negative)
      targetAngle = Math.max(45, targetAngle - changeAmount);
    } else if (movingRight) {
      // Moving right - raise arm (more positive)
      targetAngle = Math.min(0, targetAngle + changeAmount);
    }
    
    // Visual feedback when near optimal position
    if (Math.abs(targetAngle + 30) < 5) {
      armHead.classList.add('on-target');
    } else {
      armHead.classList.remove('on-target');
    }
    
    // Update last position
    lastX = currentX;
    
    // Log current state
    console.log("Dragging: direction =", movingLeft ? "left" : (movingRight ? "right" : "none"), "targetAngle =", targetAngle);
  }
  
  function stopDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Get final angle equal to the target angle (since we've been updating it)
    const finalAngle = targetAngle;
    
    // After a short delay to allow animation to settle
    setTimeout(() => {
      // Cancel the animation loop
      if (currentAnimFrame !== null) {
        cancelAnimationFrame(currentAnimFrame);
        currentAnimFrame = null;
      }
      
      // Update record player state
      updatePlayerState(finalAngle);
    }, 50);
    
    console.log("Arm drag ended at angle:", finalAngle);
  }
  
  function updateArmPosition() {
    // Get current angle from CSS
    const style = getComputedStyle(document.documentElement);
    const currentAngle = parseFloat(style.getPropertyValue('--arm-angle')) || 0;
    
    // Apply smooth easing to movement (interpolate current angle toward target)
    const easing = 0.15; // Higher = smoother but slower
    const newAngle = currentAngle + ((targetAngle - currentAngle) * easing);
    
    // Only update if there's a significant difference
    if (Math.abs(newAngle - currentAngle) > 0.01) {
      document.documentElement.style.setProperty('--arm-angle', newAngle + 'deg');
    }
    
    // Continue animation loop
    currentAnimFrame = requestAnimationFrame(updateArmPosition);
  }
  
  function updatePlayerState(angle) {
    const turntable = document.getElementById('turntable');
    
    console.log("Updating player state based on arm angle:", angle);
    
    if (angle <= -10) {
      // Arm is lowered enough to play
      console.log("Arm is lowered, starting playback");
      turntable.classList.remove('pause');
      turntable.classList.add('play');
      
      // Always ensure arm is at the optimal position
      console.log("Setting arm to optimal playing position (30 degrees)");
      document.documentElement.style.setProperty('--arm-transition-duration', '0.5s');
      document.documentElement.style.setProperty('--arm-angle', '30deg');
      
      // Start playback
      startPlayback(30); // Pass the optimal angle
    } else {
      // Arm is raised
      console.log("Arm is raised, pausing playback");
      turntable.classList.remove('play');
      turntable.classList.add('pause');
      
      // Pause playback
      pausePlayback();
    }
  }
}

function initializeRecordPlayer() {
  // Apply skeuomorphic styling to power button directly
  const powerButton = document.querySelector('#power');
  if (powerButton) {
    // Apply inline styles to ensure styling is visible - now with larger square shape (250x250px)
    powerButton.style.cssText = `
      width: 250px;
      height: 250px;
      border-radius: 10px;
      position: relative;
      cursor: pointer;
      user-select: none;
      background: linear-gradient(145deg, #444, #222);
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.8), inset 0 -3px 7px rgba(0, 0, 0, 0.5), inset 0 3px 3px rgba(255, 255, 255, 0.1);
      border: 1px solid #111;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: #ddd;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.8);
    `;
    
    console.log("Applied skeuomorphic styling to power button");
  }

  // Set up power button click handler
  powerButton.addEventListener('click', async function() {
    console.log("Power button clicked");
    let turntable = document.querySelector('#turntable');
    const isCurrentlyPlaying = turntable.classList.contains('play');
    
    try {
      // Play start sound at the beginning of each click
      console.log("Attempting to play start sound...");
      startSound.currentTime = 0;
      await startSound.play();
      console.log("Start sound played successfully");
    } catch (error) {
      console.error("Error playing start sound:", error);
    }
    
    if (isCurrentlyPlaying) {
      // Currently playing, so stop it
      console.log("Stopping playback");
      turntable.classList.remove('play');
      turntable.classList.add('pause');
      
      // Update button style for inactive state - larger square button
      this.style.background = 'linear-gradient(145deg, #444, #222)';
      this.style.boxShadow = '0 6px 10px rgba(0, 0, 0, 0.8), inset 0 -3px 7px rgba(0, 0, 0, 0.5), inset 0 3px 3px rgba(255, 255, 255, 0.1)';
      this.style.transform = 'none';
      
      // Raise the arm with animation
      console.log("Raising arm to 0 degrees");
      document.documentElement.style.setProperty('--arm-transition-duration', '1s');
      document.documentElement.style.setProperty('--arm-angle', '0deg');
      
      // Pause the audio
      audioPlayer.pause();
    } else {
      // Currently stopped, so start it
      console.log("Starting playback");
      turntable.classList.remove('pause');
      turntable.classList.add('play');
      
      // Update button style for active state - larger square button
      this.style.background = 'linear-gradient(145deg, #333, #222)';
      this.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.8), inset 0 3px 7px rgba(0, 0, 0, 0.7), inset 0 -2px 3px rgba(255, 255, 255, 0.1)';
      this.style.transform = 'translateY(3px)';
      
      // Lower the arm with animation
      console.log("Lowering arm to -30 degrees (over record)");
      document.documentElement.style.setProperty('--arm-transition-duration', '1s');
      document.documentElement.style.setProperty('--arm-angle', '30deg');
      
      // Start the audio
      try {
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log("Audio started playing successfully");
        }
      } catch (error) {
        console.error('Error playing audio:', error);
        // If autoplay is blocked, show a message to the user
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 20px 30px;
          border-radius: 10px;
          font-size: 18px;
          z-index: 1000;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        tooltip.innerHTML = `
          <div style="margin-bottom: 15px;">Please click the Start/Stop button again to begin playing</div>
          <div style="font-size: 14px; opacity: 0.8;">(This is required by your browser)</div>
        `;
        document.body.appendChild(tooltip);
        
        // Remove tooltip when user clicks anywhere
        const removeTooltip = () => {
          tooltip.remove();
          document.removeEventListener('click', removeTooltip);
        };
        document.addEventListener('click', removeTooltip);
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;

    if (e.keyCode === 32) {
        document.querySelector('#power').click();
    }
  });

  document.querySelector('#volume .slider').addEventListener('input', (e) => {
    let volume = e.target.value;
    console.log("Volume set to", volume);
  });

  document.querySelector('#volume .slider').value = 75;
}

function startPlayback(armPosition) {
  let percentage = armPosition ? calculatePercentageFromArm(armPosition) : getPercentage();
  let head = document.querySelector('#arm .head');
  let turntable = document.querySelector('#turntable');

  head.classList.remove('pulse');

  if (percentage >= -0.1 && percentage <= 1) {
    if (turntable.classList.contains('play')) {
      let remaining = 1800; // Default to 30 minutes (in seconds)
      setArmAnimation(remaining);
    }
  } else if (percentage < -0.1) {
    head.classList.add('pulse');
  }
}

function pausePlayback() {
  console.log("Playback paused");
}

function getEstimatedRemainingTime() {
  // Default to 30 minutes if no timer is active
  return 1800; // 30 minutes in seconds
}

function calculatePercentageFromArm(angle) {
  return Math.abs(angle) / 45;
}

function getPercentage() {
  try {
  let head = document.querySelector('#arm .head');
  let rect = head.getBoundingClientRect();
  let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  let needle = {
    x: rect.left + scrollLeft + head.offsetWidth / 2,
    y: rect.top + scrollTop + head.offsetHeight + 10
  }

  let record = document.querySelector('#record');
  let center = {
    x: record.offsetLeft + record.offsetWidth / 2,
    y: record.offsetTop + record.offsetHeight / 2
  }

  let distance = getDistance(center, needle);
  let angle = getAngle(center, needle);

  let label = document.querySelector('#label');
  let startBuffer = 10;
  let radiusRecord = record.offsetWidth / 2 - startBuffer;
  let radiusLabel = label.offsetWidth / 2 + 15;
  let percentage = ((radiusRecord - distance) / (radiusRecord - radiusLabel)) + (angle / 36000);

  percentage = Math.min(percentage, 1);

  return percentage;
  } catch (error) {
    console.log("Error calculating percentage:", error);
    return 0;
  }
}

function getDistance(center, needle) {
  return Math.sqrt(Math.pow(center.x - needle.x, 2) + Math.pow(center.y - needle.y, 2));
}

function getAngle(center, needle) {
  let record = document.querySelector('#record');
  let rotation = getRotation(record);
  let angle = atan2Degrees(needle.y - center.y, needle.x - center.x);

  angle = angle - rotation;
  if (angle < 0) angle += 360;

  return angle;
}

function getRotation(element) {
  let matrix = window.getComputedStyle(element, null).getPropertyValue('transform');

  let values = matrix.split('(')[1];
  values = values.split(')')[0];
  values = values.split(',');

  let a = values[0];
  let b = values[1];

  let rotation = atan2Degrees(b, a);

  return rotation;
}

function atan2Degrees(y, x) {
  let angle = Math.atan2(y, x) * (180/Math.PI);
  if (angle < 0) angle += 360;

  return angle;
}

function setRotation(angle) {
  let root = document.documentElement;
  root.style.setProperty('--arm-transition-duration', '0');
  root.style.setProperty('--arm-angle', angle + 'deg'); 
}

function setArmAnimation(remaining) {
  try {
  let root = document.documentElement;

    console.log("Setting arm animation with remaining time:", remaining);
  root.style.setProperty('--arm-transition-duration', remaining + 's');

  if (remaining > 0) {
    clearInterval(interval);
      // Note: We set to -45 degrees (fully lowered) as the arm moves across the record
      console.log("Setting arm to fully lowered position (45 degrees)");
    root.style.setProperty('--arm-angle', '45deg');
  } else {
      interval = setInterval(function() { setArmAnimation(0); }, 500);
    }
  } catch (error) {
    console.log("Error setting arm animation:", error);
  }
}

// Add vanilla JavaScript replacement
function setupRecordCenterVanilla() {
  const label = document.getElementById('label');
  if (label) {
    const centerImage = document.createElement('img');
    
    // Use the category image instead of data URI
    let categoryImagePath = '';
    if (category === 'Classical') {
      categoryImagePath = 'img/classical.png';
    } else if (category === 'Lo-Fi Jazz') {
      categoryImagePath = 'img/jazz.png';
    } else if (category === 'Nature' || category === 'Stream') {
      categoryImagePath = 'img/nature.png';
    } else if (category === 'Rain') {
      categoryImagePath = 'img/rain.png';
    } else {
      // Use a data URI as fallback if category is unknown
      centerImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="black"/><circle cx="50" cy="50" r="20" fill="white"/><circle cx="50" cy="50" r="5" fill="black"/></svg>';
    }
    
    // Set the image source if we have a valid category
    if (categoryImagePath) {
      centerImage.src = categoryImagePath;
    }
    
    centerImage.alt = 'Record center';
    centerImage.id = 'record-center-image';
    
    centerImage.style.position = 'absolute';
    centerImage.style.top = '50%';
    centerImage.style.left = '50%';
    centerImage.style.transform = 'translate(-50%, -50%)';
    // centerImage.style.width = '70px'; // Larger size for the category image
    centerImage.style.height = 'auto';
    centerImage.style.zIndex = '10';
    centerImage.style.borderRadius = '50%'; // Make it circular
    
    label.appendChild(centerImage);
    console.log("Added category image to record:", categoryImagePath);
    
    // Clear the text content of the label as we're using an image instead
    label.textContent = '';
    label.appendChild(centerImage);
    } else {
      console.error("Could not find label element for the record");
    }
  
  // Set volume slider value
  const volumeSlider = document.querySelector('#volume .slider');
  if (volumeSlider) {
    volumeSlider.value = 75;
  }
  
  // Set light colored background for label
  // if (label) {
  //   label.style.backgroundColor = 'hsl(0, 0%, 90%)'; // Light grey background to make images stand out
  // }
  
  // Hide the category title text
  const categoryTitle = document.getElementById('category-title');
  if (categoryTitle) {
    categoryTitle.style.display = 'none';
  }
}

// Add CSS styling
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.textContent = `
    /* Record center image styling */
    #record-center-image {
      transition: transform 0.3s ease;
    }
    
    #turntable.play #record-center-image {
      animation: spin-center 2s linear infinite;
    }
    
    #arm .head.on-target {
      box-shadow: 0 0 8px 2px rgba(255, 255, 0, 0.7);
    }
    
    @keyframes spin-center {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    /* Power Button (Start/Stop) Styling - larger square button */
    #power {
      width: 250px;
      height: 250px;
      border-radius: 10px;
      position: relative;
      cursor: pointer;
      user-select: none;
      
      /* Button face - metallic texture */
      background: linear-gradient(145deg, #444, #222);
      box-shadow: 
        0 6px 10px rgba(0, 0, 0, 0.8),
        inset 0 -3px 7px rgba(0, 0, 0, 0.5),
        inset 0 3px 3px rgba(255, 255, 255, 0.1);
      border: 1px solid #111;
      
      /* Center content */
      display: flex;
      align-items: center;
      justify-content: center;
      
      /* Transition for smooth hover/active states */
      transition: all 0.2s ease;
      
      /* Text styling */
      color: #ddd;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.8);
    }
    
    #power:hover {
      background: linear-gradient(145deg, #555, #333);
    }
    
    /* Active/pressed state when playing */
    #turntable.play #power {
      background: linear-gradient(145deg, #333, #222);
      box-shadow: 
        0 3px 6px rgba(0, 0, 0, 0.8),
        inset 0 3px 7px rgba(0, 0, 0, 0.7),
        inset 0 -2px 3px rgba(255, 255, 255, 0.1);
      transform: translateY(3px);
    }
    
    /* Record animation */
    #turntable.play #record {
      animation: spin-record 1.8s linear infinite;
    }
    
    @keyframes spin-record {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  console.log("Record player styling initialized");
});

// Function to get playlist based on category
function getPlaylistForCategory(category) {
    let playlist = [];
    
    if (category === 'Classical') {
        playlist = [
            audioSources.classical.chill['calm.mp3'],
            audioSources.classical.chill['ghibli.mp3'],
            audioSources.classical.chill['bridgerton.mp3'],
            audioSources.classical.deadline['moozart.mp3'],
            audioSources.classical.deadline['ode2joy.mp3'],
            audioSources.classical.deadline['black_swan.mp3'],
            audioSources.classical.deadline['Hans Zimmer.mp3']
        ];
    } else if (category === 'Lo-Fi Jazz') {
        playlist = [
            audioSources.lofi.chill['jazz1.mp3'],
            audioSources.lofi.chill['jazz2.mp3'],
            audioSources.lofi.chill['jazz3.mp3'],
            audioSources.lofi.deadline['lofijazz1.mp3'],
            audioSources.lofi.deadline['lofijazz2.mp3']
        ];
    } else if (category === 'Nature' || category === 'Stream') {
        playlist = [
            audioSources.nature.stream['stream.mp3']
        ];
    } else if (category === 'Rain') {
        playlist = [
            audioSources.nature.rain['rain.mp3']
        ];
    }
    
    return shuffleArray(playlist);
}

// Function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Set up the record player
function setupRecordPlayer() {
    // Get references to DOM elements - with error checking
    const volumeSldr = document.querySelector('#volume .slider');
    const recordLbl = document.getElementById('label');
    
    // Set the volume if slider exists
    if (volumeSldr) {
        volumeSldr.addEventListener('input', function() {
            audioPlayer.volume = this.value / 100;
        });
        
        // Initial volume
        audioPlayer.volume = volumeSldr.value / 100 || 0.7;
    }
    
    // We don't need to update the label text since we're using images
    // Just ensure the record label has the right styling
    if (recordLbl) {
        recordLbl.style.backgroundColor = 'hsl(0, 0%, 90%)';
    }
}

// Start playing music
function playMusic() {
    if (category) {
        console.log('Starting music playback for category:', category);
        const playlist = getPlaylistForCategory(category);
        if (playlist.length > 0) {
            console.log('Playlist found with', playlist.length, 'tracks');
            let currentTrack = 0;
            
            // Play the first track
            audioPlayer.src = playlist[currentTrack];
            audioPlayer.load();
            
            // Set volume to prevent startling the user with loud audio
            audioPlayer.volume = volumeSlider.value / 100 || 0.7;
            console.log('Audio volume set to:', audioPlayer.volume);
            
            // Create a tooltip to guide the user
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px 30px;
                border-radius: 10px;
                font-size: 18px;
                z-index: 1000;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            `;
            tooltip.innerHTML = `
                <div style="margin-bottom: 15px;">Click the Start/Stop button to begin playing ${category}</div>
                <div style="font-size: 14px; opacity: 0.8;">(This is required by your browser)</div>
            `;
            
            // Add the tooltip to the document
            document.body.appendChild(tooltip);
            
            // Remove tooltip when user clicks anywhere
            const removeTooltip = () => {
                tooltip.remove();
                document.removeEventListener('click', removeTooltip);
            };
            document.addEventListener('click', removeTooltip);
            
            // When a track ends, play the next one
            audioPlayer.addEventListener('ended', function() {
                console.log('Track ended, playing next one');
                currentTrack = (currentTrack + 1) % playlist.length;
                audioPlayer.src = playlist[currentTrack];
                audioPlayer.load();
                audioPlayer.play().catch(error => {
                    console.error('Error playing next track:', error);
                });
            });
        } else {
            console.error('No tracks found for category:', category);
        }
    } else {
        console.error('No category specified for playback');
    }
}

// Helper function to show notification about playback
function showPlaybackNotification() {
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        font-size: 18px;
        z-index: 1000;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    tooltip.innerHTML = `
        <div style="margin-bottom: 15px;">Click the Start/Stop button to begin playing</div>
        <div style="font-size: 14px; opacity: 0.8;">(This is required by your browser)</div>
    `;
    
    // Add the tooltip to the document
    document.body.appendChild(tooltip);
    
    // Remove tooltip when user clicks anywhere
    const removeTooltip = () => {
        tooltip.remove();
        document.removeEventListener('click', removeTooltip);
    };
    document.addEventListener('click', removeTooltip);
}