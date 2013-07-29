Meteor.publish('myGames', function(){
    if(!this.userId){
        return [];
    }
    return Games.find({$or: [ {playerOne: this.userId}, {playerTwo: this.userId}]});
});