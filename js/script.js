// DOM Elements
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('playPauseBtn');
const customBtn = document.getElementById('customBtn');
const customBtn2 = document.getElementById('customBtn2');
const customBtn3 = document.getElementById('customBtn3');
const deadlineBtn = document.getElementById('deadlineBtn');
const chillBtn = document.getElementById('chillBtn');
const categoryName = document.getElementById('categoryName');

// Audio Context and Variables
let audioContext;
let source;
let gainNode;
let equalizer;
let isPlaying = false;
let timerTimeout = null;
let timerStartTime = null;
let timerDuration = null;
let remainingTime = null;
let currentPlaylist = [];
let currentTrackIndex = 0;
let currentCategory = null;
let fadeInterval = null;
const FADE_DURATION = 2000; // 2 seconds fade

// Audio source configuration
const audioSources = {
    classical: {
        chill: {
            'calm.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052333/calm_z5cmi8.mp3',
            'ghibli.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052332/ghibli_fjtgck.mp3',
            'bridgerton.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052324/bridgerton_rllu0f.mp3'
        },
        deadline: {
            'Hans Zimmer.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052330/Hans_Zimmer_hiohab.mp3',
            'moozart.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052287/moozart_jkkyil.mp3',
            'ode2joy.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052257/ode2joy_van6m8.mp3',
            'black_swan.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052252/black_swan_tutm6n.mp3'
        }
    },
    
    lofi: {
        
            'jazz1.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052304/jazz1_hfwubr.mp3',
            'jazz2.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052330/jazz2_agdae0.mp3',
            'jazz3.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052324/jazz3_kdmywz.mp3'
        },
        deadline: {
            'lofijazz1.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052272/lofijazz1_hsp8dg.mp3',
            'lofijazz2.mp3': 'https://res.cloudinary.com/dfo9aeybu/video/upload/v1742052323/lofijazz2_s1hj2a.mp3',
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

// Initialize audio context
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaElementSource(audioPlayer);
        gainNode = audioContext.createGain();
        equalizer = {
            lowshelf: audioContext.createBiquadFilter(),
            peaking1: audioContext.createBiquadFilter(),
            peaking2: audioContext.createBiquadFilter(),
            highshelf: audioContext.createBiquadFilter()
        };

        // Configure equalizer
        equalizer.lowshelf.type = 'lowshelf';
        equalizer.lowshelf.frequency.value = 100;
        equalizer.lowshelf.gain.value = 3;

        equalizer.peaking1.type = 'peaking';
        equalizer.peaking1.frequency.value = 500;
        equalizer.peaking1.Q.value = 1;
        equalizer.peaking1.gain.value = 2;

        equalizer.peaking2.type = 'peaking';
        equalizer.peaking2.frequency.value = 2000;
        equalizer.peaking2.Q.value = 1;
        equalizer.peaking2.gain.value = 4;

        equalizer.highshelf.type = 'highshelf';
        equalizer.highshelf.frequency.value = 8000;
        equalizer.highshelf.gain.value = 2;

        // Connect nodes
        source.connect(equalizer.lowshelf);
        equalizer.lowshelf.connect(equalizer.peaking1);
        equalizer.peaking1.connect(equalizer.peaking2);
        equalizer.peaking2.connect(equalizer.highshelf);
        equalizer.highshelf.connect(gainNode);
        gainNode.connect(audioContext.destination);
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Function to adjust equalizer based on category
function adjustEqualizer(category) {
    if (!audioContext) {
        initializeAudioContext();
    }
    
    if (!equalizer) {
        console.log('Equalizer not yet initialized');
        return;
    }

    try {
        if (category === 'Lo-Fi Jazz') {
            equalizer.lowshelf.gain.value = 3;
            equalizer.peaking1.gain.value = 2;
            equalizer.peaking2.gain.value = 4;
            equalizer.highshelf.gain.value = 2;
        } else {
            equalizer.lowshelf.gain.value = 0;
            equalizer.peaking1.gain.value = 0;
            equalizer.peaking2.gain.value = 0;
            equalizer.highshelf.gain.value = 0;
        }
    } catch (error) {
        console.error('Error adjusting equalizer:', error);
    }
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

// Function to fade audio
function fadeAudio(from, to, duration, onComplete) {
    if (fadeInterval) clearInterval(fadeInterval);
    
    const startTime = Date.now();
    fadeInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeProgress = progress * progress * (3 - 2 * progress);
        audioPlayer.volume = from + (to - from) * easeProgress;
        
        if (progress >= 1) {
            clearInterval(fadeInterval);
            fadeInterval = null;
            if (onComplete) onComplete();
        }
    }, 16);
}

// Function to check if audio file exists
async function checkAudioFileExists(src) {
    try {
        const response = await fetch(src, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Function to get audio source with fallback
function getAudioSource(localPath) {
    // Remove leading slash if present
    localPath = localPath.replace(/^\//, '');
    
    // Try to find the remote source
    const pathParts = localPath.split('/');
    let current = audioSources;
    
    for (const part of pathParts) {
        if (current[part]) {
            current = current[part];
        } else {
            // If we can't find the remote source, return the local path
            return localPath;
        }
    }
    
    // If we found a string (URL), return it
    if (typeof current === 'string') {
        return current;
    }
    
    // Otherwise, return the local path
    return localPath;
}

// Modified loadAndPlayAudio function with better error handling
async function loadAndPlayAudio(src, fadeOut = true) {
    if (!src) {
        console.error('Invalid source provided to loadAndPlayAudio');
        return;
    }

    try {
        console.log('Loading audio:', src);
        initializeAudioContext();
        
        // Set play button state immediately
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.classList.remove('play-state');
        playPauseBtn.classList.add('pause-state');
        isPlaying = true;

        // Add loading timeout
        const loadingTimeout = setTimeout(() => {
            if (currentPlaylist.length > 1) {
                console.log('Loading timeout reached, skipping to next track');
                playNextTrack();
            }
        }, 10000); // 10 second timeout

        // Simple preload check
        const preloadCheck = new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.crossOrigin = 'anonymous';
            
            audio.addEventListener('canplaythrough', () => resolve(), { once: true });
            audio.addEventListener('error', (e) => reject(e.error), { once: true });
            
            audio.src = src;
            audio.load();
        });

        await preloadCheck;

        if (fadeOut && isPlaying) {
            fadeAudio(audioPlayer.volume, 0, FADE_DURATION / 2, () => {
                audioPlayer.crossOrigin = 'anonymous';
                audioPlayer.src = src;
                audioPlayer.load();
                audioPlayer.play().then(() => {
                    clearTimeout(loadingTimeout);
                    fadeAudio(0, volumeSlider.value / 100, FADE_DURATION / 2);
                }).catch(error => {
                    console.error('Error playing audio:', error);
                    clearTimeout(loadingTimeout);
                    if (currentPlaylist.length > 1) playNextTrack();
                });
            });
        } else {
            audioPlayer.crossOrigin = 'anonymous';
            audioPlayer.src = src;
            audioPlayer.load();
            audioPlayer.volume = 0;
            audioPlayer.play().then(() => {
                clearTimeout(loadingTimeout);
                fadeAudio(0, volumeSlider.value / 100, FADE_DURATION / 2);
            }).catch(error => {
                console.error('Error playing audio:', error);
                clearTimeout(loadingTimeout);
                if (currentPlaylist.length > 1) playNextTrack();
            });
        }
    } catch (error) {
        console.error('Error in loadAndPlayAudio:', error);
        if (currentPlaylist.length > 1) {
            setTimeout(playNextTrack, 1000); // Wait a second before trying next track
        }
    }
}

// Function to play next track
function playNextTrack() {
    if (currentPlaylist.length === 0) return;
    
    if (currentTrackIndex >= currentPlaylist.length - 1) {
        currentPlaylist = shuffleArray(currentPlaylist);
        currentTrackIndex = 0;
    } else {
        currentTrackIndex++;
    }
    
    loadAndPlayAudio(currentPlaylist[currentTrackIndex], true);
}

// Function to update playlist
function updatePlaylist() {
    console.log('Updating playlist for category:', currentCategory);
    
    // Stop current playback before updating playlist
    if (isPlaying) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
    
    // Clear current playlist
    currentPlaylist = [];
    currentTrackIndex = 0;
    
    try {
        if (currentCategory === 'Classical') {
            // For Classical, always merge both deadline and chill playlists
            currentPlaylist = [
                // Chill playlist
                audioSources.classical.chill['calm.mp3'],
                audioSources.classical.chill['ghibli.mp3'],
                audioSources.classical.chill['bridgerton.mp3'],
                // Deadline playlist
                audioSources.classical.deadline['moozart.mp3'],
                audioSources.classical.deadline['ode2joy.mp3'],
                audioSources.classical.deadline['black_swan.mp3'],
                audioSources.classical.deadline['Hans Zimmer.mp3']
            ];
        } else if (currentCategory === 'Lo-Fi Jazz') {
            // For Lo-Fi Jazz, always merge both deadline and chill playlists
            currentPlaylist = [
                // Chill playlist
                audioSources.lofi.chill['jazz1.mp3'],
                audioSources.lofi.chill['jazz2.mp3'],
                audioSources.lofi.chill['jazz3.mp3'],
                // Deadline playlist
                audioSources.lofi.deadline['lofijazz1.mp3'],
                audioSources.lofi.deadline['lofijazz2.mp3']
            ];
        } else if (currentCategory === 'Nature') {
            const isRainSelected = deadlineBtn.classList.contains('selected');
            const isStreamSelected = chillBtn.classList.contains('selected');
            
            if (isRainSelected) {
                currentPlaylist = [audioSources.nature.rain['rain.mp3']];
            } else if (isStreamSelected) {
                currentPlaylist = [audioSources.nature.stream['stream.mp3']];
            }
        }
        
        if (currentPlaylist.length > 0) {
            currentPlaylist = shuffleArray([...currentPlaylist]);
            currentTrackIndex = 0;
            loadAndPlayAudio(currentPlaylist[0], false);
        } else {
            stopPlayback();
        }
    } catch (error) {
        console.error('Error updating playlist:', error);
        stopPlayback();
    }
}

// Function to handle category selection
function handleCategorySelection(index) {
    if (index === 0) { // Classical
        document.body.classList.remove('nature');
        categoryName.classList.remove('nature');
        [customBtn, customBtn2, customBtn3].forEach(b => b.classList.remove('nature-timer'));
        [deadlineBtn, chillBtn].forEach(b => b.classList.remove('nature-vibe'));
        
        document.querySelector('.background-image').src = 'img/bcg.png';
        
        [customBtn, customBtn2, customBtn3].forEach(b => b.classList.remove('selected'));
        customBtn3.classList.add('selected');
        clearExistingTimer();
        
        deadlineBtn.querySelector('span').textContent = 'Deadline';
        chillBtn.querySelector('span').textContent = 'Chill';
        [deadlineBtn, chillBtn].forEach(b => b.classList.remove('selected'));
        deadlineBtn.classList.add('selected');
        
        // Set play button state before updating playlist
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.classList.remove('play-state');
        playPauseBtn.classList.add('pause-state');
        isPlaying = true;
        
        updatePlaylist();
    } else if (index === 1) { // Lo-Fi Jazz
        document.body.classList.remove('nature');
        categoryName.classList.remove('nature');
        [customBtn, customBtn2, customBtn3].forEach(b => b.classList.remove('nature-timer'));
        [deadlineBtn, chillBtn].forEach(b => b.classList.remove('nature-vibe'));
        
        document.querySelector('.background-image').src = 'img/bcg.png';
        
        [customBtn, customBtn2, customBtn3].forEach(b => b.classList.remove('selected'));
        customBtn3.classList.add('selected');
        clearExistingTimer();
        
        deadlineBtn.querySelector('span').textContent = 'Deadline';
        chillBtn.querySelector('span').textContent = 'Chill';
        [deadlineBtn, chillBtn].forEach(b => b.classList.remove('selected'));
        chillBtn.classList.add('selected');
        
        // Set play button state before updating playlist
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.classList.remove('play-state');
        playPauseBtn.classList.add('pause-state');
        isPlaying = true;
        
        updatePlaylist();
    } else if (index === 2) { // Nature
        document.body.classList.add('nature');
        categoryName.classList.add('nature');
        
        document.querySelector('.background-image').src = 'img/nature.png';
        
        [customBtn, customBtn2, customBtn3].forEach(b => {
            b.classList.remove('selected');
            b.classList.add('nature-timer');
        });
        customBtn.classList.add('selected');
        startTimer(30 * 60 * 1000);
        
        deadlineBtn.querySelector('span').textContent = 'Rain';
        chillBtn.querySelector('span').textContent = 'Stream';
        [deadlineBtn, chillBtn].forEach(b => {
            b.classList.remove('selected');
            b.classList.add('nature-vibe');
        });
        deadlineBtn.classList.add('selected');
        
        // Set play button state before updating playlist
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.classList.remove('play-state');
        playPauseBtn.classList.add('pause-state');
        isPlaying = true;
        
        updatePlaylist();
    }
}

// Function to stop playback
function stopPlayback() {
    if (fadeInterval) clearInterval(fadeInterval);
    fadeAudio(audioPlayer.volume, 0, FADE_DURATION / 2, () => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        playPauseBtn.textContent = 'Play';
        playPauseBtn.classList.remove('pause-state');
        playPauseBtn.classList.add('play-state');
        isPlaying = false;
    });
}

// Function to format time
function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / (60 * 1000));
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Function to update timer display
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (remainingTime === null) {
        timerDisplay.classList.remove('visible');
        return;
    }

    const now = Date.now();
    const elapsed = now - timerStartTime;
    const remaining = timerDuration - elapsed;

    if (remaining <= 0) {
        timerDisplay.classList.remove('visible');
        return;
    }

    timerDisplay.textContent = formatTime(remaining);
    timerDisplay.classList.add('visible');
    requestAnimationFrame(updateTimerDisplay);
}

// Function to start timer
function startTimer(duration) {
    clearExistingTimer();
    timerStartTime = Date.now();
    timerDuration = duration;
    remainingTime = duration;
    timerTimeout = setTimeout(stopPlayback, duration);
    updateTimerDisplay();
}

// Function to clear existing timer
function clearExistingTimer() {
    if (timerTimeout) {
        clearTimeout(timerTimeout);
        timerTimeout = null;
    }
    timerStartTime = null;
    timerDuration = null;
    remainingTime = null;
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.classList.remove('visible');
}

// Function to pause timer
function pauseTimer() {
    if (timerTimeout) {
        clearTimeout(timerTimeout);
        timerTimeout = null;
        remainingTime = timerDuration - (Date.now() - timerStartTime);
    }
}

// Function to resume timer
function resumeTimer() {
    if (remainingTime !== null) {
        timerStartTime = Date.now();
        timerDuration = remainingTime;
        timerTimeout = setTimeout(stopPlayback, remainingTime);
        updateTimerDisplay();
    }
}

// Function to handle timer button click
function handleTimerButtonClick() {
    if (this.classList.contains('selected')) {
        this.classList.remove('selected');
        clearExistingTimer();
        return;
    }
    
    [customBtn, customBtn2, customBtn3].forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    
    if (this === customBtn) {
        startTimer(30 * 60 * 1000);
    } else if (this === customBtn2) {
        startTimer(60 * 60 * 1000);
    } else {
        clearExistingTimer();
    }
}

// Function to handle vibe button click
function handleVibeButtonClick() {
    [deadlineBtn, chillBtn].forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    updatePlaylist();
}

// Function to handle play/pause
function handlePlayPause() {
    if (isPlaying) {
        stopPlayback();
        pauseTimer();
    } else if (currentPlaylist.length > 0) {
        loadAndPlayAudio(currentPlaylist[currentTrackIndex]);
        resumeTimer();
    }
}

// Event Listeners
document.querySelectorAll('.category-image').forEach((img, index) => {
    img.addEventListener('click', function() {
        const categories = ['Classical', 'Lo-Fi Jazz', 'Nature'];
        currentCategory = categories[index];
        
        // Redirect to player.html with the category as a URL parameter
        window.location.href = `player.html?category=${encodeURIComponent(currentCategory)}`;
    });
});

// Audio ended event listener
if (audioPlayer) {
    audioPlayer.addEventListener('ended', playNextTrack);
    audioPlayer.preload = 'auto';
}

// Handle image hover effects
document.addEventListener('DOMContentLoaded', function() {
    // Get image elements
    const categoryImages = document.querySelectorAll('.category-image');
    
    // Define image hover effects
    const imageHoverSources = {
        'Classical Music': 'img/hover_classical.png',
        'Lo-Fi Jazz': 'img/hover_jazz.png',
        'Nature Sounds': 'img/hover_nature.png'
    };
    
    // Store original image sources
    const originalSources = {};
    
    categoryImages.forEach(img => {
        const altText = img.getAttribute('alt');
        originalSources[altText] = img.src;
        
        // Handle mouse enter
        img.addEventListener('mouseenter', function() {
            // Add hovered class to this image
            img.classList.add('hovered');
            
            // Change image source to hover version
            if (imageHoverSources[altText]) {
                img.src = imageHoverSources[altText];
            }
        });
        
        // Handle mouse leave
        img.addEventListener('mouseleave', function() {
            // Remove hovered class
            img.classList.remove('hovered');
            
            // Reset image source to original
            img.src = originalSources[altText];
        });
    });
}); 