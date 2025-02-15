/* DOKUWIKI:include script/prosemirror.js */
/* DOKUWIKI:include script/tinykeys.umd.js */
/* DOKUWIKI:include aframe/aframe.js */
/* DOKUWIKI:include aframe/aframe-event-set-component.min.js */
/* DOKUWIKI:include aframe/aframe-layout-component.min.js */
/* disabledWIKI:include stereoscopic-slideshow/gallery-controller.js */
/* disabledWIKI:include stereoscopic-slideshow/utils.js */
/* disabledWIKI:include stereoscopic-slideshow/controls.js */
/* disabledWIKI:include stereoscopic-slideshow/daydream-controls.js */
/* disabledWIKI:include stereoscopic-slideshow/gearvr-controls.js */
/* disabledWIKI:include stereoscopic-slideshow/magicleap-controls.js */
/* disabledWIKI:include stereoscopic-slideshow/oculus-go-controls.js */
/* disabledWIKI:include stereoscopic-slideshow/oculus-touch-controls.js */
/* disabledWIKI:include stereoscopic-slideshow/vive-controls.js */
/* disabledWIKI:include stereoscopic-slideshow/vive-focus-controls.js */
/* disabledWIKI:include stereoscopic-slideshow/windows-motion-controls.js */

jQuery(function () {
    /**
     * Add a quicklink to the media popup
     */
    (function() {
        const $opts = jQuery('#media__opts');
        if (!$opts.length) return;
        if (!window.opener) return; // we're not in the popup

        const sglbl = document.createElement('label');
        const sglnk = document.createElement('a');
        const sgbrk = document.createElement('br');

        sglnk.innerHTML = LANG.plugins.stereogallery.addgal;
        sglnk.style.cursor = 'pointer';
        sglnk.href = '#';

        sglnk.onclick = function () {
            const $h1 = jQuery('#media__ns');
            if (!$h1.length) return;
            const ns = $h1[0].textContent;
            opener.insertAtCarret('wiki__text', '{{stereogallery>' + ns + '}}');
            if (!dw_mediamanager.keepopen) window.close();
        };

        $opts[0].appendChild(sglbl);
        sglbl.appendChild(sglnk);
        $opts[0].appendChild(sgbrk);
    })();

    /**
     * Display a selected page and hide all others
     */
    (function() {
        // hide all pages except the first one in each stereo gallery
        jQuery('.plugin-stereogallery').each(function() {
            const $gallery = jQuery(this);
            $gallery.find('.stereogallery-page').hide().eq(0).show();
            $gallery.find('.stereogallery-page-selector a').eq(0).addClass('active');
        });
        // attach page selector
        jQuery('.stereogallery-page-selector a').click(function(e) {
            const $self = jQuery(this);
            $self.siblings().removeClass('active');
            $self.addClass('active');
            const $gallery = $self.closest('.plugin-stereogallery');
            $gallery.find('.stereogallery-page').hide();
            $gallery.find(e.target.hash).show();
            e.preventDefault();
        });
        // make page selector visible
        jQuery('.stereogallery-page-selector').show();
    })();

});
