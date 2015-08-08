var app = angular.module('DeepPicApp', ['angularFileUpload', 'ngClipboard']);

app.config(['ngClipProvider', function(ngClipProvider) {
  ngClipProvider.setPath("/assets/lib/zeroclipboard/dist/ZeroClipboard.swf");
}]);

app.filter('formatDate', function() {
  return function(input) {
    var year  = '20' + input.substr(0, 2) + '年';
    var month = ''   + parseInt(input.substr(2, 2)) + '月'
    return year + month;
  };
});

app.controller('UploadCtrl', function($scope, $timeout, $http, FileUploader) {
  $scope.view = 'history';
  $scope.pictures = [];

  var uploader = $scope.uploader = new FileUploader({
    url: 'http://v0.api.upyun.com/deeppic',
    autoUpload: false,
    filters: [{
      name: 'imageFilter',
      fn: function(item, options) {
        return /image\/.*/.test(item.type)  ;
      }
    }]
  });

  angular.element('body').on('paste', function($event) {
    // 粘贴时，自动切换到 uploader 视频
    $scope.view = 'uploader';

    var items = $event.originalEvent.clipboardData.items;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (/image\/.*/i.test(item.type)) {
        var file = item.getAsFile();
        console.log(item.type);
        file.name = file.fileName = item.type.replace(/image\//i, 'paste.');
        uploader.addToQueue(file);
      }
    }
  });

  uploader.onSuccessItem = function(fileItem, response, status, headers) {
    fileItem.remoteUrl = 'http://deeppic.b0.upaiyun.com' + response.url;
  };

  uploader.onAfterAddingFile = function(fileItem) {
    var request = $http.post('/uptoken', { image: fileItem.file.name });
    
    request.success(function(data, status, headers, config) {
      fileItem.formData = [data];
      fileItem.upload();
    });

    request.error(function(data, status, headers, config) {
      console.error(data);
      fileItem.remove();
    });
  };

  $scope.currentList = function() {
    if (this.view == 'uploader') {
      return uploader.queue;
    } else {
      return this.pictures;
    }
  };

  $scope.clickUpload = function() {
    angular.element('#file').trigger('click');
  };

  $scope.toggleSelect = function(item) {
    if (item.isSuccess) {
      item.isSelected = !(item.isSelected);
    }
  };

  $scope.selectOutput = function() {
    angular.element('.sidebar textarea').focus().select();
  };

  $scope.selectAll = function() {
    _.each(this.currentList(), function(item) {
      if (item.isSuccess) {
        item.isSelected = true;
      }
    });
  };

  $scope.selectNone = function() {
    _.each(this.currentList(), function(item) {
      if (item.isSuccess) {
        item.isSelected = false;
      }
    });
  };

  $scope.removeItem = function(item) {
    item.cancel();
    item.remove();
  };

  $scope.getItemUrl = function(item) {
    return item.remoteUrl;
  };

  $scope.showCopySuccess = function(item) {
    item.isJustCopied = true;
    $timeout(function() {
      item.isJustCopied = false;
    }, 1000);
  };

  $scope.removeSelection = function() {
    while(true) {
      var item = _.chain(this.currentList())
                  .where({ isSelected: true })
                  .last().value();

      if (item) {
        item.remove();
      } else {
        break;
      }
    }
  }

  // 清除当前所有图片
  $scope.handleKey = function($event) {
    if ($event.keyCode == 27) {
      uploader.clearQueue();
    }
  };

  $scope.activeView = function(view) {
    $scope.view = view;
  };

  $scope.isOutputVisible = function() {
    return _.any(this.currentList(), { isSelected: true });
  };

  $scope.output = function() {
    return _.chain(this.currentList())
            .where({ isSelected: true })
            .map('remoteUrl')
            .value().join('\n');
  };

  function currentMonth() {
    var date = new Date();
    var year = date.getFullYear().toString().substr(2, 2);
    var month = date.getMonth() + 1;
    var prefix = month < 10 ? '0' : '';

    return year + prefix + month;
  }

  // Fetching all months
  var currentMonth = currentMonth();
  $scope.months = [currentMonth];
  $scope.currentMonth = currentMonth;

  $scope.onMonthChange = function() {
    $scope.pictures = [];
    this.loadPictures(this.currentMonth);
  };

  $scope.loadPictures = function(month) {
    $http.get('/months/' + month).success(function(data) {
      $scope.pictures = _.map(data, function(url) {
        return { remoteUrl: url, isSuccess: true };
      });
    });
  };

  $http.get('/months').success(function(data) {
    $scope.months = data;

    if (data.length) {
      $scope.currentMonth = data[0];
      $scope.onMonthChange();
    }
  });
});
