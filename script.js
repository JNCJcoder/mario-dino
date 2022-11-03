(function () {
    /** @type {HTMLCanvasElement} */
    const canvas     = document.getElementById('canvas');
    const context    = canvas.getContext("2d");
    
    const SCREEN_WIDTH      = 600;
    const SCREEN_HEIGHT     = 150;
    const FPS               = 30;

    let timeNow     = 0;
    let timeThen    = 0;

    let spriteSheet;

    const GRAVITY       = 1.6;
    const SPEED         = 8;
    const HALF_SPEED    = SPEED / 2;
    const JUMP_FORCE    = 15.7;

    let animationTimer  = 0
    let enemyTimer      = 0;
    let score           = 0;
    let highScore       = 0;
    let local           = 0;
    let gameOver        = false;

    const BACKGROUND_TYPES = [
        "#75a5f9",
        "#000000",
        "#000000",
        "#000000"
    ];

    const CLOUD_TYPES = [
        { x: 0, y: 0 },  // Day Cloud
        { x: 48, y: 0 } // Night Cloud
    ];

    const FLOOR_TYPES = [
        { x: 0, y: 118 },   // DEFAULT
        { x: 0, y: 118 },   // NIGHT
        { x: 0, y: 134 }, 	// CAVE
        { x: 0, y: 103 }   	// CASTLE
    ];

    const CHARACTER_ANIMATION = [
        { x: 16, y: 71, width: 16, height: 32 },
        { x: 32, y: 71, width: 16, height: 32 },
        { x: 0,  y: 71, width: 16, height: 32 },
        { x: 48, y: 71, width: 16, height: 32 },
        { x: 64, y: 81, width: 16, height: 22 },
        { x: 80, y: 71, width: 16, height: 32 }
    ];

    const ENEMY_LIST = [
        { x: 96, y: 89, width: 16, height: 14 },  // Bullet Bill black
        { x: 128, y: 89, width: 16, height: 14 },  // Green Turle
        { x: 144, y: 89, width: 16, height: 14 },  // Red Turle
        { x: 112, y: 89, width: 16, height: 14 },   // Bullet Bill Grey
        { x: 160, y: 89, width: 16, height: 14 },  // Cave Turtle
        { x: 176, y: 95, width: 24 , height: 8 },  // Bowser Fire
        { x: 200, y: 95, width: 24 , height: 8 }   // Bowser Fire Animation (Animation only)
    ];

    const ENEMY_Y_LIST = [ 118, 98, 88 ];

    const cloud = {
        x: 600,
        y: 0,
        width: 48,
        height: 24,
        tile: 0
    }

    let enemys = [];

    const character = {
        x: 30,
        y: 103,
        width: 16,
        height: 32,
        speed: 0,
        animation: 5,
        jumping: false,
        ducking: false
    };

    const floor = {
        x: 0,
        y: SCREEN_HEIGHT - 16,
        width: 70,
        height: 16,
        tile: 0
    }

    const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);

    function drawAndUpdateMap()
    {
        if(score % 101 == 100)
        {
            let randomNumber = getRandomNumber(0, 4);
            while (local == randomNumber)
            {
                randomNumber = getRandomNumber(0, 4);
            }
    
            local = randomNumber;
            changeBackground(local);
        }

        if(local <= 1)
        {
            context.drawImage(
                spriteSheet,
                CLOUD_TYPES[cloud.tile].x,
                CLOUD_TYPES[cloud.tile].y,
                cloud.width,
                cloud.height,
                cloud.x,
                cloud.y,
                cloud.width,
                cloud.height,
            );
        }
            
        cloud.x -= HALF_SPEED; 
            
        if(cloud.x + cloud.width == 0)
        {
            cloud.x = 600 + getRandomNumber(0, 100);
            cloud.y = getRandomNumber(0, 25);
        }
            
        context.fillText(score, 530, 20, 140);
    
        if(highScore > 0)
        {
            context.fillText(`HI ${highScore}`, 430, 20, 140);
        }

        if(animationTimer == 0) score++;
    }
        
    function drawAndUpdateCharacter()
        {
        character.speed += GRAVITY;
        character.y += character.speed;

        if(animationTimer == 0)
        {
            if(!character.jumping && !character.ducking)
            {
                character.animation = (character.animation + 1) % 3;
            }
            else if(character.jumping)
            {
                character.animation = 3;
            }
            else if(character.ducking)
            {
                character.animation = 4;
            }
        }
        if (character.y > 134 - CHARACTER_ANIMATION[character.animation].height)
        {
            character.y = 134 - CHARACTER_ANIMATION[character.animation].height;
            character.speed = 0;
            character.jumping = false;
        }

        context.drawImage(
		    spriteSheet,
			CHARACTER_ANIMATION[character.animation].x,
			CHARACTER_ANIMATION[character.animation].y,
			CHARACTER_ANIMATION[character.animation].width,
			CHARACTER_ANIMATION[character.animation].height,
			character.x,
			character.y,
			CHARACTER_ANIMATION[character.animation].width,
			CHARACTER_ANIMATION[character.animation].height,
		);
    }

    function drawAndUpdateFloor()
    {
        floor.x += floor.x <= -30 ? 30 : -SPEED;

        context.drawImage(
		    spriteSheet,
			FLOOR_TYPES[floor.tile].x,
			FLOOR_TYPES[floor.tile].y,
			floor.width,
			floor.height,
			floor.x,
			floor.y,
			floor.width,
			floor.height,
		);

        context.drawImage(
		    spriteSheet,
			FLOOR_TYPES[floor.tile].x,
			FLOOR_TYPES[floor.tile].y,
			floor.width,
			floor.height,
			floor.x,
			floor.y,
			floor.width + 30,
			floor.height,
		);
    }

    function makeEnemy()
    {
        const choiceY = getRandomNumber(0, 2);

        let enemyType = 0;

        switch(local)
        {
            case 0: // Day
                enemyType = (choiceY == 0) ? getRandomNumber(0, 2) : 0;
            break;
            
            case 1: // Night
                enemyType = (choiceY == 0) ? getRandomNumber(1, 3) : 3;
            break;

            case 2: // Cave
                enemyType = (choiceY == 0) ? getRandomNumber(3, 4) : 3;
            break;

            case 3: // Castle
                enemyType = (choiceY == 0) ? getRandomNumber(4, 5) : 5;
            break;
        }

        return {
            x: SCREEN_WIDTH + 50,
            y: ENEMY_Y_LIST[choiceY],
            tile: enemyType,
            animation: 0
        };
    }

    function drawAndUpdateEnemy(enemy)
    {
        enemy.x -= SPEED;
        if(enemy.tile == 5 && animationTimer == 0)
        {
            enemy.animation += 1;
            enemy.animation %= 2;
        }

        context.drawImage(
		    spriteSheet,
			ENEMY_LIST[enemy.tile + enemy.animation].x,
			ENEMY_LIST[enemy.tile + enemy.animation].y,
			ENEMY_LIST[enemy.tile + enemy.animation].width,
			ENEMY_LIST[enemy.tile + enemy.animation].height,
			enemy.x,
			enemy.y,
			ENEMY_LIST[enemy.tile + enemy.animation].width,
			ENEMY_LIST[enemy.tile + enemy.animation].height,
		);

        if (enemy.x < character.x + character.width &&
            enemy.x + ENEMY_LIST[enemy.tile].width > character.x &&
            enemy.y < character.y + character.height &&
            ENEMY_LIST[enemy.tile].height + enemy.y > character.y)
        {
            gameOver = true;
            return false;
        }

        return enemy.x <= -15 ? false : enemy;
    }

    function changeBackground(tile)
    {
        document.body.style.backgroundColor = BACKGROUND_TYPES[tile];
        cloud.tile = tile % 2;
        floor.tile = tile;
    }

    function reset()
    {
        // Cloud
        cloud.x = 600;
        cloud.y = 0;

        // Floor
        floor.x = 0;
		floor.width = SCREEN_WIDTH;

        // Character
        character.y = 103;
        character.height = 32;
        character.speed = 0;
        character.animation = 5;
        character.jumping = false;
        character.ducking = false;

        // Map
        context.fillText('Game Over', SCREEN_WIDTH / 2.5, SCREEN_HEIGHT / 2, 140);
        context.fillText(`Score: ${score}`, SCREEN_WIDTH / 2.5, SCREEN_HEIGHT / 1.5, 140);
        if(score > highScore)
        {
            localStorage.setItem('highscore', score);
            highScore = score;
        }
        score = 0;
        changeBackground(0);

        // Enemys
        enemys = [];
        enemyTimer = 0;
        animationTimer = 0;
    }

    function updateCanvas()
    {
        timeNow = Date.now();
        const elapsed = timeNow - timeThen;
    
        window.requestAnimationFrame(updateCanvas);
    
        if (!(elapsed > FPS)) return;
        if (gameOver) return;
    
        // Clear Screen
        context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // Map
        drawAndUpdateMap();

        // Character
        drawAndUpdateCharacter();

        // Floor
        drawAndUpdateFloor();

        // Enemy
        if(enemyTimer == 0 && enemys.length < 10) enemys.push(makeEnemy())
        enemys = enemys.filter(drawAndUpdateEnemy);

        // Game Over
        if (gameOver) reset();
        
        animationTimer = (animationTimer + 1) % 2;
        enemyTimer = (enemyTimer + getRandomNumber(1, 8)) % 40;
        timeThen = timeNow - (elapsed % FPS);
    }

    function handleKeyDown(event)
    {
        switch (event.key)
        {
            case "ArrowUp":      
                if(!character.jumping) character.speed = -JUMP_FORCE;
                character.jumping = true;
            break;
            case "ArrowDown":
                character.ducking   = true;
                character.height    = 13;
                if(character.jumping)
                {
                    character.jumping = false;
                    character.speed = JUMP_FORCE;
                }
            break;
            default:  break;
        }
        gameOver = false;
    }

    function handleKeyUp(event)
    {
        switch (event.key)
        {
            //case "ArrowUp":      character.jumping = false;   break;
            case "ArrowDown":
                character.ducking   = false;
                character.height    = 30;
            break;
            default:  break;
        }
    }

    function loadSpriteSheet(path)
    {
	    return new Promise((resolve) => {
		    const img = new Image();
		    img.onload = () => { resolve(img); };
            img.src = path;
	    });
    }

    async function init()
    {
        context.font = '25px Pixeboy';
        context.fillStyle = '#fff';

        spriteSheet = await loadSpriteSheet("assets/SpriteSheet.png");

        window.onkeydown    = handleKeyDown;
        window.onkeyup      = handleKeyUp;

        floor.width = SCREEN_WIDTH;

        highScore = localStorage.getItem('highscore') || 0;

        window.requestAnimationFrame(updateCanvas);
    }

    init();
})();
  