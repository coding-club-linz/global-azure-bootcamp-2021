var videoStarted = false;

window.onscroll = function () {
    if (!videoStarted) {
        var dv = document.getElementById('teaser-video-container');
        var viewportOffset = dv.getBoundingClientRect();
        var v = document.getElementById('teaser-video');

        if ((window.scrollY < (viewportOffset.top + dv.offsetHeight)) && ((window.scrollY + window.outerHeight) > viewportOffset.top)) {
            console.log('start');
            videoStarted = true;
        }
    }
}