export function createInitialBoard() {
    const board = []
    for (let i = 0; i < 24; i++) {
        board.push({ owner: null, checkers: 0 })
    }
    board[23] = { owner: "white", checkers: 2 }
    board[12] = { owner: "white", checkers: 5 }
    board[7] = { owner: "white", checkers: 3 }
    board[5] = { owner: "white", checkers: 5 }
    board[0] = { owner: "black", checkers: 2 }
    board[11] = { owner: "black", checkers: 5 }
    board[16] = { owner: "black", checkers: 3 }
    board[18] = { owner: "black", checkers: 5 }
    return board
}

export function createInitialGameState() {
    const game = {
        board: createInitialBoard(),
        currentPlayer: "white",
        dice: [],
        remainingDice: [],
        bar: { white: 0, black: 0 },
        borneOff: { white: 0, black: 0 },
        status: "waiting-for-roll",
        winner: null
    }
    return game
}

export function rollDie() {
    return Math.floor(Math.random() * 6) + 1
}

export function calculateDestination(from, die, color) {
    return color === "white" ? from - die : from + die;
}

export function getBarDestination(die, color) {
    return color === "white" ? 24 - die : die - 1;
}

export function distanceToExit(index, color) {
    return color === "white" ? index + 1 : 24 - index;
}

export function startGame() {
    const game = createInitialGameState();
    let whiteDie;
    let blackDie;
    do {
        whiteDie = rollDie()
        blackDie = rollDie()
    } while (whiteDie === blackDie);
    if (whiteDie > blackDie) {
        game.currentPlayer = "white"
    }
    else { game.currentPlayer = "black" }
    game.dice = [whiteDie, blackDie]
    game.remainingDice = [whiteDie, blackDie]
    game.status = "waiting-for-move"
    return game
}

export function rollDice(game) {
    const die1 = rollDie();
    const die2 = rollDie();
    game.dice = [die1, die2];
    if (die1 === die2) game.remainingDice = [die1, die1, die2, die2];
    else { game.remainingDice = [die1, die2] }
    game.status = "waiting-for-move";
    return game;
}

export function isPointOpen(board, index, color) {
    if (index > 23 || index < 0) return false;
    const point = board[index]
    if (point.owner === null || point.owner === color || (point.owner !== color && point.checkers === 1)) {
        return true;
    }
    else {
        return false;
    }
}

export function canBearOff(game, color) {
    if (game.bar[color] > 0) return false;
    if (color === "white") {
        for (let i = 6; i <= 23; i++) {
            if (game.board[i].owner === "white" && game.board[i].checkers > 0) {
                return false;
            }
        }
    }
    if (color === "black") {
        for (let i = 0; i <= 17; i++) {
            if (game.board[i].owner === "black" && game.board[i].checkers > 0) {
                return false;
            }
        }
    }
    return true;
}

export function applyMove(game, move) {
    const color = game.currentPlayer;
    const opponent = color === "white" ? "black" : "white";
    const indexDie = game.remainingDice.indexOf(move.die)
    if (move.from === "bar") {
        game.bar[color] -= 1;
    } else {
        const moveFrom = game.board[move.from];
        moveFrom.checkers -= 1;
        if (moveFrom.checkers === 0) moveFrom.owner = null
    }
    if (move.to === "off") {
        game.borneOff[color] += 1;
    } else {
        const moveTo = game.board[move.to];
        if (moveTo.owner === opponent && moveTo.checkers === 1) {
            game.bar[opponent] += 1;
            moveTo.owner = color
            moveTo.checkers = 1
        } else {
            moveTo.owner = color;
            moveTo.checkers += 1
        }
    }
    if (indexDie !== -1) game.remainingDice.splice(indexDie, 1)
    if (game.borneOff[color] === 15) {
        game.status = "finished";
        game.winner = color
    }
    return game
}

function hasCheckerFarther(game, color, index) {
    if (color === "white") {
        for (let i = index + 1; i <= 5; i++) {
            if (game.board[i].owner === "white" && game.board[i].checkers > 0) return true;
        }
    }
    if (color === "black") {
        for (let i = 18; i < index; i++) {
            if (game.board[i].owner === "black" && game.board[i].checkers > 0) return true;
        }
    }
    return false
}

export function getLegalMoves(game) {
    const color = game.currentPlayer
    if (game.status !== "waiting-for-move" || game.remainingDice.length === 0) return [];
    const nuqieDice = [...new Set(game.remainingDice)];
    const lagelMoves = [];
    if (game.bar[color] > 0) {
        for (const die of nuqieDice) {
            const to = getBarDestination(die, color)
            if (isPointOpen(game.board, to, color)) {
                lagelMoves.push({ from: "bar", to, die })
            }
        }
        return lagelMoves
    }
    for (let i = 0; i < 24; i++) {
        if (game.board[i].owner === color && game.board[i].checkers > 0) {
            for (const die of nuqieDice) {
                const to = calculateDestination(i, die, color);
                if (to >= 0 && to <= 23 && isPointOpen(game.board, to, color)) {
                    lagelMoves.push({ from: i, to, die })
                }
                const canBear = canBearOff(game, color);
                if (canBear === true) {
                    const dist = distanceToExit(i, color);
                    if (die === dist || (die > dist && !hasCheckerFarther(game, color, i))) lagelMoves.push({ from: i, to: "off", die })
                }
            }
        }
    }
    return lagelMoves
}

export function checkAndSwitchTurn(game) {
    if (game.status === "finished") return game;
    if (game.remainingDice.length === 0 || getLegalMoves(game).length === 0) {
        game.remainingDice = [];
        game.dice = [];
        game.currentPlayer = game.currentPlayer === "white" ? "black" : "white";
        game.status = "waiting-for-roll";
    }
    return game;
}