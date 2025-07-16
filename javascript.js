document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    const humanModeBtn = document.getElementById('human-mode');
    const computerModeBtn = document.getElementById('computer-mode');
    const xScoreElement = document.getElementById('x-score');
    const oScoreElement = document.getElementById('o-score');
    const drawScoreElement = document.getElementById('draw-score');
    
    // Audio elements
    const clickSound = document.getElementById('click-sound');
    const winSound = document.getElementById('win-sound');
    const drawSound = document.getElementById('draw-sound');
    
    // Game state
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let isComputerMode = false;
    let scores = { x: 0, o: 0, draw: 0 };
    
    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    resetButton.addEventListener('click', resetGame);
    humanModeBtn.addEventListener('click', () => setGameMode(false));
    computerModeBtn.addEventListener('click', () => setGameMode(true));
    
    // Initialize game
    updateScores();
    
    function setGameMode(computerMode) {
        isComputerMode = computerMode;
        if (computerMode) {
            computerModeBtn.classList.add('active');
            humanModeBtn.classList.remove('active');
            // If it's computer's turn first (as O)
            if (currentPlayer === 'O') {
                makeComputerMove();
            }
        } else {
            humanModeBtn.classList.add('active');
            computerModeBtn.classList.remove('active');
        }
        resetGame(false); // Reset game but keep scores
    }
    
    function handleCellClick(e) {
        if (!gameActive) return;
        
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (gameState[clickedCellIndex] !== '') return;
        
        // Play click sound
        clickSound.currentTime = 0;
        clickSound.play();
        
        makeMove(clickedCellIndex, currentPlayer);
        
        // Check if game is still active and it's computer's turn
        if (gameActive && isComputerMode && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 500); // Small delay for better UX
        }
    }
    
    function makeMove(cellIndex, player) {
        gameState[cellIndex] = player;
        cells[cellIndex].textContent = player;
        checkResult();
    }
    
    function makeComputerMove() {
        if (!gameActive) return;
        
        // Simple AI: first try to win, then block, then random
        let move = findWinningMove('O') || 
                  findWinningMove('X') || 
                  findRandomMove();
        
        if (move !== null) {
            makeMove(move, 'O');
            // Play click sound for computer move
            clickSound.currentTime = 0;
            clickSound.play();
        }
    }
    
    function findWinningMove(player) {
        for (let condition of winningConditions) {
            let [a, b, c] = condition;
            // Check if two in a row and third is empty
            if (gameState[a] === player && gameState[b] === player && gameState[c] === '') return c;
            if (gameState[a] === player && gameState[c] === player && gameState[b] === '') return b;
            if (gameState[b] === player && gameState[c] === player && gameState[a] === '') return a;
        }
        return null;
    }
    
    function findRandomMove() {
        let availableMoves = gameState.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        if (availableMoves.length > 0) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        return null;
    }
    
    function checkResult() {
        let roundWon = false;
        let winningCells = [];
        
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
                continue;
            }
            
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                winningCells = [a, b, c];
                break;
            }
        }
        
        if (roundWon) {
            // Highlight winning cells
            winningCells.forEach(index => {
                cells[index].classList.add('winning-cell');
            });
            
            // Update scores
            scores[currentPlayer.toLowerCase()]++;
            updateScores();
            
            status.textContent = `Player ${currentPlayer} wins!`;
            gameActive = false;
            
            // Play win sound
            winSound.currentTime = 0;
            winSound.play();
            
            return;
        }
        
        if (!gameState.includes('')) {
            // Update draw count
            scores.draw++;
            updateScores();
            
            status.textContent = "Game ended in a draw!";
            gameActive = false;
            
            // Play draw sound
            drawSound.currentTime = 0;
            drawSound.play();
            
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        status.textContent = `Player ${currentPlayer}'s turn`;
    }
    
    function updateScores() {
        xScoreElement.textContent = scores.x;
        oScoreElement.textContent = scores.o;
        drawScoreElement.textContent = scores.draw;
    }
    
    function resetGame(resetScores = true) {
        if (resetScores) {
            scores = { x: 0, o: 0, draw: 0 };
            updateScores();
        }
        
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        status.textContent = `Player ${currentPlayer}'s turn`;
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('winning-cell');
        });
        
        // If computer mode and computer goes first
        if (isComputerMode && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 500);
        }
    }
});