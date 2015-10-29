type Board = string[][];
interface BoardDelta {
  rowS: number;
  colS: number;
  rowE: number;
  colE: number;
  playerNo: number;
}
interface IState {
  board?: Board;
  delta?: BoardDelta;
}

var playersMap : { [key:number]:string; } = {};

module gameLogic {
  /** Map playerIdx with player color */
  export function initialPLayersMap(): void {
    playersMap[0] = 'R';
    playersMap[1] = 'G';
    playersMap[2] = 'Y';
  }

  export function getPlayerColorById(playerId: number): string {
    return playersMap[playerId];
  }

  /** Returns the initial TicTacToe board, which is a 3x3 matrix containing ''.  */
  export function getInitialBoard(playerNo : number): Board {
    switch (playerNo){
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
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', 'R', '#', '#', '#', '#', '#', '#', '#', '#', '#']]
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
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', 'R', '#', '#', '#', '#', '#', '#', '#', '#', '#']]
    default: throw new Error("illegal Player Number: expect 2 or 3");
    }
  }

  /**
   * Return the winner (either 'X' or 'O') or '' if there is no winner.
   * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
   * E.g., getWinner returns 'X' for the following board:
   *     [['X', 'O', ''],
   *      ['X', 'O', ''],
   *      ['X', '', '']]
   */
  function getWinner(board: Board): string {
    var boardString = '';
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[0].length; j++) {
        var cell = board[i][j];
        boardString += cell === '' ? ' ' : cell;
      }
    }
    var win_patterns = [
      '#########R#########'+
      '########R R########'+
      '#######R R R#######'+
      '. . . R R R R . . .'+
      '#. . . . . . . . .#'+
      '##. . . . . . . .##'+
      '###. . . . . . .###'+
      '##. . . . . . . .##'+
      '#. . . . . . . . .#'+
      '. . . . . . . . . .'+
      '#######. . .#######'+
      '########. .########'+
      '#########.#########',

      '#########.#########'+
      '########. .########'+
      '#######. . .#######'+
      '. . . . . . . . . .'+
      '#. . . . . . . . .#'+
      '##. . . . . . . .##'+
      '###G . . . . . .###'+
      '##G G . . . . . .##'+
      '#G G G . . . . . .#'+
      'G G G G . . . . . .'+
      '#######. . .#######'+
      '########. .########'+
      '#########.#########',


      '#########.#########'+
      '########. .########'+
      '#######. . .#######'+
      '. . . . . . . . . .'+
      '#. . . . . . . . .#'+
      '##. . . . . . . .##'+
      '###. . . . . . Y###'+
      '##. . . . . . Y Y##'+
      '#. . . . . . Y Y Y#'+
      '. . . . . . Y Y Y Y'+
      '#######. . .#######'+
      '########. .########'+
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
  export function getPossibleMoves(board: Board, turnIndexBeforeMove: number, delta: BoardDelta): IMove[] {
    var possibleMoves: IMove[] = [];
    var adjPosition: number[][] = [[0, -2], [-1, -1], [-1, 1], [0, 2], [1, -1], [1, 1]];
    var possibleMoveBoard = angular.copy(board);
    for (var i = 0; i < adjPosition.length; i++) {
      var nextRow: number = delta.rowS+adjPosition[i][0];
      var nextCol: number = delta.colS+adjPosition[i][1];
      var nextDalta: BoardDelta = {rowS:delta.rowS, colS:delta.colS, rowE:nextRow, colE:nextCol, playerNo:delta.playerNo};
      try {
        possibleMoves.push(createMove(board, turnIndexBeforeMove, nextDalta));
        markAsVisited(possibleMoveBoard, nextRow, nextCol);
      } catch (e) {
        // The cell in that position was full.
      }
    }

    try {
      var jumpMoves = getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, delta, delta.rowS, delta.colS);
      if(jumpMoves){ possibleMoves.push.apply(possibleMoves, jumpMoves); }
    } catch (e) {}
    //console.log("getPossibleMoves possibleMoves[2]=" + JSON.stringify(possibleMoves));
    return possibleMoves;
  }

  /** Returns all possible moves from jumping move*/
  export function getPossibleJumpMoves(board: Board, possibleMoveBoard: Board,
    adjPosition: number[][], turnIndexBeforeMove: number, delta: BoardDelta, originalRow: number, originalCol: number): IMove[]{
    var possibleMoves: IMove[] = [];
    var rowS= delta.rowE;
    var colS = delta.colE;
    for(var i=0; i<adjPosition.length; i++){
      var nextRow: number = rowS+adjPosition[i][0];
      var nextCol: number = colS+adjPosition[i][1];
      try {
        if(isOccupied(board, nextRow, nextCol)){
          var jumpRow: number = rowS+adjPosition[i][0]*2;
          var jumpCol: number = colS+adjPosition[i][1]*2;
          var nextDelta: BoardDelta = {rowS:originalRow, colS:originalCol, rowE:jumpRow, colE:jumpCol, playerNo:delta.playerNo};
          var move = createMove(possibleMoveBoard, turnIndexBeforeMove, nextDelta);
          if(move) {
            possibleMoves.push(move);
            markAsVisited(possibleMoveBoard, jumpRow, jumpCol);
            var nextMove = getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, nextDelta, originalRow, originalCol);
            if(nextMove.length > 0) { possibleMoves.push.apply(possibleMoves, nextMove); }
          }
        }
      } catch (e){  }
    }
    //console.log("getPossibleJumpMoves possibleMoves[2]=" + JSON.stringify(possibleMoves));
    return possibleMoves;
  }

  /** Add an '@' mark onto the board representing the position had been visited*/
  function markAsVisited(board: Board, row: number, col: number){
    board[row][col] = '@';
  }

  /** Check if this position is occupied by a piece */
  function isOccupied(board: Board, row: number, col: number): boolean {
    if(board[row][col] === 'R' || board[row][col] === 'G' || board[row][col] === 'Y'){ return true; }
    return false;
  }

  function replaceAll(board: Board, replaceFrom: string, replaceTo: string): Board{
    var resultBoard = angular.copy(board);
    for(var i=0; i<board.length; i++){
      for(var j=0; j<board[0].length; j++){
        if(resultBoard[i][j] === replaceFrom){ resultBoard[i][j] = replaceTo; }
      }
    }
    return resultBoard;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
      board: Board, turnIndexBeforeMove: number, delta: BoardDelta): IMove {

    console.log("createMove[0-0]");
    console.log("createMove[0-1] board=", JSON.stringify(board));
    console.log("createMove[0-2] turnIndexBeforeMove=", turnIndexBeforeMove);
    console.log("createMove[0-3] delta=", JSON.stringify(delta));

    if (!board) {
      // Initially (at the beginning of the match), the board in state is undefined.
      throw new Error("Board doesn't initial normally");
    }

    console.log("createMove[0]");
    var rowS = delta.rowS;
    var colS = delta.colS;
    var rowE = delta.rowE;
    var colE = delta.colE;
    var playerNo = delta.playerNo;

    //if (!playersMap[turnIndexBeforeMove]) {
    //  initialPLayersMap();
    //}
    if (rowS < 0 || colS < 0 || rowS >= board.length || colS >= board[0].length ||
        rowE < 0 || colE < 0 || rowE >= board.length || colE >= board[0].length ||
        board[rowS][colS] === '#' || board[rowE][colE] === '#'){
      throw new Error("Exceed board range");
    }

    console.log("createMove[1]");

    if (board[rowE][colE] !== '') {
      throw new Error("One can only make a move in an empty position!");
    }
    console.log("createMove[2]");

    if (getWinner(board) !== '') {
      throw new Error("Can only make a move if the game is not over!");
    }

    console.log("createMove[3]");

    var boardAfterMove = replaceAll(board, '@', '');
    boardAfterMove[rowS][colS] = '';
    boardAfterMove[rowE][colE] = playersMap[turnIndexBeforeMove];

    var winner = getWinner(boardAfterMove);
    var firstOperation: IOperation;
    console.log("createMove[4]");

    if (winner !== '') {
      // Game over.
      firstOperation = {endMatch: {endMatchScores:
        [winner === playersMap[0]? 1:0, winner === playersMap[1]? 1:0, winner === playersMap[2]? 1:0]}};
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: (turnIndexBeforeMove+1)%playerNo}};
    }
    console.log("createMove[5]");

    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: delta}}];
  }

  //test commit
  export function isMoveOk(params: IIsMoveOk): boolean {
    console.log("isMoveOk[0]");

    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove: IState = params.stateBeforeMove;

    console.log("isMoveOk[1-1] turnIndexBeforeMove=", turnIndexBeforeMove);
    console.log("isMoveOk[1-2] stateBeforeMove=", JSON.stringify(stateBeforeMove));

    // The state and turn after move are not needed in TicTacToe (or in any game where all state is public).
    //var turnIndexAfterMove = params.turnIndexAfterMove;
    //var stateAfterMove = params.stateAfterMove;

    // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
    // to verify that move is legal.
    try {
      // Example move:
      // [{setTurn: {turnIndex : 1},
      //  {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},


      var deltaValue: BoardDelta = move[2].set.value;
      var board = stateBeforeMove.board;
      if (!board) {
        board = getInitialBoard(deltaValue.playerNo);
      }

      var playerNo = deltaValue.playerNo;

      console.log("isMoveOk[2-1]", JSON.stringify(board));
      console.log("isMoveOk[2-2]", JSON.stringify(deltaValue));

      console.log("isMoveOk[2-3]", JSON.stringify(move));

      var expectedMove = createMove(board, turnIndexBeforeMove, deltaValue);

      console.log("isMoveOk[3]", JSON.stringify(expectedMove));


      if (!angular.equals(move, expectedMove)) {
        return false;
      }
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }
}
