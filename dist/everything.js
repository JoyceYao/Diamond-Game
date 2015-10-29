var playersMap = {};
var gameLogic;
(function (gameLogic) {
    /** Map playerIdx with player color */
    function initialPLayersMap() {
        playersMap[0] = 'R';
        playersMap[1] = 'G';
        playersMap[2] = 'Y';
    }
    gameLogic.initialPLayersMap = initialPLayersMap;
    /** Returns the initial TicTacToe board, which is a 3x3 matrix containing ''.  */
    function getInitialBoard(playerNo) {
        switch (playerNo) {
            case 2:
                return [['#', '#', '#', '#', '#', '#', '#', '#', '#', '', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                    ['#', '#', '#', '#', '#', '#', '#', '#', '', '', '', '#', '#', '#', '#', '#', '#', '#', '#'],
                    ['#', '#', '#', '#', '#', '#', '#', '', '', '', '', '', '#', '#', '#', '#', '#', '#', '#'],
                    ['', '', '', '', '', '', '', '', '', '', '', '', 'G', '', 'G', '', 'G', '', 'G'],
                    ['#', '', '', '', '', '', '', '', '', '', '', '', '', 'G', '', 'G', '', 'G', '#'],
                    ['#', '#', '', '', '', '', '', '', '', '', '', '', '', '', 'G', '', 'G', '#', '#'],
                    ['#', '#', '#', '', '', '', '', '', '', '', '', '', '', '', '', 'G', '#', '#', '#'],
                    ['#', '#', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#', '#'],
                    ['#', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#'],
                    ['', '', '', '', '', '', 'R', '', 'R', '', 'R', '', 'R', '', '', '', '', '', ''],
                    ['#', '#', '#', '#', '#', '#', '#', 'R', '', 'R', '', 'R', '#', '#', '#', '#', '#', '#', '#'],
                    ['#', '#', '#', '#', '#', '#', '#', '#', 'R', '', 'R', '#', '#', '#', '#', '#', '#', '#', '#'],
                    ['#', '#', '#', '#', '#', '#', '#', '#', '#', 'R', '#', '#', '#', '#', '#', '#', '#', '#', '#']];
            case 3:
                return [['#', '#', '#', '#', '#', '#', '#', '#', '#', '', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                    ['#', '#', '#', '#', '#', '#', '#', '#', '', '', '', '#', '#', '#', '#', '#', '#', '#', '#'],
                    ['#', '#', '#', '#', '#', '#', '#', '', '', '', '', '', '#', '#', '#', '#', '#', '#', '#'],
                    ['Y', '', 'Y', '', 'Y', '', 'Y', '', '', '', '', '', 'G', '', 'G', '', 'G', '', 'G'],
                    ['#', 'Y', '', 'Y', '', 'Y', '', '', '', '', '', '', '', 'G', '', 'G', '', 'G', '#'],
                    ['#', '#', 'Y', '', 'Y', '', '', '', '', '', '', '', '', '', 'G', '', 'G', '#', '#'],
                    ['#', '#', '#', 'Y', '', '', '', '', '', '', '', '', '', '', '', 'G', '#', '#', '#'],
                    ['#', '#', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#', '#'],
                    ['#', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#'],
                    ['', '', '', '', '', '', 'R', '', 'R', '', 'R', '', 'R', '', '', '', '', '', ''],
                    ['#', '#', '#', '#', '#', '#', '#', 'R', '', 'R', '', 'R', '#', '#', '#', '#', '#', '#', '#'],
                    ['#', '#', '#', '#', '#', '#', '#', '#', 'R', '', 'R', '#', '#', '#', '#', '#', '#', '#', '#'],
                    ['#', '#', '#', '#', '#', '#', '#', '#', '#', 'R', '#', '#', '#', '#', '#', '#', '#', '#', '#']];
            default: throw new Error("illegal Player Number: expect 2 or 3");
        }
    }
    gameLogic.getInitialBoard = getInitialBoard;
    /**
     * Return the winner (either 'X' or 'O') or '' if there is no winner.
     * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
     * E.g., getWinner returns 'X' for the following board:
     *     [['X', 'O', ''],
     *      ['X', 'O', ''],
     *      ['X', '', '']]
     */
    function getWinner(board) {
        var boardString = '';
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[0].length; j++) {
                var cell = board[i][j];
                boardString += cell === '' ? ' ' : cell;
            }
        }
        var win_patterns = [
            '#########R#########' +
                '########R R########' +
                '#######R R R#######' +
                '. . . R R R R . . .' +
                '#. . . . . . . . .#' +
                '##. . . . . . . .##' +
                '###. . . . . . .###' +
                '##. . . . . . . .##' +
                '#. . . . . . . . .#' +
                '. . . . . . . . . .' +
                '#######. . .#######' +
                '########. .########' +
                '#########.#########',
            '#########.#########' +
                '########. .########' +
                '#######. . .#######' +
                '. . . . . . . . . .' +
                '#. . . . . . . . .#' +
                '##. . . . . . . .##' +
                '###G . . . . . .###' +
                '##G G . . . . . .##' +
                '#G G G . . . . . .#' +
                'G G G G . . . . . .' +
                '#######. . .#######' +
                '########. .########' +
                '#########.#########',
            '#########.#########' +
                '########. .########' +
                '#######. . .#######' +
                '. . . . . . . . . .' +
                '#. . . . . . . . .#' +
                '##. . . . . . . .##' +
                '###. . . . . . Y###' +
                '##. . . . . . Y Y##' +
                '#. . . . . . Y Y Y#' +
                '. . . . . . Y Y Y Y' +
                '#######. . .#######' +
                '########. .########' +
                '#########.#########'
        ];
        for (i = 0; i < win_patterns.length; i++) {
            var win_pattern = win_patterns[i];
            var regexp = new RegExp(win_pattern);
            if (regexp.test(boardString)) {
                return playersMap[i];
            }
        }
        return '';
    }
    /**
     * Returns all the possible moves for the given board and turnIndexBeforeMove.
     * Returns an empty array if the game is over.
     */
    function getPossibleMoves(board, turnIndexBeforeMove, delta) {
        var possibleMoves = [];
        var adjPosition = [[0, -2], [-1, -1], [-1, 1], [0, 2], [1, -1], [1, 1]];
        var possibleMoveBoard = angular.copy(board);
        for (var i = 0; i < adjPosition.length; i++) {
            var nextRow = delta.rowS + adjPosition[i][0];
            var nextCol = delta.colS + adjPosition[i][1];
            var nextDalta = { rowS: delta.rowS, colS: delta.colS, rowE: nextRow, colE: nextCol, playerNo: delta.playerNo };
            try {
                possibleMoves.push(createMove(board, turnIndexBeforeMove, nextDalta));
                markAsVisited(possibleMoveBoard, nextRow, nextCol);
            }
            catch (e) {
            }
        }
        try {
            var jumpMoves = getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, delta, delta.rowS, delta.colS);
            if (jumpMoves) {
                possibleMoves.push.apply(possibleMoves, jumpMoves);
            }
        }
        catch (e) { }
        //console.log("getPossibleMoves possibleMoves[2]=" + JSON.stringify(possibleMoves));
        return possibleMoves;
    }
    gameLogic.getPossibleMoves = getPossibleMoves;
    /** Returns all possible moves from jumping move*/
    function getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, delta, originalRow, originalCol) {
        var possibleMoves = [];
        var rowS = delta.rowE;
        var colS = delta.colE;
        for (var i = 0; i < adjPosition.length; i++) {
            var nextRow = rowS + adjPosition[i][0];
            var nextCol = colS + adjPosition[i][1];
            try {
                if (isOccupied(board, nextRow, nextCol)) {
                    var jumpRow = rowS + adjPosition[i][0] * 2;
                    var jumpCol = colS + adjPosition[i][1] * 2;
                    var nextDelta = { rowS: originalRow, colS: originalCol, rowE: jumpRow, colE: jumpCol, playerNo: delta.playerNo };
                    var move = createMove(possibleMoveBoard, turnIndexBeforeMove, nextDelta);
                    if (move) {
                        possibleMoves.push(move);
                        markAsVisited(possibleMoveBoard, jumpRow, jumpCol);
                        var nextMove = getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, nextDelta, originalRow, originalCol);
                        if (nextMove.length > 0) {
                            possibleMoves.push.apply(possibleMoves, nextMove);
                        }
                    }
                }
            }
            catch (e) { }
        }
        //console.log("getPossibleJumpMoves possibleMoves[2]=" + JSON.stringify(possibleMoves));
        return possibleMoves;
    }
    gameLogic.getPossibleJumpMoves = getPossibleJumpMoves;
    /** Add an '@' mark onto the board representing the position had been visited*/
    function markAsVisited(board, row, col) {
        board[row][col] = '@';
    }
    /** Check if this position is occupied by a piece */
    function isOccupied(board, row, col) {
        if (board[row][col] === 'R' || board[row][col] === 'G' || board[row][col] === 'Y') {
            return true;
        }
        return false;
    }
    function replaceAll(board, replaceFrom, replaceTo) {
        var resultBoard = angular.copy(board);
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[0].length; j++) {
                if (resultBoard[i][j] === replaceFrom) {
                    resultBoard[i][j] = replaceTo;
                }
            }
        }
        return resultBoard;
    }
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     */
    function createMove(board, turnIndexBeforeMove, delta) {
        if (!board) {
            // Initially (at the beginning of the match), the board in state is undefined.
            throw new Error("Board doesn't initial normally");
        }
        var rowS = delta.rowS;
        var colS = delta.colS;
        var rowE = delta.rowE;
        var colE = delta.colE;
        var playerNo = delta.playerNo;
        if (!playersMap[turnIndexBeforeMove]) {
            initialPLayersMap();
        }
        if (rowS < 0 || colS < 0 || rowS >= board.length || colS >= board[0].length ||
            rowE < 0 || colE < 0 || rowE >= board.length || colE >= board[0].length ||
            board[rowS][colS] === '#' || board[rowE][colE] === '#') {
            throw new Error("Exceed board range");
        }
        if (board[rowE][colE] !== '') {
            throw new Error("One can only make a move in an empty position!");
        }
        if (getWinner(board) !== '') {
            throw new Error("Can only make a move if the game is not over!");
        }
        var boardAfterMove = replaceAll(board, '@', '');
        boardAfterMove[rowS][colS] = '';
        boardAfterMove[rowE][colE] = playersMap[turnIndexBeforeMove];
        var winner = getWinner(boardAfterMove);
        var firstOperation;
        if (winner !== '') {
            // Game over.
            firstOperation = { endMatch: { endMatchScores: [winner === playersMap[0] ? 1 : 0, winner === playersMap[1] ? 1 : 0, winner === playersMap[2] ? 1 : 0] } };
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            firstOperation = { setTurn: { turnIndex: (turnIndexBeforeMove + 1) % playerNo } };
        }
        return [firstOperation,
            { set: { key: 'board', value: boardAfterMove } },
            { set: { key: 'delta', value: delta } }];
    }
    gameLogic.createMove = createMove;
    //test commit
    function isMoveOk(params) {
        var move = params.move;
        var turnIndexBeforeMove = params.turnIndexBeforeMove;
        var stateBeforeMove = params.stateBeforeMove;
        // The state and turn after move are not needed in TicTacToe (or in any game where all state is public).
        //var turnIndexAfterMove = params.turnIndexAfterMove;
        //var stateAfterMove = params.stateAfterMove;
        // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
        // to verify that move is legal.
        try {
            // Example move:
            // [{setTurn: {turnIndex : 1},
            //  {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
            //  {set: {key: 'delta', value: {row: 0, col: 0}}}]
            var deltaValue = move[2].set.value;
            var board = stateBeforeMove.board;
            var playerNo = deltaValue.playerNo;
            var expectedMove = createMove(board, turnIndexBeforeMove, deltaValue);
            if (!angular.equals(move, expectedMove)) {
                return false;
            }
        }
        catch (e) {
            // if there are any exceptions then the move is illegal
            return false;
        }
        return true;
    }
    gameLogic.isMoveOk = isMoveOk;
})(gameLogic || (gameLogic = {}));
;var game;
(function (game) {
    var animationEnded = false;
    var canMakeMove = false;
    var isComputerTurn = false;
    var lastUpdateUI = null;
    var state = null;
    game.isHelpModalShown = false;
    function init() {
        console.log("Translation of 'RULES_OF_TICTACTOE' is " + translate('RULES_OF_TICTACTOE'));
        resizeGameAreaService.setWidthToHeight(1);
        gameService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 3,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI
        });
        // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
        document.addEventListener("animationend", animationEndedCallback, false); // standard
        document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
        document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
    }
    game.init = init;
    function animationEndedCallback() {
        $rootScope.$apply(function () {
            log.info("Animation ended");
            animationEnded = true;
            if (isComputerTurn) {
                sendComputerMove();
            }
        });
    }
    function sendComputerMove() {
        gameService.makeMove(aiService.findComputerMove(lastUpdateUI));
    }
    function updateUI(params) {
        animationEnded = false;
        lastUpdateUI = params;
        state = params.stateAfterMove;
        if (!state.board) {
            state.board = gameLogic.getInitialBoard(state.delta.playerNo);
        }
        canMakeMove = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        // Is it the computer's turn?
        isComputerTurn = canMakeMove &&
            params.playersInfo[params.yourPlayerIndex].playerId === '';
        if (isComputerTurn) {
            // To make sure the player won't click something and send a move instead of the computer sending a move.
            canMakeMove = false;
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            if (!state.delta) {
                // This is the first move in the match, so
                // there is not going to be an animation, so
                // call sendComputerMove() now (can happen in ?onlyAIs mode)
                sendComputerMove();
            }
        }
    }
    function cellClicked(row, col) {
        log.info(["Clicked on cell:", row, col]);
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!canMakeMove) {
            return;
        }
        try {
            var delta = { rowS: row, colS: col, rowE: 0, colE: 0, playerNo: state.delta.playerNo };
            var move = gameLogic.createMove(state.board, turnIndex, delta);
            canMakeMove = false; // to prevent making another move
            gameService.makeMove(move);
        }
        catch (e) {
            log.info(["Cell is already full in position:", row, col]);
            return;
        }
    }
    game.cellClicked = cellClicked;
    function shouldShowImage(row, col) {
        var cell = state.board[row][col];
        return cell !== "";
    }
    game.shouldShowImage = shouldShowImage;
    function isPieceX(row, col) {
        return state.board[row][col] === 'X';
    }
    game.isPieceX = isPieceX;
    function isPieceO(row, col) {
        return state.board[row][col] === 'O';
    }
    game.isPieceO = isPieceO;
    function shouldSlowlyAppear(row, col) {
        return !animationEnded &&
            state.delta &&
            state.delta.rowE === row && state.delta.colE === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap'])
    .run(['initGameServices', function (initGameServices) {
        $rootScope['game'] = game;
        translate.setLanguage('en', {
            RULES_OF_TICTACTOE: "Rules of TicTacToe",
            RULES_SLIDE1: "You and your opponent take turns to mark the grid in an empty spot. The first mark is X, then O, then X, then O, etc.",
            RULES_SLIDE2: "The first to mark a whole row, column or diagonal wins.",
            CLOSE: "Close"
        });
        game.init();
    }]);
;var aiService;
(function (aiService) {
    /**
     * Returns the move that the computer player should do for the given board.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    function createComputerMove(board, steps, playerNo, playerIndex) {
        // We use alpha-beta search, where the search states are TicTacToe moves.
        // Recal that a TicTacToe move has 3 operations:
        // 0) endMatch or setTurn
        // 1) {set: {key: 'board', value: ...}}
        // 2) {set: {key: 'delta', value: ...}}]
        return getBestMove(board, steps, playerNo, playerIndex);
    }
    aiService.createComputerMove = createComputerMove;
    function getBestMove(board, steps, playerNo, playerIndex) {
        gameLogic.initialPLayersMap();
        // The distance that reduced, the larger the better
        var maxDist = 0;
        var bestDelta;
        var deltaList = [];
        var myPieces = getMyPiecePosition(board, playerIndex);
        var stateList = getBoardListAfterNSteps(board, deltaList, myPieces, steps, playerNo, playerIndex);
        /* for each move result, calculate the distance reduced by the movement,
          choose the move that reduce the most distance */
        for (var i = 0; i < stateList.length; i++) {
            var thisDist = 0;
            var thisBoard = stateList[i].board;
            var thisDeltaList = stateList[i].deltaList;
            for (var j = 0; j < thisDeltaList.length; j++) {
                var thisDelta = thisDeltaList[j];
                var dist = getRowDiff(thisDelta.rowS, thisDelta.colS, thisDelta.rowE, thisDelta.colE, playerIndex);
                thisDist += dist;
            }
            if (thisDist > maxDist) {
                maxDist = thisDist;
                bestDelta = thisDeltaList[0];
            }
        }
        var myMove = gameLogic.createMove(board, playerIndex, bestDelta);
        return myMove;
    }
    /* return the final board state and movement history by N steps */
    function getBoardListAfterNSteps(board, deltaList, myPieces, steps, playerNo, playerIndex) {
        if (steps == 0) {
            return [{ board: board, deltaList: angular.copy(deltaList) }];
        }
        var result = [];
        for (var i = 0; i < myPieces.length; i++) {
            var row = myPieces[i][0];
            var col = myPieces[i][1];
            var allMoves = gameLogic.getPossibleMoves(board, playerIndex, { rowS: row, colS: col, rowE: row, colE: col, playerNo: playerNo });
            for (var j = 0; j < allMoves.length; j++) {
                var thisMove = allMoves[j];
                var nextBoard = thisMove[1].set.value;
                var nextDelta = thisMove[2].set.value;
                // if the move is going backward, don't consider next step
                if (getRowDiff(nextDelta.rowS, nextDelta.colS, nextDelta.rowE, nextDelta.colE, playerIndex) < 0) {
                    continue;
                }
                var nextMyPieces = angular.copy(myPieces);
                nextMyPieces.splice(i, 1);
                nextMyPieces.push([nextDelta.rowE, nextDelta.colE]);
                deltaList.push(nextDelta);
                var thisResult = getBoardListAfterNSteps(nextBoard, deltaList, nextMyPieces, steps - 1, playerNo, playerIndex);
                if (thisResult) {
                    result.push.apply(result, thisResult);
                }
                // remove last element for next recursion
                deltaList.splice(-1, 1);
            }
        }
        return result;
    }
    /* return the location of all pieces of this player */
    function getMyPiecePosition(board, playerIndex) {
        var myColor = playersMap[playerIndex];
        var result = [];
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[0].length; j++) {
                if (board[i][j] == myColor) {
                    result.push([i, j]);
                }
            }
        }
        return result;
    }
    /* calculate the row diff in this move */
    function getRowDiff(rowS, colS, rowE, colE, playerIndex) {
        var startRow = parseInt(rowNoByPlayer[playerIndex][rowS][colS]);
        var endRow = parseInt(rowNoByPlayer[playerIndex][rowE][colE]);
        return startRow - endRow;
    }
    /* representing the prefer move direction for each player, 9-12 -> start area, 0-3 -> target area */
    var rowNoByPlayer = [[['#', '#', '#', '#', '#', '#', '#', '#', '#', '0', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '1', '', '1', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '2', '', '2', '', '2', '#', '#', '#', '#', '#', '#', '#'],
            ['6', '', '5', '', '4', '', '3', '', '3', '', '3', '', '3', '', '4', '', '5', '', '6'],
            ['#', '6', '', '5', '', '4', '', '4', '', '4', '', '4', '', '4', '', '5', '', '6', '#'],
            ['#', '#', '6', '', '5', '', '5', '', '5', '', '5', '', '5', '', '5', '', '6', '#', '#'],
            ['#', '#', '#', '6', '', '6', '', '6', '', '6', '', '6', '', '6', '', '6', '#', '#', '#'],
            ['#', '#', '8', '', '7', '', '7', '', '7', '', '7', '', '7', '', '7', '', '8', '#', '#'],
            ['#', '10', '', '9', '', '8', '', '8', '', '8', '', '8', '', '8', '', '9', '', '10', '#'],
            ['12', '', '11', '', '10', '', '9', '', '9', '', '9', '', '9', '', '10', '', '11', '', '12'],
            ['#', '#', '#', '#', '#', '#', '#', '10', '', '10', '', '10', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '11', '', '11', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '12', '#', '#', '#', '#', '#', '#', '#', '#', '#']],
        [['#', '#', '#', '#', '#', '#', '#', '#', '#', '12', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '10', '', '11', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '8', '', '9', '', '10', '#', '#', '#', '#', '#', '#', '#'],
            ['6', '', '6', '', '6', '', '6', '', '7', '', '8', '', '9', '', '10', '', '11', '', '12'],
            ['#', '5', '', '5', '', '5', '', '6', '', '7', '', '8', '', '9', '', '10', '', '11', '#'],
            ['#', '#', '4', '', '4', '', '5', '', '6', '', '7', '', '8', '', '9', '', '10', '#', '#'],
            ['#', '#', '#', '3', '', '4', '', '5', '', '6', '', '7', '', '8', '', '9', '#', '#', '#'],
            ['#', '#', '2', '', '3', '', '4', '', '5', '', '6', '', '7', '', '8', '', '10', '#', '#'],
            ['#', '1', '', '2', '', '3', '', '4', '', '5', '', '6', '', '7', '', '9', '', '11', '#'],
            ['0', '', '1', '', '2', '', '3', '', '4', '', '5', '', '6', '', '8', '', '10', '', '12'],
            ['#', '#', '#', '#', '#', '#', '#', '4', '', '5', '', '6', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '5', '', '6', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '6', '#', '#', '#', '#', '#', '#', '#', '#', '#']],
        [['#', '#', '#', '#', '#', '#', '#', '#', '#', '12', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '11', '', '10', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '10', '', '9', '', '8', '#', '#', '#', '#', '#', '#', '#'],
            ['12', '', '11', '', '10', '', '9', '', '8', '', '7', '', '6', '', '6', '', '6', '', '6'],
            ['#', '11', '', '10', '', '9', '', '8', '', '7', '', '6', '', '5', '', '5', '', '5', '#'],
            ['#', '#', '10', '', '9', '', '8', '', '7', '', '6', '', '5', '', '4', '', '4', '#', '#'],
            ['#', '#', '#', '9', '', '8', '', '7', '', '6', '', '5', '', '4', '', '3', '#', '#', '#'],
            ['#', '#', '10', '', '8', '', '7', '', '6', '', '5', '', '4', '', '3', '', '2', '#', '#'],
            ['#', '11', '', '9', '', '7', '', '6', '', '5', '', '4', '', '3', '', '2', '', '1', '#'],
            ['12', '', '10', '', '8', '', '6', '', '5', '', '4', '', '3', '', '2', '', '1', '', '0'],
            ['#', '#', '#', '#', '#', '#', '#', '6', '', '5', '', '4', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '6', '', '5', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '6', '#', '#', '#', '#', '#', '#', '#', '#', '#']]];
})(aiService || (aiService = {}));
