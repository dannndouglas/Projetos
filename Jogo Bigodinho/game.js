const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variáveis globais
let gravity = 0.5;
let jumpHeight = -15;
let score = 0;
let gameOver = false;
let gameStarted = false;
let fastFall = false;
let groundLevel;

// Variáveis do personagem
const character = {
    x: 50,
    y: 0,
    width: 50,
    height: 100,
    dy: 0,
    isJumping: false,
    isLanding: false,
    currentFrame: 'walk1',
    frameCounter: 0,
    images: {
        idle: new Image(),
        walk1: new Image(),
        walk2: new Image(),
        midAir: new Image(),
        landing: new Image(),
    },
};

// Carregar os sprites do personagem
character.images.idle.src = 'char_idle.png';
character.images.walk1.src = 'char_walk1.png';
character.images.walk2.src = 'char_walk2.png';
character.images.midAir.src = 'char_mid_air.png';
character.images.landing.src = 'char_landing.png';

// Obstáculos
const policeCars = [];
const stoves = [];

// Sons
const jumpSound = document.getElementById('jump-sound');
const pointSound = document.getElementById('point-sound');
const gameOverSound = document.getElementById('game-over-sound');
const backgroundMusic = document.getElementById('background-music');

// Função para redimensionar o canvas e ajustar o tamanho dos elementos
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
    groundLevel = canvas.height * 0.8;

    // Ajustar o personagem com base no novo tamanho do canvas
    character.x = canvas.width * 0.1;
    character.width = canvas.width * 0.1;
    character.height = canvas.height * 0.2;
    character.y = groundLevel - character.height;
}

// Inicializar o canvas no início
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Função para iniciar o jogo ao clicar no botão "Começar"
function startGame() {
    hideGameOverScreen(); // Esconde a tela de "Game Over" no início
    gameOver = false;
    gameStarted = true;
    backgroundMusic.play();
    update(); // Iniciar o loop de atualização
    spawnObstacles(); // Iniciar a geração dos obstáculos
}

// Função para alternar entre os sprites de caminhada
function updateCharacterSprite() {
    if (character.isJumping) {
        character.currentFrame = 'midAir';
    } else if (character.isLanding) {
        character.currentFrame = 'landing';
        setTimeout(() => {
            character.isLanding = false;
        }, 100);
    } else {
        // Alternar entre os sprites de caminhada quando o personagem não estiver pulando
        if (character.frameCounter % 20 < 10) {
            character.currentFrame = 'walk1';
        } else {
            character.currentFrame = 'walk2';
        }
    }
    character.frameCounter++;
}

// Função para desenhar o personagem e obstáculos
function draw() {
    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar o personagem
    ctx.drawImage(character.images[character.currentFrame], character.x, character.y, character.width, character.height);

    // Desenhar obstáculos (policeCars e stoves)
    policeCars.forEach((car) => {
        ctx.drawImage(car.image, car.x, car.y, car.width, car.height);
    });

    stoves.forEach((stove) => {
        ctx.drawImage(stove.image, stove.x, stove.y, stove.width, stove.height);
    });
}

// Função para manipular a física e o movimento do personagem
function update() {
    if (gameOver || !gameStarted) return;

    // Aplicar gravidade ao personagem
    character.dy += gravity;
    character.y += character.dy;

    // Limitar o personagem ao chão
    if (character.y > groundLevel - character.height) {
        character.y = groundLevel - character.height;
        character.isJumping = false;
        character.dy = 0;
    }

    // Atualizar sprites e desenhar
    updateCharacterSprite();
    draw();

    // Atualizar a posição dos obstáculos
    updateObstacles();

    requestAnimationFrame(update);
}

// Função para gerar obstáculos aleatórios
function spawnObstacles() {
    // Gera carros de polícia
    setInterval(() => {
        if (!gameStarted) return; // Impedir a geração de obstáculos antes do início do jogo
        const policeCar = {
            x: canvas.width,
            y: groundLevel - canvas.height * 0.1,
            width: canvas.width * 0.1, // Ajuste para 10% da largura do canvas
            height: canvas.height * 0.1, // Ajuste para 10% da altura do canvas
            speed: 7,
            image: new Image(),
        };
        policeCar.image.src = 'police.png';
        policeCars.push(policeCar);
    }, 3000); // Gera um carro de polícia a cada 3 segundos

    // Gera fogões
    setInterval(() => {
        if (!gameStarted) return; // Impedir a geração de obstáculos antes do início do jogo
        const stove = {
            x: canvas.width,
            y: groundLevel - canvas.height * 0.2, // Ajuste para estar mais visível acima do chão
            width: canvas.width * 0.08, // Ajuste para 8% da largura do canvas
            height: canvas.height * 0.1, // Ajuste para 10% da altura do canvas
            speed: 4,
            image: new Image(),
        };
        stove.image.src = 'stove.png';
        stoves.push(stove);
    }, 5000); // Gera um fogão a cada 5 segundos
}

// Função para atualizar a posição dos obstáculos
function updateObstacles() {
    policeCars.forEach((car, index) => {
        car.x -= car.speed;
        if (car.x + car.width < 0) {
            policeCars.splice(index, 1); // Remove o carro de polícia quando sai da tela
        }
    });

    stoves.forEach((stove, index) => {
        stove.x -= stove.speed;
        if (stove.x + stove.width < 0) {
            stoves.splice(index, 1); // Remove o fogão quando sai da tela
        }
    });
}

// Função para manipular o pulo
function handleJump() {
    if (!character.isJumping) {
        character.dy = jumpHeight;
        character.isJumping = true;
        jumpSound.play();
    }
}

// Função para reiniciar o jogo
function resetGame() {
    gameOver = false;
    gameStarted = true;
    score = 0;
    character.y = groundLevel - character.height;
    hideGameOverScreen(); // Esconde a tela de game over ao reiniciar
    backgroundMusic.play();
    update();
}

// Função para esconder a tela de "Game Over"
function hideGameOverScreen() {
    document.getElementById('game-over').classList.add('hidden');
}

// Adicionar eventos de clique para os botões de início e reinício
document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('restart-button').addEventListener('click', resetGame);

// Adicionar eventos de toque e teclado
window.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleJump();
    }
});
