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
//var playersMap = { 0:'R', 1:'G', 2:'Y' };

module gameLogic {
  /** Map playerIdx with player color */
  function initialPLayersMap(): void {
    playersMap[0] = 'R';
    playersMap[1] = 'G';
    playersMap[2] = 'Y';
    //console.log("initialPLayersMap playersMap[0]=" + playersMap[0]);
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

    console.log("getWinner boardString="+ boardString);
    for (i = 0; i < win_patterns.length; i++) {
      var win_pattern = win_patterns[i];
      console.log("getWinner win_pattern="+ win_pattern);
      var regexp = new RegExp(win_pattern);
      console.log("getWinner test="+ regexp.test(boardString));
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
      var nextDalta: BoardDelta = {rowS:delta.rowE, colS:delta.colE, rowE:nextRow, colE:nextCol, playerNo:delta.playerNo};
      try {
        possibleMoves.push(createMove(board, turnIndexBeforeMove, nextDalta));
        markAsVisited(possibleMoveBoard, nextRow, nextCol);
      } catch (e) {
        // The cell in that position was full.
      }
    }

    try {
      possibleMoves.push(getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, delta));
    } catch (e) {}

    return possibleMoves;
  }

  /** Returns all possible moves from jumping move*/
  export function getPossibleJumpMoves(board: Board, possibleMoveBoard: Board,
    adjPosition: number[][], turnIndexBeforeMove: number, delta: BoardDelta): IMove[]{
    var possibleMoves: IMove[] = [];
    var rowS= delta.rowS;
    var colS = delta.colS;
    for(var i=0; i<adjPosition.length; i++){
      var nextRow: number = rowS+adjPosition[i][0];
      var nextCol: number = colS+adjPosition[i][1];
      try {
        if(isOccupied(board, nextRow, nextCol)){
          var jumpRow: number = rowS+adjPosition[i][0]*2;
          var jumpCol: number = colS+adjPosition[i][1]*2;
          var nextDelta: BoardDelta = {rowS: delta.rowE, colS:delta.colE, rowE:jumpRow, colE:jumpCol, playerNo:delta.playerNo};
          possibleMoves.push(createMove(possibleMoveBoard, turnIndexBeforeMove, nextDelta));
          markAsVisited(possibleMoveBoard, jumpRow, jumpCol);
          possibleMoves.push(getPossibleJumpMoves(board, possibleMoveBoard, adjPosition, turnIndexBeforeMove, nextDelta));
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
      board: Board, turnIndexBeforeMove: number, delta: BoardDelta): IMove {
    var rowS = delta.rowS;
    var colS = delta.colS;
    var rowE = delta.rowE;
    var colE = delta.colE;
    var playerNo = delta.playerNo;

    if (!board) {
      // Initially (at the beginning of the match), the board in state is undefined.
      board = getInitialBoard(playerNo);
    }

    console.log("createMove playersMap=" + JSON.stringify(playersMap));
    if (!playersMap[turnIndexBeforeMove]) {
      console.log("createMove playersMap=");
      initialPLayersMap();
    }
    if (rowS < 0 || colS < 0 || rowS >= board.length || colS >= board[0].length ||
        rowE < 0 || colE < 0 || rowE >= board.length || colE >= board[0].length ||
        board[rowS][colS] === '#' || board[rowE][colE] === '#'){
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

    console.log("turnIndexBeforeMove="+turnIndexBeforeMove);
    console.log("createMove playersMap=" + JSON.stringify(playersMap));
    console.log("playersMap[turnIndexBeforeMove]="+playersMap[turnIndexBeforeMove]);


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

    console.log("createMove firstOperation=" + JSON.stringify(firstOperation));
    console.log("createMove boardAfterMove=" + boardAfterMove);
    console.log("createMove delta=" + delta);
    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: delta}}];
  }

  //test commit
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
      var board = stateBeforeMove.board;
      var playerNo = deltaValue.playerNo;

      var expectedMove = createMove(board, turnIndexBeforeMove, deltaValue);

      console.log("isMoveOk expectedMove=" +  JSON.stringify(expectedMove));
      console.log("isMoveOk move=" + JSON.stringify(move));

      if (!angular.equals(move, expectedMove)) {
        console.log("return false");
        return false;
      }
    } catch (e) {
      console.log("isMoveOk Exception");
      // if there are any exceptions then the move is illegal
      return false;
    }
    console.log("return true");
    return true;
  }
}
