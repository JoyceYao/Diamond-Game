var playersMap = {};
// use the start and end position as key, store all intermediate positions for this move
var movesHistoryMap = {};
var gameLogic;
(function (gameLogic) {
    /** Map playerIdx with player color */
    function initialPLayersMap() {
        playersMap[0] = 'R';
        playersMap[1] = 'G';
        playersMap[2] = 'Y';
    }
    gameLogic.initialPLayersMap = initialPLayersMap;
    function getPlayerColorById(playerId) {
        return playersMap[playerId];
    }
    gameLogic.getPlayerColorById = getPlayerColorById;
    function getMovesHistory(rowS, colS, rowE, colE) {
        var key = rowS + "_" + colS + "_" + rowE + "_" + colE;
        //console.log("getMovesHistory key=" + key);
        //console.log("getMovesHistory map=" + JSON.stringify(movesHistoryMap));
        return movesHistoryMap[key];
    }
    gameLogic.getMovesHistory = getMovesHistory;
    /* clear moveHistoryMap after animation */
    function clearMoveHistory() {
        movesHistoryMap = {};
    }
    gameLogic.clearMoveHistory = clearMoveHistory;
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
        //movesHistoryMap = {}; /* clear moveHistoryMap for new storage */
        //console.log("getPossibleMoves clear map!!");
        var possibleMoves = [];
        var adjPosition = [[0, -2], [-1, -1], [-1, 1], [0, 2], [1, -1], [1, 1]];
        var possibleMoveBoard = angular.copy(board);
        for (var i = 0; i < adjPosition.length; i++) {
            var nextRow = delta.rowS + adjPosition[i][0];
            var nextCol = delta.colS + adjPosition[i][1];
            var nextDalta = { rowS: delta.rowS, colS: delta.colS, rowE: nextRow, colE: nextCol, playerNo: delta.playerNo };
            try {
                possibleMoves.push(createMove(board, turnIndexBeforeMove, nextDalta));
                addMoveHistory([nextDalta]);
                markAsVisited(possibleMoveBoard, nextRow, nextCol);
            }
            catch (e) {
            }
        }
        try {
            var jumpMoves = getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, [delta], delta.rowS, delta.colS);
            if (jumpMoves) {
                possibleMoves.push.apply(possibleMoves, jumpMoves);
            }
        }
        catch (e) { }
        //console.log("getPossibleMoves[2] possibleMoves=" + JSON.stringify(possibleMoves));
        return possibleMoves;
    }
    gameLogic.getPossibleMoves = getPossibleMoves;
    /** Returns all possible moves from jumping move*/
    function getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, delta, originalRow, originalCol) {
        var possibleMoves = [];
        var thisDeltaIdx = delta.length - 1;
        var rowS = delta[thisDeltaIdx].rowE;
        var colS = delta[thisDeltaIdx].colE;
        for (var i = 0; i < adjPosition.length; i++) {
            var nextRow = rowS + adjPosition[i][0];
            var nextCol = colS + adjPosition[i][1];
            try {
                if (isOccupied(board, nextRow, nextCol)) {
                    var jumpRow = rowS + adjPosition[i][0] * 2;
                    var jumpCol = colS + adjPosition[i][1] * 2;
                    var nextDelta = { rowS: originalRow, colS: originalCol, rowE: jumpRow, colE: jumpCol, playerNo: delta[thisDeltaIdx].playerNo };
                    var move = createMove(possibleMoveBoard, turnIndexBeforeMove, nextDelta);
                    if (move) {
                        possibleMoves.push(move);
                        var nextDeltaList = angular.copy(delta);
                        nextDeltaList.push({ rowS: rowS, colS: colS, rowE: jumpRow, colE: jumpCol, playerNo: delta[thisDeltaIdx].playerNo });
                        // add to history map
                        addMoveHistory(nextDeltaList);
                        //console.log("getPossibleMoves delta=" + JSON.stringify(delta));
                        //console.log("getPossibleMoves nextDeltaList=" + JSON.stringify(nextDeltaList));
                        markAsVisited(possibleMoveBoard, jumpRow, jumpCol);
                        var nextMove = getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, nextDeltaList, originalRow, originalCol);
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
    function addMoveHistory(deltaList) {
        if (deltaList.length == 0) {
            return;
        }
        var rowS = deltaList[0].rowS;
        var colS = deltaList[0].colS;
        var rowE = deltaList[deltaList.length - 1].rowE;
        var colE = deltaList[deltaList.length - 1].colE;
        var key = rowS + "_" + colS + "_" + rowE + "_" + colE;
        //console.log("addMoveHistory key=" + key);
        var prevData = movesHistoryMap[key];
        // if the same move exists and with shorter path, return
        if (prevData && prevData.length <= deltaList.length) {
            return;
        }
        var newDeltaList = angular.copy(deltaList);
        // remove the first dummy delta
        if (newDeltaList.length > 1) {
            newDeltaList.splice(0, 1);
        }
        //console.log("addMoveHistory newDeltaList=" + JSON.stringify(newDeltaList));
        movesHistoryMap[key] = newDeltaList;
    }
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
        if (rowS < 0 || colS < 0 || rowS >= board.length || colS >= board[0].length ||
            rowE < 0 || colE < 0 || rowE >= board.length || colE >= board[0].length ||
            board[rowS][colS] === '#' || board[rowE][colE] === '#') {
            throw new Error("Exceed board range");
        }
        // row + col must be an odd value, otherwise the position is invalid
        if ((rowS + colS) % 2 === 0 || (rowE + colE) % 2 === 0) {
            throw new Error("Not a valid position");
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
            if (playerNo === 2) {
                firstOperation = { endMatch: { endMatchScores: [winner === playersMap[0] ? 1 : 0, winner === playersMap[1] ? 1 : 0] } };
            }
            else {
                firstOperation = { endMatch: { endMatchScores: [winner === playersMap[0] ? 1 : 0, winner === playersMap[1] ? 1 : 0, winner === playersMap[2] ? 1 : 0] } };
            }
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
            var deltaValue = move[2].set.value;
            var board = stateBeforeMove.board;
            if (!board) {
                board = getInitialBoard(deltaValue.playerNo);
            }
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
    var selectedPosition = null;
    var possibleMoves = [];
    var playerNo = 0;
    var playerId = -1;
    var gameArea = null;
    var rowsNum = 13;
    var colsNum = 19;
    var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
    var draggingPiece = null;
    var draggingStartPosi = null;
    var nextZIndex = 61;
    function init() {
        //console.log("Translation of 'RULES_OF_DIAMOND_GAME' is " + translate('RULES_OF_DIAMOND_GAME'));
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
        gameArea = document.getElementById("gameArea");
        console.log("gameArea=" + JSON.stringify(gameArea));
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
        gameLogic.initialPLayersMap();
        ////createRotationMapping();
    }
    game.init = init;
    function animationEndedCallback() {
        $rootScope.$apply(function () {
            log.info("Animation ended");
            animationEnded = true;
            gameLogic.clearMoveHistory();
            if (isComputerTurn) {
                sendComputerMove();
            }
        });
    }
    function sendComputerMove() {
        gameService.makeMove(aiService.findComputerMove(lastUpdateUI));
    }
    function updateUI(params) {
        console.log("updateUI[0]", angular.toJson(params));
        animationEnded = false;
        lastUpdateUI = params;
        playerNo = params.playersInfo.length;
        state = params.stateAfterMove;
        if (!state.board) {
            state.board = gameLogic.getInitialBoard(playerNo);
        }
        playerId = params.turnIndexAfterMove;
        console.log("updateUI[1] playerId=" + playerId);
        if (state.delta && params.playMode != "passAndPlay") {
            modifyMoveCSS(state.delta);
        }
        canMakeMove = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        // Is it the computer's turn?
        isComputerTurn = canMakeMove &&
            params.playersInfo[params.yourPlayerIndex].playerId === '';
        //rotateGameBoard(params);
        if (isComputerTurn) {
            // To make sure the player won't click something and send a move instead of the computer sending a move.
            canMakeMove = false;
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            //console.log("updateUI[3-1] state.delta=", state.delta);
            //if (!state.delta) {
            // This is the first move in the match, so
            // there is not going to be an animation, so
            // call sendComputerMove() now (can happen in ?onlyAIs mode)
            sendComputerMove();
        }
    }
    game.updateUI = updateUI;
    function isPieceRed(row, col) {
        return state.board[row][col] === 'R';
    }
    game.isPieceRed = isPieceRed;
    function isPieceGreen(row, col) {
        return state.board[row][col] === 'G';
    }
    game.isPieceGreen = isPieceGreen;
    function isPieceYellow(row, col) {
        return state.board[row][col] === 'Y';
    }
    game.isPieceYellow = isPieceYellow;
    function getBoardRow() {
        return new Array(13);
    }
    game.getBoardRow = getBoardRow;
    function getBoardCol() {
        return new Array(19);
    }
    game.getBoardCol = getBoardCol;
    function isSelectableAt(row, col) {
        var delta = null;
        if (!state || !state.delta) {
            delta = { rowS: row, colS: col, rowE: row, colE: col, playerNo: playerNo };
        }
        else {
            delta = state.delta;
        }
        return isSelectable(row, col, playerId, delta);
    }
    game.isSelectableAt = isSelectableAt;
    function isSelectable(row, col, playerId, delta) {
        if (state.board[row][col] !== gameLogic.getPlayerColorById(playerId)) {
            return false;
        }
        possibleMoves = gameLogic.getPossibleMoves(state.board, playerId, delta);
        //console.log("isSelectable row=" + row + " col=" + col + " moves=" + JSON.stringify(possibleMoves));
        if (possibleMoves.length == 0) {
            return false;
        }
        return true;
    }
    function isContain(array, target) {
        for (var i = 0; i < array.length; i++) {
            if (angular.equals(array[i], target)) {
                return true;
            }
        }
        return false;
    }
    function rotateGameBoard(params) {
        if (params.playMode == "single-player" || isComputerTurn) {
            return;
        }
        var gameBoard = document.getElementById("gameArea");
        var thisPlayerColor = gameLogic.getPlayerColorById(params.turnIndexAfterMove);
        switch (thisPlayerColor) {
            case "R":
                gameBoard.className = "rotationR";
                break;
            case "G":
                gameBoard.className = "rotationG";
                break;
            case "Y":
                gameBoard.className = "rotationY";
                break;
        }
    }
    function getStyle(row, col) {
        if (state.delta && state.delta.rowE === row && state.delta.colE === col) {
            return { top: "0%", left: "0%", position: "relative", width: "90%", height: "100%",
                "-webkit-animation": "moveAnimation 1s",
                "animation": "moveAnimation 1s" };
        }
        else {
            return { width: "90%", height: "100%" };
        }
    }
    game.getStyle = getStyle;
    function getTopShift(row) {
        return row * 7.86;
    }
    function getLeftShift(col) {
        return col * 4.59 + 5.5;
    }
    function modifyMoveCSS(delta) {
        var moveHistory = gameLogic.getMovesHistory(delta.rowS, delta.colS, delta.rowE, delta.colE);
        //console.log("moveHistory=" + moveHistory);
        var steps = moveHistory.length;
        //console.log("moveHistory.length=" + moveHistory.length);
        var finalRow = moveHistory[moveHistory.length - 1].rowE;
        var finalCol = moveHistory[moveHistory.length - 1].colE;
        var cssRules = "";
        var interval = 100 / steps;
        for (var i = 0; i < steps; i++) {
            //console.log("moveHistory[i]=" + JSON.stringify(moveHistory[i]));
            var top = (moveHistory[i].rowS - finalRow) * 100;
            var left = (moveHistory[i].colS - finalCol) * 100 / 2;
            cssRules += interval * i + '% {top: ' + top + '%; left: ' + left + '%;}';
        }
        //console.log("modifyMoveCSS cssRules=" + cssRules);
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = ' @-webkit-keyframes moveAnimation { ' + cssRules + ' }';
        document.getElementsByTagName('head')[0].appendChild(style);
        var style2 = document.createElement('style');
        style2.type = 'text/css';
        style2.innerHTML = ' @keyframes moveAnimation { ' + cssRules + ' }';
        document.getElementsByTagName('head')[0].appendChild(style2);
    }
    function handleDragEvent(type, clientX, clientY) {
        // Center point in gameArea
        var x = clientX - gameArea.offsetLeft;
        var y = clientY - gameArea.offsetTop;
        var row, col;
        //console.log("handleDragEvent[0] x=" + x + " y=" + y);
        //console.log("handleDragEvent[0] selectedPosition=" + JSON.stringify(selectedPosition));
        // Is outside gameArea?
        if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
            if (draggingPiece) {
                // Drag the piece where the touch is (without snapping to a square).
                var thisRow = 0;
                var thisCol = 0;
                if (y < 0) {
                    thisRow = 0;
                }
                if (y >= gameArea.clientHeight) {
                    thisRow = rowsNum - 1;
                }
                if (x < 0) {
                    thisCol = 0;
                }
                if (x >= gameArea.clientWidth) {
                    thisCol = colsNum - 1;
                }
                //console.log("handleDragEvent[1-1] thisRow=" + thisRow + " thisCol=" + thisCol);
                setDraggingPieceTopLeft(thisRow, thisCol, false);
            }
            else {
                return;
            }
        }
        else {
            var myPlayerId = lastUpdateUI.turnIndexAfterMove;
            // Inside gameArea. Let's find the containing square's row and col
            var row = Math.floor((y / gameArea.clientHeight) * 100 / 7.86);
            var col = 0;
            if (row % 2 === 0) {
                col = Math.floor(((x / gameArea.clientWidth) * 100 - 5.5) / 9.18) * 2 + 1;
            }
            else {
                col = Math.floor(((x / gameArea.clientWidth) * 100 - 5.5) / 9.18) * 2;
            }
            //console.log("handleDragEvent[1-2] clientHeight=" + gameArea.clientHeight + " clientWidth=" + gameArea.clientWidth);
            //console.log("handleDragEvent[1-2] row=" + row + " col=" + col);
            //console.log("  gameArea.offsetLeft=" + gameArea.offsetLeft + " gameArea.offsetTop=" + gameArea.offsetLeft);
            //console.log("handleDragEvent[1-2-2] row=" + row + " col=" + col);
            if (type === "touchstart") {
                var delta = { rowS: row, colS: col, rowE: row, colE: col, playerNo: playerNo };
                //console.log("handleDragEvent[1-4] myPlayerId =" + myPlayerId );
                //console.log("handleDragEvent[1-4] delta =" + delta );
                if (isSelectable(row, col, myPlayerId, delta)) {
                    selectedPosition = { row: row, col: col };
                }
                if (!draggingStartedRowCol) {
                    //console.log("handleDragEvent[1-5-1] draggingStartedRowCol=" + draggingStartedRowCol);
                    //console.log("handleDragEvent[1-5-2] state.board[row][col]=" + state.board[row][col]);
                    // drag started
                    if (isSelectableAt(row, col)) {
                        draggingStartedRowCol = { row: row, col: col };
                        draggingPiece = document.getElementById("piece_" + draggingStartedRowCol.row + "_" + draggingStartedRowCol.col);
                        draggingPiece.style.zIndex = ++nextZIndex + "";
                        draggingPiece.className += " selected";
                        draggingStartPosi = document.getElementById("cell_" + draggingStartedRowCol.row + "_" + draggingStartedRowCol.col);
                        draggingStartPosi.className += " selected";
                    }
                }
            }
            if (!draggingPiece) {
                return;
            }
            //console.log("type = " + type);
            if (type === "touchend") {
                //console.log("handleDragEvent[1-6]");
                var from = draggingStartedRowCol;
                var to = { row: row, col: col };
                //console.log("handleDragEvent[1-6-2] from.row="  + from.row + " from.col=" + from.col + " to.row=" + to.row + " to.col=" + to.col);
                dragDone(from, to);
            }
            else {
                // Drag continue
                //setDraggingPieceTopLeft(getSquareTopLeft(row, col));
                //console.log("handleDragEvent[1-7]");
                //if (gameLogic.getMovesHistory(draggingStartedRowCol.row, draggingStartedRowCol.col, row, col)){
                setDraggingPieceTopLeft(row, col, false);
            }
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
            // drag ended
            // return the piece to it's original style (then angular will take care to hide it).
            if (draggingStartedRowCol) {
                setDraggingPieceTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col, true);
                draggingStartedRowCol = null;
                draggingPiece.className = draggingPiece.className.replace('selected', '');
                draggingStartPosi.className = draggingStartPosi.className.replace('selected', '');
                draggingPiece = null;
            }
        }
    }
    function dragDone(from, to) {
        var msg = "Dragged piece " + from.row + "x" + from.col + " to square " + to.row + "x" + to.col;
        log.info(msg);
        msg = msg;
        // Update piece in board
        //console.log("dragDone! from.row=" + from.row + " from.col=" + from.col + " to.row=" + to.row + " to.col=" + to.col);
        //console.log("dragDone! draggingStartedRowCol.row=" + draggingStartedRowCol.row + " draggingStartedRowCol.col=" + draggingStartedRowCol.col);
        if (from.row === to.row && from.col === to.col) {
            return;
        }
        //console.log("dragDone! gameLogic.getMovesHistory=" + gameLogic.getMovesHistory(from.row, from.col, to.row, to.col));
        //console.log("dragDone! before draggingPiece.className=" + draggingPiece.className);
        draggingPiece.className = draggingPiece.className.replace('selected', '');
        draggingStartPosi.className = draggingStartPosi.className.replace('selected', '');
        try {
            var myPlayerId = lastUpdateUI.turnIndexAfterMove;
            if (gameLogic.getMovesHistory(from.row, from.col, to.row, to.col)) {
                setDraggingPieceTopLeft(from.row, from.col, true);
                commitTheMove(to.row, to.col, myPlayerId);
            }
        }
        catch (Exception) { }
    }
    function commitTheMove(row, col, myPlayerId) {
        var thisDelta = { rowS: selectedPosition.row, colS: selectedPosition.col, rowE: row, colE: col, playerNo: playerNo };
        var move = gameLogic.createMove(state.board, myPlayerId, thisDelta);
        selectedPosition = null;
        draggingStartedRowCol = null;
        draggingPiece = null;
        canMakeMove = false; // to prevent making another move
        gameService.makeMove(move);
    }
    /*
      function getRotationPosition(row: number, col:number, clientX: number, clientY: number, playerId: number): IPosition {
        if(playerId === 0){ return {row: row, col:col}; }
        var ele = document.elementFromPoint(clientX, clientY);
        if (!ele) { return null; }
        console.log("getRotationPosition ele=" + JSON.stringify(ele));
        var eles = ele.id.split("_");
        console.log("getRotationPosition ele.id=" + ele.id);
        console.log("getRotationPosition eles[1]=" + eles[1]);
        console.log("getRotationPosition eles[2]=" + eles[2]);
        return {row: parseInt(eles[1]), col: parseInt(eles[2])+2};
      }*/
    function setDraggingPieceTopLeft(row, col, reset) {
        if (reset || !isValidPosition(row, col)) {
            draggingPiece.style.left = getLeftShift(draggingStartedRowCol.col) + "%";
            draggingPiece.style.top = 0 + "%";
            return;
        }
        var orgTop = getTopShift(draggingStartedRowCol.row);
        draggingPiece.style.left = getLeftShift(col) + "%";
        draggingPiece.style.top = (row - draggingStartedRowCol.row) * 100 + "%";
    }
    function isValidPosition(row, col) {
        if (state.board[row][col] === '' && (row + col) % 2 === 1) {
            return true;
        }
        return false;
    }
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        RULES_OF_DIAMOND_GAME: "Rules of Diamond Game",
        RULES_SLIDE1: "You and your opponent take turns to move your own piece. The first player's piece is red, second is green, third is yellow, etc.",
        RULES_SLIDE2: "You can move your piece to an adjancent empty position",
        RULES_SLIDE3: "Or jump over any other pieces for any consecutive jump steps",
        RULES_SLIDE4: "The first to put all pieces into the other end of board wins.",
        CLOSE: "Close"
    });
    game.init();
});
;var aiService;
(function (aiService) {
    var defaultSearchStep = 1;
    /** Returns the move that the computer player should do for the given updateUI. */
    function findComputerMove(updateUI) {
        return createComputerMove(updateUI.stateAfterMove.board, defaultSearchStep, updateUI.numberOfPlayers, updateUI.turnIndexAfterMove);
    }
    aiService.findComputerMove = findComputerMove;
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
        var bestDelta = null;
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
            if (bestDelta === null || thisDist > maxDist) {
                maxDist = thisDist;
                bestDelta = thisDeltaList[0];
            }
        }
        // if don't find a good move within one steps (very close to target board)
        // search for two steps ahead
        var myMove = gameLogic.createMove(board, playerIndex, bestDelta);
        return myMove;
    }
    /* return the final board state and movement history (delta list) by N steps */
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
                // if find a winning step, use it and return
                if (thisMove[0].endMatch != undefined) {
                    deltaList.push(nextDelta);
                    return [{ board: board, deltaList: angular.copy(deltaList) }];
                }
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
            ['9', '', '7', '', '5', '', '3', '', '3', '', '3', '', '3', '', '5', '', '7', '', '9'],
            ['#', '8', '', '6', '', '5', '', '4', '', '4', '', '4', '', '5', '', '6', '', '8', '#'],
            ['#', '#', '7', '', '6', '', '5', '', '5', '', '5', '', '5', '', '6', '', '7', '#', '#'],
            ['#', '#', '#', '7', '', '6', '', '6', '', '6', '', '6', '', '6', '', '7', '#', '#', '#'],
            ['#', '#', '8', '', '7', '', '7', '', '7', '', '7', '', '7', '', '7', '', '8', '#', '#'],
            ['#', '10', '', '9', '', '8', '', '8', '', '8', '', '8', '', '8', '', '9', '', '10', '#'],
            ['12', '', '11', '', '10', '', '9', '', '9', '', '9', '', '9', '', '10', '', '11', '', '12'],
            ['#', '#', '#', '#', '#', '#', '#', '10', '', '10', '', '10', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '11', '', '11', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '12', '#', '#', '#', '#', '#', '#', '#', '#', '#']],
        [['#', '#', '#', '#', '#', '#', '#', '#', '#', '12', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '10', '', '11', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '8', '', '9', '', '10', '#', '#', '#', '#', '#', '#', '#'],
            ['9', '', '8', '', '7', '', '6', '', '7', '', '8', '', '9', '', '10', '', '11', '', '12'],
            ['#', '7', '', '6', '', '5', '', '6', '', '7', '', '8', '', '9', '', '10', '', '11', '#'],
            ['#', '#', '5', '', '5', '', '5', '', '6', '', '7', '', '8', '', '9', '', '10', '#', '#'],
            ['#', '#', '#', '3', '', '4', '', '5', '', '6', '', '7', '', '8', '', '9', '#', '#', '#'],
            ['#', '#', '2', '', '3', '', '4', '', '5', '', '6', '', '7', '', '8', '', '10', '#', '#'],
            ['#', '1', '', '2', '', '3', '', '4', '', '5', '', '6', '', '7', '', '9', '', '11', '#'],
            ['0', '', '1', '', '2', '', '3', '', '5', '', '6', '', '6', '', '8', '', '10', '', '12'],
            ['#', '#', '#', '#', '#', '#', '#', '5', '', '6', '', '7', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '7', '', '8', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '9', '#', '#', '#', '#', '#', '#', '#', '#', '#']],
        [['#', '#', '#', '#', '#', '#', '#', '#', '#', '12', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '11', '', '10', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '10', '', '9', '', '8', '#', '#', '#', '#', '#', '#', '#'],
            ['12', '', '11', '', '10', '', '9', '', '8', '', '7', '', '6', '', '7', '', '8', '', '9'],
            ['#', '11', '', '10', '', '9', '', '8', '', '7', '', '6', '', '6', '', '6', '', '7', '#'],
            ['#', '#', '10', '', '9', '', '8', '', '7', '', '6', '', '5', '', '5', '', '5', '#', '#'],
            ['#', '#', '#', '9', '', '8', '', '7', '', '6', '', '5', '', '4', '', '3', '#', '#', '#'],
            ['#', '#', '10', '', '8', '', '7', '', '6', '', '5', '', '4', '', '3', '', '2', '#', '#'],
            ['#', '11', '', '9', '', '7', '', '6', '', '5', '', '4', '', '3', '', '2', '', '1', '#'],
            ['12', '', '10', '', '8', '', '6', '', '6', '', '5', '', '3', '', '2', '', '1', '', '0'],
            ['#', '#', '#', '#', '#', '#', '#', '7', '', '6', '', '5', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '8', '', '7', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '9', '#', '#', '#', '#', '#', '#', '#', '#', '#']]];
})(aiService || (aiService = {}));
