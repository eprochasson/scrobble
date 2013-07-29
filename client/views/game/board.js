var getBoard = function(){
    return Games.findOne(Session.get('currentGame'));
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
    isPlaying: function(){
        var board = getBoard();
        return board.playerOne === Meteor.userId() || board.playerTwo === Meteor.userId();
    },
    tile: function(){
        console.log(this);
        return this;
    }
});

Template.onetile.helpers({
    class: function(){
        console.log(this);
        if(this.content){
            return 'content';
        }
        if(this.mul){
            return 'mul'+this.mul;
        }
        return 'empty';
    }
});