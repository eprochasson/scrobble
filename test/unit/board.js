(function () {

    "use strict";
    var board;

    Template.stub('board');
    Template.stub('home');
    Template.stub('onesquare');
    Template.stub('game');
    Template.stub('onetile');


    describe("Board", function () {
        beforeEach(function(){
            board = new Board(Config.Board, Config.Letters, Config.Letters);
            board.makeBoard();
        });

        it("should be empty", function () {
            expect(board.isEmptyTile(7,7)).toBe(true);
        });

    });



})();
