Meteor.publish('myGames', function(){
    if(!this.userId){
        return [];
    }
    Meteor.publishWithRelations({
        handle: this,
        collection: Games,
        filter: {$or: [ {playerOne: this.userId}, {playerTwo: this.userId}]},
        options: {fields: {_id: 1, playerOne: 1, playerTwo: 1, lastplayed: 1}},
        mappings: [{
            collection: Meteor.users,
            key: 'playerOne',
            options: {fields: {username: 1}}
        },{
            collection: Meteor.users,
            key: 'playerTwo',
            options: {fields: {username: 1}}
        }]
    });
});

Meteor.publish('currentGame', function(gameId){
    if(!gameId){
        return null;
    }

    var fields = {
        _id: 1,
        playerOne: 1,
        playerTwo: 1,
        bag: 1,
        board: 1,
        playerOneScore: 1,
        playerTwoScore: 1,
        playerTurn: 1
    };

    var game = Games.findOne(gameId);
    if(!game){
        return null;
    }

    // Only show my own tiles...
    if(game.playerOne === this.userId){
        fields.playerOneTiles = 1;
    } else if (game.playerTwo === this.userId){
        fields.playerTwoTiles = 1;
    }

    Meteor.publishWithRelations({
        handle: this,
        collection: Games,
        filter: {_id: gameId},
        options: {fields: fields},
        mappings: [{
            collection: Meteor.users,
            key: 'playerOne',
            options: {fields: {username: 1}}
        },{
            collection: Meteor.users,
            key: 'playerTwo',
            options: {fields: {username: 1}}
        }]
    });

});