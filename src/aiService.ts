module aiService {
  interface IDeltaHistory {
    board: Board;
    deltaList: BoardDelta[];
  }
  var defaultSearchStep = 1;

  /** Returns the move that the computer player should do for the given updateUI. */
  export function findComputerMove(updateUI: IUpdateUI): IMove {
    return createComputerMove(
      updateUI.stateAfterMove.board,
      defaultSearchStep,
      updateUI.numberOfPlayers,
      updateUI.turnIndexAfterMove);
    }

  /**
   * Returns the move that the computer player should do for the given board.
   * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
   * and it has either a millisecondsLimit or maxDepth field:
   * millisecondsLimit is a time limit, and maxDepth is a depth limit.
   */
  export function createComputerMove(
      board: Board, steps: number, playerNo: number, playerIndex: number): IMove {
    // We use alpha-beta search, where the search states are TicTacToe moves.
    // Recal that a TicTacToe move has 3 operations:
    // 0) endMatch or setTurn
    // 1) {set: {key: 'board', value: ...}}
    // 2) {set: {key: 'delta', value: ...}}]
    return getBestMove(board, steps, playerNo, playerIndex);
  }

  function getBestMove(board: Board, steps: number, playerNo: number, playerIndex: number) : IMove {
    gameLogic.initialPLayersMap();
    // The distance that reduced, the larger the better
    var maxDist = 0;
    var bestDelta : BoardDelta = null;
    var deltaList : BoardDelta[] = [];
    var myPieces = getMyPiecePosition(board, playerIndex);
    var stateList : IDeltaHistory[] = [];
    stateList = getBoardListAfterNSteps(board, deltaList, myPieces, steps, playerNo, playerIndex);

    //console.log("stateList=" + JSON.stringify(stateList));
    var maxStartPoint = 0;

    /* for each move result, calculate the distance reduced by the movement,
      choose the move that reduce the most distance */
    for (var i=0; i<stateList.length; i++){
      var thisDist = 0;
      var thisBoard = stateList[i].board;
      var thisDeltaList = stateList[i].deltaList;
      var thisStartPoint = 0;
      for (var j=0; j<thisDeltaList.length; j++){
        var thisDelta = thisDeltaList[j];
        if (j === 0){ thisStartPoint = getPositionNo(thisDelta.rowS, thisDelta.colS, playerIndex) }
        var dist = getRowDiff(thisDelta.rowS, thisDelta.colS, thisDelta.rowE, thisDelta.colE, playerIndex);
        thisDist += dist;
      }
      /* prefer long distance movement and higher starting row (pieces that fall behind) */
      //console.log("thisDist[0]=" + thisDist);
      //console.log("maxDist[0]=" + maxDist);
      if (bestDelta === null || thisDist > maxDist ||
         (thisDist === maxDist && thisStartPoint > maxStartPoint)){
        maxDist = thisDist;
        bestDelta = thisDeltaList[0];
        maxStartPoint = thisStartPoint;
        //console.log("maxDist[1]=" + maxDist);
        //console.log("thisDist[1]=" + thisDist);
      }
    }

    if (maxDist == 0 && nearEndGame(myPieces, playerIndex)){
      var endGameMove = getEndGameMove(board, myPieces, playerIndex, playerNo);
      if (endGameMove){ return endGameMove; }
    }

    var myMove = gameLogic.createMove(board, playerIndex, bestDelta);
    console.log("myMove=" + JSON.stringify(myMove));
    return myMove;
  }

  /* return the final board state and movement history (delta list) by N steps */
  function getBoardListAfterNSteps(board: Board, deltaList: BoardDelta[], myPieces: number[][], steps: number, playerNo: number, playerIndex: number): IDeltaHistory[] {
    if (steps == 0){ return [{board: board, deltaList: angular.copy(deltaList)}]; }
    var result : IDeltaHistory[] = [];
    for (var i=0; i<myPieces.length; i++){
      var row = myPieces[i][0];
      var col = myPieces[i][1];
      var allMoves = gameLogic.getPossibleMoves(board, playerIndex, {rowS:row, colS:col, rowE:row, colE:col, playerNo});

      for (var j=0; j<allMoves.length; j++){
        var thisMove = allMoves[j];
        var nextBoard = thisMove[1].set.value;
        var nextDelta = thisMove[2].set.value;

        // if find a winning step, use it and return
        if (thisMove[0].endMatch != undefined) {
          deltaList.push(nextDelta);
          return [{board: board, deltaList: angular.copy(deltaList)}];
        }

        // if the move is going backward, don't consider next step
        if (getRowDiff(nextDelta.rowS, nextDelta.colS, nextDelta.rowE, nextDelta.colE, playerIndex) < 0){ continue; }

        var nextMyPieces = angular.copy(myPieces);
        nextMyPieces.splice(i, 1);
        nextMyPieces.push([nextDelta.rowE, nextDelta.colE]);
        var nextDeltaList = angular.copy(deltaList);
        nextDeltaList.push(nextDelta);
        var thisResult = getBoardListAfterNSteps(nextBoard, nextDeltaList, nextMyPieces, steps-1, playerNo, playerIndex);
        if(thisResult){ result.push.apply(result, thisResult); }
        // remove last element for next recursion
        //deltaList.splice(-1,1);
      }
    }
    return result;
  }

  function nearEndGame(myPieces: number[][], playerIndex: number): boolean {
    var rowSum = 0;
    for (var i=0; i<myPieces.length; i++){
      rowSum += getPositionNo(myPieces[i][0], myPieces[i][1], playerIndex);
    }
    if (rowSum < 25){ return true; }
    return false;
  }

  function getEndGameMove(board: Board, myPieces: number[][], playerIndex: number, playerNo: number): IMove {
    var piece: number[] = getNotArrivedPiece(myPieces, playerIndex);
    var target: number[] = getEmptyTargetPosition(board, playerIndex);
    // if no empty target space (have other player's piece) return
    if (!target){ return null; }

    var possibleMoves = gameLogic.getPossibleMoves(board, playerIndex,
      {rowS:piece[0], colS:piece[1], rowE:piece[0], colE:piece[1], playerNo: playerNo});

    var bestMove: IMove = null;
    var minDist = 30;
    for (var j=0; j<possibleMoves.length; j++){
      var thisMove = possibleMoves[j];
      var delta = thisMove[2].set.value;
      var thisDist = Math.abs(parseInt(delta.rowE)-target[0])+
        Math.abs(parseInt(delta.colE)-target[1]);
      if (thisDist < minDist){
        bestMove = thisMove;
        minDist = thisDist;
      }
    }
    console.log("getEndGameMove bestMove=" + JSON.stringify(getEndGameMove));
    return bestMove;
  }

  function getNotArrivedPiece(myPieces: number[][], playerIndex: number): number[] {
    var result : number[] = [];
    var maxPosi = 0;
    for (var i=0; i<myPieces.length; i++){
      var posit = getPositionNo(myPieces[i][0], myPieces[i][1], playerIndex);
      if (posit > 3 && posit > maxPosi){
        result = myPieces[i];
        maxPosi = posit;
      }
    }
    return result;
  }

  function getEmptyTargetPosition(board: Board, playerIndex: number): number[] {
    var result : number[] = [];
    for (var i=0; i<board.length; i++){
      for (var j=0; j<board[0].length; j++){
        if (getPositionNo(i, j, playerIndex) <= 3 && board[i][j] === ""){
          result = [i, j];
          return result;
        }
      }
    }
  }

  /* return the location of all pieces of this player */
  function getMyPiecePosition(board: Board, playerIndex: number): number[][] {
    var myColor = playersMap[playerIndex];
    var result : number[][] = [];
    for (var i=0; i<board.length; i++){
      for (var j=0; j<board[0].length; j++){
        if (board[i][j] == myColor){
          result.push([i, j]);
        }
      }
    }
    return result;
  }

  /* calculate the row diff in this move */
  function getRowDiff(rowS: number, colS: number, rowE: number, colE: number, playerIndex: number): number {
    var startRow : number = parseInt(rowNoByPlayer[playerIndex][rowS][colS]);
    var endRow : number = parseInt(rowNoByPlayer[playerIndex][rowE][colE]);
    //console.log("getRowDiff:rowS=" + rowS + " colS=" + colS + " rowE=" + rowE+ " colE=" + colE + " playerIndex=" + playerIndex);
    return startRow-endRow;
  }

  /* input playerIdx and a position on the board, output the rowNo for the player at this position */
  function getPositionNo(row: number, col: number, playerIndex: number): number {
    try{
      return parseInt(rowNoByPlayer[playerIndex][row][col]);
    }catch(e){
      return 13;
    }
  }

  /* representing the prefer move direction for each player, 9-12 -> start area, 0-3 -> target area */
  var rowNoByPlayer: string[][][] =
   [[['#', '#', '#', '#', '#', '#', '#', '#', '#', '0', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
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
     ['#', '7', '', '6', '', '6', '', '6', '', '7', '', '8', '', '9', '', '10', '', '11', '#'],
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
     ['#', '#', '#', '#', '#', '#', '#', '#', '#', '9', '#', '#', '#', '#', '#', '#', '#', '#', '#']]]

}
