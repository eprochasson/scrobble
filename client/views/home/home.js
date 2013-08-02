Template.home.helpers({
    games: function(){
        return Games.find({ $or: [{playerOne: Meteor.userId()}, {playerTwo: Meteor.userId()}]});
    }
});

Template.home.events({
    'click .create': function(){
        Meteor.call('createGame', function(err, res){
            if(err){
                throw err;
            } else{
                Meteor.Router.to('board', res);
            }
        })
    }
});

Template.game.helpers({
    gameWith: function(){
        var game = Games.findOne(this._id);
        if(!game){
            return 'Error';
        }
        var otherPlayer;
        if(game.playerOne === Meteor.userId()){
            if(game.playerTwo){
                otherPlayer = Meteor.users.findOne(game.playerTwo);
            } else {
                return "No one yet";
            }
        } else {
            if(game.playerOne){
                otherPlayer = Meteor.users.findOne(game.playerOne);
            } else {
                return "";
            }
        }
        if(otherPlayer){
            return otherPlayer.username;
        } else {
            return '';
        }
    }
});