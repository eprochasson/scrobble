Meteor.subscribe('myGames', function(){

});

Deps.autorun(function(){
    Meteor.subscribe('currentGame', Session.get('currentGame'), function(){
        Session.set('boardReady', true);
    });
});