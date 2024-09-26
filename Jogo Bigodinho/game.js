const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Função para redimensionar o canvas baseado na tela
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;  // Ajusta o canvas para 90% da largura da tela
    canvas.height = window.innerHeight * 0.7;  // Ajusta o canvas para 80% da altura da tela
}

// Inicializa o tamanho do canvas
resizeCanvas();

let gravity = 0.4;
let jumpHeight = -15;
let score = 0;
let gameOver = false;
let fastFall = false;  // Estado de queda rápida
const groundLevel = canvas.height * 0.8;  // Define o nível do chão como 80% da altura do canvas

const character = {
    x: canvas.width * 0.1,
    y: groundLevel - canvas.height * 0.1,  // O personagem fica alinhado ao chão
    width: canvas.width * 0.07,  // Reduzi o tamanho do personagem para 7% da largura do canvas
    height: canvas.height * 0.1,  // Personagem será 10% da altura do canvas
    dy: 0,
    isJumping: false,
    isLanding: false,
    isIdle: false,
    images: {
        idle: new Image(),
        walk1: new Image(),
        walk2: new Image(),
        midAir: new Image(),
        landing: new Image(),
    },
    currentFrame: 'idle',
    frameCounter: 0,
};

// Carregar os sprites do personagem
character.images.idle.src = 'char_idle.png';
character.images.walk1.src = 'char_walk1.png';
character.images.walk2.src = 'char_walk2.png';
character.images.midAir.src = 'char_mid_air.png';
character.images.landing.src = 'char_landing.png';

const policeCars = [];
const stoves = [];
const jumpSound = document.getElementById('jump-sound');
const pointSound = document.getElementById('point-sound');
const gameOverSound = document.getElementById('game-over-sound');
const backgroundMusic = document.getElementById('background-music');

backgroundMusic.play();

// Função para atualizar os sprites do personagem
function updateCharacterSprite() {
    if (character.isJumping) {
        character.currentFrame = 'midAir';
    } else if (character.isLanding) {
        character.currentFrame = 'landing';
        setTimeout(() => {
            character.isLanding = false;
        }, 100);
    } else if (character.isIdle) {
        character.currentFrame = 'idle';
    } else {
        if (character.frameCounter % 10 < 5) {
            character.currentFrame = 'walk1';
        } else {
            character.currentFrame = 'walk2';
        }
    }
    character.frameCounter++;
}

// Função para gerar carros de polícia com velocidade e posição aleatória
function spawnPoliceCar() {
    const policeCar = {
        x: canvas.width,
        y: groundLevel - canvas.height * 0.085,  // Carro de polícia no nível do chão
        width: canvas.width * 0.30,  // Carro será 30% da largura do canvas
        height: canvas.height * 0.08,  // Carro será 8% da altura do canvas
        speed: 5 + Math.random() * 2,  // Velocidade aleatória entre 5 e 7
        image: new Image(),
    };
    policeCar.image.src = 'police.png';
    policeCars.push(policeCar);
}

// Função para gerar fogões
function spawnStove() {
    const stove = {
        x: canvas.width,
        y: groundLevel - canvas.height * 0.45,  // O fogão estará um pouco acima do nível do chão
        width: canvas.width * 0.18,  // Fogão será 8% da largura do canvas
        height: canvas.height * 0.1,  // Fogão será 10% da altura do canvas
        speed: 3,  // Os fogões terão uma velocidade mais lenta
        image: new Image(),
    };
    stove.image.src = 'stove.png';
    stoves.push(stove);
}

// Função para manipular o pulo do personagem
function handleJump() {
    if (!character.isJumping) {
        character.dy = jumpHeight;
        character.isJumping = true;
        jumpSound.play();
    }
}

// Função para acelerar a queda do personagem
function handleFastFall() {
    if (character.isJumping) {
        fastFall = true;
    }
}

// Função para verificar colisões
function handleCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// Função principal de atualização
function update() {
    if (gameOver) return;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Física do personagem
    if (fastFall) {
        character.dy += gravity * 5;  // Acelera a queda
    } else {
        character.dy += gravity;
    }
    character.y += character.dy;

    // Limita o personagem ao nível do chão
    if (character.y > groundLevel - character.height) {
        character.y = groundLevel - character.height;
        if (character.isJumping) {
            character.isLanding = true;
        }
        character.isJumping = false;
        fastFall = false;  // Reseta o estado de queda rápida ao tocar o chão
    }

    // Atualiza o sprite do personagem
    updateCharacterSprite();

    // Desenha o personagem
    ctx.drawImage(character.images[character.currentFrame], character.x, character.y, character.width, character.height);

    // Move e desenha os carros de polícia
    policeCars.forEach((policeCar, index) => {
        policeCar.x -= policeCar.speed;
        if (policeCar.x + policeCar.width < 0) {
            policeCars.splice(index, 1);  // Remove carros fora da tela
        }

        ctx.drawImage(policeCar.image, policeCar.x, policeCar.y, policeCar.width, policeCar.height);

        // Verifica colisão
        if (handleCollision(character, policeCar)) {
            gameOver = true;
            gameOverSound.play();
            document.getElementById('score').textContent = score;
            document.getElementById('game-over').style.display = 'block';
            backgroundMusic.pause();
        }
    });

    // Move e desenha os fogões
    stoves.forEach((stove, index) => {
        stove.x -= stove.speed;
        if (stove.x + stove.width < 0) {
            stoves.splice(index, 1);  // Remove fogões fora da tela
        }

        ctx.drawImage(stove.image, stove.x, stove.y, stove.width, stove.height);

        // Verifica se o personagem pousou no fogão
        if (handleCollision(character, stove)) {
            score += 1;
            pointSound.play();
            stoves.splice(index, 1);
        }
    });

    requestAnimationFrame(update);
}

// Função para reiniciar o jogo
function resetGame() {
    policeCars.length = 0;
    stoves.length = 0;
    score = 0;
    gameOver = false;
    character.y = groundLevel - character.height;
    backgroundMusic.play();
    document.getElementById('game-over').style.display = 'none';
    update();
}

// Gera carros de polícia de forma aleatória (entre 2 a 5 segundos)
function spawnRandomPoliceCar() {
    spawnPoliceCar();
    const randomTime = Math.random() * 3000 + 2000;  // Entre 2 a 5 segundos
    setTimeout(spawnRandomPoliceCar, randomTime);
}

// Gera fogões a cada 4 segundos
setInterval(spawnStove, 4000);

// Eventos de teclado e toque para o pulo e queda rápida
window.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleJump();
    } else if (e.code === 'ArrowDown') {
        handleFastFall();
    }
});

// Adiciona eventos de toque para dispositivos móveis (pulo e queda rápida)
canvas.addEventListener('touchstart', function () {
    if (!character.isJumping) {
        handleJump();
    } else {
        handleFastFall();
    }
});

document.getElementById('restart-button').addEventListener('click', resetGame);

// Garante que o canvas seja redimensionado corretamente
window.addEventListener('resize', resizeCanvas);

// Inicia o jogo e começa a gerar carros aleatórios
update();
spawnRandomPoliceCar();