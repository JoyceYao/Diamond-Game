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
    var draggingPieceObj = null;
    var nextZIndex = 61;
    function init() {
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
        //console.log("gameArea=" + JSON.stringify(gameArea));
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
        console.log("params.playMode=" + params.playMode);
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
            if (!state.delta) {
                // This is the first move in the match, so
                // there is not going to be an animation, so
                // call sendComputerMove() now (can happen in ?onlyAIs mode)
                sendComputerMove();
            }
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
        //console.log("getStyle !! lastUpdateUI.playMode=" + lastUpdateUI.playMode);
        //console.log("getStyle !! =" + lastUpdateUI.playMode != "passAndPlay");
        if (state.delta && state.delta.rowE === row && state.delta.colE === col && lastUpdateUI.playMode != "passAndPlay") {
            //console.log("getStyle animation!!");
            return { top: "10%", left: "0%", position: "relative", width: "80%", height: "80%", margin: "auto",
                "-webkit-animation": "moveAnimation 1s",
                "animation": "moveAnimation 1s" };
        }
        else {
            return { top: "10%", left: "0%", position: "relative", width: "80%", height: "80%", margin: "auto" };
        }
    }
    game.getStyle = getStyle;
    function getTopShift(row) {
        return row * 7.72;
    }
    function getLeftShift(col) {
        return col * 4.427 + 5.5;
    }
    function modifyMoveCSS(delta) {
        //var moveHistory: BoardDelta[] = gameLogic.getMovesHistory(delta.rowS, delta.colS, delta.rowE, delta.colE);
        var moveHistory = state.movesHistory;
        if (!moveHistory) {
            return;
        }
        console.log("modifyMoveCSS  moveHistory=" + JSON.stringify(moveHistory));
        var steps = moveHistory.length;
        var finalRow = moveHistory[moveHistory.length - 1].rowE;
        var finalCol = moveHistory[moveHistory.length - 1].colE;
        var cssRules = "";
        var interval = 100 / steps;
        for (var i = 0; i < steps; i++) {
            var top = (moveHistory[i].rowS - finalRow) * 100 + 10; // top:10%;
            var left = (moveHistory[i].colS - finalCol) * 100 / 2;
            //cssRules += interval*i + '% {top: ' + top + '%; transform: translateY(-50%); left: ' + left + '%;}';
            cssRules += interval * i + '% {top: ' + top + '%; left: ' + left + '%;}';
        }
        console.log("modifyMoveCSS  cssRules=" + cssRules);
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
                setDraggingPieceTopLeft(thisRow, thisCol, false);
            }
            else {
                return;
            }
        }
        else {
            var myPlayerId = lastUpdateUI.turnIndexAfterMove;
            // Inside gameArea. Let's find the containing square's row and col
            var row = Math.floor((y / gameArea.clientHeight) * 100 / 7.72);
            var col = 0;
            if (row % 2 === 0) {
                // 9.927 = 5.5 + 4.427 even rows start from col = 1
                col = Math.floor(((x / gameArea.clientWidth) * 100 - 9.927) / 8.854) * 2 + 1;
            }
            else {
                // odd rows start from col = 0
                col = Math.floor(((x / gameArea.clientWidth) * 100 - 5.5) / 8.854) * 2;
            }
            if (type === "touchstart") {
                var delta = { rowS: row, colS: col, rowE: row, colE: col, playerNo: playerNo };
                if (isSelectable(row, col, myPlayerId, delta)) {
                    selectedPosition = { row: row, col: col };
                }
                if (!draggingStartedRowCol) {
                    // drag started
                    if (isSelectableAt(row, col)) {
                        draggingStartedRowCol = { row: row, col: col };
                        draggingPiece = document.getElementById("cell_" + draggingStartedRowCol.row + "_" + draggingStartedRowCol.col);
                        draggingPiece.style.zIndex = ++nextZIndex + "";
                        //draggingPieceObj = document.getElementById("pieceC_" + draggingStartedRowCol.row + "_" + draggingStartedRowCol.col);
                        addSelectedCSSClass();
                    }
                }
            }
            if (!draggingPiece) {
                return;
            }
            if (type === "touchend") {
                var from = draggingStartedRowCol;
                var to = { row: row, col: col };
                dragDone(from, to);
            }
            else {
                // Drag continue
                setDraggingPieceTopLeft(row, col, false);
            }
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
            // drag ended
            // return the piece to it's original style (then angular will take care to hide it).
            if (draggingStartedRowCol) {
                setDraggingPieceTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col, true);
                draggingStartedRowCol = null;
                removeAllSelectedCSS();
                draggingPiece = null;
            }
        }
    }
    function dragDone(from, to) {
        var msg = "Dragged piece " + from.row + "x" + from.col + " to square " + to.row + "x" + to.col;
        log.info(msg);
        msg = msg;
        // Update piece in board
        if (from.row === to.row && from.col === to.col) {
            return;
        }
        removeAllSelectedCSS();
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
        console.log("game.ts commitTheMove move= " + JSON.stringify(move));
        gameService.makeMove(move);
    }
    function addSelectedCSSClass() {
        if (draggingPiece.className.indexOf("selected") < 0) {
            draggingPiece.className += " selected";
        }
        //if (draggingPieceObj.className.indexOf("selected") < 0){ draggingPieceObj.className += "selected"; }
    }
    function addCanDropCSSClass() {
        if (draggingPiece.className.indexOf("canDrop") < 0) {
            draggingPiece.className += " canDrop";
        }
        //if (draggingPieceObj.className.indexOf("canDrop") < 0){ draggingPieceObj.className += "canDrop"; }
    }
    function removeSelectedCSSClass() {
        draggingPiece.className = draggingPiece.className.replace('selected', '');
        //draggingPieceObj.className = draggingPieceObj.className.replace('selected' , '');
    }
    function removeCanDropCSSClass() {
        draggingPiece.className = draggingPiece.className.replace('canDrop', '');
        //draggingPieceObj.className = draggingPieceObj.className.replace('canDrop' , '');
    }
    function removeAllSelectedCSS() {
        removeSelectedCSSClass();
        removeCanDropCSSClass();
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
        /* if this is a valid drop position, change the glowing color */
        console.log("setDraggingPieceTopLeft !!");
        //console.log(gameLogic.getMovesHistory(draggingStartedRowCol.row, draggingStartedRowCol.col, row, col));
        //console.log(!(draggingStartedRowCol.row === row && draggingStartedRowCol.col === col));
        if (gameLogic.getMovesHistory(draggingStartedRowCol.row, draggingStartedRowCol.col, row, col)
            && !(draggingStartedRowCol.row === row && draggingStartedRowCol.col === col)) {
            addCanDropCSSClass();
        }
        else {
            removeCanDropCSSClass();
        }
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
        if (state.board[row][col] != '#' && (row + col) % 2 === 1) {
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
        RULES_SLIDE1: "You and your opponent take turns to move your own piece. The first player's piece is red, second is green, third is yellow",
        RULES_SLIDE2: "You can move your piece to an adjancent empty position",
        RULES_SLIDE3: "Or jump over any other pieces for any consecutive jump steps",
        RULES_SLIDE4: "The first to put all pieces into the other end of board wins.",
        CLOSE: "Close"
    });
    game.init();
});
