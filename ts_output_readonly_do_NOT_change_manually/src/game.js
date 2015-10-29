var game;
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
    function init() {
        console.log("Translation of 'RULES_OF_DIAMOND_GAME' is " + translate('RULES_OF_DIAMOND_GAME'));
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
        gameLogic.initialPLayersMap();
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
        console.log("updateUI[1-1] params=", JSON.stringify(params));
        playerNo = params.playersInfo.length;
        state = params.stateAfterMove;
        if (!state.board) {
            state.board = gameLogic.getInitialBoard(playerNo);
        }
        rotateGameBoard(params);
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
        //log.info(["Clicked on cell:", row, col]);
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!canMakeMove) {
            return;
        }
        var myPlayerId = lastUpdateUI.turnIndexAfterMove;
        var delta = { rowS: row, colS: col, rowE: row, colE: col, playerNo: playerNo };
        try {
            // select phase:
            //   if the player does not click on their own pieces
            //   or the piece has no valid move, then return
            //console.log("cellClicked[1-1]", selectedPosition);
            if (selectedPosition == null) {
                //console.log("cellClicked[1-3] isSelectable", isSelectable(row, col, myPlayerId, delta));
                if (isSelectable(row, col, myPlayerId, delta)) {
                    selectedPosition = { row: row, col: col };
                }
            }
            else {
                // put phase:
                // if this position is the same with last position,
                // then put the piece back
                if (selectedPosition.row === row && selectedPosition.col === col) {
                    selectedPosition = null;
                    return;
                }
                var thisDelta = { rowS: selectedPosition.row, colS: selectedPosition.col, rowE: row, colE: col, playerNo: playerNo };
                var move = gameLogic.createMove(state.board, myPlayerId, thisDelta);
                //console.log("cellClicked[2-41] move", JSON.stringify(move));
                //console.log("cellClicked[2-2] possibleMoves", JSON.stringify(possibleMoves));
                if (isContain(possibleMoves, move)) {
                    canMakeMove = false; // to prevent making another move
                    gameService.makeMove(move);
                    selectedPosition = null;
                }
            }
        }
        catch (e) {
            log.info(["Not a valid move"]);
            return;
        }
    }
    game.cellClicked = cellClicked;
    function shouldShowImage(row, col) {
        var cell = state.board[row][col];
        return cell !== "";
    }
    game.shouldShowImage = shouldShowImage;
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
    function shouldSlowlyAppear(row, col) {
        return !animationEnded &&
            state.delta &&
            state.delta.rowE === row && state.delta.colE === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function getBoardRow() {
        return new Array(13);
    }
    game.getBoardRow = getBoardRow;
    function getBoardCol() {
        return new Array(19);
    }
    game.getBoardCol = getBoardCol;
    function isSelectable(row, col, playerId, delta) {
        //console.log("isSelectable[0]", state.board[row][col]);
        //console.log("isSelectable[1]", gameLogic.getPlayerColorById(playerId));
        if (state.board[row][col] !== gameLogic.getPlayerColorById(playerId)) {
            return false;
        }
        possibleMoves = gameLogic.getPossibleMoves(state.board, playerId, delta);
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
        if (params.playMode == "single-player") {
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
