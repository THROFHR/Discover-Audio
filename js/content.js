var data = null

var showActions = function () {
    if (data && data.url) {
        $('#inject-action-btn-see').attr('href', data.url);
        $(".inject-dom").fadeIn()
    }
}
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('Discover Audio==========', request);
        data = request;
        showActions()
    }
);

var initContent = function (html) {
    $(html).appendTo('body');
    showActions()
    /**监听下载按钮 */
    $('body').on('click', '#inject-action-btn-down', function () {
        chrome.runtime.sendMessage({
            url: data.url,
            title: document.title,
            href: location.href
        }, (response) => {
            // response 是 background 或者 popupjs 响应后的回复
        });
    });
    console.log('inject finish');
}
window.addEventListener('load', function (e) {
    console.log('load end');
    $.get(chrome.extension.getURL('html/inject.html'), function (res) {
        console.log('====get inject.html=======');
        initContent(res)
    });
}, false);