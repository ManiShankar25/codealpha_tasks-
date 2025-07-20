// Song data configuration
const songs = [
  {
    name: "Fight Club • Where Is My Mind • Pixies_1753024214638.mp3",
    title: "Where Is My Mind",
    artist: "The Pixies"
  },
  {
    name: "David Kushner - Daylight (Official Music Video)_1753024214637.mp3",
    title: "Daylight",
    artist: "David Kushner"
  },
  {
    name: "Narvent - Fainted (4K Music Video)_1753024214639.mp3",
    title: "Fainted",
    artist: "Narvent"
  },
  {
    name: "The Neighbourhood - Sweater Weather (Lyrics)_1753024214639.mp3",
    title: "Sweater Weather",
    artist: "The Neighbourhood"
  },
  {
    name: "Tom Odell - Another Love (Official Video)_1753024214640.mp3",
    title: "Another Love",
    artist: "Tom Odell"
  }
];

// DOM element references
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progressFill = document.getElementById('progress');
const progressThumb = document.getElementById('thumb');
const progressTrack = document.querySelector('.progress-track');
const currentTimeEl = document.getElementById('current');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume');
const playlistEl = document.getElementById('playlist');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');
const vinylRecord = document.querySelector('.vinyl-record');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');

// Player state
let currentIndex = 0;
let isShuffled = false;
let repeatMode = 'none'; // 'none', 'one', 'all'
let shuffledIndices = [];

// Initialize the player
function init() {
  loadSong(currentIndex);
  createPlaylist();
  setupEventListeners();
  
  // Set initial volume
  audio.volume = 0.7;
  volumeSlider.value = 0.7;
  
  // Set initial cover image
  coverEl.onerror = function() {
    this.src = "https://via.placeholder.com/300x300/8B4513/FFFFFF?text=No+Cover";
  };
}

// Load a song by index
function loadSong(index) {
  const song = songs[index];
  if (!song) return;
  
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  audio.src = `songs/${song.name}`;
  
  // Update cover art (fallback to placeholder if not found)
  coverEl.src = `https://via.placeholder.com/300x300/8B4513/FFFFFF?text=${encodeURIComponent(song.title)}`;
  
  highlightCurrentTrack();
  updateDocumentTitle();
}

// Update document title with current track
function updateDocumentTitle() {
  const song = songs[currentIndex];
  document.title = `${song.title} - ${song.artist} | Vintage Music Player`;
}

// Play/Pause functionality
function togglePlayPause() {
  if (audio.paused) {
    audio.play().then(() => {
      updatePlayButton(true);
      vinylRecord.classList.add('playing');
    }).catch(error => {
      console.error('Error playing audio:', error);
    });
  } else {
    audio.pause();
    updatePlayButton(false);
    vinylRecord.classList.remove('playing');
  }
}

// Update play button appearance
function updatePlayButton(isPlaying) {
  if (isPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }
}

// Previous track
function previousTrack() {
  if (isShuffled && shuffledIndices.length > 0) {
    const currentShuffledIndex = shuffledIndices.indexOf(currentIndex);
    const prevIndex = currentShuffledIndex > 0 ? currentShuffledIndex - 1 : shuffledIndices.length - 1;
    currentIndex = shuffledIndices[prevIndex];
  } else {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  }
  
  loadSong(currentIndex);
  if (!audio.paused) {
    audio.play();
  }
}

// Next track
function nextTrack() {
  if (isShuffled && shuffledIndices.length > 0) {
    const currentShuffledIndex = shuffledIndices.indexOf(currentIndex);
    const nextIndex = (currentShuffledIndex + 1) % shuffledIndices.length;
    currentIndex = shuffledIndices[nextIndex];
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  
  loadSong(currentIndex);
  if (!audio.paused) {
    audio.play();
  }
}

// Toggle shuffle mode
function toggleShuffle() {
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle('active', isShuffled);
  
  if (isShuffled) {
    // Create shuffled array
    shuffledIndices = [...Array(songs.length).keys()];
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }
    
    // Ensure current song is first in shuffle
    const currentShuffledIndex = shuffledIndices.indexOf(currentIndex);
    if (currentShuffledIndex > 0) {
      [shuffledIndices[0], shuffledIndices[currentShuffledIndex]] = [shuffledIndices[currentShuffledIndex], shuffledIndices[0]];
    }
  } else {
    shuffledIndices = [];
  }
}

// Toggle repeat mode
function toggleRepeat() {
  const modes = ['none', 'all', 'one'];
  const currentModeIndex = modes.indexOf(repeatMode);
  repeatMode = modes[(currentModeIndex + 1) % modes.length];
  
  repeatBtn.classList.toggle('active', repeatMode !== 'none');
  repeatBtn.title = `Repeat: ${repeatMode}`;
}

// Handle track end
function handleTrackEnd() {
  if (repeatMode === 'one') {
    audio.currentTime = 0;
    audio.play();
  } else if (repeatMode === 'all' || isShuffled) {
    nextTrack();
  } else {
    // Check if we're at the last track
    if (currentIndex === songs.length - 1) {
      // Stop playback and reset
      updatePlayButton(false);
      vinylRecord.classList.remove('playing');
    } else {
      nextTrack();
    }
  }
}

// Update progress bar
function updateProgress() {
  if (audio.duration) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${percent}%`;
    progressThumb.style.left = `${percent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
}

// Set progress when clicking on progress bar
function setProgress(e) {
  const width = progressTrack.clientWidth;
  const clickX = e.offsetX;
  const percent = clickX / width;
  
  if (audio.duration) {
    audio.currentTime = percent * audio.duration;
  }
}

// Update volume
function updateVolume() {
  audio.volume = volumeSlider.value;
}

// Create playlist UI
function createPlaylist() {
  playlistEl.innerHTML = '';
  
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="track-item">
        <span class="track-number">${index + 1}</span>
        <div class="track-details">
          <div class="track-name">${song.title}</div>
          <div class="track-artist">${song.artist}</div>
        </div>
      </div>
    `;
    
    li.addEventListener('click', () => {
      currentIndex = index;
      loadSong(index);
      audio.play().then(() => {
        updatePlayButton(true);
        vinylRecord.classList.add('playing');
      });
    });
    
    playlistEl.appendChild(li);
  });
}

// Highlight current track in playlist
function highlightCurrentTrack() {
  const playlistItems = playlistEl.querySelectorAll('li');
  playlistItems.forEach((item, index) => {
    item.classList.toggle('active', index === currentIndex);
  });
}

// Format time display
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Setup all event listeners
function setupEventListeners() {
  // Player controls
  playBtn.addEventListener('click', togglePlayPause);
  prevBtn.addEventListener('click', previousTrack);
  nextBtn.addEventListener('click', nextTrack);
  shuffleBtn.addEventListener('click', toggleShuffle);
  repeatBtn.addEventListener('click', toggleRepeat);
  
  // Audio events
  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
  });
  
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', handleTrackEnd);
  
  audio.addEventListener('play', () => {
    updatePlayButton(true);
    vinylRecord.classList.add('playing');
  });
  
  audio.addEventListener('pause', () => {
    updatePlayButton(false);
    vinylRecord.classList.remove('playing');
  });
  
  audio.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    // Try next track if current fails to load
    if (audio.error) {
      nextTrack();
    }
  });
  
  // Progress bar interaction
  progressTrack.addEventListener('click', setProgress);
  
  // Volume control
  volumeSlider.addEventListener('input', updateVolume);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    switch(e.code) {
      case 'Space':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        previousTrack();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextTrack();
        break;
    }
  });
}

// Add CSS for active states
const style = document.createElement('style');
style.textContent = `
  .header-btn.active {
    background: var(--color-highlight);
    color: var(--color-background);
    border-color: var(--color-highlight);
  }
  
  .track-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }
  
  .track-number {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    min-width: 20px;
  }
  
  .track-details {
    flex: 1;
  }
  
  .track-name {
    font-weight: var(--font-weight-medium);
    margin-bottom: 2px;
  }
  
  .track-artist {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }
`;
document.head.appendChild(style);

// Initialize the player when the page loads
document.addEventListener('DOMContentLoaded', init);

// Handle visibility change to pause/resume appropriately
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !audio.paused) {
    // Optionally pause when tab becomes hidden
    // audio.pause();
  }
});
