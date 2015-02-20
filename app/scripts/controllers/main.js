'use strict';

/**
 * @ngdoc function
 * @name hexApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the hexApp
 */
 angular.module('hexApp')
 .controller('MainCtrl', function ($scope,$interval,$localStorage) {

  	//init
  	$scope.starts = [
    {type:'left',dir:'top'},
    {type:'right',dir:'top'},
    {type:'top',dir:'left'},
    {type:'bottom',dir:'left'}
    ];


    _.map($scope.starts, function(start) {start.pos = 0; return start; });
    var moving, line1, line2,
    canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    grid = document.getElementById('grid');

    canvas.width  = grid.offsetWidth;
    canvas.height = grid.offsetHeight;

    window.onresize = function(event) {
      canvas.width  = grid.offsetWidth;
      canvas.height = grid.offsetHeight;
    };

  	// start
  	$scope.start = function() {

  		$scope.center = {};
  		$scope.trial = {};
      $scope.best = '';
      $scope.going = true;
      //context.clearRect(0, 0, 400, 300);

	  	// move
	  	moving = $interval(function() {
	  		_.map($scope.starts, function(start) {start.pos = Math.floor(Math.random()*97)+3});
	  	},1700);
   }
   $scope.start();


  	// stop moving
  	$scope.stop = function(ev) {
  		if(!$scope.going) return;

     $interval.cancel(moving);

     $scope.trial.coordinates = findClickPoint(ev)

     $scope.center.coordinates = findCenter($scope.starts);

     var indexes = _.indexBy($scope.starts,'type'),
     line1 = {
        startX: 0,
        startY: indexes.left.pos/100 * grid.offsetHeight,
        endX: grid.offsetWidth,
        endY: indexes.right.pos/100 * grid.offsetHeight
     }

     line2 = {
        startX: indexes.top.pos/100 * grid.offsetWidth,
        startY: 0,
        endX: indexes.bottom.pos/100 * grid.offsetWidth,
        endY: grid.offsetHeight
     }

     drawLine(line1, '');
     drawLine(line2, '');

     $scope.going = false;

     $scope.distance = calcDistance($scope.center.coordinates,$scope.trial.coordinates);


     $scope.best = $localStorage.best < $scope.distance ?  $localStorage.best : $scope.distance;
     $localStorage.best = $scope.best;



   }


// Functions

  	// find center
  	var findCenter = function(points) {
  		var indexes = _.indexBy(points,'type'),
      grid = document.getElementById('grid');

      console.log(indexes);
      var intersection = checkLineIntersection(
        0,indexes['left']['pos']/100 * grid.offsetHeight, // line 1 start
        grid.offsetWidth,indexes['right']['pos']/100 * grid.offsetHeight, // line 1 end
        indexes['top']['pos']/100 * grid.offsetWidth, 0, // line 2 start
        indexes['bottom']['pos']/100 * grid.offsetWidth,  grid.offsetHeight // line 2 end
        )

      return [ Math.round( intersection.x / grid.offsetWidth * 100), Math.round( intersection.y / grid.offsetHeight * 100) ]
    }


    var findClickPoint = function(ev) {
      var grid = document.getElementById('grid');
      return [ ev.clientX / grid.offsetWidth * 100,
      ev.clientY / grid.offsetHeight * 100 ]
    }

    var calcDistance = function(point1,point2) {
      var grid = document.getElementById('grid'),
      dist = [ (grid.offsetWidth*(point1[0]/100))-(grid.offsetWidth*(point2[0]/100)), 
      (grid.offsetHeight*(point1[1]/100))-(grid.offsetHeight*(point2[1]/100))];
      return Math.round(Math.sqrt(dist[0]*dist[0] + dist[1]*dist[1]));


    }

    var checkLineIntersection = function(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
      // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
      var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
      };
      denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
      if (denominator == 0) {
        return result;
      }
      a = line1StartY - line2StartY;
      b = line1StartX - line2StartX;
      numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
      numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
      a = numerator1 / denominator;
      b = numerator2 / denominator;

      // if we cast these lines infinitely in both directions, they intersect here:
      result.x = line1StartX + (a * (line1EndX - line1StartX));
      result.y = line1StartY + (a * (line1EndY - line1StartY));
  /*
          // it is worth noting that this should be the same as:
          x = line2StartX + (b * (line2EndX - line2StartX));
          y = line2StartX + (b * (line2EndY - line2StartY));
          */
      // if line1 is a segment and line2 is infinite, they intersect if:
      if (a > 0 && a < 1) {
        result.onLine1 = true;
      }
      // if line2 is a segment and line1 is infinite, they intersect if:
      if (b > 0 && b < 1) {
        result.onLine2 = true;
      }
      // if line1 and line2 are segments, they intersect if both of the above are true
      return result;
    };

    var drawLine = function(line, color) {
      color = color || 'rgba(240,240,240,.25)';
      context.strokeStyle = color;
      context.beginPath();
      context.moveTo(line.startX, line.startY);
      context.lineTo(line.endX, line.endY);
      context.lineWidth = 1;
      context.stroke();
    };



  });
