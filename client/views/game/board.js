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
    hasAllPlayer: function(){
        var board = getBoard();
        return board.playerOne && board.playerTwo;
    },
    tile: function(){
        console.log(this);
        return this;
    },
    myTiles: function(){
        var board = getBoard();
        if(!board){
            return null;
        }
        if(board.playerOne === Meteor.userId()){
            return board.playerOneTiles;
        } else if(board.playerTwo === Meteor.userId()) {
            return board.playerTwoTiles;
        } else {
            return [];
        }
    },
    playerOneName: function(){
        var board = getBoard();
        if(!board){
            return;
        }
        var p1 = Meteor.users.findOne(board.playerOne);
        return p1.username;
    },
    playerTwoName: function(){
        var board = getBoard();
        if(!board){
            return;
        }
        var p2 = Meteor.users.findOne(board.playerTwo);
        if(!p2){
            return 'No One Yet!'
        }
    }
});

Template.board.events({
    'click .join': function(){
        Meteor.call('joinGame', Session.get('currentGame'), function(err, res){
            if(err){throw err;}
        })
    }
});

Template.board.rendered = function(){
    var dropped = false;
    var draggable_sibling;
    var droppable = $('.droppable');
    var draggable = $('.draggable');
    var sortable = $('.sortable');

    sortable.sortable({
        start: function(e, ui){
            draggable_sibling = $(ui.item).prev();
            console.log('start', draggable_sibling);
        },
        stop: function(e, ui){
            var item = ui.item;
            if(dropped){
                dropped = false;
                console.log('stop', draggable_sibling);
                if(draggable_sibling.length == 0){
                    console.log('adding before');
                    $('.sortable').prepend(item);
                } else {
                    draggable_sibling.after(item);
                }
                console.log(item);
            }
        }
    });
    sortable.disableSelection();
    droppable.droppable({
        accept: '.draggable',
        hoverClass: 'hovered',
        drop: function(e, ui){

            console.log('dropped');
            dropped = true;
//            var item = ui.draggable;
//
//            console.log(item);
//
//            item.draggable({ revert: false });
//            item.position( { of: $(this), my: 'left top', at: 'left top' } );
//            console.log('drop');
        }

//        drop: function(e, ui){
//            var item = $(ui.draggable);
//            if(!($(this).hasClass('busy'))){
//                dropped = true;
//                $(e.target).addClass('dropped');
//                console.log('drop', ui);
//                item.addClass('onboard');
//                var newItem = Template.onetile({letter: item.data('letter'), class: item.data('extraclass'), value: item.data('value')});
//                $('body').append(newItem).draggable({
//                    connectToSortable: '.sortable'
//                }).position( { of: $(this), my: 'left top', at: 'left top' } );
//                item.remove();
//
//                $(this).addClass('busy', true);
//            }
//        },
//        out: function(e,ui){
//            var item = $(ui.draggable);
//            if(item.hasClass('onboard')){
//                $(this).data('busy', false);
//                console.log('out');
//                item.draggable('option','connectToSortable', sortable);
//            }
//        }
    });
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