jQuery(document).on('PROSEMIRROR_API_INITIALIZED', function () {

    /**
     * Add our node to the document schema of the Prosemirror plugin
     *
     * @param {OrderedMap} nodes the nodes already in the schema
     * @param {OrderedMap} marks the marks already in the schema
     *
     * @returns {{nodes: OrderedMap, marks: OrderedMap}} the updated nodes and marks
     */
    function addStereoGallerySchema(nodes, marks) {
        nodes = nodes.addToEnd('dwplugin_stereogallery', {
            content: '', // there is no content here -- it is all attributes
            marks: '',
            attrs: jQuery.extend(
                {
                    renderedHTML: {default: null},
                },
                JSINFO.plugins.stereogallery.defaults
            ),
            group: 'protected_block', // may go into a block quote or list, but not into a table
        });

        return {nodes: nodes, marks: marks};
    }

    window.Prosemirror.pluginSchemas.push(addStereoGallerySchema);

    /**
     * Get the fields for the key value form with values
     *
     * @param {object} attrs the values to use
     * @return {Object[]} array with parameters
     */
    function getStereoGalleryFormFields(attrs) {
        return [
            {
                name: 'namespace',
                label: LANG.plugins.stereogallery.label_namespace,
                type: 'text',
                value: attrs['namespace'],
            },
            {
                name: 'thumbnailsize',
                label: LANG.plugins.stereogallery.label_thumbnailsize,
                type: 'text',
                pattern: '\\d+x\\d+',
                title: LANG.plugins.stereogallery.pattern_hint_thumbnailsize,
                value: attrs['thumbnailsize'],
            },
            {
                name: 'imagesize',
                label: LANG.plugins.stereogallery.label_imagesize,
                type: 'text',
                pattern: '\\d+X\\d+',
                title: LANG.plugins.stereogallery.pattern_hint_imagesize,
                value: attrs['imagesize'],
            },
            {
                name: 'cache',
                label: LANG.plugins.stereogallery.label_cache,
                type: 'checkbox',
                value: '1',
                checked: attrs['cache'],
            },
            {
                name: 'filter',
                label: LANG.plugins.stereogallery.label_filter,
                type: 'text',
                value: attrs['filter'],
            },
            {
                name: 'showname',
                label: LANG.plugins.stereogallery.label_showname,
                type: 'checkbox',
                value: '1',
                checked: attrs['showname'],
            },
            {
                name: 'showtitle',
                label: LANG.plugins.stereogallery.label_showtitle,
                type: 'checkbox',
                value: '1',
                checked: attrs['showtitle'],
            },
            {
                name: 'crop',
                label: LANG.plugins.stereogallery.label_crop,
                type: 'checkbox',
                value: '1',
                checked: attrs['crop'],
            },
            {
                name: 'direct',
                label: LANG.plugins.stereogallery.label_direct,
                type: 'checkbox',
                value: '1',
                checked: attrs['direct'],
            },
            {
                name: 'reverse',
                label: LANG.plugins.stereogallery.label_reverse,
                type: 'checkbox',
                value: '1',
                checked: attrs['reverse'],
            },
            {
                name: 'recursive',
                label: LANG.plugins.stereogallery.label_recursive,
                type: 'checkbox',
                value: '1',
                checked: attrs['recursive'],
            },
            {
                name: 'align',
                label: LANG.plugins.stereogallery.label_align_left,
                type: 'radio',
                value: 'left',
                checked: attrs['align'] === 'left',
            },
            {
                name: 'align',
                label: LANG.plugins.stereogallery.label_align_center,
                type: 'radio',
                value: 'center',
                checked: attrs['align'] === 'center',
            },
            {
                name: 'align',
                label: LANG.plugins.stereogallery.label_align_right,
                type: 'radio',
                value: 'right',
                checked: attrs['align'] === 'right',
            },
            {
                name: 'cols',
                label: LANG.plugins.stereogallery.label_cols,
                type: 'number',
                value: attrs['cols'],
                min: 0,
            },
            {
                name: 'limit',
                label: LANG.plugins.stereogallery.label_limit,
                type: 'number',
                value: attrs['limit'],
                min: 0,
            },
            {
                name: 'offset',
                label: LANG.plugins.stereogallery.label_offset,
                type: 'number',
                value: attrs['offset'],
                min: 0,
            },
            {
                name: 'paginate',
                label: LANG.plugins.stereogallery.label_paginate,
                type: 'number',
                value: attrs['paginate'],
                min: 0,
            },
            {
                name: 'sort',
                label: LANG.plugins.stereogallery.label_sort_file,
                type: 'radio',
                value: 'filesort',
                checked: attrs['sort'] === 'filesort',
            },
            {
                name: 'sort',
                label: LANG.plugins.stereogallery.label_sort_random,
                type: 'radio',
                value: 'random',
                checked: attrs['sort'] === 'random',
            },
            {
                name: 'sort',
                label: LANG.plugins.stereogallery.label_sort_mod,
                type: 'radio',
                value: 'modsort',
                checked: attrs['sort'] === 'modsort',
            },
            {
                name: 'sort',
                label: LANG.plugins.stereogallery.label_sort_exif_date,
                type: 'radio',
                value: 'datesort',
                checked: attrs['sort'] === 'datesort',
            },
            {
                name: 'sort',
                label: LANG.plugins.stereogallery.label_sort_exif_title,
                type: 'radio',
                value: 'titlesort',
                checked: attrs['sort'] === 'titlesort',
            },
        ];
    }


    /**
     * Handle our submitted form
     *
     * @param {Event} event the submit event
     *
     * @return {void}
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        var newAttrs = jQuery(event.target).serializeArray().reduce(function (acc, cur) {
            acc[cur['name']] = cur['value'];
            return acc;
        }, {});
        var nodeStartPos = this.getPos();

        // we must have the unchecked checkboxes with default = true
        // explicitly listed as false, they cannot just be missing
        // similar might be (multi-)selects that have options selected by default
        newAttrs = Object.entries(this.node.type.attrs).reduce(
            function (acc, cur) {
                if (acc[cur[0]]) {
                    return acc;
                }
                if (cur[1].default && cur[1].default === true) {
                    acc[cur[0]] = false;
                }
                return acc;
            },
            newAttrs
        );

        this.form.hide();
        this.outerView.dispatch(
            this.outerView.state.tr
                .setNodeMarkup(
                    nodeStartPos,
                    null,
                    newAttrs,
                    this.node.marks
                )
        );
    }

    /**
     * Send this node's attributes to the server to get the rendered html back
     *
     * @param {object} attrs
     * @param {StereoGalleryNodeView} nodeview
     */
    function retrieveRenderedHTML(attrs, nodeview) {
        const ajaxEndpoint = DOKU_BASE + 'lib/exe/ajax.php';
        jQuery.post(ajaxEndpoint, {
            'call': 'plugin_stereogallery_prosemirror',
            'attrs': JSON.stringify(attrs),
        }).done(function (data) {
            var newAttrs = jQuery.extend({}, attrs);
            newAttrs.renderedHTML = data;
            nodeview.outerView.dispatch(
                nodeview.outerView.state.tr
                    .setNodeMarkup(
                        nodeview.getPos(),
                        null,
                        newAttrs,
                        nodeview.node.marks
                    )
            );
        });
    }

    /**
     * Callback returning our NodeView
     *
     * See https://prosemirror.net/docs/ref/#view.NodeView
     *
     * @param {Node}       node
     * @param {EditorView} outerview
     * @param {function}   getPos
     * @return {StereoGalleryNodeView}
     */
    function dwplugin_stereogallery(node, outerview, getPos) {

        // Inheritance in an IE compatible way without "class" keyword
        function StereoGalleryNodeView(node, outerview, getPos) {
            this.form = new window.Prosemirror.classes.KeyValueForm(
                LANG.plugins.stereogallery.title_dialog,
                getStereoGalleryFormFields(node.attrs)
            );
            AbstractNodeView.call(this, node, outerview, getPos);
        }

        StereoGalleryNodeView.prototype = Object.create(AbstractNodeView.prototype);
        StereoGalleryNodeView.prototype.constructor = StereoGalleryNodeView;

        /**
         * This renders the node into the editor
         *
         * This method is called from the AbstractNodeView constructor and from our update method below
         *
         * @param attrs
         */
        StereoGalleryNodeView.prototype.renderNode = function (attrs) {
            var thisView = this;
            if (!this.dom) {
                this.dom = document.createElement('div');
                var $settingsButton = jQuery('<button>', {type: 'button', class: 'settings'}).text('settings');
                $settingsButton.on('click', function () {
                    thisView.form.show();
                });
                jQuery(this.dom)
                    .text('StereoGalleryPlugin')
                    .append($settingsButton)
                ;
                this.form.on('submit', handleFormSubmit.bind(this));
            }
            if (!attrs.renderedHTML) {
                retrieveRenderedHTML(attrs, this);
                jQuery(this.dom).addClass('dwplugin dwplugin_stereogallery');
            } else {
                var $renderedWrapper = jQuery(attrs.renderedHTML);
                this.dom.innerHTML = $renderedWrapper.html();
                this.dom.classList = $renderedWrapper.attr('class') + ' dwplugin_stereogallery nodeHasForm';
                jQuery(this.dom).children().css('pointer-events', 'none');
                jQuery(this.dom).on('click', function () {
                    thisView.form.show();
                });
            }
        };

        /**
         * This method is called by the prosemirror framework, if it exists
         *
         * see https://prosemirror.net/docs/ref/#view.NodeView.update
         *
         * @param {Node} node
         * @return {boolean}
         */
        StereoGalleryNodeView.prototype.update = function (node) {
            this.node = node;
            this.renderNode(node.attrs);

            return true;
        };

        StereoGalleryNodeView.prototype.selectNode = function () {
            this.dom.classList.add('ProseMirror-selectednode');
        };

        StereoGalleryNodeView.prototype.deselectNode = function () {
            this.dom.classList.remove('ProseMirror-selectednode');
            this.form.hide();
        };

        return new StereoGalleryNodeView(node, outerview, getPos);
    }

    window.Prosemirror.pluginNodeViews.dwplugin_stereogallery = dwplugin_stereogallery;

    /**
     * Create MenuItemDispatcher that produces an MenuItem if available in a schema
     *
     * @constructor
     */
    function StereoGalleryMenuItemDispatcher() {
        this.prototype = Object.create(window.Prosemirror.classes.AbstractMenuItemDispatcher.prototype);
        this.prototype.constructor = this;

        this.isAvailable = function (schema) {
            return Boolean(schema.nodes.dwplugin_stereogallery);
        };
        this.getMenuItem = function (schema) {
            return new window.Prosemirror.classes.MenuItem({
                command: function (state, dispatch) {
                    var isAllowed = window.Prosemirror.commands.setBlockTypeNoAttrCheck(schema.nodes.dwplugin_stereogallery)(state);
                    if (!isAllowed) {
                        return false;
                    }
                    if (dispatch) {
                        var defaultAttributes = Object.entries(schema.nodes.dwplugin_stereogallery.attrs)
                            .reduce(
                                function (acc, attr) {
                                    acc[attr[0]] = attr[1].default;
                                    return acc;
                                },
                                {}
                            )
                        ;
                        var form = new window.Prosemirror.classes.KeyValueForm(
                            LANG.plugins.stereogallery.title_dialog,
                            getStereoGalleryFormFields(defaultAttributes)
                        );
                        form.show();

                        // ToDo: offer ready-made command
                        form.on('submit', function (event) {
                            event.preventDefault();
                            event.stopPropagation();
                            var newAttrs = jQuery(this).serializeArray().reduce(function (acc, cur) {
                                acc[cur['name']] = cur['value'];
                                return acc;
                            }, {});
                            form.destroy();
                            dispatch(state.tr.replaceSelectionWith(schema.nodes.dwplugin_stereogallery.createChecked(newAttrs)));
                        });
                    }
                    return true;
                },
                label: LANG.plugins.stereogallery.label_toolbar_button,
                icon: (function () {
                    var puzzleSVG = '<svg viewBox="0 0 24 24"><path d="M22,16V4A2,2 0 0,0 20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16M11,12L13.03,14.71L16,11L20,16H8M2,6V20A2,2 0 0,0 4,22H18V20H4V6" /></svg>';
                    return jQuery('<span>').html(puzzleSVG).get(0);
                })(),
            });
        };
    }

    window.Prosemirror.pluginMenuItemDispatchers.push(new StereoGalleryMenuItemDispatcher());
});
