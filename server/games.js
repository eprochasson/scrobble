var makeBoard = function(board){
    var b = [], thisline;
    _.each(board, function(line){
        thisline = [];
        _.each(line, function(tile){
            thisline.push({mul: tile, content: ''});
        });
        b.push(thisline);
    });
    return b;
};

Meteor.methods({
    createGame: function(){
        var doc = {};
        doc.board = makeBoard(Config.Board); // Initialize the board
        doc.bag = Config.Letters; // Create the bag of letter to pick from.
        doc.playerOne = this.userId;

        return Games.insert(doc);

    },
    joinGame: function(gameId){
        if(!this.userId){
            throw new Meteor.Error(300, 'Forbidden');
        }
        var game = Games.findOne(gameId);
        if(!game || !this.userId){
            throw new Meteor.Error(404,'Game Not Found');
        }

        // Third player, can only spectate.
        if(game.playerTwo != this.userId){
            return false; // No error, but shouldn't happen...
        }

        Games.update(gameId, {$set: {playerTwo : this.userId}}, function(err, res){
            if(err){
                throw Meteor.Error(err);
            } else {
                return true;
            }
        });
    }
});