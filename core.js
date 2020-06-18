
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


    function DemoCtrl ($scope,$http,$routeParams,$timeout, $q, $log) {
        var self = this;
        self.data = null;
        self.selectedItem = null;
        self.searchText = null;
        self.selectedResult = null;
        self.movies = null;
        $scope.stockList = [];



        self.querySearch = function(query)
        {
            if(query.length< 3) return;
            return $http.get('https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords='+escape(query)+'&apikey=9DSDGWGBNQAEJ8R3').then(function(result){
                self.data = result.data.bestMatches;
                return result.data.bestMatches;
            })
        }

        self.selectedItemQuery = function(selectedItem) {
            if (selectedItem === undefined) return;
            return $http.get('https://cloud.iexapis.com/stable/stock/'+escape(selectedItem)+'/quote?token=pk_6846f423778d41229e263cfc9ccc6ea9').then(function (result) {
                $scope.stockList.push(result);
                self.selectedResult = result;
                self.searchText = '';
                // Set a callback to run when the Google Visualization API is loaded.
                google.charts.setOnLoadCallback(drawChart($scope.stockList));

                setInterval(function(){
                    //this code runs every second
                    for(let j=0;j<$scope.stockList.length;j++)
                    {
                        $http.get('https://cloud.iexapis.com/stable/stock/'+$scope.stockList[j].data.symbol+'/quote?token=pk_6846f423778d41229e263cfc9ccc6ea9').then(function(result){
                            if(result.data.latestPrice === $scope.stockList[j].data.latestPrice)
                            {
                                console.log('Prices remain same');
                            }
                            else
                            {
                                $scope.stockList[j].data.latestPrice = result.data.latestPrice;
                            }
                        })
                    }
                }, 10000);

                return result;
            })
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
            ['Stock Name', 'Todays Price',{ role: 'annotation' } ],
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
            }
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }

})();