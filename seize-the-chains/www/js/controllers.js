angular.module('app.controllers', [])

.controller('AppCtrl', function($scope, $ionicLoading, Data) {
  Data.auth.firebaseAuth.$onAuth(function(authData) {
    if(authData) {
      $scope.authData = authData;
    }
  });
  
  $scope.logout = function() {
    $ionicLoading.show({
      template: 'Logging Out...',
      duration: 2000
    });
    Data.auth.logout();
    window.location.reload(true);
  };
})

.controller('LoginCtrl', function($scope, $state, $ionicLoading, Data, Message) {
  if(Data.auth.getAuth()) {
    $state.go('app.home');
  }
  
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  // });

  // Form data for login
  $scope.loginData = {};
  
  // Perform the login action when the user submits the login form
  $scope.passwordLogin = function() {
    $ionicLoading.show({
      template: 'Logging In...'
    });
    
    Data.auth.passwordLogin($scope.loginData.email, $scope.loginData.password,
    function(error, authData) {
      if(error) {
        $ionicLoading.hide();
        
        switch (error.code) {
          case 'INVALID_EMAIL':
            $scope.error = "The specified user account email is invalid.";
            Message.timedAlert('Error', $scope.error, 'short');
            break;
          
          case 'INVALID_PASSWORD':
            $scope.error = "The specified user account password is incorrect.";
            Message.timedAlert('Error', $scope.error, 'short');
            break;
          
          case 'INVALID_USER':
            $scope.error = "The specified user account does not exist.";
            Message.timedAlert('Error', $scope.error, 'short');
            break;
          
          default:
            $scope.error = "Error logging user in: " + error;
            Message.timedAlert('Error', $scope.error, 'short');
        }
      } else {
        $ionicLoading.hide();

        $state.go("app.home");
      }
    });
  };
  
  $scope.signup = function() {
    $state.go("signup");
  };
})

.controller('SignupCtrl', function($scope, $state, $ionicHistory, $ionicLoading, Data, Message) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  // });

  // Form data for the login modal
  $scope.loginData = {};
  
  $scope.createUser = function() {
    $scope.message = null;
    $scope.error = null;
    
    if($scope.loginData.password == $scope.loginData.retype_password) {
      $ionicLoading.show({
        template: 'Creating User...'
      });
      
      Data.auth.createUser($scope.loginData.email, $scope.loginData.password)
      .then(function(authData) {
        $ionicLoading.hide();
        
        $scope.message = "User created successfully. You may login now.";
        $state.go("login");
        
        Message.timedAlert('Success', $scope.message, 'short');
      }).catch(function(error) {
        $ionicLoading.hide();
        
        $scope.error = error;
        Message.timedAlert('Error', $scope.error, 'short');
      });
    } else {
      $scope.error = "The passwords do not match.";
      Message.timedAlert('Error', $scope.error, 'short');
    }
  };
  
  $scope.cancel = function() {
    $ionicHistory.goBack();
  };
})

.controller('AccountCtrl', function($scope, $state, $ionicHistory, $ionicLoading, $firebaseObject, Data, Message) {
  
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  // });
  
  var authData = Data.auth.getAuth();
  
  $scope.profileData = $firebaseObject(Data.user().profile());
  
  $scope.emailData = {
    new_email: authData.password.email,
    email: authData.password.email
  };
  
  $scope.passwordData = {};
  
  $scope.saveEmail = function() {
    $scope.message = null;
    $scope.error = null;
    
    // Update email address
    if($scope.emailData.email !== $scope.emailData.new_email)
    {
      $ionicLoading.show({
        template: 'Saving Email...'
      });
      
      Data.auth.changeEmail($scope.emailData.email,
        $scope.emailData.new_email,
        $scope.emailData.password).then(function() {
        $ionicLoading.hide();
        
        $scope.emailData.email = $scope.emailData.new_email;
        $scope.message = "Email changed successfully!";
        Message.timedAlert('Success', $scope.message, 'short');
      }).catch(function(error) {
        $ionicLoading.hide();
        
        $scope.error = error;
        Message.timedAlert('Error', $scope.error, 'short');
      });
    }
  };
  
  $scope.savePassword = function() {
    $scope.message = null;
    $scope.error = null;
    
    // Update password
    if($scope.passwordData.new_password) {
      if($scope.passwordData.new_password == $scope.passwordData.retype_password) {
        $ionicLoading.show({
          template: 'Saving Password...'
        });
        
        Data.auth.changePassword($scope.emailData.email,
          $scope.passwordData.password,
          $scope.passwordData.new_password).then(function() {
          $ionicLoading.hide();
          
          $scope.passwordData = {};
          $scope.message = "Password changed successfully!";
          Message.timedAlert('Success', $scope.message, 'short');
        }).catch(function(error) {
          $ionicLoading.hide();
          
          $scope.error = error;
          Message.timedAlert('Error', $scope.error, 'short');
        });
      } else {
        $scope.error = "The new passwords do not match.";
        Message.timedAlert('Error', $scope.error, 'short');
      }
    }
  };
  
  $scope.deleteAccount = function() {
    $scope.message = null;
    $scope.error = null;
    
    // 1. Confirm
    var options = {
      title: "Delete Account",
      subTitle: "Are you sure you would like to delete your account?",
      message: "THIS CANNOT BE UNDONE!",
      positive_label: "GOOD BYE!",
      negative_label: "NEVER MIND",
      callback: function(result) {
        if(result) {
          // 2. Remove user from users
          var obj = $firebaseObject(Data.user().ref());
          
          $ionicLoading.show({
            template: 'Deleting Account...'
          });
        
          obj.$remove().then(function(ref) {
            // 3. Remove account from auth
            Data.auth.removeUser($scope.emailData.email,
              $scope.passwordData.password).then(function() {
              $ionicLoading.hide();
              
              $scope.message = "Your account was successfully removed!";
              Message.timedAlert('Success', $scope.message, 'short');
              Data.auth.logout();
              $state.go('login');
            }).catch(function(error) {
              $ionicLoading.hide();
              
              $scope.error = error;
              Message.timedAlert('Error', $scope.error, 'long');
            });
          }, function(error) {
            $ionicLoading.hide();
            
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
})

.controller('HomeCtrl', function($scope, $ionicModal, $ionicListDelegate, $ionicLoading, $firebaseArray, $firebaseObject, Data, Message) {

})

.controller('CoursesCtrl', function($scope, $ionicModal, $ionicListDelegate, $ionicLoading, $firebaseArray, $firebaseObject, Data, Message) {
  $scope.courses = Data.courses().all();
})

.controller('CourseCtrl', function($scope, $stateParams, $ionicModal, $ionicListDelegate, $ionicLoading, $ionicHistory, $firebaseArray, $firebaseObject, Data, Message) {
  $scope.courseId = $stateParams.courseId;
  
  $scope.course = Data.courses().findOne($scope.courseId);
  
  $scope.remove = function() {
    // 1. Confirm
    var options = {
      title: "Delete Course",
      subTitle: "Are you sure you would like to delete " + $scope.course.name + "?",
      message: "THIS CANNOT BE UNDONE!",
      positive_label: "YES",
      negative_label: "NO",
      callback: function(result) {
        if(result) {
          // 2. Remove course
          $ionicLoading.show({
            template: 'Deleting Course...'
          });
        
          Data.courses().remove($scope.course).then(function(ref) {
            $ionicLoading.hide();
            
            $ionicHistory.goBack();
          }, function(error) {
            $ionicLoading.hide();
            
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
})

.controller('NewCourseCtrl', function($scope, $ionicModal, $ionicListDelegate, $ionicLoading, $ionicHistory, $firebaseArray, $firebaseObject, Data, Message) {
  $scope.course = {
    name: "",
    location: "",
    holes: []
  };
  
  $scope.newHole = function() {
    var hole = {
      number: ($scope.course.holes.length + 1),
      par: 3,
      distance: 0
    };
    
    $scope.course.holes.push(hole);
  };
  
  $scope.cancel = function() {
    $ionicHistory.goBack();
  };
  
  $scope.save = function() {
    $ionicLoading.show({
      template: 'Saving Course...'
    });
    
    var course = {
      name: $scope.course.name,
      location: $scope.course.location,
      holes: $scope.course.holes
    };
    
    Data.courses().add(course).then(function() {
        $ionicLoading.hide();
        $ionicHistory.goBack();
      }).catch(function(error) {
        $ionicLoading.hide();
        
        $scope.error = error;
        Message.timedAlert('Error', $scope.error, 'short');
      });
  };
})

.controller('EditCourseCtrl', function($scope, $stateParams, $ionicModal, $ionicListDelegate, $ionicLoading, $ionicHistory, $firebaseArray, $firebaseObject, Data, Message) {
  $scope.courseId = $stateParams.courseId;
  
  $scope.course = Data.courses().findOne($scope.courseId);
  
  $scope.newHole = function() {
    var hole = {
      number: ($scope.course.holes.length + 1),
      par: 3,
      distance: 0
    };
    
    $scope.course.holes.push(hole);
  };
  
  $scope.cancel = function() {
    $ionicHistory.goBack();
  };
  
  $scope.save = function() {
    $ionicLoading.show({
      template: 'Saving Course...'
    });
    
    Data.courses().save($scope.course).then(function() {
        $ionicLoading.hide();
        $ionicHistory.goBack();
      }).catch(function(error) {
        $ionicLoading.hide();
        
        $scope.error = error;
        Message.timedAlert('Error', $scope.error, 'short');
      });
  };
})

.controller('ClubsCtrl', function($scope, $ionicModal, $ionicListDelegate, $ionicLoading, $firebaseArray, $firebaseObject, Data, Message) {
  $scope.clubs = Data.clubs().all();
})

.controller('ClubCtrl', function($scope, $stateParams, $ionicModal, $ionicListDelegate, $ionicLoading, $ionicHistory, $firebaseArray, $firebaseObject, Data, Message) {
  $scope.clubId = $stateParams.clubId;
  
  $scope.club = $firebaseObject(Data.clubs().findOne($scope.clubId));
  $scope.club.$loaded()
  .then(function(data) {
    // See if current user is a player in this club
    $scope.isplayer = false;
    if($scope.club.players) {
      var uid = Data.user().uid();
      for(var i=0; i<$scope.club.players.length; i++) {
        if($scope.club.players[i].uid === uid) {
          $scope.isplayer = true;
          break;
        }
      }
    }
  })
  .catch(function(error) {
    $scope.error = error;
    Message.timedAlert('Error', $scope.error, 'long');
  });
  
  $scope.profileData = $firebaseObject(Data.user().profile());
  
  $scope.remove = function() {
    // 1. Confirm
    var options = {
      title: "Delete Club",
      subTitle: "Are you sure you would like to delete " + $scope.club.name + "?",
      message: "THIS CANNOT BE UNDONE!",
      positive_label: "YES",
      negative_label: "NO",
      callback: function(result) {
        if(result) {
          // 2. Remove course
          $ionicLoading.show({
            template: 'Deleting Club...'
          });
        
          Data.clubs().remove($scope.club).then(function(ref) {
            $ionicLoading.hide();
            
            $ionicHistory.goBack();
          }, function(error) {
            $ionicLoading.hide();
            
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
  
  $scope.addMe = function() {
    var player = {
      uid: Data.user().uid(),
      name: $scope.profileData.fullname
    };
    
    if(!$scope.club.players) {
      $scope.club.players = [];
    }
    
    $scope.club.players.push(player);
    
    $ionicLoading.show({
      template: 'Saving Club...'
    });
    
    Data.clubs().save($scope.club).then(function() {
      $ionicLoading.hide();
      $scope.isplayer = true;
    }).catch(function(error) {
      $ionicLoading.hide();
      
      $scope.error = error;
      Message.timedAlert('Error', $scope.error, 'short');
    });
  };
  
  $scope.addPlayer = function() {
    var options = {
      title: "Add League Player",
      subTitle: "Name of the league player to add:",
      scope: $scope,
      positive_label: "ADD",
      negative_label: "CANCEL",
      callback: function(result) {
        if(result) {
          var player = {
            uid: "",
            name: result
          };
          
          if(!$scope.club.players) {
            $scope.club.players = [];
          }
          
          $scope.club.players.push(player);
          
          $ionicLoading.show({
            template: 'Saving Club...'
          });
          
          Data.clubs().save($scope.club).then(function() {
            $ionicLoading.hide();
          }).catch(function(error) {
            $ionicLoading.hide();
            
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'short');
          });
        }
      }
    };
    Message.prompt(options);
  };
  
  $scope.thisIsMe = function(player) {
    $ionicListDelegate.closeOptionButtons();
    
    // 1. Confirm
    var options = {
      title: "Is This You?",
      subTitle: "Are you sure you would like to save " + player.name + " as you in the league's players?",
      message: "THIS CANNOT BE UNDONE!",
      positive_label: "YES",
      negative_label: "NO",
      callback: function(result) {
        if(result) {
          // 2. Remove course
          $ionicLoading.show({
            template: 'Saving Player...'
          });
          
          var idx = $scope.club.players.indexOf(player);
          $scope.club.players[idx].uid = Data.user().uid();
        
          Data.clubs().save($scope.club).then(function(ref) {
            // See if current user is a player in this club
            $scope.isplayer = false;
            if($scope.club.players) {
              var uid = Data.user().uid();
              for(var i=0; i<$scope.club.players.length; i++) {
                if($scope.club.players[i].uid === uid) {
                  $scope.isplayer = true;
                  break;
                }
              }
            }
            
            $ionicLoading.hide();
          }, function(error) {
            $ionicLoading.hide();
            
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
  
  $scope.removePlayer = function(player) {
    $ionicListDelegate.closeOptionButtons();
    
    // 1. Confirm
    var options = {
      title: "Remove Player",
      subTitle: "Are you sure you would like to remove " + player.name + " from the league's players?",
      message: "THIS CANNOT BE UNDONE!",
      positive_label: "YES",
      negative_label: "NO",
      callback: function(result) {
        if(result) {
          // 2. Remove course
          $ionicLoading.show({
            template: 'Removing Player...'
          });
          
          var idx = $scope.club.players.indexOf(player);
          $scope.club.players.splice(idx, 1);
        
          Data.clubs().save($scope.club).then(function(ref) {
            // See if current user is a player in this club
            $scope.isplayer = false;
            if($scope.club.players) {
              var uid = Data.user().uid();
              for(var i=0; i<$scope.club.players.length; i++) {
                if($scope.club.players[i].uid === uid) {
                  $scope.isplayer = true;
                  break;
                }
              }
            }
            
            $ionicLoading.hide();
          }, function(error) {
            $ionicLoading.hide();
            
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
})

.controller('NewClubCtrl', function($scope, $ionicModal, $ionicListDelegate, $ionicLoading, $ionicHistory, $firebaseArray, $firebaseObject, Data, Message) {
  $scope.club = {
    name: "",
    location: ""
  };
  
  $scope.cancel = function() {
    $ionicHistory.goBack();
  };
  
  $scope.save = function() {
    $ionicLoading.show({
      template: 'Saving Course...'
    });
    
    var club = {
      name: $scope.club.name,
      location: $scope.club.location
    };
    
    Data.clubs().add(club).then(function() {
        $ionicLoading.hide();
        $ionicHistory.goBack();
      }).catch(function(error) {
        $ionicLoading.hide();
        
        $scope.error = error;
        Message.timedAlert('Error', $scope.error, 'short');
      });
  };
})

.controller('EditClubCtrl', function($scope, $stateParams, $ionicModal, $ionicListDelegate, $ionicLoading, $ionicHistory, $firebaseArray, $firebaseObject, Data, Message) {
  $scope.clubId = $stateParams.clubId;
  
  $scope.club = Data.clubs().findOne($scope.clubId);
  
  $scope.cancel = function() {
    $ionicHistory.goBack();
  };
  
  $scope.save = function() {
    $ionicLoading.show({
      template: 'Saving Club...'
    });
    
    Data.clubs().save($scope.club).then(function() {
      $ionicLoading.hide();
      $ionicHistory.goBack();
    }).catch(function(error) {
      $ionicLoading.hide();
      
      $scope.error = error;
      Message.timedAlert('Error', $scope.error, 'short');
    });
  };
});