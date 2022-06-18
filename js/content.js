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
        
        $('.inject-dom-popup-card').show()
        // chrome.runtime.sendMessage({
        //     url: data.url,
        //     title: title || document.title,
        //     href: location.href
        // }, (response) => {
        //     // response 是 background 或者 popupjs 响应后的回复
        // });
    });

    $('body').on('click', '.inject-dom-popup-card-main-button-comfirm', function () {
        var title = $('#inject-dom-popup-card-main-input-title').val();
        if (!title) {
            alert("输入保存名称")
            return;
        }
        var statusDom = document.querySelector('.inject-dom-popup-card-main-status')
        statusDom.style.zIndex = 1;
        statusDom.style.opacity = 1;
        setTimeout(()=>{
            $('.inject-dom-popup-card').hide()
            statusDom.style.zIndex = -1;
            statusDom.style.opacity = 0;
        },1000);
        chrome.runtime.sendMessage({
            url: data.url,
            title: title,
            href: location.href
        }, (response) => {
            // response 是 background 或者 popupjs 响应后的回复
        });
    });
    $('body').on('click', '.inject-dom-popup-card-main-button-cancel', function () {
        $('.inject-dom-popup-card-main-input-title').val("");
        $('.inject-dom-popup-card').hide()
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