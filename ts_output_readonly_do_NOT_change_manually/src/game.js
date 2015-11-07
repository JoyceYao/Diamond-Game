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
    var playerId = -1;
    var gameArea = null;
    var rowsNum = 13;
    var colsNum = 19;
    var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
    var draggingPiece = null;
    var draggingStartPosi = null;
    var nextZIndex = 61;
    function init() {
        console.log("Translation of 'RULES_OF_DIAMOND_GAME' is " + translate('RULES_OF_DIAMOND_GAME'));
        console.log("Translation of 'RULES_SLIDE1' is " + translate('RULES_SLIDE1'));
        console.log("Translation of 'RULES_SLIDE2' is " + translate('RULES_SLIDE1'));
        console.log("Translation of 'RULES_SLIDE3' is " + translate('RULES_SLIDE1'));
        console.log("Translation of 'RULES_SLIDE4' is " + translate('RULES_SLIDE1'));
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
