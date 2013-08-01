var Board = function(board, bag, values){
    return {
        board: board,
        bag: bag,
        values: values, // values for letter

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
        // Also calculate the score for this play since we parse the whole board.
        // Not very nice as the output of the function is not consistent, but I don't want to parse the board twice because I'm lazy.
        checkBoard : function(clearAfter){
            // Actually much simpler than expected. Just parse the board line by line, left to right, top to bottom. If we encounter the beginning
            // of a word, just check that it's cool, then proceed to the next tile to the right.
            // Terminate because there is no actual recursion.

            var direction = 0;
            var score = 0, s;


            // Make sure the central tile is covered.
            if(!this._centralTilePlayed()){
                console.log('central tile not covered');
                return false
            }

            var nb_tiles = 0; // just save the number of tiles use for the connectivity search algorithm. Bit dirty but hey.
            for(var y = 0 ; y < this.boardDimension() ; y++){
                for(var x = 0 ; x < this.boardDimension() ; x++){
                    if(!this.isEmptyTile(x,y)){
                        nb_tiles += 1;
                    }
                    if(direction = this.isBeginningOfWord(x,y)){
                        s = this.checkWordAtPosition(x,y, direction);
                        if(s === false){
                            console.log('Invalid word');
                            return false;
                        } else {
                            score += s;
                        }
                    }
                }
            }

            // Make sure the board is a connected graph.
            if(!this._checkBoardConnected(nb_tiles)){
                console.log('board not connected');
                return false;
            }

            // Clear tiles marked as new
            if(clearAfter){
                this._clearBoard();
            }

            return score;
        },

        _checkBoardConnected: function(nb_tiles){
            var through = [];
            var toparse = [];
            var current, neighbours;
            // starts from the central piece.
            var start = [7,7];

            toparse = this._neighbours(start[0], start[1]);

            while(!toparse.length == 0){
                current = toparse.pop();
                if(!_.contains(through, current[0]+';'+current[1])){
                    console.log('parsing', current);
                    through.push(current[0]+';'+current[1]);
                    neighbours = this._neighbours(current[0], current[1]);
                    _.each(neighbours, function(n){
                        if(!_.contains(through, n[0]+';'+n[1])){
                            toparse.push(n);
                        }
                    });
                }
            }

            return through.length === nb_tiles;

        },
        // Return the list of a tile neighbours.
        _neighbours : function(x,y){
            var neighbours = [];
            if(!this.isEmptyTile(x,y-1)){
                neighbours.push([x,y-1]);
            }
            if(!this.isEmptyTile(x,y+1)){
                neighbours.push([x,y+1]);
            }
            if(!this.isEmptyTile(x-1,y)){
                neighbours.push([x-1,y]);
            }
            if(!this.isEmptyTile(x+1,y)){
                neighbours.push([x+1,y]);
            }
            return neighbours;
        },
        // would be nice to have that not hardcoded...
        _centralTilePlayed: function(){
            return !this.isEmptyTile(7,7);
        },
        // make sure "new" tiles are unmarked as new.
        _clearBoard: function(){
            var dim = this.boardDimension();

            for(var y = 0 ; y < dim ; y++){
                for(var x = 0 ; x < dim ; x++){
                    delete this.board[y][x].isnew;
                }
            }
        },
        // Check that the current tile holds the beginning of a word, horizontally or vertically (and return the direction if any)
        isBeginningOfWord : function(x,y){
            // Beginning of a word in the following case:
            // 1- no letter on its left and one letter on its right
            // 2- no letter on top and one under

            var direction = 0; // 0: not beginning, 1: left to right, 2: top to bottom, 3: both;

            if(this.isEmptyTile(x,y)){
                return 0;
            }

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
            var score = 0;
            var scores = false;
            var multiplier = 1;
            while(!this.isEmptyTile(x,y) && y < this.boardDimension()){
                var tile = this.tile(x,y);
                word += tile.content;
                if(tile.isnew){
                    scores = true;
                    switch(tile.mul){
                        case 0: // normal letter
                            score += this.values[tile.content].value;
                            break;
                        case 1: // letter double
                            score += 2*this.values[tile.content].value;
                            break;
                        case 2: // letter triple
                            score += 3*this.values[tile.content].value;
                            break;
                        case 3: // word double
                            multiplier += 1;
                            score += this.values[tile.content].value;
                            break;
                        case 4:  // word triple
                            multiplier += 2;
                            score += this.values[tile.content].value;
                            break;
                        case 5 : //word start
                            multiplier += 1;
                            score += this.values[tile.content].value;
                            break;
                        default:
                    }
                } else {
                    score += this.values[tile.content].value;
                }
                y += 1;
            }
            if(word.length > 1 && this.inDictionary(word)){
                if(scores){
                    console.log('score', score*multiplier);
                    return score * multiplier;
                } else {
                    console.log('score: 0');
                    return 0;
                }
            } else {
                return false;
            }
        },
        _checkWordAtPositionHorizontally : function(x,y){
            var word = "";
            var score = 0;
            var scores = false;
            var multiplier = 1;

            while(!this.isEmptyTile(x,y) && x < this.boardDimension()){
                var tile = this.tile(x,y);
                word += tile.content;
                if(tile.isnew){
                    scores = true;
                    switch(tile.mul){
                        case 0: // normal letter
                            score += this.values[tile.content].value;
                            console.log('score: normal tile',this.values[tile.content].value);
                            break;
                        case 1: // letter double
                            score += 2*this.values[tile.content].value;
                            console.log('score: letter double',this.values[tile.content].value);
                            break;
                        case 2: // letter triple
                            score += 3*this.values[tile.content].value;
                            console.log('score: letter triple',this.values[tile.content].value);
                            break;
                        case 3: // word double
                            multiplier += 1;
                            score += this.values[tile.content].value;
                            console.log('score: word double',this.values[tile.content].value);
                            break;
                        case 4:  // word triple
                            multiplier += 2;
                            score += this.values[tile.content].value;
                            console.log('score: word tripler',this.values[tile.content].value);
                            break;
                        case 5 : //word start
                            multiplier += 1;
                            score += this.values[tile.content].value;
                            console.log('score: start case',this.values[tile.content].value);
                            break;
                        default:
                    }
                } else {
                    score += this.values[tile.content].value;
                    console.log('score: normal old tile',this.values[tile.content].value);
                }
                x += 1;
            }

            if(word.length > 1 && this.inDictionary(word)){
                if(scores){
                    console.log('score', score*multiplier);
                    return score * multiplier;
                } else {
                    console.log('score: 0');
                    return 0;
                }
            } else {
                return false;
            }
        },
        inDictionary: function(word){
            console.log('Checking word', word);
            // debug
            return true;
            return Boolean(Dictionary.findOne({word: word}));
        },
        // Check that a given tile has a value.
        isEmptyTile: function(x,y){
            return !this.board[y] || !this.board[y][x] || this.board[y][x].content == "";

        },
        // Return current tile value.
        tileValue: function(x,y){
            return this.board[y][x].content;
        },
        tile: function(x,y){
            return this.board[y][x];
        },
        play: function(coords, tiles){
            var self = this;
            var x, y, v; // coords + letter value
            var t = []; // values of tiles.

            if(!this._checkTilesPlayedDirection(coords)){
                console.log('wrong direction');
                return false;
            }

            _.each(tiles, function(ty){
                t.push(ty.letter);
            });

            var valid = true;
            _.each(coords, function(c){
                x = c.x; y = c.y; v= c.v;
                // check that all tiles were free before.
                valid = valid && self.isEmptyTile(x,y) && _.contains(t, v);
            });
            if(!valid){
                console.log('player played over tiles');
                return false;
            }
            _.each(coords, function(c){
                x = c.x; y = c.y ; v = c.v;
                self.setTileValue(x,y,v, true);
            });

            return this.checkBoard(true);
        },
        // just checked that the tiles played are on one line or one column.
        _checkTilesPlayedDirection : function(coords){
            if(!coords || !(typeof coords == 'object') || !coords[0]){
                return false;
            }
            if(!coords[1]){
                return true;
            }
            var x, y, x2, y2, direction, valid;

            x = coords[0].x; y = coords[0].y;
            x2 = coords[1].x ; y2 = coords[1].y;
            if(x == x2 && y != y2){
                direction = 'x';
            } else if(x != x2 && y == y2){
                direction = 'y';
            } else {
                return false;
            }
            for(var i = 2 ; i < coords.length ; i++){
                if(coords[i-1][direction] != coords[i][direction]){
                    return false;
                }
            }
            return true;
        },
        setTileValue: function(x,y,value, isnew){
            this.board[y][x].content = value;
            if(isnew){
                this.board[y][x].isnew = true;
            }
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
        },
        removePlayerTiles : function(coords, tiles){
            var res = [];
            var c = [] ; // list of tiles played, built from coords
            _.each(coords, function(co){
                c.push(co.v);
            });

            _.each(tiles, function(t){
                if(!_.contains(c, t.letter)){
                    res.push(t);
                }
            });

            tiles = res;
            return tiles;
        },
        putTilesBack: function(tiles){
            this.bag.concat(tiles);
        }
    };
};

Meteor.methods({
    createGame: function(){
        var b = Board(Config.Board, Config.Letters, Config.Letters);

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

        var board = Board(game.board, game.bag, Config.Letters);
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

        console.log('player scored ',score);

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
            nextPlayer = game.PlayerOne;
        }

        console.log(playerOneScore);

        // DEBUG:
        nextPlayer = game.playerOne;

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

        var board = Board(game.board, game.bag, Config.Letters);

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
        nextPlayer = game.playerOne;

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