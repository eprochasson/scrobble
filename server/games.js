var Board = function(board, bag){
    return {
        board: board,
        bag: bag,

        // Create a game board from a given board.
        makeBoard : function(){
            var b = [], thisline;
            _.each(this.board, function(line){
                thisline = [];
                _.each(line, function(tile){
                    thisline.push({mul: tile, content: ''});
                });
                b.push(thisline);
            });
            this.board = b;
            return b;
        },
        // Check if that the board is all ok (before committing the modification).
        checkBoard : function(){
            var result = true;
            // Actually much simpler than expected. Just parse the board line by line, left to right, top to bottom. If we encounter the beginning
            // of a word, just check that it's cool, then proceed to the next tile to the right.
            // Terminate because there is no actual recursivity.

            var direction = 0;
            // HOLLY SHIT A GOTO!
            forfor:
                for(var x = 0 ; x < this.boardDimension() ; x++){
                    for(var y = 0 ; y < this.boardDimension() ; y++){
                        if(direction = this.isBeginningOfWord(x,y)){
                            if(!this.checkWordAtPosition(x,y, direction)){
                                result = false;
                                break forfor;
                            }
                        }
                    }
                }

            return result;
        },
        // Check that the current tile holds the beginning of a word, horizontally or vertically (and return the direction if any)
        isBeginningOfWord : function(x,y){
            // Beginning of a word in the following case:
            // 1- no letter on its left and one letter on its right
            // 2- no letter on top and one under

            var direction = 0; // 0: not beginning, 1: left to right, 2: top to bottom, 3: both;

            // case 1
            if(
                (x == 0 || this.isEmptyTile(x-1,y)) // on the left border or nothing on the left
                    &&
                    (!(x == this.boardDimension()-1) && !this.isEmptyTile(x+1,y)) // Not on the right border AND not empty on the right.
                ){
                direction = 1;
            }
            // case 2
            if(
                (y == 0 || this.isEmptyTile(x,y-1)) // on the top border or nothing over
                    &&
                    (!(y == this.boardDimension()-1) && !this.isEmptyTile(x,y+1)) // Not on the bottom border AND not empty on the bottom.
                ){
                direction += 2;
            }
            return direction;
        },
        // Assume the board is square, return it's width.
        boardDimension : function(){
            return this.board.length;
        },
        // Check that a word starting at a given position is in the dictionary
        checkWordAtPosition : function(x,y,direction){
            var result;
            switch(direction){
                case 1:
                    result = this._checkWordAtPositionHorizontally(x,y);
                    break;
                case 2:
                    result = this._checkWordAtPositionVertically(x,y);
                    break;
                case 3:
                    result = this._checkWordAtPositionVertically(x,y) && this._checkWordAtPositionHorizontally(x,y);
                    break;
                default: // gni?
                    result = true;
            }
            return result;
        },

        // Check a word, vertically...
        _checkWordAtPositionVertically : function(x,y){
            var word = "";
            while(!this.isEmptyTile(x,y) && y < this.boardDimension()){
                word += this.tileValue(x, y);
                y += 1;
            }
            if(word.length > 1){
                if(Dictionary.findOne({word: word})){
                    return true
                }
            }
            return false;
        },
        _checkWordAtPositionHorizontally : function(x,y){
            var word = "";
            while(!this.isEmptyTile(x,y) && x < this.boardDimension()){
                word += this.tileValue(x, y);
                x += 1;
            }
            if(word.length > 1){
                if(Dictionary.findOne({word: word})){
                    return true
                }
            }
            return false;
        },

        // Check that a given tile has a value.
        isEmptyTile: function(x,y){
            return this.board[x][y].content == "";
        },
        // Return current tile value.
        tileValue: function(x,y){
            return this.board[x][y].content;
        },
        play: function(coords){
            var x, y, v;
            var valid = true;
            _.each(coords, function(c){
                x = c.x; y = x.y;
                // check that all tiles were free before.
                valid = valid && this.isEmptyTile(x,y);
            });
            if(!valid){
                return false;
            }
            _.each(coords, function(c){
                x = c.x; y = x.y ; v = x.v;
                // check that all tiles were free before.
                this.board[x][y].content = v;
            });
            return true;
        },
        // No idea how to do that yet.
        score: function(coords){
            return 0;
        },
        // Transform a bag object into an actual set of tiles. Shuffle the tiles.
        makeBag: function(){
            if(typeof this.bag == 'object'){
                var bag = [];
                _.each(this.bag, function(v,k){
                    for(var i = 0 ; i < v.quantity ; i++){
                        bag.push({letter: k, value: v.value});
                    }
                });
                this.bag = bag;
            }
            this.bag = _.shuffle(this.bag);
            return this.bag;
        },
        // Pick tiles from the bag, withdraw them from the bag, return the selection.
        pickTiles: function(quantity){
            var res = [];
            if(quantity > this.bag.length){
                res = this.bag;
                this.bag = [];
                return res;
            }
            res = this.bag.slice(0, quantity);
            this.bag = this.bag.slice(quantity);
            return res;
        }
    };
};

Meteor.methods({
    createGame: function(){
        var b = Board(Config.Board, Config.Letters);

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

        Games.update(gameId, {$set: {playerTwo : this.userId}}, function(err, res){
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

        var board = Board(game.board, game.bag);
        var score = 0;

        if(!(game.playerTurn === this.userId)){
            throw new Meteor.Error(300, "Forbidden");
        }

        if(board.play(coords)){
            score = board.score(coords);
        }
        // Play is valid.
        var playerOneTiles = game.playerOneTiles;
        var playerTwoTiles = game.playerTwoTiles;

        var nextPlayer, currentPlayer, bag = game.bag;
        if(game.playerTurn === game.playerOne){
            nextPlayer = game.playerTwo;
            playerOneTiles = board.pickTiles(7-playerOneTiles.length);
            currentPlayer = 'playerOne';
        } else {
            nextPlayer = game.playerOne;
            playerTwoTiles = board.pickTiles(7-playerTwoTiles.length);
            currentPlayer = 'playerTwo';
        }


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