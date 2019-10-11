var bg = chrome.extension.getBackgroundPage();
var db = bg.getDB();

var getHtml = (doc) => {
  var html = '<li class="my_fav_list_li">' +
    '<a class="my_fav_list_a" href="' + doc.url + '" target="_blank">' +
    doc.name +
    '</a>' +
    '</li>'
  return html
}

db.find({}, function (err, docs) {
  if (err) {
    return
  }
  var count = docs.length
  if (docs.length === 0) {
    docs.push({name:'无任务',href:'javascript:;'})
  }
  var html = docs.map((item) => {
    return getHtml(item)
  }).join('');
  document.getElementById("count").innerHTML = count;
  document.getElementById("content").innerHTML = html ;
})