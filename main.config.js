Config = {};

// Letters distribution and value.
Config.Letters = {
    a: { quantity : 16, value: 1},
    b: { quantity : 4, value: 3},
    c: { quantity : 6, value: 3},
    d: { quantity : 8, value: 2},
    e: { quantity : 24, value: 1},
    f: { quantity : 4, value: 4},
    g: { quantity : 5, value: 2},
    h: { quantity : 5, value: 4},
    i: { quantity : 13, value: 1},
    j: { quantity : 8, value: 2},
    k: { quantity : 2, value: 5},
    l: { quantity : 7, value: 1},
    m: { quantity : 6, value: 3},
    n: { quantity : 13, value: 1},
    o: { quantity : 15, value: 1},
    p: { quantity : 4, value: 3},
    q: { quantity : 2, value: 10},
    r: { quantity : 13, value: 1},
    s: { quantity : 10, value: 1},
    t: { quantity : 15, value: 1},
    u: { quantity : 7, value: 1},
    v: { quantity : 3, value: 4},
    w: { quantity : 4, value: 4},
    x: { quantity : 2, value: 8},
    y: { quantity : 4, value: 4},
    z: { quantity : 2, value: 10},
    '*': { quantity : 4, value: 0}
};

// 0: normal, 1: letter double, 2: letter triple, 3: word double, 4: word triple, 5 : start case (double word)
Config.Board = [
   //a b c d e f g h i j k l m n o
    [4,0,0,1,0,0,0,4,0,0,0,1,0,0,4], // 1
    [0,3,0,0,0,2,0,0,0,2,0,0,0,3,0], // 2
    [0,0,3,0,0,0,1,0,1,0,0,0,3,0,0], // 3
    [0,0,0,3,0,0,0,1,0,0,0,3,0,0,0], // 4
    [0,0,0,0,3,0,0,0,0,0,3,0,0,0,0], // 5
    [0,0,0,0,0,2,0,0,0,2,0,0,0,0,0], // 6
    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0], // 7
    [4,0,0,0,0,0,0,5,0,0,0,0,0,0,4], // 8
    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0], // 9
    [0,0,0,0,0,2,0,0,0,3,0,0,0,0,0], // 10
    [0,0,0,0,3,0,0,0,0,0,3,0,0,0,0], // 11
    [0,0,0,3,0,0,0,0,0,0,0,3,0,0,0], // 12
    [0,0,3,0,0,0,0,0,0,0,0,0,3,0,0], // 13
    [0,3,0,0,0,0,0,0,0,0,0,0,0,3,0], // 14
    [4,0,0,1,0,0,0,4,0,0,0,1,0,0,4]  // 15
   //a b c d e f g h i j k l m n o
];