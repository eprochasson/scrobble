
Meteor.methods({
    createGame: function(){
        var b = new Board(Config.Board, Config.Letters, Config.Letters);

        b.makeBag();
        b.makeBoard();

        var doc = {};
        doc.board = b.board; // Initialize the board
        doc.playerOne = this.userId;
        doc.playerTurn = this.userId;
        doc.spectators = [];
        doc.playerOneScore = 0;
        doc.playerTwoScore = 0;
        doc.bag = b.bag;
        doc.bagSize = b.bag.length;
        doc.playerOneTiles = b.pickTiles(7); // randomly pick tiles for players
        doc.playerTwoTiles = b.pickTiles(7);

        doc.started = new Date().getTime();

        return Games.insert(doc);
    },
    // Register player two. If not, register spectator.
    joinGame: function(gameId){
        if(!this.userId){
            throw new Meteor.Error(300, 'Forbidden');
        }
        var game = Games.findOne(gameId);

        var currentPlayer = game.playerTurn;
        if(!game || !this.userId){
            throw new Meteor.Error(404,'Game Not Found');
        }


        // We already have a player 2.
        if(game.playerTwo && game.playerTwo !== this.userId){
            // If this player is not already a spectator.
            if(_.indexOf(game.spectators, this.userId) < 0){
                Games.update(gameId, {$push: {spectators: this.userId}}, function(err,res){
                    if(err){
                        throw Meteor.Error(err);
                    } else {
                        return true;
                    }
                });
            }
        }

        if(!currentPlayer || currentPlayer != game.playerOne){
            currentPlayer = this.userId;
        }

        Games.update(gameId, {$set: {playerTwo : this.userId, playerTurn: currentPlayer}}, function(err, res){
            if(err){
                throw Meteor.Error(err);
            } else {
                return true;
            }
        });
    },
    /**
     * Check that a play is correct, commit it if it is. Return the points scored.
     * @param coords Array, [(x: x, y: y, v: tile value }]
     * @param gameId Unique Id of the game.
     */
    play: function(coords, gameId){
        if(!this.userId){
            throw new Meteor.Error (300, "Forbidden");
        }

        var game = Games.findOne(gameId);
        if(!game){
            throw new Meteor.Error(404, "Game Not Found");
        }

        var board = new Board(game.board, game.bag, Config.Letters);
        var score = 0;

        if(!(game.playerTurn === this.userId)){
            throw new Meteor.Error(300, "Forbidden");
        }

        var playerOneTiles = game.playerOneTiles;
        var playerTwoTiles = game.playerTwoTiles;
        var playerOneScore = game.playerOneScore;
        var playerTwoScore = game.playerTwoScore;
        var currentPlayerTiles;

        if(game.playerTurn === game.playerOne){
            currentPlayerTiles = playerOneTiles;
        } else {
            currentPlayerTiles = playerTwoTiles;
        }

        // Check that the move is valid (and get some score).
        score = board.play(coords, currentPlayerTiles);
        if(score === false){
            throw new Meteor.Error(400, "Invalid Move");
        }


        // Play is valid.
        var nextPlayer, currentPlayer, bag = game.bag;
        if(game.playerTurn === game.playerOne){
            playerOneTiles = board.removePlayerTiles(coords, playerOneTiles);
            playerOneTiles = playerOneTiles.concat(board.pickTiles(7-playerOneTiles.length));
            playerOneScore += score;
            nextPlayer = game.playerTwo;
        } else {
            playerTwoTiles = board.removePlayerTiles(coords,playerTwoTiles);
            playerTwoTiles = playerTwoTiles.concat(board.pickTiles(7-playerTwoTiles.length));
            playerTwoScore += score;
            nextPlayer = game.playerOne;
        }

        // DEBUG:
//        nextPlayer = game.playerOne;

        Games.update(gameId,
            {
                $set:
                {
                    board: board.board,
                    lastplay: new Date().getTime(),
                    playerTurn: nextPlayer,
                    playerOneTiles : playerOneTiles,
                    playerTwoTiles: playerTwoTiles,
                    playerOneScore: playerOneScore,
                    playerTwoScore: playerTwoScore,
                    bag: board.bag,
                    bagSize: board.bag.length
                }
            }, function(err, res){
                if(err){
                    throw new Meteor.Error(err);
                } else {
                    return {
                        score: score
                    };
                }
            })
    },
    skip_turn: function(gameId){
        if(!this.userId){
            throw new Meteor.Error (300, "Forbidden");
        }

        var game = Games.findOne(gameId);
        if(!game){
            throw new Meteor.Error(404, "Game Not Found");
        }

        if(!(game.playerTurn === this.userId)){
            throw new Meteor.Error(300, "Forbidden");
        }

        var playerTurn;
        if(game.playerTurn === game.playerOne){
            playerTurn = game.playerTwo;
        } else {
            playerTurn = game.playerOne;
        }

        return Games.update(gameId, {$set: {playerTurn: playerTurn}});
    },
    change_tiles: function(gameId){
        if(!this.userId){
            throw new Meteor.Error (300, "Forbidden");
        }

        var game = Games.findOne(gameId);
        if(!game){
            throw new Meteor.Error(404, "Game Not Found");
        }

        var board = new Board(game.board, game.bag, Config.Letters);

        if(!(game.playerTurn === this.userId)){
            throw new Meteor.Error(300, "Forbidden");
        }

        var playerOneTiles = game.playerOneTiles;
        var playerTwoTiles = game.playerTwoTiles;
        var nextPlayer;

        if(this.userId == game.playerOne){
            board.putTilesBack(playerOneTiles);
            playerOneTiles = board.pickTiles(7);
            nextPlayer = game.playerTwo;
        } else {
            board.putTilesBack(playerTwoTiles);
            playerTwoTiles = board.pickTiles(7);
            nextPlayer = game.playerOne;
        }

        // DEBUG:
//        nextPlayer = game.playerOne;

        Games.update(gameId,
            {
                $set:
                {
                    board: board.board,
                    lastplay: new Date().getTime(),
                    playerTurn: nextPlayer,
                    playerOneTiles : playerOneTiles,
                    playerTwoTiles: playerTwoTiles,
                    bag: board.bag
                }
            }, function(err, res){
                if(err){
                    throw new Meteor.Error(err);
                } else {
                    return {
                        score: score
                    };
                }
            })
    }
});