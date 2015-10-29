module game {
  let animationEnded = false;
  let canMakeMove = false;
  let isComputerTurn = false;
  let lastUpdateUI: IUpdateUI = null;
  let state: IState = null;
  export let isHelpModalShown: boolean = false;
  let selectedPosition: IPosition = null;
  let possibleMoves: IMove[] = [];
  let playerNo: number = 0;
  interface IPosition {
    row: number;
    col: number;
  }

  export function init() {
    console.log("init");
    console.log("Translation of 'RULES_OF_DIAMOND_GAME' is " + translate('RULES_OF_DIAMOND_GAME'));
    resizeGameAreaService.setWidthToHeight(1);

    console.log("init[1]");

    gameService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 3,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });

    console.log("init[2]");
    // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    document.addEventListener("animationend", animationEndedCallback, false); // standard
    document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
    document.addEventListener("oanimationend", animationEndedCallback, false); // Opera

    gameLogic.initialPLayersMap();
    console.log("init[3]");
  }

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

  function updateUI(params: IUpdateUI): void {
    console.log("updateUI[1]");
    animationEnded = false;
    lastUpdateUI = params;

    //console.log("updateUI[1-1] params=", JSON.stringify(params));

    //state = params.stateAfterMove;

    //console.log("updateUI[1-2] state=", JSON.stringify(state));
    playerNo = params.playersInfo.length;

    //console.log("updateUI[1-3] playerNo=", playerNo);

    //if (Object.getOwnPropertyNames(params.stateAfterMove).length === 0) {
    //    params.stateBeforeMove = {board: gameLogic.getInitialBoard(playerNo), delta: undefined}
    //    params.stateAfterMove = {board: gameLogic.getInitialBoard(playerNo), delta: undefined}
    //    console.log("updateUI[2] state=", JSON.stringify(params.stateAfterMove));
    //}
    state = params.stateAfterMove;
    if (!state.board) {
      state.board = gameLogic.getInitialBoard(playerNo);
    }

    //console.log("updateUI[1-5] state.board=", JSON.stringify(state.board));

    //console.log("updateUI[1-6] state.board[0]=", JSON.stringify(state.board[0]));

    canMakeMove = params.turnIndexAfterMove >= 0 && // game is ongoing
      params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn

    //console.log("updateUI[3]");
    // Is it the computer's turn?
    isComputerTurn = canMakeMove &&
        params.playersInfo[params.yourPlayerIndex].playerId === '';

    //console.log("updateUI[4]");
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

  export function cellClicked(row: number, col: number): void {
    log.info(["Clicked on cell:", row, col]);
    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    if (!canMakeMove) {
      return;
    }

    var myPlayerId: number = lastUpdateUI.turnIndexAfterMove;
    var delta: BoardDelta = {rowS:row, colS:col, rowE:0, colE:0, playerNo:playerNo}

    try {
      // select phase:
      //   if the player does not click on their own pieces
      //   or the piece has no valid move, then return
      console.log("cellClicked[1-1]", selectedPosition);
      if (selectedPosition == null){
        console.log("cellClicked[1-3] isSelectable", isSelectable(row, col, myPlayerId, delta));
        if (isSelectable(row, col, myPlayerId, delta)) {
          selectedPosition = {row:row, col:col};
          // do something to show the selected piecs

        }
      } else {
      // put phase:
      //   check if the put position is a valid move
        var thisDelta: BoardDelta = {rowS: selectedPosition.row, colS: selectedPosition.col, rowE:row, colE:col, playerNo:playerNo};

        console.log("cellClicked[2-1]", JSON.stringify(state.board));

        var move = gameLogic.createMove(state.board, myPlayerId, thisDelta);
        canMakeMove = false; // to prevent making another move
        console.log("cellClicked[2]", JSON.stringify(move));
        gameService.makeMove(move);
        console.log("cellClicked[3]");
        selectedPosition = null;
      }

    } catch (e) {
      log.info(["Cell is already full in position:", row, col]);
      return;
    }
  }

  export function shouldShowImage(row: number, col: number): boolean {
    //log.info("shouldShowImage:", row, col);
    let cell = state.board[row][col];
    return cell !== "";
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

  export function shouldSlowlyAppear(row: number, col: number): boolean {
    return !animationEnded &&
        state.delta &&
        state.delta.rowE === row && state.delta.colE === col;
  }

  export function getBoardRow(){
    //log.info("getBoardRow");
    return new Array(13);
  }

  export function getBoardCol(){
    //log.info("getBoardCol");
    return new Array(19);
  }

  function isSelectable(row:number, col:number, playerId: number, delta: BoardDelta): boolean {
    console.log("isSelectable[0]", state.board[row][col]);
    console.log("isSelectable[1]", gameLogic.getPlayerColorById(playerId));
    if (state.board[row][col] !== gameLogic.getPlayerColorById(playerId)){
      return false;
    }

    possibleMoves = gameLogic.getPossibleMoves(state.board, playerId, delta)
    if (possibleMoves.length == 0){
      return false;
    }
    return true;
  }

/*
  export function getTopPosition(row: number): number {
    return row*7.86;
  }

  export function getLeftPosition(col: number): number {
    return 5.5 + col * 4.59;
  }*/

}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
  $rootScope['game'] = game;
  translate.setLanguage('en',  {
    RULES_OF_DIAMOND_GAME:"Rules of Diamond Game",
    RULES_SLIDE1:"You and your opponent take turns to move your own piece. The first player's piece is red, second is green, third is yellow, etc.",
    RULES_SLIDE2:"You can move your piece to an adjancent empty position",
    RULES_SLIDE3:"Or jump over any other pieces for any consecutive jump steps",
    RULES_SLIDE4:"The first to put all pieces into the other end of board wins.",
    CLOSE:"Close"
  });
  game.init();
});
