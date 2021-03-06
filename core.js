
// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});


(function () {
    'use strict';
    angular
        .module('movieReviewApp', ['ngRoute','ngMaterial'])
        .config(['$routeProvider',
            function($routeProvider, $locationProvider) {
                $routeProvider
                    .when('/moviesReviewed', {
                        templateUrl: 'Movies.html'
                    })
                    .when('/movieReview', {
                        templateUrl: 'createMovie.html'
                    });


            }])
        .controller('DemoCtrl', DemoCtrl)


    function DemoCtrl ($mdToast,$scope,$http,$routeParams,$timeout, $q, $log) {
        var self = this;
        self.data = null;
        $scope.stockSymbol = "";
        self.selectedItem = null;
        self.searchText = null;
        self.selectedResult = null;
        self.movies = null;
        $scope.stockList = [];
        var last = {
            bottom: false,
            top: true,
            left: false,
            right: true
        };
        this.toastPosition = angular.extend({}, last);


        self.selectedItemQuery = function(selectedItem) {
            if (selectedItem === undefined) return;
            return $http.get('https://cloud.iexapis.com/stable/stock/'+escape(selectedItem)+'/quote?token=pk_6846f423778d41229e263cfc9ccc6ea9').then(function (result) {
                $scope.stockList.push(result);
                self.selectedResult = result;
                $scope.stockSymbol = "";
                // Set a callback to run when the Google Visualization API is loaded.
                google.charts.setOnLoadCallback(drawChart($scope.stockList));

                return result;
            })
        }

        setInterval(function(){
            let count = 0;
            //this code runs every second
            for(let j=0;j<$scope.stockList.length;j++)
            {
                $http.get('https://cloud.iexapis.com/stable/stock/'+$scope.stockList[j].data.symbol+'/quote?token=pk_6846f423778d41229e263cfc9ccc6ea9').then(function(result){
                    if(result.data.latestPrice === $scope.stockList[j].data.latestPrice)
                    {
                        count = count + 1;
                        if(count === $scope.stockList.length)
                        {
                            showToast("All Companies");
                        }
                    }
                    else
                    {
                        $scope.stockList[j].data.latestPrice = result.data.latestPrice;
                        google.charts.setOnLoadCallback(drawChart($scope.stockList));
                    }
                });
            }
        }, 10000);

        function sanitizePosition() {
            var current = self.toastPosition;

            if (current.bottom && last.top) {
                current.top = false;
            }
            if (current.top && last.bottom) {
                current.bottom = false;
            }
            if (current.right && last.left) {
                current.left = false;
            }
            if (current.left && last.right) {
                current.right = false;
            }

            last = angular.extend({}, current);
        }

        function getToastPosition() {
            sanitizePosition();

            return Object.keys(self.toastPosition)
                .filter(function(pos) {
                    return self.toastPosition[pos];
                }).join(' ');
        }

        function showToast(name)
        {
            var pinTo = getToastPosition();

            $mdToast.show(
                $mdToast.simple()
                    .textContent(name+' Stock Prices remains unchanged')
                    .position(pinTo)
                    .hideDelay(3000))
                .then(function() {
                    $log.log('Toast dismissed.');
                }).catch(function() {
                $log.log('Toast failed or was forced to close early by another toast.');
            });
        }
    }

    // Callback that creates and populates a data table,
    // instantiates the bar chart, passes in the data and
    // draws it.
    function drawChart(stockList) {
        console.log(stockList);
        // Create the data table.
        let resultArray = [];
        for(let i=0;i<stockList.length;i++)
        {
         resultArray.push([stockList[i].data.companyName , stockList[i].data.latestPrice, stockList[i].data.latestPrice])
        }
        console.log(...resultArray);
        var data = google.visualization.arrayToDataTable([
            ['Stock Name', 'Stock Price',{ role: 'annotation' } ],
                ...resultArray
        ]);

        // Set chart options
        var options = {
            title: 'Stock Price Chart',
            chartArea: {width: '50%'},
            hAxis: {
                title: 'Stock Price',
                minValue: 0
            },
            vAxis: {
                title: 'Stock Name'
            },
            bar: { groupWidth: "40%" }
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }

})();