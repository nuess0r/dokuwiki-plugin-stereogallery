/* DOKUWIKI:include script/prosemirror.js */
/* DOKUWIKI:include script/tinykeys.umd.js */
/* DOKUWIKI:include aframe/aframe.min.js */
/* DOKUWIKI:include aframe/aframe-stereo-component.js */
/* DOKUWIKI:include aframe/aframe-event-set-component.min.js */
/* DOKUWIKI:include stereoscopic-slideshow/namespace.js */
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

/**
 * Initialize the stereoscopic-slideshow
 */

    /*********************
     * Internal properties
     *********************/
    const buttonHoverZoomScale = 0.5;

    const requiredNamespaces = [
        'Components.Utils',
        'Components.GalleryController',
        'Components.Controls'
    ];

    const supportedControllers = [
        "OculusTouch",
        "Daydream",
        "GearVr",
        "MagicLeap",
        "OculusGo",
        "Vive",
        "ViveFocus",
        "WindowsMotion"
    ];

    const controllerHelpText = {
        OculusTouch: {
            title: "Oculus Touch controls",
            text: "Thumbstick left/right to change slide" +
                "\nThumbstick up/down to change viewing distance" +
                "\nA/B/X/Y button to exit VR"
        },
        Daydream: {
            title: "Daydream controls",
            text: "Left/right trackpad to change slide"
        },
        GearVr: {
            title: "Gear VR controls",
            text: "Left/right trackpad to change slide"
        },
        MagicLeap: {
            title: "Magic Leap controls",
            text: "Touchpad left/right to change slide" +
                "\nTouchpad up/down to change viewing distance" +
                "\nMenu button to exit VR"
        },
        OculusGo: {
            title: "Oculus Go controls",
            text: "Touchpad left/right to change slide" +
                "\nTouchpad up/down to change viewing distance"
        },
        Vive: {
            title: "Vive controls",
            text: "Left/right trackpad to change slide" +
                "\nMenu/system button to exit VR"
        },
        ViveFocus: {
            title: "Vive Focus controls",
            text: "Trackpad left/right to change slide" +
                "\nTrackpad up/down to change viewing distance"
        },
        WindowsMotion: {
            title: "Windows Motion controls",
            text: "Trackpad/thumbstick left/right to change slide" +
                "\nTrackpad/thumbstick up/down to change viewing distance" +
                "\nMenu button to exit VR"
        }
    };

    let $currentImage, Utils, GalleryController, Controls, Controllers = {};

    let onDocumentReady = function () {
        let namespaces = requiredNamespaces;
        supportedControllers.forEach((controllerName) => {
            namespaces.push(controllerName + 'Controls');
        });

        onNamespacesLoaded([
            'Components.Utils',
            'Components.GalleryController',
            'Components.Controls'
        ], function () {
            Utils = Components.Utils;
            GalleryController = Components.GalleryController;
            Controls = Components.Controls;

            supportedControllers.forEach((controllerName) => {
                Controllers[controllerName] = Components[controllerName + 'Controls'];
            });

            onLoadedNamespaces();
        });
    };

    let onLoadedNamespaces = function () {
        document.addEventListener(Controls.webXrControllerEventName, onWebXrController);

        tinykeys(window, {
            "Space": () => { if (GalleryController.isInVR) showNextImage(); },
            "ArrowLeft": () => { if (GalleryController.isInVR) showPrevImage(); },
            "ArrowRight": () => { if (GalleryController.isInVR) showNextImage(); },
        });

        const $clickableButtons = jQuery('[data-clickable][data-button]');
        Utils.addEventListenerToEntityNodeList($clickableButtons, 'mouseenter', (evt) => {
            const entity = evt.target;
            let scale = entity.getAttribute('scale');
            scale.x += buttonHoverZoomScale;
            scale.y += buttonHoverZoomScale;
            scale.z += buttonHoverZoomScale;
            entity.setAttribute('scale', scale);
        });

        Utils.addEventListenerToEntityNodeList($clickableButtons, 'mouseleave', (evt) => {
            const entity = evt.target;
            let scale = entity.getAttribute('scale');
            scale.x -= buttonHoverZoomScale;
            scale.y -= buttonHoverZoomScale;
            scale.z -= buttonHoverZoomScale;
            entity.setAttribute('scale', scale);
        });

        Utils.addEventListenerToEntityNodeList(jQuery('#previous-button'), 'click', showPrevImage);
        Utils.addEventListenerToEntityNodeList(jQuery('#next-button'), 'click', showNextImage);
        Utils.addEventListenerToEntityNodeList(jQuery('#exit-button'), 'click', exitVR);
        Utils.addEventListenerToEntityNodeList(jQuery('#increase-distance-button'), 'click', GalleryController.moveUiFurtherAway);
        Utils.addEventListenerToEntityNodeList(jQuery('#decrease-distance-button'), 'click', GalleryController.moveUiCloser);

        jQuery('.stereogallery-page').on("click", '.stereogallery-image', onClickImg);
    };

    let onClickImg = function(event){
        $currentImage = jQuery(this);
        showImg($currentImage.children('figure'));
        event.preventDefault();
    }

    let showImg = function($img){
        const src = $img.attr('data-url'), description = $img.attr('description'), aspect = $img.attr('aspect');
        GalleryController.showImg(src, description, aspect);
    };


    let onWebXrController = function (event) {

        const detail = event.detail, controllerType = detail.controllerType, control = detail.control, hand = detail.hand, action = detail.action;


        // Control presses
        if (action === Controls.actions.down) {

            // Exit VR mode
            if ((controllerType === Controllers.OculusTouch.CONTROL_NAME && (
                control === Controllers.OculusTouch.controls.abutton
                || control === Controllers.OculusTouch.controls.bbutton
                || control === Controllers.OculusTouch.controls.xbutton
                || control === Controllers.OculusTouch.controls.ybutton)
            )
                || (controllerType === Controllers.MagicLeap.CONTROL_NAME &&
                    control === Controllers.OculusTouch.controls.menu
                )
                || (controllerType === Controllers.Vive.CONTROL_NAME &&
                    (control === Controllers.Vive.controls.menu || control === Controllers.Vive.controls.system)
                )
                || (controllerType === Controllers.WindowsMotion.CONTROL_NAME &&
                    control === Controllers.WindowsMotion.controls.menu
                )) {
                exitVR();
            }

            // Next/prev slide
            if ((controllerType === Controllers.Daydream.CONTROL_NAME && control === Controllers.Daydream.controls.trackpad)
                || (controllerType === Controllers.GearVr.CONTROL_NAME && control === Controllers.GearVr.controls.trackpad)
                || (controllerType === Controllers.Vive.CONTROL_NAME && control === Controllers.Vive.controls.trackpad)) {
                if (hand === Controls.hand.left) {
                    showPrevImage();
                } else if (hand === Controls.hand.right) {
                    showNextImage();
                }
            }
        }

        // Cursor direction controls
        if (action === Controls.actions.directionchanged &&
            (controllerType === Controllers.OculusTouch.CONTROL_NAME && control === Controllers.OculusTouch.controls.thumbstick)
            || (controllerType === Controllers.MagicLeap.CONTROL_NAME && control === Controllers.MagicLeap.controls.touchpad)
            || (controllerType === Controllers.OculusGo.CONTROL_NAME && control === Controllers.OculusGo.controls.touchpad)
            || (controllerType === Controllers.ViveFocus.CONTROL_NAME && control === Controllers.ViveFocus.controls.trackpad)
            || (controllerType === Controllers.WindowsMotion.CONTROL_NAME && (
                control === Controllers.WindowsMotion.controls.trackpad || control === Controllers.WindowsMotion.controls.thumbstick
            ))) {
            if (detail.direction.x === Controls.direction.left) {
                showPrevImage();
            } else if (detail.direction.x === Controls.direction.right) {
                showNextImage();
            } else if (detail.direction.y === Controls.direction.up) {
                GalleryController.moveUiFurtherAway();
            } else if (detail.direction.y === Controls.direction.down) {
                GalleryController.moveUiCloser();
            }
        }
    };

    let exitVR = function () {
        GalleryController.exitVR();
    };

    let showNextImage = function(){
        var $next = $currentImage.next();

       // If there wasn't a next one, go back to the first.
        if( $next.length == 0 ) {
            $next = $currentImage.prevAll().last();
        }
        $currentImage = $next;
        showImg($currentImage.children('figure'));
    };

    let showPrevImage = function(){
        var $prev = $currentImage.prev();

       // If there wasn't a previous one, go to the last.
        if( $prev.length == 0 ) {
            $prev = $currentImage.nextAll().last();
        }
        $currentImage = $prev;
        showImg($currentImage.children('figure'));
    };

    // Execute the onDocumentReady method when it's time for it
    jQuery(document).ready(onDocumentReady);
});
