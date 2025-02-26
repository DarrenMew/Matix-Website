const canvas = document.getElementById('Matrix');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';

const alphabet = katakana + latin + nums;

const fontSize = 16;
const columns = canvas.width / fontSize;

let typedText = "";
let textIndex = 0;
let typingInterval = 100;
let cursorVisible = true; // Initially the cursor is visible
const cursorWidth = 12; // Width of the cursor line

const rainDrops = [];
for (let x = 0; x < columns; x++) {
    rainDrops[x] = 1;
}

let animationRunning = true;
let animationTimer = null;

// Array to store the multiple text prompts with their respective durations
let textPrompts = [
    { text: "Do you want to know...What it is?\nThe Matrix is everywhere\nIt is all around us\nEven now in this very room\nYou can see it when you look out your window or when you turn on your television\nYou can feel it when you go to work\nWhen you go to church\nWhen you pay your taxes\nIt is the world that has been pulled over your eyes to blind you from the truth\n", x: 10, y: 100, duration: 3000},
    { text: "What Truth ?", x: 10, y: 100, duration: 3000 },
    { text: "That you are a slave Neo\nLike everyone else you where born into bondage\nborn into a prison that you can not smell or taste or touch.\n", x: 10, y: 100, duration: 3000 },
    { text: "A prision...... For your MIND\n", x: 10, y: 100, duration: 3000 },
    { text: "Unfortunatley no one can be told what the matrix is\nYou have to see it for yourself !\n", x: 10, y: 100, duration: 3000 },
    { text: "This is your last chance!\nAfter this there is no turning back.\n", x: 10, y: 100, duration: 3000 },
    { text: "You take the blue pill, the story ends.\nYou wake up in your bed and believe whatever you want to believe.\n\n\n\n\n\n\nYou take the red pill,\nYou stay in wonderland and I show you how deep the rabbit hole goes.\n", x: 10, y: 100, duration: 3000 },
];

let currentPromptIndex = 0;  // To track which text prompt is being typed
let currentLineY = 100; // Starting Y position for text typing

const maxLineWidth = canvas.width - 20; // Maximum width of text before moving to the next line
let lines = [];  // To keep track of the lines of text being typed

// Flag to track whether we're waiting for user input
let waitingForInput = false;

// Function to start typing the next prompt
const startTypingNextPrompt = () => {
    if (currentPromptIndex < textPrompts.length) {
        typedText = "";  // Reset typed text for the new prompt
        textIndex = 0;   // Reset the text index
        lines = [];      // Clear the lines array for the new prompt
        const currentPrompt = textPrompts[currentPromptIndex];
        setTimeout(() => {
            typingInterval = setInterval(() => {
                typeLetter(currentPrompt.text);
            }, 100); // Slow down the typing effect by adjusting this interval
        }, 1000);  // Delay before starting to type the current prompt
        currentPromptIndex++;  // Move to the next prompt after the current one starts
    }
};

// Function to type each letter of the prompt and handle new lines
const typeLetter = (text) => {
    if (textIndex < text.length) {
        let currentChar = text.charAt(textIndex);
        typedText += currentChar;
        textIndex++;

        // Check if we reached a newline character
        if (currentChar === '\n') {
            lines.push(typedText.trim()); // Push the current line to the lines array
            typedText = ""; // Reset typed text for the next line
            currentLineY += fontSize + 5; // Increase Y position for the new line
        }

        // Handle new line if text exceeds max width
        else if (context.measureText(typedText).width > maxLineWidth) {
            lines.push(typedText.trim());  // Push the current line to the lines array
            typedText = "";  // Reset typed text for the next line
            currentLineY += fontSize + 5; // Increase Y position for the new line
        }

        drawTypingEffect(); // Redraw text with new character
    } else {
        // After the prompt finishes typing, push the last line and stop the typing interval
        if (typedText.trim()) lines.push(typedText.trim());
        clearInterval(typingInterval);
        
        // If it's the last prompt, start waiting for user input
        if (currentPromptIndex === textPrompts.length) {
            setTimeout(startWaitingForInput, 1000); // Start waiting for user input after a short delay
        } else {
            setTimeout(startTypingNextPrompt, 1000); // Continue with the next prompt
        }
    }
};

const drawRain = () => {
    context.fillStyle = 'rgba(0, 0, 0, 0.05)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#0F0'; // Green color
    context.font = fontSize + 'px monospace';

    for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        context.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0; // Reset the drop
        }

        rainDrops[i]++;
    }
};

// Function to draw the text (with support for new lines)
const drawTypingEffect = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#0F0'; // Green color for text
    context.font = '24px monospace'; // Font size for the typed text

    // Draw the lines of text that have been typed so far
    lines.forEach((line, index) => {
        context.fillText(line, 10, 100 + (index * (fontSize + 5))); // Add offset for each line
    });

    // Draw the current line of text being typed
    context.fillText(typedText, 10, currentLineY + 15);

    // If the cursor is visible, draw it at the end of the current line of text
    if (cursorVisible) {
        const cursorX = 10 + context.measureText(typedText).width; // Position the cursor at the end of the typed text
        const cursorY = currentLineY + 30; // Cursor Y position based on the current line
        context.fillRect(cursorX, cursorY - 30, cursorWidth, fontSize); // Draw cursor
    }
};

// Function to handle blinking cursor after the last prompt
const startWaitingForInput = () => {
    waitingForInput = true; // Start waiting for input
    setInterval(toggleCursor, 500); // Cursor blinking
    listenForUserInput(); // Start listening for user input
};

// Listen for user input and show it as typed text
const listenForUserInput = () => {
    let userInput = "";
    window.addEventListener("keydown", (e) => {
        if (!waitingForInput) return; // Don't capture keys unless we're waiting for input

        if (e.key.length === 1 && e.key !== 'Enter' && e.key !== 'Backspace') {
            userInput += e.key;
        }

        if (e.key === 'Backspace') {
            userInput = userInput.slice(0, -1); // Remove last character
        }

        if (e.key === 'Enter') {
            handleUserInput(userInput);
        }

        // Display the user's typed input with the same effect as the prompt text
        typedText = userInput;
        drawTypingEffect();  // Redraw after every keypress to show the user's input
    });
};

// Handle user input (red or blue)
const handleUserInput = (input) => {
    if (input.toLowerCase() === "red") {
        window.location.href = "matrixRed.html";  // Redirect to red pill page
    } else if (input.toLowerCase() === "blue") {
        window.location.href = "https://www.google.com";  // Redirect to Google
    } else {
        alert("Please type 'red' or 'blue'");
    }
};

const toggleCursor = () => {
    cursorVisible = !cursorVisible; // Toggle the visibility of the cursor
};

const startNewAnimation = () => {
    // Stop the rain animation
    clearInterval(animationTimer);
    animationRunning = false;

    // Start the typing animation
    setInterval(toggleCursor, 500);  // Start blinking the cursor
    startTypingNextPrompt();  // Start typing the first prompt
};

// Start the rain effect
animationTimer = setInterval(drawRain, 58);

// Transition to typing animation after 12 seconds (end of rain)
setTimeout(startNewAnimation, 8000);




