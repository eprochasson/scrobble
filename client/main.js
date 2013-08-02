Meteor.subscribe('myGames', function(){

});

Deps.autorun(function(){
    Meteor.subscribe('currentGame', Session.get('currentGame'), Session.get('playerStatusChange'), function(){
        Session.set('boardReady', true);
    });
});

Deps.autorun(function(){
    Meteor.subscribe('currentPlayers', Session.get('currentPlayers'));
});

