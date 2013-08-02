var getBoard = function(){
    return Session.get('boardReady') && Games.findOne(Session.get('currentGame'));
};

Template.board.helpers({
    isGame: function(){
        return getBoard();
    },
    rows: function(){
        var board = getBoard();
        return board.board;
    },
    myScore: function(){
        var board = getBoard();
        if(board.playerOne === Meteor.userId()){
            return board.playerOneScore;
        }
        if(board.playerTwo === Meteor.userId()){
            return board.playerTwoScore;
        }
        return -1;
    },
    otherPlayerScore: function(){
        var board = getBoard();
        if(board.playerOne === Meteor.userId()){
            return board.playerTwoScore || 0;
        }
        if(board.playerTwo === Meteor.userId()){
            return board.playerOneScore || 0;
        }
        return 0;
    },
    currentPlayers: function(){
        var board = getBoard();
        if(!board){
            return '';
        } else {
            Session.set('currentPlayers', [board.playerOne, board.playerTwo]);
            return '';
        }
    },
    isPlaying: function(){
        var board = getBoard();
        return board.playerOne === Meteor.userId() || board.playerTwo === Meteor.userId();
    },
    hasAllPlayer: function(){
        var board = getBoard();
        return board.playerOne && board.playerTwo;
    },
    tile: function(){
        return this;
    },
    myTurn: function(){
        var board = getBoard();
        return board.playerTurn === Meteor.userId();
    },
    myTiles: function(){
        var board = getBoard();

        if(!board){
            return null;
        }
        if(board.playerOne === Meteor.userId()){
            tiles = board.playerOneTiles;
        } else if(board.playerTwo === Meteor.userId()) {
            tiles = board.playerTwoTiles;
        }
        if(!tiles){
            return null;
        }
        while(tiles.length < 9){
            tiles.push({ empty : true });
        }
        return tiles;
    },
    playerOneName: function(){
        var board = getBoard();
        if(!board){
            return null;
        }
        var p1 = Meteor.users.findOne(board.playerOne);
        if(!p1){
            return null;
        }
        return p1.username;
    },
    playerTwoName: function(){
        var board = getBoard();
        if(!board){
            return null;
        }
        var p2 = Meteor.users.findOne(board.playerTwo);
        if(!p2){
            return 'No One Yet!'
        }
        return p2.username;
    },
    otherPlayerName: function(){
        var board = getBoard();
        if(!board){
            return '';
        }

        var user;
        if(board.playerOne === Meteor.userId()){
            if(!board.playerTwo){
                return '';
            }
            user = Meteor.users.findOne(board.playerTwo);
            return user && user.username;
        } else if(board.playerTwo === Meteor.userId()) {
            user = Meteor.users.findOne(board.playerOne);
            return user && user.username;
        }
        return '';
    }

});

Template.board.events({
    'click .join': function(e){
        e.preventDefault();
        Meteor.call('joinGame', Session.get('currentGame'), function(err, res){
            if(err){throw err;}
            Session.set('playerStatusChange', Math.random(0, 100)); // just trigger a refresh of the publication to get the extra fields.
        })
    },
    'click .play': function(e){
        e.preventDefault();
        var res = [];
        // collect all the tiles from the board.
        _.each($('table.board .playing'), function(tile){
            console.log(tile);
            var parent = $(tile).parent();
            res.push({
                v: $(tile).data('letter'),
                x: $(parent).data('x'),
                y: $(parent).data('y')
            })
        });
        if(_.isEmpty(res)){
            alert('How about putting some tiles on the board?');
            return;
        }

        console.log('sending ', res);
        Meteor.call('play', res, Session.get('currentGame'), function(err, res){
            if(err){
                throw err;
            } else {
//                alert('ok');
            }
        })
    },
    'click .changetiles': function(e){
        e.preventDefault();
        Meteor.call('change_tiles', Session.get('currentGame'), function(err, res){
            if(err){
                throw err;
            } else {
//                alert('ok');
            }
        })
    },
    'click .skip': function(e){
        e.preventDefault();
        Meteor.call('skip_turn', Session.get('currentGame'), function(err, res){});
    }
});

Template.board.rendered = function(){
    if(Session.get('boardReady')){
        var setDropOption = function(el, e){

            while(el && el.nodeName !== 'TABLE'){
                el = el.parentNode;
            }
            if($(el).hasClass('banc')){
                rd.drop_option = 'switching';
            } else if($(el).hasClass('board')){
                console.log('single');
                rd.drop_option = 'single';
            }
        };
        rd = REDIPS.drag;
        rd.init();
        rd.drop_option = 'single';

        rd.myhandler_moved = function(){
            setDropOption(rd.obj);
        };

        // Also need to tag all square on the board.
        var x = 0, y = 0;
        _.each($('table.board').find('tr'), function(tr){
            _.each($(tr).find('td'), function(td){
                $(td).data("x", x);
                $(td).data("y", y);
                x += 1;
            });
            x = 0;
            y += 1;
        })
    }
};

Template.onesquare.helpers({
    class: function(){
        if(this.content){
            return 'content';
        }
        if(this.mul){
            return 'droppable mul'+this.mul;
        }
        return 'droppable empty';
    },
    letterValue: function(){
        if(this.content){
            return Config.Letters[this.content].value;
        }
    }
});

Template.onetile.helpers({
    content: function(){
        return this.letter;
    },
    value: function(){
        return this.value;
    }
});

Template.onetile.rendered = function(){
    $(this);
};