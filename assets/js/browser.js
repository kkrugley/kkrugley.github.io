/*! CSS Browser Selector - http://rafael.adm.br/css_browser_selector */
function css_browser_selector(userAgent) {
    var ua = userAgent.toLowerCase();

    function is(str) {
        return ua.indexOf(str) > -1;
    }

    var gecko = 'gecko',
        webkit = 'webkit',
        safari = 'safari',
        opera = 'opera',
        mobile = 'mobile',
        html = document.documentElement;

    var browserClasses = [
        // IE
        (!(/opera|webtv/i.test(ua)) && /msie\s(\d)/.test(ua)) ? 'ie ie' + RegExp.$1 :
        // Firefox
        is('firefox/2') ? gecko + ' ff2' :
        is('firefox/3.5') ? gecko + ' ff3 ff3_5' :
        is('firefox/3.6') ? gecko + ' ff3 ff3_6' :
        is('firefox/3') ? gecko + ' ff3' :
        is('gecko/') ? gecko :
        // Opera
        is('opera') ? opera + (/version\/(\d+)/.test(ua) ? ' ' + opera + RegExp.$1 : (/opera(\s|\/)(\d+)/.test(ua) ? ' ' + opera + RegExp.$2 : '')) :
        // Konqueror
        is('konqueror') ? 'konqueror' :
        // Mobile devices
        is('blackberry') ? mobile + ' blackberry' :
        is('android') ? mobile + ' android' :
        // WebKit-based browsers
        is('chrome') ? webkit + ' chrome' :
        is('iron') ? webkit + ' iron' :
        is('applewebkit/') ? webkit + ' ' + safari + (/version\/(\d+)/.test(ua) ? ' ' + safari + RegExp.$1 : '') :
        // Other
        is('mozilla/') ? gecko :
        '',

        // Mobile devices
        is('j2me') ? mobile + ' j2me' :
        is('iphone') ? mobile + ' iphone' :
        is('ipod') ? mobile + ' ipod' :
        is('ipad') ? mobile + ' ipad' :
        // Operating systems
        is('mac') ? 'mac' :
        is('darwin') ? 'mac' :
        is('webtv') ? 'webtv' :
        is('win') ? 'win' + (is('windows nt 6.0') ? ' vista' : '') :
        is('freebsd') ? 'freebsd' :
        (is('x11') || is('linux')) ? 'linux' :
        '',
        'js'
    ];

    var classes = browserClasses.join(' ');
    html.className += ' ' + classes;
    return classes;
}

css_browser_selector(navigator.userAgent);

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        var clippyContainer = document.getElementById("clippy-container");
        if (clippyContainer) {
            clippyContainer.classList.add("visible");
        }
    }, 2000); // 1 секунда
});
