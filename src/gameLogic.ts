type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
  playerNo: number;
}
interface IState {
  board?: Board;
  delta?: BoardDelta;
}
var playersMap : { [key:number]:string; } = {};
//var playersMap = { 0:'R', 1:'G', 2:'Y' };

module gameLogic {
  /** Map playerIdx with player color */
  export function initialPLayersMap(): void {
    playersMap[0] = 'R';
    playersMap[1] = 'G';
    playersMap[2] = 'Y';
  }

  /** Returns the initial TicTacToe board, which is a 3x3 matrix containing ''. */
  export function getInitialBoard(playerNo : number): Board {
    switch (playerNo){
      case 2:
      return [['#', '#', '#', '#', '#', '#', '#', '#', '#', 'R', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', 'R', '', 'R', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', 'R', '', 'R', '', 'R', '#', '#', '#', '#', '#', '#', '#'],
            ['', '', '', '', '', '', 'R', '', 'R', '', 'R', '', 'R', '', '', '', '', '', ''],
            ['#', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#'],
            ['#', '#', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#', '#'],
            ['#', '#', '#', 'G', '', '', '', '', '', '', '', '', '', '', '', '', '#', '#', '#'],
            ['#', '#', 'G', '', 'G', '', '', '', '', '', '', '', '', '', '', '', '', '#', '#'],
            ['#', 'G', '', 'G', '', 'G', '', '', '', '', '', '', '', '', '', '', '', '', '#'],
            ['G', '', 'G', '', 'G', '', 'G', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['#', '#', '#', '#', '#', '#', '#', '', '', '', '', '', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '', '', '', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '', '#', '#', '#', '#', '#', '#', '#', '#', '#']]
    case 3:
      return [['#', '#', '#', '#', '#', '#', '#', '#', '#', 'R', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', 'R', '', 'R', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', 'R', '', 'R', '', 'R', '#', '#', '#', '#', '#', '#', '#'],
            ['', '', '', '', '', '', 'R', '', 'R', '', 'R', '', 'R', '', '', '', '', '', ''],
            ['#', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#'],
            ['#', '#', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#', '#'],
            ['#', '#', '#', 'G', '', '', '', '', '', '', '', '', '', '', '', 'Y', '#', '#', '#'],
            ['#', '#', 'G', '', 'G', '', '', '', '', '', '', '', '', '', 'Y', '', 'Y', '#', '#'],
            ['#', 'G', '', 'G', '', 'G', '', '', '', '', '', '', '', 'Y', '', 'Y', '', 'Y', '#'],
            ['G', '', 'G', '', 'G', '', 'G', '', '', '', '', '', 'Y', '', 'Y', '', 'Y', '', 'Y'],
            ['#', '#', '#', '#', '#', '#', '#', '', '', '', '', '', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '', '', '', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '', '#', '#', '#', '#', '#', '#', '#', '#', '#']]
    default: return []
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
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var cell = board[i][j];
        boardString += cell === '' ? ' ' : cell;
      }
    }
    var win_patterns = [
      '#########.#########\
       ########. .########\
       #######. . .#######\
       . . . . . . . . . .\
       #. . . . . . . . .#\
       ##. . . . . . . .##\
       ###. . . . . . .###\
       ##. . . . . . . .##\
       #. . . . . . . . .#\
       . . . R R R R . . .\
       #######R R R#######\
       ########R R########\
       #########R#########',

      '#########.#########\
       ########. .########\
       #######. . .#######\
       . . . . . . G G G G\
       #. . . . . . G G G#\
       ##. . . . . . G G##\
       ###. . . . . . G###\
       ##. . . . . . . .##\
       #. . . . . . . . .#\
       . . . . . . . . . .\
       #######. . .#######\
       ########. .########\
       #########.#########',


      '#########.#########\
       ########. .########\
       #######. . .#######\
       Y Y Y Y . . . . . .\
       #Y Y Y . . . . . .#\
       ##Y Y . . . . . .##\
       ###Y . . . . . .###\
       ##. . . . . . . .##\
       #. . . . . . . . .#\
       . . . . . . . . . .\
       #######. . .#######\
       ########. .########\
       #########.#########'
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
  export function getPossibleMoves(board: Board, turnIndexBeforeMove: number, row: number, col: number, playerNo: number): IMove[] {
    var possibleMoves: IMove[] = [];
    var adjPosition: number[][] = [[0, -2], [-1, -1], [-1, 1], [0, 2], [1, -1], [1, 1]];
    var possibleMoveBoard = angular.copy(board);
    for (var i = 0; i < adjPosition.length; i++) {
      var nextRow: number = row+adjPosition[i][0];
      var nextCol: number = col+adjPosition[i][1];
      try {
        possibleMoves.push(createMove(board, nextRow, nextCol, turnIndexBeforeMove, playerNo));
        markAsVisited(possibleMoveBoard, nextRow, nextCol);
      } catch (e) {
        // The cell in that position was full.
      }
    }

    try {
      possibleMoves.push(getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, row, col, playerNo));
    } catch (e) {}

    return possibleMoves;
  }

  /** Returns all possible moves from jumping */
  export function getPossibleJumpMoves(board: Board, possibleMoveBoard: Board,
    adjPosition: number[][], turnIndexBeforeMove: number, row: number, col: number, playerNo: number): IMove[]{
    var possibleMoves: IMove[] = [];
    for(var i=0; i<adjPosition.length; i++){
      var nextRow: number = row+adjPosition[i][0];
      var nextCol: number = col+adjPosition[i][1];
      try {
        if(isOccupied(board, nextRow, nextCol)){
          var jumpRow: number = row+adjPosition[i][0]*2;
          var jumpCol: number = col+adjPosition[i][1]*2;
          possibleMoves.push(createMove(possibleMoveBoard, jumpRow, jumpCol, turnIndexBeforeMove, playerNo));
          markAsVisited(possibleMoveBoard, jumpRow, jumpCol);
          possibleMoves.push(getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, jumpRow, jumpCol, playerNo));
        }
      } catch (e){  }
    }
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
      board: Board, row: number, col: number, turnIndexBeforeMove: number, playerNo: number): IMove {
    if (!board) {
      // Initially (at the beginning of the match), the board in state is undefined.
      board = getInitialBoard(playerNo);
    }
    if (!playersMap) {
      initialPLayersMap();
    }
    if (row < 0 || col < 0 || row >= board.length || col >= board[0].length || board[row][col] === '#'){
      throw new Error("Exceed board range");
    }
    if (board[row][col] !== '') {
      throw new Error("One can only make a move in an empty position!");
    }
    if (getWinner(board) !== '') {
      throw new Error("Can only make a move if the game is not over!");
    }
    var boardAfterMove = replaceAll(board, '@', '');
    boardAfterMove[row][col] = playersMap[turnIndexBeforeMove];
    var winner = getWinner(boardAfterMove);
    var firstOperation: IOperation;
    if (winner !== '') {
      // Game over.
      firstOperation = {endMatch: {endMatchScores:
        [winner === playersMap[0]? 1:0, winner === playersMap[1]? 1:0, winner === playersMap[2]? 1:0]}};
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: (turnIndexBeforeMove+1)%playerNo}};
    }
    var delta: BoardDelta = {row: row, col: col, playerNo: playerNo};
    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: delta}}];
  }

  export function isMoveOk(params: IIsMoveOk): boolean {
    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove: IState = params.stateBeforeMove;
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
      var deltaValue: BoardDelta = move[2].set.value;
      var row = deltaValue.row;
      var col = deltaValue.col;
      var board = stateBeforeMove.board;
      var playerNo = deltaValue.playerNo;

      var expectedMove = createMove(board, row, col, turnIndexBeforeMove, playerNo);
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
