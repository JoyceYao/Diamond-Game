module game {
  let animationEnded = false;
  let canMakeMove = false;
  let isComputerTurn = false;
  let lastUpdateUI: IUpdateUI = null;
  let state: IState = null;
  export let isHelpModalShown: boolean = false;
  let selectedPosition: IPosition = null;
  let possibleMoves: IMove[] = [];
  let playerNo = 0;
  let playerId = -1;
  let gameArea : HTMLElement = null;
  let rowsNum = 13;
  let colsNum = 19;
  let draggingStartedRowCol: IPosition = null; // The {row: YY, col: XX} where dragging started.
  let draggingPiece : HTMLElement = null;
  let draggingStartPosi : HTMLElement = null;
  let nextZIndex = 61;
  interface IPosition {
    row: number;
    col: number;
  }
  interface ITopLeft {
    top: number;
    left: number;
  }

  export function init() {
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

  export function updateUI(params: IUpdateUI): void {
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
    if (state.delta && params.playMode != "passAndPlay"){
      modifyMoveCSS(state.delta);
    }

    canMakeMove = params.turnIndexAfterMove >= 0 && // game is ongoing
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
      //}
    }
  }

  export function isPieceRed(row: number, col: number): boolean {
    return state.board[row][col] === 'R';
  }

  export function isPieceGreen(row: number, col: number): boolean {
    return state.board[row][col] === 'G';
  }

  export function isPieceYellow(row: number, col: number): boolean {
    return state.board[row][col] === 'Y';
  }

  export function getBoardRow(){
    return new Array(13);
  }

  export function getBoardCol(){
    return new Array(19);
  }

  export function isSelectableAt(row: number, col: number): boolean {
    var delta: BoardDelta = null;
    if (!state || !state.delta){
      delta = {rowS: row, colS: col, rowE:row, colE:col, playerNo: playerNo};
    } else {
      delta = state.delta;
    }
    return isSelectable(row, col, playerId, delta);
  }

  function isSelectable(row:number, col:number, playerId: number, delta: BoardDelta): boolean {
    if (state.board[row][col] !== gameLogic.getPlayerColorById(playerId)){
      return false;
    }

    possibleMoves = gameLogic.getPossibleMoves(state.board, playerId, delta);
    //console.log("isSelectable row=" + row + " col=" + col + " moves=" + JSON.stringify(possibleMoves));
    if (possibleMoves.length == 0){
      return false;
    }
    return true;
  }

  function isContain(array:any[], target:any){
    for (var i=0; i<array.length; i++){
      if (angular.equals(array[i], target)){
        return true;
      }
    }
    return false;
  }

  function rotateGameBoard(params: IUpdateUI){
    if (params.playMode == "single-player" || isComputerTurn){
      return;
    }

    var gameBoard = document.getElementById("gameArea");
    var thisPlayerColor = gameLogic.getPlayerColorById(params.turnIndexAfterMove);
    switch (thisPlayerColor){
      case "R" : gameBoard.className = "rotationR"; break;
      case "G" : gameBoard.className = "rotationG"; break;
      case "Y" : gameBoard.className = "rotationY"; break;
    }
  }

  export function getStyle(row: number, col: number): {} {
    if (state.delta && state.delta.rowE === row && state.delta.colE === col) {
      return {top: "0%", left: "0%", position: "relative", width: "90%", height: "100%",
              "-webkit-animation": "moveAnimation 1s",
              "animation": "moveAnimation 1s"};
    } else {
      return {width: "90%", height: "100%"};
    }
  }

  function getTopShift(row: number){
    return row * 7.86;
  }

  function getLeftShift(col: number){
    return col * 4.59 + 5.5;
  }

  function modifyMoveCSS(delta: BoardDelta){
    var moveHistory: BoardDelta[] = gameLogic.getMovesHistory(delta.rowS, delta.colS, delta.rowE, delta.colE);
    //console.log("moveHistory=" + moveHistory);
    if (!moveHistory){ return; }

    var steps = moveHistory.length;
    var finalRow = moveHistory[moveHistory.length-1].rowE;
    var finalCol = moveHistory[moveHistory.length-1].colE;
    var cssRules = "";
    var interval = 100/steps;
    for (var i=0; i<steps; i++){
      //console.log("moveHistory[i]=" + JSON.stringify(moveHistory[i]));
      var top = (moveHistory[i].rowS-finalRow)*100;
      var left = (moveHistory[i].colS-finalCol)*100/2;
      cssRules += interval*i + '% {top: ' + top + '%; left: ' + left + '%;}';
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

  function handleDragEvent(type: string, clientX: number, clientY: number) {
    // Center point in gameArea
    var x = clientX - gameArea.offsetLeft;
    var y = clientY - gameArea.offsetTop;
    var row: number, col: number;

    //console.log("handleDragEvent[0] x=" + x + " y=" + y);
    //console.log("handleDragEvent[0] selectedPosition=" + JSON.stringify(selectedPosition));

    // Is outside gameArea?
    if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
      if (draggingPiece) {
        // Drag the piece where the touch is (without snapping to a square).
        var thisRow = 0;
        var thisCol = 0;
        if (y < 0){ thisRow = 0 }
        if (y >= gameArea.clientHeight){ thisRow = rowsNum-1; }
        if (x < 0){ thisCol = 0 }
        if (x >= gameArea.clientWidth){ thisCol = colsNum-1; }

        //console.log("handleDragEvent[1-1] thisRow=" + thisRow + " thisCol=" + thisCol);

        setDraggingPieceTopLeft(thisRow, thisCol, false);
      } else {
        return;
      }
    } else {

      var myPlayerId: number = lastUpdateUI.turnIndexAfterMove;
      // Inside gameArea. Let's find the containing square's row and col
      var row = Math.floor((y / gameArea.clientHeight)*100 / 7.86);
      var col = 0;
      if (row % 2 === 0){
        col = Math.floor(((x / gameArea.clientWidth)*100 - 5.5) / 9.18 )*2+1;
      } else {
        col = Math.floor(((x / gameArea.clientWidth)*100 - 5.5) / 9.18 )*2;
      }

      //console.log("handleDragEvent[1-2] clientHeight=" + gameArea.clientHeight + " clientWidth=" + gameArea.clientWidth);
      //console.log("handleDragEvent[1-2] row=" + row + " col=" + col);
      //console.log("  gameArea.offsetLeft=" + gameArea.offsetLeft + " gameArea.offsetTop=" + gameArea.offsetLeft);
      //console.log("handleDragEvent[1-2-2] row=" + row + " col=" + col);

      if (type === "touchstart") {

        var delta: BoardDelta = {rowS:row, colS:col, rowE:row, colE:col, playerNo:playerNo};
        //console.log("handleDragEvent[1-4] myPlayerId =" + myPlayerId );
        //console.log("handleDragEvent[1-4] delta =" + delta );
        if (isSelectable(row, col, myPlayerId, delta)){
          selectedPosition = {row: row, col: col};
          //console.log("handleDragEvent[1-4-1] selectedPosition =" + selectedPosition );
        }

        if (!draggingStartedRowCol) {
          //console.log("handleDragEvent[1-5-1] draggingStartedRowCol=" + draggingStartedRowCol);
          //console.log("handleDragEvent[1-5-2] state.board[row][col]=" + state.board[row][col]);
          // drag started

          if (isSelectableAt(row, col)){
            draggingStartedRowCol = {row: row, col: col};
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
        var to = {row: row, col: col};
        //console.log("handleDragEvent[1-6-2] from.row="  + from.row + " from.col=" + from.col + " to.row=" + to.row + " to.col=" + to.col);
        dragDone(from, to);
      } else {
        // Drag continue
        //setDraggingPieceTopLeft(getSquareTopLeft(row, col));
          //console.log("handleDragEvent[1-7]");
          //if (gameLogic.getMovesHistory(draggingStartedRowCol.row, draggingStartedRowCol.col, row, col)){
            setDraggingPieceTopLeft(row, col, false);
          //}
      }
    }
    if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
      // drag ended
      // return the piece to it's original style (then angular will take care to hide it).
      if (draggingStartedRowCol){
        setDraggingPieceTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col, true);
        draggingStartedRowCol = null;
        draggingPiece.className = draggingPiece.className.replace('selected' , '');
        draggingStartPosi.className = draggingStartPosi.className.replace('selected' , '');
        draggingPiece = null;
      }
    }
  }

  function dragDone(from: IPosition, to: IPosition) {
    var msg = "Dragged piece " + from.row + "x" + from.col + " to square " + to.row + "x" + to.col;
    log.info(msg);
    msg = msg;
    // Update piece in board
    //console.log("dragDone! from.row=" + from.row + " from.col=" + from.col + " to.row=" + to.row + " to.col=" + to.col);
    //console.log("dragDone! draggingStartedRowCol.row=" + draggingStartedRowCol.row + " draggingStartedRowCol.col=" + draggingStartedRowCol.col);
    if (from.row === to.row && from.col === to.col){ return; }
    //console.log("dragDone! gameLogic.getMovesHistory=" + gameLogic.getMovesHistory(from.row, from.col, to.row, to.col));
    //console.log("dragDone! before draggingPiece.className=" + draggingPiece.className);
    draggingPiece.className = draggingPiece.className.replace('selected' , '');
    draggingStartPosi.className = draggingStartPosi.className.replace('selected' , '');

    try{
        var myPlayerId: number = lastUpdateUI.turnIndexAfterMove;
        if (gameLogic.getMovesHistory(from.row, from.col, to.row, to.col)){
          setDraggingPieceTopLeft(from.row, from.col, true);
          commitTheMove(to.row, to.col, myPlayerId);
        }
    } catch (Exception){}
  }

  function commitTheMove(row: number, col: number, myPlayerId: number){
    var thisDelta: BoardDelta = {rowS: selectedPosition.row, colS: selectedPosition.col, rowE:row, colE:col, playerNo:playerNo};
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

  function setDraggingPieceTopLeft(row: number, col: number, reset: boolean) {
    if (reset || !isValidPosition(row, col)){
      draggingPiece.style.left = getLeftShift(draggingStartedRowCol.col) + "%";
      draggingPiece.style.top = 0 + "%";
      return;
    }

    var orgTop = getTopShift(draggingStartedRowCol.row);
    draggingPiece.style.left = getLeftShift(col) + "%";
    draggingPiece.style.top = (row - draggingStartedRowCol.row)*100 + "%";
  }

  function isValidPosition(row: number, col: number): boolean {
    if (state.board[row][col] != '#' && (row + col)%2 === 1){
      return true;
    }
    return false;
  }

/*
  var mapping1 : { [key:string]:IPosition; } = {};
  var mapping2 : { [key:string]:IPosition; } = {};
  function createRotationMapping() {
    mapping1['9_6'] = {row: 6, col: 15};
    mapping1['9_8'] = {row: 5, col: 14};
    mapping1['9_10'] = {row: 4, col: 13};
    mapping1['9_12'] = {row: 3, col: 12};
    mapping1['10_7'] = {row: 5, col: 16};
    mapping1['10_9'] = {row: 4, col: 15};
    mapping1['10_11'] = {row: 3, col: 14};
    mapping1['11_8'] = {row: 4, col: 17};
    mapping1['11_10'] = {row: 3, col: 16};
    mapping1['12_9'] = {row: 3, col: 18};

    mapping2['9_6'] = {row: 3, col: 6};
    mapping2['9_8'] = {row: 4, col: 5};
    mapping2['9_10'] = {row: 5, col: 4};
    mapping2['9_12'] = {row: 6, col: 3};
    mapping2['10_7'] = {row: 3, col: 4};
    mapping2['10_9'] = {row: 4, col: 3};
    mapping2['10_11'] = {row: 5, col: 2};
    mapping2['11_8'] = {row: 3, col: 2};
    mapping2['11_10'] = {row: 4, col: 1};
    mapping2['12_9'] = {row: 3, col: 0};
  }

  function getRotationMapping(row: number, col: number, playerIdx: number) {
    if (playerIdx == 0) {return {row: row, col: col};  }
    if (playerIdx === 1){ return mapping1[row+"_"+col]; }
    else return mapping2[row+"_"+col];
  }*/

}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
  $rootScope['game'] = game;
  translate.setLanguage('en',  {
    RULES_OF_DIAMOND_GAME:"Rules of Diamond Game",
    RULES_SLIDE1:"You and your opponent take turns to move your own piece. The first player's piece is red, second is green, third is yellow",
    RULES_SLIDE2:"You can move your piece to an adjancent empty position",
    RULES_SLIDE3:"Or jump over any other pieces for any consecutive jump steps",
    RULES_SLIDE4:"The first to put all pieces into the other end of board wins.",
    CLOSE:"Close"
  });
  game.init();
});
