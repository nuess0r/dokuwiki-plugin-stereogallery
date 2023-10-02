/* TODO: remove lightbox */
/* DOKUWIKI:include_once simple-lightbox/simple-lightbox.js */
/* DOKUWIKI:include script/prosemirror.js */
/* DOKUWIKI:include script/tinykeys.umd.js */
/* DOKUWIKI:include aframe/aframe.min.js */
/* DOKUWIKI:include aframe/aframe-event-set-component.min.js */
/* DOKUWIKI:include aframe/aframe-layout-component.min.js */
/* DOKUWIKI:include stereoscopic-slideshow/gallery-controller.js */
/* DOKUWIKI:include stereoscopic-slideshow/utils.js */
/* DOKUWIKI:include stereoscopic-slideshow/controls.js */
/* DOKUWIKI:include stereoscopic-slideshow/daydream-controls.js */
/* DOKUWIKI:include stereoscopic-slideshow/gearvr-controls.js */
/* DOKUWIKI:include stereoscopic-slideshow/magicleap-controls.js */
/* DOKUWIKI:include stereoscopic-slideshow/oculus-go-controls.js */
/* DOKUWIKI:include stereoscopic-slideshow/oculus-touch-controls.js */
/* DOKUWIKI:include stereoscopic-slideshow/vive-controls.js */
/* DOKUWIKI:include stereoscopic-slideshow/vive-focus-controls.js */
/* DOKUWIKI:include stereoscopic-slideshow/windows-motion-controls.js */

jQuery(function () {
    /**
     * Add a quicklink to the media popup
     */
    (function() {
        const $opts = jQuery('#media__opts');
        if (!$opts.length) return;
        if (!window.opener) return; // we're not in the popup

        const glbl = document.createElement('label');
        const glnk = document.createElement('a');
        const gbrk = document.createElement('br');

        glnk.innerHTML = LANG.plugins.stereogallery.addgal;
        glnk.style.cursor = 'pointer';
        glnk.href = '#';

        glnk.onclick = function () {
            const $h1 = jQuery('#media__ns');
            if (!$h1.length) return;
            const ns = $h1[0].textContent;
            opener.insertAtCarret('wiki__text', '{{stereogallery>' + ns + '}}');
            if (!dw_mediamanager.keepopen) window.close();
        };

        $opts[0].appendChild(glbl);
        glbl.appendChild(glnk);
        $opts[0].appendChild(gbrk);
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

    /**
     * Initialize the lightbox
     */
    new SimpleLightbox("a.lightbox, a[rel^='lightbox']", {
        sourceAttr: 'data-url',
        captionSelector: 'self',
        captionType: 'data',
        captionsData: 'caption',
        captionPosition: 'outside',
        captionHTML: true, // we allow HTML and double escape in the formatter
        alertError: false,
        fileExt: false,
    });
});

/**
 * Assigns an object instance to a global namespace.
 * Safely assigns instance object to the namespace, preserving any existing children of the namespace to allow for
 * async loading and evaluation of runtime scripts.
 *
 * @param {String} name - name of global namespace.
 * Can be single-level (e.g. "Foo") or multi-level (e.g "Foo.Bar").
 * If multi-level, each parent namespace that doesn't exist will also be defined if it's not already.
 * @param {Object} instance - object to assign to the global namespace
 */
function namespace(name, instance){
    if(typeof name !== "string") throw '\'name\' must be a string defining a namespace';
    if(typeof instance !== "object") throw '\'instance\' must be an object to assign to the namespace';

    var parts = name.split('.');
    var l = parts.length;
    var v;
    var i;

    var o = window;
    var n = '';

    for(i = 0; i < l; i++){
        v = parts[i];
        n += (n ? '.' : '') + v;

        if(n === name){
        if(typeof o[v] !== 'undefined'){
            // Target namespace already exists: move contents to temporary object then re-instate
            var k;
            var t = {};
            for(k in o[v]){
            t[k] = o[v][k];
            }
            o[v] = instance;
            for(k in t){
            o[v][k] = t[k];
            }
        }else{
            o[v] = instance;
        }
        o[v]['_initialised'] = true;
        document.dispatchEvent(new CustomEvent(name + '.ready'));
        }else{
        if(typeof o[v] === 'undefined'){
            o[v] = {};
        }
        o = o[v];
        }
    }
}

function onNamespacesLoaded(namespaces, thisFunction){
    if(typeof namespaces === 'string') namespaces = [namespaces];

    var namespacesLoaded = 0;
    var namespaceLoaded = function(){
        namespacesLoaded++
        if(namespacesLoaded === namespaces.length) thisFunction();
    }

    for(var j=0; j<namespaces.length; j++){
        var i, v,
                namespace = namespaces[j],
                ready = false,
                parts = namespace.split('.'),
                l = parts.length,
                o = window,
                n = '';
        for(i = 0; i < l; i++){
        v = parts[i];
        n += (n ? '.' : '') + v;
        if(typeof o[v] !== "object"){
            break;
        }else if(n === namespace && typeof o[v] === "object" && o[v]._initialised){
            ready = true;
        }
        o = o[v];
        }

        if(ready){
        namespaceLoaded();
        }else{
        document.addEventListener(namespace + '.ready', namespaceLoaded, false);
        }
    }
}

