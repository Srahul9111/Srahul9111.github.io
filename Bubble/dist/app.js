(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw ((f.code = "MODULE_NOT_FOUND"), f);
      }
      var l = (n[o] = { exports: {} });
      t[o][0].call(
        l.exports,
        function (e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        },
        l,
        l.exports,
        e,
        t,
        n,
        r
      );
    }
    return n[o].exports;
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
})(
  {
    1: [
      function (require, module, exports) {
        "use strict";

        exports.__esModule = true;
        exports.init = init;
        exports.setNumberOfAllowedRows = setNumberOfAllowedRows;
        exports.updateTotalNumberOfBubbles = updateTotalNumberOfBubbles;
        exports.getGroup = getGroup;
        exports.findOrphans = findOrphans;
        exports.deleteBubble = deleteBubble;

        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key))
                  newObj[key] = obj[key];
              }
            }
            newObj["default"] = obj;
            return newObj;
          }
        }

        var _bubbleJs = require("./../bubble.js");

        var Bubble = _interopRequireWildcard(_bubbleJs);

        var _uiJs = require("./../ui.js");

        var UI = _interopRequireWildcard(_uiJs);

        var NUM_ROW = undefined;
        exports.NUM_ROW = NUM_ROW;
        var NUM_COL = undefined;

        exports.NUM_COL = NUM_COL;
        var boardArray = [];

        var totalNumberOfBubbles = 0;

        exports.totalNumberOfBubbles = totalNumberOfBubbles;
        var numberOfAllowedRows = 0;

        exports.numberOfAllowedRows = numberOfAllowedRows;

        function init(numRows, numCols) {
          exports.NUM_ROW = NUM_ROW = numRows;
          exports.NUM_COL = NUM_COL = numCols;
          exports.totalNumberOfBubbles = totalNumberOfBubbles =
            (NUM_ROW * NUM_COL) / 2;

          createBoardArray();
        }

        function setNumberOfAllowedRows(number) {
          exports.numberOfAllowedRows = numberOfAllowedRows = number;
        }

        function updateTotalNumberOfBubbles(addedValue) {
          exports.totalNumberOfBubbles = totalNumberOfBubbles += addedValue;
        }

        var Board = function Board() {
          var bubbleArray = createBubbleArray();
        };

        var addBubble = function addBubble(bubble, coords) {
          //    let rowNum = Math.floor(coords.y / (UI.bubbleRadius * 2));
          var rowNum = coords.y;
          coords.x = coords.x - UI.board.getBoundingClientRect().left;
          if (rowNum % 2 == 0) {
            //        coords.x = coords.x - UI.spriteRadius /2
          }

          var colNum = undefined;
          //    let colNum = Math.round(coords.x / (UI.bubbleRadius * 2));
          //    colNum -= 1;
          //    colNum = Math.round(colNum / 2) * 2;

          if (rowNum % 2 === 0) {
            colNum = Math.round(coords.x / (UI.bubbleRadius * 2));

            colNum = colNum * 2 - 1;
          } else {
            colNum = Math.floor(coords.x / (UI.bubbleRadius * 2));

            colNum = colNum * 2;
          }

          if (!boardArray[rowNum]) {
            boardArray[rowNum] = [];
            exports.NUM_ROW = NUM_ROW += 1;
          }
          //    else if (boardArray[rowNum][colNum] != false) {
          //        b
          //    }
          bubble.setCol(colNum);
          bubble.setRow(rowNum);
          boardArray[rowNum][colNum] = bubble;
        };

        exports.addBubble = addBubble;
        var getBoardArray = function getBoardArray() {
          return boardArray;
        };

        exports.getBoardArray = getBoardArray;
        // return the bubble at the current position or null if it doesn't exist
        function getBubbleAt(row, col) {
          if (!boardArray[row]) return null;
          return boardArray[row][col];
        }

        // get the bubbles that surround a bubble
        function getBubbleAround(row, col) {
          var bubbleList = [];
          for (var i = row - 1; i <= row + 1; i++) {
            // loop through bubbles in that row
            for (var j = col - 2; j <= col + 2; j++) {
              var bubble = getBubbleAt(i, j);
              if (bubble) {
                bubbleList.push(bubble);
              }
            }
          }
          return bubbleList;
        }

        // get the connected group of bubbles (that share the same color, or not) starting from this bubble

        function getGroup(bubble, bubblesFound, differentColor) {
          var currentRow = bubble.row;
          if (!bubblesFound[currentRow]) {
            bubblesFound[currentRow] = {};
          }
          if (!bubblesFound.list) {
            bubblesFound.list = [];
          }
          if (bubblesFound[bubble.row][bubble.col]) {
            // we end this branch of recursion here because we've been to this bubble before
            return bubblesFound;
          }

          // add the bubble to the 2D array
          bubblesFound[bubble.row][bubble.col] = bubble;
          // push the bubble to the linear list
          bubblesFound.list.push(bubble);
          // get a list of bubbles that surround this bubble and are of the same color
          var surrounding = getBubbleAround(bubble.row, bubble.col);
          // for every surrounding bubble recursively call this function again
          for (var i = 0; i < surrounding.length; i++) {
            if (surrounding[i].type === bubble.type || differentColor) {
              bubblesFound = getGroup(
                surrounding[i],
                bubblesFound,
                differentColor
              );
            }
          }

          return bubblesFound;
        }

        function findOrphans() {
          var connected = [];
          var groups = [];
          var orphans = [];
          // initialize the rows of the connected
          for (var i = 0; i < boardArray.length; i++) {
            connected[i] = [];
          }
          // loop on the first row, because it should be the root of every connected group
          // initially everything is NOT connected
          for (var i = 0; i < boardArray[0].length; i++) {
            var bubble = boardArray[0][i];
            if (bubble && !connected[0][i]) {
              // here we pass true, because we want to match for any color
              var group = getGroup(bubble, {}, true);
              group.list.forEach(function (item) {
                return (connected[item.row][item.col] = true);
              });
            }
          }

          // loop through all the board to detect orphan bubbles after we decided connected bubbles with the first row
          for (var i = 0; i < boardArray.length; i++) {
            var startCol = i % 2 == 0 ? 1 : 0;
            for (var j = startCol; j < NUM_COL; j += 2) {
              var bubble = getBubbleAt(i, j);
              if (bubble && !connected[i][j]) {
                orphans.push(bubble);
              }
            }
          }

          return orphans;
        }

        function deleteBubble(bubble) {
          delete boardArray[bubble.row][bubble.col];
        }

        var createBoardArray = function createBoardArray() {
          for (var i = 0; i < NUM_ROW; i++) {
            var startCol = i % 2 == 0 ? 1 : 0;
            boardArray[i] = [];

            for (var j = startCol; j < NUM_COL; j += 2) {
              var bubble = Bubble.create(i, j);
              boardArray[i][j] = bubble;
            }
          }
        };
      },
      { "./../bubble.js": 4, "./../ui.js": 7 },
    ],
    2: [
      function (require, module, exports) {
        "use strict";

        exports.__esModule = true;
        exports.init = init;
        exports.updateScore = updateScore;

        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key))
                  newObj[key] = obj[key];
              }
            }
            newObj["default"] = obj;
            return newObj;
          }
        }

        var _uiJs = require("./../ui.js");

        var UI = _interopRequireWildcard(_uiJs);

        var score = 0;
        var timer = {
          min: 2,
          sec: 0,
        };

        var timerID = undefined;

        function init() {
          //    timerID = setInterval(updateTimer, 1000);
          UI.renderScore(score);
        }

        // let timerID = setInterval(updateTimer, 1000);

        function updateTimer() {
          //    UI.renderScore(score);
          UI.renderTime(timer);

          timer.sec--;

          if (timer.sec == -1) {
            if (timer.min == 0) {
              clearInterval(timerID);
              // render game over
            } else {
              timer.sec = 59;
              timer.min = timer.min - 1;
            }
          }

          // render the timer
        }

        function updateScore(addedValue) {
          score = score + addedValue;
          if (addedValue > 0) UI.renderScore(score);
        }
      },
      { "./../ui.js": 7 },
    ],
    3: [
      function (require, module, exports) {
        "use strict";

        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key))
                  newObj[key] = obj[key];
              }
            }
            newObj["default"] = obj;
            return newObj;
          }
        }

        var _gameJs = require("./game.js");

        var game = _interopRequireWildcard(_gameJs);

        game.init();
      },
      { "./game.js": 6 },
    ],
    4: [
      function (require, module, exports) {
        "use strict";

        exports.__esModule = true;

        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key))
                  newObj[key] = obj[key];
              }
            }
            newObj["default"] = obj;
            return newObj;
          }
        }

        var _uiJs = require("./ui.js");

        var UI = _interopRequireWildcard(_uiJs);

        function Bubble(domElement, row, col, type) {
          domElement.classList.add("bubble");
          domElement.classList.add("bubble" + type);
          this.dom = domElement;
          this.col = col;
          this.row = row;
          this.type = type;
        }

        Bubble.prototype.setType = function (type) {
          this.type = type;
        };

        Bubble.prototype.setDOM = function (newDom) {
          this.dom = newDom;
        };

        Bubble.prototype.setCoords = function (left, top) {
          this.left = left;
          this.top = top;
        };

        Bubble.prototype.setCol = function (col) {
          this.col = col;
        };

        Bubble.prototype.setRow = function (row) {
          this.row = row;
        };

        Bubble.prototype.getCoords = function () {
          return {
            left: this.left,
            top: this.top,
          };
        };

        Bubble.prototype.changeType = function (type) {
          this.dom.classList.remove("bubble" + this.type);
          if (type === undefined) {
            type = Math.floor(Math.random() * 4);
          }
          this.setType(type);
          this.dom.classList.add("bubble" + type);
        };

        Bubble.prototype.getHeightPosFromType = function () {
          if (this.type == 0) {
            return 0;
          }
          if (this.type == 1) {
            return 33.33333333;
          }
          if (this.type == 2) {
            return 66.66666667;
          }
          if (this.type == 3) {
            return 100;
          }
        };

        var create = function create(row, col, type) {
          var bubbleDOM = document.createElement("div");

          if (type === undefined) {
            type = Math.floor(Math.random() * 4);
          }
          var newBubble = new Bubble(bubbleDOM, row, col, type);

          return newBubble;
        };

        exports.create = create;
        var deepCopy = function deepCopy(copiedBubble) {
          var newBubbleDom = document.createElement("div");
          newBubbleDom.style.left = copiedBubble.dom.style.left;
          newBubbleDom.style.top = copiedBubble.dom.style.top;
          newBubbleDom.style.width = copiedBubble.dom.style.width;
          newBubbleDom.style.height = copiedBubble.dom.style.height;

          return new Bubble(newBubbleDom, -1, -1, copiedBubble.type);
        };
        exports.deepCopy = deepCopy;
      },
      { "./ui.js": 7 },
    ],
    5: [
      function (require, module, exports) {
        "use strict";

        exports.__esModule = true;
        exports.findIntersection = findIntersection;

        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key))
                  newObj[key] = obj[key];
              }
            }
            newObj["default"] = obj;
            return newObj;
          }
        }

        var _ModelBoardJs = require("./Model/Board.js");

        var Board = _interopRequireWildcard(_ModelBoardJs);

        var _uiJs = require("./ui.js");

        var UI = _interopRequireWildcard(_uiJs);

        var boardArray = Board.getBoardArray();

        function findIntersection(angle, currBubble) {
          var startCenterPos = {
            left: currBubble.dom.getBoundingClientRect().left + UI.spriteRadius,
            top: currBubble.dom.getBoundingClientRect().top + UI.spriteRadius,
          };

          // an object that holds some data on a collision if exists
          var collision = null;

          var dx = Math.sin(angle);
          var dy = -Math.cos(angle);

          for (var i = 0; i < Board.NUM_ROW; i++) {
            for (var j = 0; j < Board.NUM_COL; j++) {
              var bubble = boardArray[i][j];
              if (bubble) {
                // get the coords of the current bubble
                var bubbleCoords = bubble.getCoords();
                var distToBubble = {
                  x: startCenterPos.left - bubbleCoords.left,
                  y: startCenterPos.top - bubbleCoords.top,
                };

                var t = dx * distToBubble.x + dy * distToBubble.y;
                //
                var ex = -t * dx + startCenterPos.left;
                var ey = -t * dy + startCenterPos.top;

                var distEC = Math.sqrt(
                  Math.pow(ex - bubbleCoords.left, 2) -
                    Math.pow(ey - bubbleCoords.top, 2)
                );

                // if the prependicular distance between the trajectory and the center of the checked out bubble is greater than 2R, then NO collision
                if (distEC < UI.bubbleRadius) {
                  var dt = Math.sqrt(
                    Math.pow(UI.bubbleRadius, 2) - Math.pow(distEC, 2)
                  );
                  var offset1 = {
                    x: (t - dt) * dx,
                    y: -(t - dt) * dy,
                  };

                  var offset2 = {
                    x: (t + dt) * dx,
                    y: -(t + dt) * dy,
                  };

                  var distToFirstPoint = Math.sqrt(
                    Math.pow(offset1.x, 2) + Math.pow(offset1.y, 2)
                  );

                  var distToSecondPoint = Math.sqrt(
                    Math.pow(offset2.x, 2) + Math.pow(offset2.y, 2)
                  );

                  // holds the new distance from the starting point of firing a ball to the collison point t
                  var newDistance = undefined;
                  // holds the collision point coordinates
                  var collisionCoords = undefined;
                  if (distToFirstPoint < distToSecondPoint) {
                    newDistance = distToFirstPoint;
                    collisionCoords = {
                      x: startCenterPos.left + offset1.x,
                      //                            y: startCenterPos.top + offset1.y
                      y: bubble.row + 1,
                    };
                  } else {
                    newDistance = distToSecondPoint;
                    collisionCoords = {
                      x: startCenterPos.left - offset2.x,
                      //                            y: startCenterPos.top + offset2.y
                      y: bubble.row + 1,
                    };
                  }

                  // if a collision was detected and was distance was smaller than the smallest collision distane till now
                  if (
                    !collision ||
                    newDistance < collision.distanceToCollision
                  ) {
                    collision = {
                      distanceToCollision: newDistance,
                      bubble: bubble,
                      coords: collisionCoords,
                    };
                  }
                }
              }
            }
          }
          return collision;
        }
      },
      { "./Model/Board.js": 1, "./ui.js": 7 },
    ],
    6: [
      function (require, module, exports) {
        "use strict";

        exports.__esModule = true;
        exports.init = init;

        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key))
                  newObj[key] = obj[key];
              }
            }
            newObj["default"] = obj;
            return newObj;
          }
        }

        var _uiJs = require("./ui.js");

        var UI = _interopRequireWildcard(_uiJs);

        var _bubbleJs = require("./bubble.js");

        var Bubble = _interopRequireWildcard(_bubbleJs);

        var _ModelBoardJs = require("./Model/Board.js");

        var Board = _interopRequireWildcard(_ModelBoardJs);

        var _collisionDetectorJs = require("./collisionDetector.js");

        var Collision = _interopRequireWildcard(_collisionDetectorJs);

        var _ModelMiscJs = require("./Model/Misc.js");

        var State = _interopRequireWildcard(_ModelMiscJs);

        var board = undefined;

        var audiolink = "http://www.myDomain.com/myVideo.m4v";



        function init() {
          window.addEventListener("load", function () {
            UI.newGameButton.addEventListener("click", startGame);
            window.addEventListener("resize", UI.resize);
            document.body.addEventListener("orientationchange", UI.resize);
          });
        }

        function startGame() {
          Board.init(4, 24);
          UI.init();
          UI.newGameButton.removeEventListener("click", startGame);
          UI.hideDialog();

          //    UI.drawBoard();

          // set the first next bubble
          UI.prepareNextBubble();
          UI.resize();
          //    UI.drawBoard();

          // add event listner for mouse clicks on the board
          UI.gameBoard.addEventListener("touchstart", ballFiredHandler);
          UI.gameBoard.addEventListener("click", ballFiredHandler);

          State.init();
        }

        function ballFiredHandler(event) {
          var coordinates = {};
          if (event.type == "touchstart") {
            coordinates.x = event.changedTouches[0].pageX;
            coordinates.y = event.changedTouches[0].pageY;
            
          } else {
            // handling mouse
            coordinates.x = event.pageX;
            coordinates.y = event.pageY;
          }
          // get the firing angle
          var angle = getAngleFromDevice(coordinates);

          // default distance and duration
          var animationDuration = 750; // 0.75 sec
          var distance = 1000;

          var collisionHappened = Collision.findIntersection(
            angle,
            UI.currentBubble
          );

          var animationCallback = undefined;
          var newBubble = Bubble.deepCopy(UI.currentBubble);
          UI.board.appendChild(newBubble.dom);
          // randomly change the type to get a new bubble with a new color
          UI.currentBubble.changeType();

          // if collision occurs change distance and duration.
          if (collisionHappened) {
            (function () {
              animationDuration =
                (animationDuration * collisionHappened.distanceToCollision) /
                distance;
              distance = collisionHappened.distanceToCollision;
              // update the board state with the position of the new bubble. also update the col and row of the bubble object itself
              Board.addBubble(newBubble, collisionHappened.coords);

              // check for groups with the same color like our new bubble
              var group = Board.getGroup(newBubble, {});

              animationCallback = function () {
                // re-render all the dom tree when the animation finish to put the new bubble in the appropriate position
                UI.drawBoard();
                if (group.list.length >= 3) {
                  popBubbles(group.list);
                  // update score
                  State.updateScore(group.list.length * 10);
                  //                UI.drawBoard();
                  // check for winning the game
                  if (Board.totalNumberOfBubbles == 0) {
                    // use setTimeput to show a box that you won the game
                    UI.init()
                    // setTimeout(function () {
                    //   return alert("you won the game!");
                    // }, 400);
                    UI.gameBoard.removeEventListener(
                      "touchstart",
                      ballFiredHandler
                    );
                    UI.gameBoard.removeEventListener("click", ballFiredHandler);

                    //                    alert("you won the game");
                  }
                } else {
                  Board.updateTotalNumberOfBubbles(1);

                  if (Board.NUM_ROW >= Board.numberOfAllowedRows) {
                    alert("game over!");
                    UI.gameBoard.removeEventListener(
                      "touchstart",
                      ballFiredHandler
                    );
                    UI.gameBoard.removeEventListener("click", ballFiredHandler);
                  }
                }
              };
            })();
          } // end if collisionHappened
          else {
            animationCallback = function () {
              newBubble.dom.remove();
            };
          } // end else

          // fire up the animation
          UI.startBallAnimation(
            newBubble,
            angle,
            animationDuration,
            distance,
            animationCallback
          );
         
          event.preventDefault();
        }

        function popBubbles(bubbles) {
          bubbles.forEach(function (bubble) {
            return Board.deleteBubble(bubble);
          });
          // get the orphans
          var orphans = Board.findOrphans();
          // update the tracked number of bubbles
          Board.updateTotalNumberOfBubbles(
            -(bubbles.length - 1 + orphans.length)
          );
          //    Board.totalNumberOfBubbles -= (bubbles.length + orphans.length);

          // update score from the orphans
          State.updateScore(orphans.length * 20);

          bubbles.forEach(function (bubble, index) {
            var bubbleDom = document.getElementById(
              bubble.row + "" + bubble.col
            );
            // if it was the last ball animated then we want to drop bubbles if existed
            if (orphans.length > 0 && index == bubbles.length - 1)
              UI.animateVanish(bubbleDom, bubble, UI.dropBubbles(orphans));
            else UI.animateVanish(bubbleDom, bubble);
          });
        }

        function getAngleFromDevice(deviceXY) {
          //    alert("in the get Angle");
          var BubbleXY = {
            x:
              UI.currentBubble.dom.getBoundingClientRect().left +
              UI.currentBubble.dom.getBoundingClientRect().width / 2,
            y:
              UI.currentBubble.dom.getBoundingClientRect().top +
              UI.currentBubble.dom.getBoundingClientRect().height / 2,
          };

          var fireAngle = Math.atan(
            (deviceXY.x - BubbleXY.x) / (BubbleXY.y - deviceXY.y)
          );

          //    let fireAngle = Math.atan2((deviceXY.x - BubbleXY.x) , (BubbleXY.y - deviceXY.y));

          //if the player fired the ball at aproximatly horizontal level
          //    if(deviceXY.y > BubbleXY.y) {
          //        fireAngle = fireAngle + Math.PI;
          //    }

          return fireAngle;
        }
      },
      {
        "./Model/Board.js": 1,
        "./Model/Misc.js": 2,
        "./bubble.js": 4,
        "./collisionDetector.js": 5,
        "./ui.js": 7,
      },
    ],
    7: [
      function (require, module, exports) {
        "use strict";

        exports.__esModule = true;
        exports.init = init;
        exports.hideDialog = hideDialog;
        exports.startBallAnimation = startBallAnimation;
        exports.prepareNextBubble = prepareNextBubble;
        exports.resize = resize;
        exports.setNewBubblePosition = setNewBubblePosition;
        exports.dropBubbles = dropBubbles;
        exports.animateVanish = animateVanish;
        exports.drawBoard = drawBoard;
        exports.renderTime = renderTime;
        exports.renderScore = renderScore;

        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key))
                  newObj[key] = obj[key];
              }
            }
            newObj["default"] = obj;
            return newObj;
          }
        }

        var _bubbleJs = require("./bubble.js");

        var Bubble = _interopRequireWildcard(_bubbleJs);

        var _ModelBoardJs = require("./Model/Board.js");

        var Board = _interopRequireWildcard(_ModelBoardJs);

        var newGameDialog = document.getElementById("start_game_dialog");
        exports.newGameDialog = newGameDialog;
        var currentBubble = undefined;
        exports.currentBubble = currentBubble;
        var gameBoard = document.getElementById("game");
        exports.gameBoard = gameBoard;
        var newGameButton = document.getElementById("new_game_button");
        exports.newGameButton = newGameButton;
        var topbar = document.getElementById("topbar");
        exports.topbar = topbar;
        var footer = document.getElementById("footer");

        exports.footer = footer;
        var board = document.getElementById("board");

        exports.board = board;
        var scoreDom = document.getElementById("score");
        var timeDom = document.getElementById("timer");

        var boardWidth = undefined;
        exports.boardWidth = boardWidth;
        var boardHeight = undefined;

        exports.boardHeight = boardHeight;
        var spriteRadius = 0;
        exports.spriteRadius = spriteRadius;
        var bubbleRadius = 0;
        exports.bubbleRadius = bubbleRadius;
        var twoSidesEmptySpace = 0;

        exports.twoSidesEmptySpace = twoSidesEmptySpace;
        // number of col in the board
        var numOfCol = undefined;
        // number of rows in the board
        var numOfRow = undefined;

        var boardInitiated = undefined;

        function init() {
          numOfCol = Board.NUM_COL / 2;
          numOfRow = Board.NUM_ROW;
          boardInitiated = false;
        }

        function hideDialog() {
          newGameDialog.style.opacity = "0";
          newGameDialog.style.display = "none";
        }

        function startBallAnimation(
          firedBubble,
          angle,
          duration,
          distance,
          animationCallback
        ) {
          //    let angle = getAngleFromDevice(deviceXY);
          //    let distance = 1000;
          // let us assume that we will fire the ball for 1000px for now
          var distanceX = Math.sin(angle) * distance;
          var distanceY = Math.cos(angle) * distance;

          var numberOfIterations = Math.ceil(duration / 16);
          var xEveryFrame = distanceX / numberOfIterations;
          var yEveryFrame = distanceY / numberOfIterations;

          //    let animationLoop = function () {
          //        firedBubble.dom.style.left = (parseFloat(firedBubble.dom.style.left) + xEveryFrame) + "px";
          //        firedBubble.dom.style.top = (parseFloat(firedBubble.dom.style.top) - yEveryFrame) + "px";
          //
          //        numberOfIterations --;
          //        if (numberOfIterations === 0) {
          //            cancelAnimationFrame(loopID);
          //            animationCallback();
          //        }
          //        else {
          //            loopID = requestAnimationFrame(animationLoop);
          //        }
          //    }
          //
          //    let loopID = requestAnimationFrame(animationLoop);

          firedBubble.dom.addEventListener(
            "transitionend",
            function () {
              animationCallback();
              firedBubble.dom.removeEventListener("transitionend");
            },
            false
          );
          firedBubble.dom.style.transition =
            "transform " + duration / 1000 + "s ease-out";
          firedBubble.dom.style.transition =
            "-webkit-transform " + duration / 1000 + "s ease-out";
          //    firedBubble.dom.style.transition = "-webkit-transform " + 1 + "s ease-out";
          //    firedBubble.dom.style.transition = "transform " + 1 + "s ease-out";

          //        firedBubble.dom.style.transition = "transform " + 0.5 + "s linear";
          setTimeout(function () {
            firedBubble.dom.style.webkitTransform =
              "translate(" +
              distanceX +
              "px," +
              (-distanceY + spriteRadius) +
              "px)";
            firedBubble.dom.style.transform =
              "translate(" +
              distanceX +
              "px," +
              (-distanceY + spriteRadius) +
              "px)";
          }, 20);
        }

        function prepareNextBubble() {
          if (currentBubble) {
          }
          exports.currentBubble = currentBubble = Bubble.create(-1, -1);

          // make the new bubble the current bubble, then add it to the dom
          currentBubble.dom.classList.add("curr_bubble");

          //    board.appendChild(currentBubble.dom);
        }

        function resize() {
          var gameWidth = window.innerWidth;
          var gameHeight = window.innerHeight;

          var scaleToFitX = gameWidth / 720; // the game will be playable in portrait mode, so 720 for horizontal and 1280 for vertical
          var scaleToFitY = gameHeight / 1280;
          var optimalRatio = Math.min(scaleToFitX, scaleToFitY);
          //    var optimalRatio = Math.max(scaleToFitX, scaleToFitY);

          exports.boardWidth = boardWidth = 720 * optimalRatio;
          exports.boardHeight = boardHeight =
            1280 * optimalRatio -
            (topbar.getBoundingClientRect().height +
              footer.getBoundingClientRect().height);
          exports.bubbleRadius = bubbleRadius = boardWidth / (numOfCol + 1) / 2;
          exports.spriteRadius = spriteRadius = bubbleRadius / 0.88;

          // update the number of allowed rows to detect game over
          Board.setNumberOfAllowedRows(
            Math.floor(boardHeight / (bubbleRadius * 2))
          );

          board.style.width = boardWidth + "px";
          board.style.height = boardHeight + "px";

          //    currentBubble.left = ((boardWidth / 2) - (bubbleRadius)) + "px";
          //    currentBubble.top = (boardHeight - (bubbleRadius * 3)) + "px";

          drawBoard();
          //    let bubbleWidth = (newBoardWidth / numOfCol +3);
          //    // update global bubbleRadius variable
          //
          ////    cssRender(bubbleWidth);
          //    // resize the currentBubble
          //    if(currentBubble) {
          ////        currentBubble.dom.style.left = ( (newBoardWidth / 2) - (bubbleWidth /2) ) + "px";
          //    }
        }

        function setNewBubblePosition() {
          var width = spriteRadius * 2 + "px";
          var left = boardWidth / 2 - spriteRadius + "px";
          var top = boardHeight - spriteRadius * 3 + "px";
          currentBubble.dom.setAttribute("id", "current");
          currentBubble.dom.style.left = left;
          currentBubble.dom.style.top = top;
          currentBubble.dom.style.width = width;
          currentBubble.dom.style.height = width;
          //    currentBubble.dom.classList.add("curr_bubble");
        }

        function dropBubbles(orphanBubbles) {
          var partialApplication = function partialApplication() {
            var _loop = function (i) {
              var bubble = orphanBubbles[i];
              var bubbleDom = document.getElementById(
                bubble.row + "" + bubble.col
              );
              bubbleDom.addEventListener(
                "transitionend",
                function () {
                  Board.deleteBubble(bubble);
                  bubbleDom.removeEventListener("transitionend");
                  bubbleDom.remove();
                },
                false
              );

              //            bubbleDom.style.transition = "transform " + 1.2 + "s cubic-bezier(0.59,-0.05, 0.74, 0.05)";
              bubbleDom.style.transition =
                "-webkit-transform " +
                0.8 +
                "s cubic-bezier(0.59,-0.05, 0.74, 0.05)";

              bubbleDom.style.webkitTransform =
                "translate(" + 0 + "px," + 1500 + "px)";
              bubbleDom.style.transform =
                "translate(" + 0 + "px," + 1500 + "px)";
            };

            for (var i = 0; i < orphanBubbles.length; i++) {
              _loop(i);
            }
          };

          return partialApplication;
        }

        function animateVanish(bubbleDom, bubble, animateCallback) {
          var numOfIteration = 15;
          var counter = numOfIteration;

          var animateBubble = function animateBubble() {
            if (counter == numOfIteration) {
              bubbleDom.style.backgroundPosition =
                "33.33333333% " + bubble.getHeightPosFromType() + "%";
            } else if (counter == Math.floor((numOfIteration * 2) / 3)) {
              bubbleDom.style.backgroundPosition =
                "66.66666667%" + bubble.getHeightPosFromType() + "%";
            } else if (counter == Math.floor((numOfIteration * 1) / 3)) {
              bubbleDom.style.backgroundPosition =
                "100%" + bubble.getHeightPosFromType() + "%";
            }
            if (counter == 0) {
              bubbleDom.remove();
              cancelAnimationFrame(loopID);
              if (animateCallback) {
                // if it was the last bubble to be animated then we want to animate orphans if the exist
                animateCallback();
              }
            } else {
              counter--;
              loopID = requestAnimationFrame(animateBubble);
            }
          };

          var loopID = requestAnimationFrame(animateBubble);
        }

        function drawBoard() {
          var boardArray = Board.getBoardArray();
          //    let fragment = document.createDocumentFragment();
          var width = spriteRadius * 2;
          var htmlString = "";

          if (currentBubble) {
            var left = boardWidth / 2 - spriteRadius + "px";
            var _top = boardHeight - spriteRadius * 3 + "px";
            htmlString +=
              "<div id='current' class='bubble bubble" +
              currentBubble.type +
              "' style=' width: " +
              width +
              "px; height: " +
              width +
              "px;" +
              "left: " +
              (boardWidth / 2 - spriteRadius) +
              "px;" +
              " top: " +
              (boardHeight - spriteRadius * 3) +
              "px;' > </div>";

            //        currentBubble.dom.style.left = ( (newBoardWidth / 2) - (bubbleWidth /2) ) + "px";
          }

          for (var i = 0; i < Board.NUM_ROW; i++) {
            for (var j = 0; j < numOfCol * 2; j++) {
              var bubble = boardArray[i][j];
              // there exist a bubble on that index (even rows have bubble on the odd column indicies)
              if (bubble) {
                var left = j * bubbleRadius;
                var _top2 = i * bubbleRadius * 2 - spriteRadius * 0.15 * i;

                // update the coords in the bubble object (these coords are coords of the center of the bubble)
                bubble.setCoords(
                  left + board.getBoundingClientRect().left + bubbleRadius,
                  _top2 + board.getBoundingClientRect().top + bubbleRadius
                );

                htmlString +=
                  "<div id='" +
                  i +
                  "" +
                  j +
                  "' class='bubble bubble" +
                  bubble.type +
                  "' style='left: " +
                  left +
                  "px; top: " +
                  _top2 +
                  "px; width: " +
                  width +
                  "px;height: " +
                  width +
                  "px;' ></div>";
              }
            }
          }

          board.innerHTML = htmlString;
          currentBubble.setDOM(document.getElementById("current"));
          //    board.appendChild(fragment);
          //    cssRender(bubbleRadius * 2);
          //    boardInitiated = true;
        }

        /*
=========================
Render timer and score
=========================
*/

        function renderTime(timerState) {
          timeDom.textContent =
            "Remaining time " + timerState.min + ":" + timerState.sec;
        }

        function renderScore(scoreState) {
          scoreDom.textContent = "Score: " + scoreState;
        }
      },
      { "./Model/Board.js": 1, "./bubble.js": 4 },
    ],
  },
  {},
  [3]
);
