Dictionary = new Meteor.Collection('dictionary');

// Users can't do shit on the dictionary
Dictionary.allow({
    update: function(){ return false },
    insert: function(){ return false },
    remove: function(){ return false }
});

if(Meteor.isServer){
    Dictionary._ensureIndex({word : 1}, {unique: 1});
}