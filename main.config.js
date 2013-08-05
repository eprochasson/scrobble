Meteor.startup(function(){
    if(Meteor.isClient){
        Accounts.ui.config({
            passwordSignupFields: 'USERNAME_AND_EMAIL'
        })
    }
});

Config = {};

// Letters distribution and value.
Config.Letters = {
    a: { quantity : 9, value: 1},
    b: { quantity : 2, value: 3},
    c: { quantity : 2, value: 3},
    d: { quantity : 4, value: 4},
    e: { quantity : 12, value: 1},
    f: { quantity : 2, value: 4},
    g: { quantity : 2, value: 3},
    h: { quantity : 2, value: 4},
    i: { quantity : 9, value: 1},
    j: { quantity : 1, value: 8},
    k: { quantity : 1, value: 5},
    l: { quantity : 4, value: 1},
    m: { quantity : 2, value: 3},
    n: { quantity : 6, value: 1},
    o: { quantity : 8, value: 1},
    p: { quantity : 2, value: 3},
    q: { quantity : 1, value: 10},
    r: { quantity : 6, value: 1},
    s: { quantity : 4, value: 1},
    t: { quantity : 6, value: 1},
    u: { quantity : 4, value: 1},
    v: { quantity : 2, value: 4},
    w: { quantity : 2, value: 4},
    x: { quantity : 1, value: 8},
    y: { quantity : 2, value: 4},
    z: { quantity : 1, value: 10},
    '*': { quantity : 2, value: 0}
};

// 0: normal, 1: letter double, 2: letter triple, 3: word double, 4: word triple, 5 : start case (double word)
Config.Board = [
   //a b c d e f g h i j k l m n o
    [4,0,0,1,0,0,0,4,0,0,0,1,0,0,4], // 1
    [0,3,0,0,0,2,0,0,0,2,0,0,0,3,0], // 2
    [0,0,3,0,0,0,1,0,1,0,0,0,3,0,0], // 3
    [1,0,0,3,0,0,0,1,0,0,0,3,0,0,1], // 4
    [0,0,0,0,3,0,0,0,0,0,3,0,0,0,0], // 5
    [0,2,0,0,0,2,0,0,0,2,0,0,0,2,0], // 6
    [0,0,1,0,0,0,1,0,1,0,0,0,1,0,0], // 7
    [4,0,0,1,0,0,0,5,0,0,0,1,0,0,4], // 8
    [0,0,1,0,0,0,1,0,1,0,0,0,1,0,0], // 9
    [0,2,0,0,0,2,0,0,0,3,0,0,0,2,0], // 10
    [0,0,0,0,3,0,0,0,0,0,3,0,0,0,0], // 11
    [1,0,0,3,0,0,0,1,0,0,0,3,0,0,1], // 12
    [0,0,3,0,0,0,1,0,1,0,0,0,3,0,0], // 13
    [0,3,0,0,0,2,0,0,0,2,0,0,0,3,0], // 14
    [4,0,0,1,0,0,0,4,0,0,0,1,0,0,4]  // 15
   //a b c d e f g h i j k l m n o
];