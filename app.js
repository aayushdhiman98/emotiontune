// DOM Elements
const video = document.getElementById('video');
const emotionText = document.getElementById('emotion');
const messageBox = document.getElementById('dynamic-message');
const startButton = document.getElementById('startButton');
const toggleMusicButton = document.getElementById('toggleMusic');
const loadingElement = document.getElementById('loading');

// Audio elements for different emotions
const audioElements = {
    happy: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
    sad: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
    angry: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
    neutral: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
    surprised: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3')
};

// Emotional messages
const emotionalMessages = {
    happy: ["You're glowing today!", "Your smile brightens the room!", "Keep that positive energy!"],
    sad: ["Everything will be okay!", "You're stronger than you know!", "Tomorrow is a new day!"],
    angry: ["Take a deep breath...", "Let's calm down together", "Peace begins with a smile"],
    neutral: ["How are you feeling?", "Ready for an amazing day!", "Stay present, stay peaceful"],
    surprised: ["Wow! What caught your eye?", "Life is full of surprises!", "Embrace the unexpected!"]
};

let isPlaying = false;
let currentEmotion = 'neutral';
let currentAudio = null;

// Initialize face-api.js
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo).catch(err => console.error(err));

// Start video stream
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        loadingElement.style.display = 'none';
    } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Please enable webcam access to use this application");
    }
}

// Start emotion detection
video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

        if (detections && detections.length > 0) {
            const expressions = detections[0].expressions;
            handleEmotions(expressions);
        }
    }, 100);
});

// Handle detected emotions
function handleEmotions(expressions) {
    const emotion = Object.keys(expressions).reduce((a, b) => 
        expressions[a] > expressions[b] ? a : b
    );

    if (currentEmotion !== emotion) {
        currentEmotion = emotion;
        updateUI(emotion);
        updateMusic(emotion);
    }
}

// Update UI based on emotion
function updateUI(emotion) {
    emotionText.textContent = emotion;
    document.body.className = emotion;
    
    // Update message
    const messages = emotionalMessages[emotion] || emotionalMessages.neutral;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Animate message change
    gsap.to(messageBox, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            messageBox.textContent = randomMessage;
            gsap.to(messageBox, {
                opacity: 1,
                duration: 0.3
            });
        }
    });
}

// Handle music playback
function updateMusic(emotion) {
    if (!isPlaying) return;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = audioElements[emotion] || audioElements.neutral;
    currentAudio.loop = true;
    currentAudio.play();
}

// Event Listeners
startButton.addEventListener('click', () => {
    startVideo();
    startButton.disabled = true;
});

toggleMusicButton.addEventListener('click', () => {
    isPlaying = !isPlaying;
    toggleMusicButton.textContent = isPlaying ? 'Mute Music' : 'Play Music';
    
    if (!isPlaying && currentAudio) {
        currentAudio.pause();
    } else if (isPlaying) {
        updateMusic(currentEmotion);
    }
});
