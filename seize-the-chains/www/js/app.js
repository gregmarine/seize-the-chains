// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'firebase', 'firebase.config', 'app.controllers', 'app.services'])

.run(["$rootScope", "$state", "$ionicPlatform", function($rootScope, $state, $ionicPlatform) {
  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  
  // When a state requires auth, this will send the user to the login screen.
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the log in screen
    if (error === "AUTH_REQUIRED") {
      $state.go("login");
    }
  });
}])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('login', {
    cache: false,
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('signup', {
    cache: false,
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignupCtrl'
  })

  .state('app.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: 'templates/account.html',
        controller: 'AccountCtrl',
        resolve: {
          "currentAuth": ["Data", function(Data) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError (see above)
            return Data.auth.requireAuth();
          }]
        }
      }
    }
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl',
        resolve: {
          "currentAuth": ["Data", function(Data) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError (see above)
            return Data.auth.requireAuth();
          }]
        }
      }
    }
  })

  .state('app.courses', {
    url: '/courses',
    views: {
      'menuContent': {
        templateUrl: 'templates/courses.html',
        controller: 'CoursesCtrl',
        resolve: {
          "currentAuth": ["Data", function(Data) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError (see above)
            return Data.auth.requireAuth();
          }]
        }
      }
    }
  })

  .state('app.newcourse', {
    url: '/courses/new',
    views: {
      'menuContent': {
        templateUrl: 'templates/new-course.html',
        controller: 'NewCourseCtrl',
        resolve: {
          "currentAuth": ["Data", function(Data) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError (see above)
            return Data.auth.requireAuth();
          }]
        }
      }
    }
  })

  .state('app.course', {
    url: '/course/:courseId',
    views: {
      'menuContent': {
        templateUrl: 'templates/course.html',
        controller: 'CourseCtrl',
        resolve: {
          "currentAuth": ["Data", function(Data) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError (see above)
            return Data.auth.requireAuth();
          }]
        }
      }
    }
  })

  .state('app.editcourse', {
    url: '/course/:courseId/edit',
    views: {
      'menuContent': {
        templateUrl: 'templates/edit-course.html',
        controller: 'EditCourseCtrl',
        resolve: {
          "currentAuth": ["Data", function(Data) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError (see above)
            return Data.auth.requireAuth();
          }]
        }
      }
    }
  });
  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
