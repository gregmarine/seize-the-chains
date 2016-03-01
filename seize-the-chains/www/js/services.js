angular.module('app.services', [])

.factory('Data', ['$firebaseAuth', 'FirebaseConfig', function($firebaseAuth, FirebaseConfig) {
  var _baseRef = new Firebase(FirebaseConfig.baseRefUrl);
  
  return {
    auth: {
      firebaseAuth: $firebaseAuth(_baseRef),
      
      getAuth: function() {
        return $firebaseAuth(_baseRef).$getAuth();
      },
      
      requireAuth: function() {
        return $firebaseAuth(_baseRef).$requireAuth();
      },
      
      createUser: function(email, password) {
        return $firebaseAuth(_baseRef).$createUser({
          email: email,
          password: password
        });
      },
      
      changeEmail: function(email, new_email, password) {
        return $firebaseAuth(_baseRef).$changeEmail({
          oldEmail: email,
          newEmail: new_email,
          password: password
        });
      },
      
      changePassword: function(email, password, new_password) {
        return $firebaseAuth(_baseRef).$changePassword({
          email: email,
          oldPassword: password,
          newPassword: new_password
        });
      },
      
      removeUser: function(email, password) {
        return $firebaseAuth(_baseRef).$removeUser({
          email: email,
          password: password
        });
      },
      
      passwordLogin: function(email, password, cb) {
        _baseRef.authWithPassword({
          email: email,
          password: password
        }, function(error, authData) {
          cb(error, authData);
        });
      },
      
      logout: function() {
        _baseRef.unauth();
      }
    },
    
    users: function() {
      return _baseRef.child('users');
    },
    
    user: function() {
      var authData = $firebaseAuth(_baseRef).$getAuth();
      
      return {
        ref: function() {
          return _baseRef.child('users').child(authData.uid);
        },
        
        profile: function() {
          return _baseRef.child('users').child(authData.uid).child('profile');
        }
      };
    }
  };
}])

.factory('Message', ['$ionicPopup', '$timeout', function($ionicPopup, $timeout) {
  return {
    timedAlert: function(title, message, duration) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: message
      });
      
      var timeout;
      switch (duration) {
        case 'short':
          timeout = 3000;
          break;
          
        case 'long':
          timeout = 5000;
          break;
        
        default:
          timeout = 3000;
      }
    
      $timeout(function() {
        alertPopup.close(); //close the popup after 3 seconds for some reason
      }, timeout);
    },
    
    confirm: function(options) {
      var confirmPopup = $ionicPopup.show({
        template: options.message,
        title: options.title,
        subTitle: options.subTitle,
        buttons: [
          { text: options.negative_label,
            onTap: function(e) {
              return false;
            }
          },
          {
            text: options.positive_label,
            type: 'button-positive',
            onTap: function(e) {
              return true;
            }
          }
        ]
      });
      
      confirmPopup.then(function(result) {
        options.callback(result);
      });
    }
  };
}]);