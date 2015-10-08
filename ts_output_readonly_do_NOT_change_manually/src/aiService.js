var aiService;
(function (aiService) {
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
        var bestDelta;
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
            if (thisDist > maxDist) {
                maxDist = thisDist;
                bestDelta = thisDeltaList[0];
            }
        }
        var myMove = gameLogic.createMove(board, playerIndex, bestDelta);
        return myMove;
    }
    /* return the final board state and movement history by N steps */
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
                // if go backward, don't consider next step
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
            ['6', '', '5', '', '4', '', '3', '', '3', '', '3', '', '3', '', '4', '', '5', '', '6'],
            ['#', '6', '', '5', '', '4', '', '4', '', '4', '', '4', '', '4', '', '5', '', '6', '#'],
            ['#', '#', '6', '', '5', '', '5', '', '5', '', '5', '', '5', '', '5', '', '6', '#', '#'],
            ['#', '#', '#', '6', '', '6', '', '6', '', '6', '', '6', '', '6', '', '6', '#', '#', '#'],
            ['#', '#', '8', '', '7', '', '7', '', '7', '', '7', '', '7', '', '7', '', '8', '#', '#'],
            ['#', '10', '', '9', '', '8', '', '8', '', '8', '', '8', '', '8', '', '9', '', '10', '#'],
            ['12', '', '11', '', '10', '', '9', '', '9', '', '9', '', '9', '', '10', '', '11', '', '12'],
            ['#', '#', '#', '#', '#', '#', '#', '10', '', '10', '', '10', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '11', '', '11', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '12', '#', '#', '#', '#', '#', '#', '#', '#', '#']],
        [['#', '#', '#', '#', '#', '#', '#', '#', '#', '12', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '10', '', '11', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '8', '', '9', '', '10', '#', '#', '#', '#', '#', '#', '#'],
            ['6', '', '6', '', '6', '', '6', '', '7', '', '8', '', '9', '', '10', '', '11', '', '12'],
            ['#', '5', '', '5', '', '5', '', '6', '', '7', '', '8', '', '9', '', '10', '', '11', '#'],
            ['#', '#', '4', '', '4', '', '5', '', '6', '', '7', '', '8', '', '9', '', '10', '#', '#'],
            ['#', '#', '#', '3', '', '4', '', '5', '', '6', '', '7', '', '8', '', '9', '#', '#', '#'],
            ['#', '#', '2', '', '3', '', '4', '', '5', '', '6', '', '7', '', '8', '', '10', '#', '#'],
            ['#', '1', '', '2', '', '3', '', '4', '', '5', '', '6', '', '7', '', '9', '', '11', '#'],
            ['0', '', '1', '', '2', '', '3', '', '4', '', '5', '', '6', '', '8', '', '10', '', '12'],
            ['#', '#', '#', '#', '#', '#', '#', '4', '', '5', '', '6', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '5', '', '6', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '6', '#', '#', '#', '#', '#', '#', '#', '#', '#']],
        [['#', '#', '#', '#', '#', '#', '#', '#', '#', '12', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '11', '', '10', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '10', '', '9', '', '8', '#', '#', '#', '#', '#', '#', '#'],
            ['12', '', '11', '', '10', '', '9', '', '8', '', '7', '', '6', '', '6', '', '6', '', '6'],
            ['#', '11', '', '10', '', '9', '', '8', '', '7', '', '6', '', '5', '', '5', '', '5', '#'],
            ['#', '#', '10', '', '9', '', '8', '', '7', '', '6', '', '5', '', '4', '', '4', '#', '#'],
            ['#', '#', '#', '9', '', '8', '', '7', '', '6', '', '5', '', '4', '', '3', '#', '#', '#'],
            ['#', '#', '10', '', '8', '', '7', '', '6', '', '5', '', '4', '', '3', '', '2', '#', '#'],
            ['#', '11', '', '9', '', '7', '', '6', '', '5', '', '4', '', '3', '', '2', '', '1', '#'],
            ['12', '', '10', '', '8', '', '6', '', '5', '', '4', '', '3', '', '2', '', '1', '', '0'],
            ['#', '#', '#', '#', '#', '#', '#', '6', '', '5', '', '4', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '6', '', '5', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '6', '#', '#', '#', '#', '#', '#', '#', '#', '#']]];
})(aiService || (aiService = {}));
