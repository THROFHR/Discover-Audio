var db = new Nedb();

var getDB = function getDB(){
  console.log('getDB===');
  return db
}
var beforeDownload = function (url, fileName) {
  db.count({ url }, function (err, count) {
    if (count===0) {
      db.insert({url,name:fileName}, function (err) {
        db.count({}, function (err, count) {
          var title = count===0 ? '' : count
          console.log('beforeDownload====',title);
          chrome.browserAction.setBadgeText({text: ''+title});  
          download(url, fileName)
        });
      })
    }
  })
}
var afterDownload = function (url) {
  db.remove({url}, function (err) {
    db.count({}, function (err, count) {
      var title = count===0 ? '' : count
      console.log('afterDownload====',title);
      chrome.browserAction.setBadgeText({text: ''+title});  
    });
  })
}

function download(url, fileName) {
  
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';

  xhr.onprogress = function (event) {
    if (event.lengthComputable) {
      var percentComplete = (event.loaded / event.total) * 100;
      //yourShowProgressFunction(percentComplete);
    }
  };

  xhr.onload = function (event) {
    if (this.status == 200) {
      _saveBlob(this.response, fileName);
    } else {
      //yourErrorFunction()
    }
    afterDownload(url)
  };

  xhr.onerror = function (event) {
    //yourErrorFunction()
  };

  xhr.send();
}


function _saveBlob(response, fileName) {
  if (navigator.msSaveBlob) {
    //OK for IE10+
    navigator.msSaveBlob(response, fileName);
  } else {
    _html5Saver(response, fileName);
  }
}

function _html5Saver(blob, fileName) {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  document.body.removeChild(a);
}
var fetchByApi = async (url) => {
  var resp = await fetch("https://music.sounm.com/", {
    "credentials": "include",
    "headers": {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,gd;q=0.7",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest"
    },
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": "input=" + url + "&filter=url&type=_&page=1",
    "method": "POST",
    "mode": "cors"
  }).then((res) => {
    return res.json()
  }).catch(() => {})
  if (resp && resp.code === 200 && resp.data[0]) {
    return resp.data[0]
  }
  return {}
}

/**支持的一些type*/
var types = ['media', 'video/mp4', 'object'];
chrome.webRequest.onBeforeRequest.addListener(function interceptRequest(request) {
  var url = decodeURIComponent(request.url);
  if (request.type != 'media' && !(/\.mp3$/.test(url))) {
    return false;
  }
  chrome.tabs.sendMessage(request.tabId, {
    url: url,
    type: 'mp3'
  });
}, {
  urls: ['http://*/*.mp3*', 'https://*/*.mp3*']
}, ['blocking']);
chrome.webRequest.onBeforeRequest.addListener(function interceptRequest(request) {
  var url = decodeURIComponent(request.url);
  if (request.type != 'media' && !(/\.wav$/.test(url))) {
    return false;
  }
  chrome.tabs.sendMessage(request.tabId, {
    url: url,
    type: 'wav'
  });
}, {
  urls: ['http://*/*.wav*', 'https://*/*.wav*']
}, ['blocking']);

chrome.webRequest.onBeforeRequest.addListener(function interceptRequest(request) {
  var url = decodeURIComponent(request.url);
  if (request.type != 'media' && !(/\.aac$/.test(url))) {
    return false;
  }
  chrome.tabs.sendMessage(request.tabId, {
    url: url,
    type: 'aac'
  });
}, {
  urls: ['http://*/*.aac*', 'https://*/*.aac*']
}, ['blocking']);

chrome.webRequest.onBeforeRequest.addListener(function interceptRequest(request) {
  var url = decodeURIComponent(request.url);
  console.log('url===', url, request.type != 'media', !(/\.m4a$/.test(url)));
  if (request.type != 'media' && !(/\.m4a$/.test(url))) {
    return false;
  }
  chrome.tabs.sendMessage(request.tabId, {
    url: url,
    type: 'm4a'
  });
}, {
  urls: ['http://*/*.m4a*', 'https://*/*.m4a*']
}, ['blocking']);

chrome.webRequest.onBeforeRequest.addListener(function interceptRequest(request) {
  var url = decodeURIComponent(request.url);
  if (types.indexOf(request.type) == -1) {
    return false;
  }
  chrome.tabs.sendMessage(request.tabId, {
    url: url,
    type: 'mp4'
  });
}, {
  urls: ['http://*/*.mp4*', 'https://*/*.mp4*']
}, ['blocking']);

/**一些其他的杂类网站，没有后缀的那种 */
chrome.webRequest.onBeforeRequest.addListener(function interceptRequest(request) {
  var url = decodeURIComponent(request.url);
  if (request.type != 'media') {
    return false;
  }
  chrome.tabs.sendMessage(request.tabId, {
    url: url,
    type: 'other'
  });
}, {
  urls: [
    'http://*.pstatp.com/obj/*', /*抖音*/
    'http://*.ixigua.com/*', /**这也是抖音，不知道为什么是 ixigua */
  ]
}, ['blocking']);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  sendResponse('Send a message to reply')
  
  var url = request.url
  var fileName = request.title
  fetchByApi(request.href).then((data) => {
    if (data.url) {
      url = data.url
      fileName = data.title + '-' + data.author
    }
    beforeDownload(url, fileName)
  })
})