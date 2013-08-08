# Scrobble
## A Scrabble-like game with Meteor

A simple scrabble-like game implementd with Meteor. Name has to change.

## How to run

1. `cd app`
2. `npm install -g meteorite` (if not already installed)
3. `mrt`

should do the trick. The first start is quite slow as it needs to load the dictionary in the database.

## Demo

A live demo is available on http://scrobble.meteor.com

## Known Bugs

Some invalid move are still possible, I need to fix that. The trivial cases should be covered. Turns out the logic of scrabble is slightly more complicated than I expected, the initial design was not really fit for it, the end result could be much cleaner.

Also, after pulling my hair (and failing at) mixing jQuery sortable, droppable and draggable, I fell back on using the [REDIPS](http://www.redips.net/javascript/drag-and-drop-table-content/) drag and drop, which is brillant but apparently do not support device not using a mouse (in other word, it won't work on a cellphone).

## License stuff

This project is licensed with the MIT license.
The dictionary courtesy of http://www.morewords.com/, public (actually taken straight from the Meteor wordplay demo).

## Contributors
- [Emmanuel Prochasson](https://github.com/eprochasson/)