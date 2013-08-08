Meteor.Router.add({
    '/': {
        as: 'home',
        to: function(){
            if(Meteor.userId()){
                return 'home'
            } else{
                return 'front'
            }
        },
        and: function(){
            Session.set('boardReady', false);
            Session.set('currentGame', null);
        }
    },
    '/game/:_id': {
        as: 'board',
        to: 'board',
        and: function(id){
            Session.set('currentGame', id);
        }
    }

















});








Meteor.Router.filters({
    'requireLogin': function(page) {
        if (Meteor.loggingIn()) {
            return 'loading';
        } else if (Meteor.userId()){
            return page;
        } else {
            return 'front';
        }
    }
});





Meteor.Router.homePath();

Meteor.Router.filter('requireLogin', {except: 'front'});