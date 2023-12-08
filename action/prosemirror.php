<?php

use dokuwiki\Extension\ActionPlugin;
use dokuwiki\Extension\EventHandler;
use dokuwiki\Extension\Event;
use dokuwiki\plugin\stereogallery\StereoGalleryNode;
use dokuwiki\plugin\prosemirror\parser\RootNode;
use dokuwiki\plugin\prosemirror\schema\Node;

class action_plugin_stereogallery_prosemirror extends ActionPlugin
{
    /**
     * Registers a callback function for a given event
     *
     * @param EventHandler $controller DokuWiki's event controller object
     *
     * @return void
     */
    public function register(EventHandler $controller)
    {
        // check if prosemirror is installed
        if (!class_exists('\dokuwiki\plugin\prosemirror\schema\Node')) return;

        $controller->register_hook('DOKUWIKI_STARTED', 'BEFORE', $this, 'writeDefaultsToJSINFO');
        $controller->register_hook('PROSEMIRROR_RENDER_PLUGIN', 'BEFORE', $this, 'renderFromInstructions');
        $controller->register_hook('PROSEMIRROR_PARSE_UNKNOWN', 'BEFORE', $this, 'parseToSyntax');
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'renderAttributesToHTML');
    }

    /**
     * Render our syntax instructions for prosemirror
     *
     * Triggered by event: DOKUWIKI_STARTED
     *
     * @param Event $event event object
     * @param mixed $param [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     *
     * @return void
     */
    public function writeDefaultsToJSINFO(Event $event, $param)
    {
        global $JSINFO;

        /** @var syntax_plugin_stereogallery $syntax */
        $syntax = plugin_load('syntax', 'stereogallery');
        $defaults = $syntax->getDataFromParams($syntax->getConf('options'));
        $attributes = $this->cleanAttributes($defaults);

        if (!isset($JSINFO['plugins'])) {
            $JSINFO['plugins'] = [];
        }
        $JSINFO['plugins']['stereogallery'] = [
            'defaults' => array_map(function ($default) {
                return ['default' => $default,];
            }, $attributes),
        ];
        $JSINFO['plugins']['stereogallery']['defaults']['namespace'] = ['default' => ''];
    }


    /**
     * Render our syntax instructions for prosemirror
     *
     * Triggered by event: PROSEMIRROR_RENDER_PLUGIN
     *
     * @param Event $event event object
     * @param mixed $param [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     *
     * @return void
     */
    public function renderFromInstructions(Event $event, $param)
    {
        if ($event->data['name'] !== 'stereogallery') {
            return;
        }
        $event->preventDefault();
        $event->stopPropagation();

        $node = new Node('dwplugin_stereogallery');
        // FIXME we may have to parse the namespace from the original syntax ?
        $data = $event->data['data'];
        $ns = $data['ns'];
        $data = $this->cleanAttributes($data);

        if (cleanID($ns) === $ns) {
            $ns = ':' . $ns;
        }
        $node->attr('namespace', $ns);
        foreach ($data as $name => $value) {
            $node->attr($name, $value);
        }
        $event->data['renderer']->nodestack->add($node);
    }

    /**
     * Slightly rewrite the attributes to the format expected by our schema
     *
     * @param $data
     *
     * @return mixed
     */
    public function cleanAttributes($data)
    {
        $data['thumbnailsize'] = $data['tw'] . 'x' . $data['th'];
        $data['imagesize'] = $data['iw'] . 'X' . $data['ih'];
        if ($data['random']) {
            $data['sort'] = 'random';
        } else {
            $data['sort'] .= 'sort';
        }

        if ($data['align'] === 1) {
            $data['align'] = 'right';
        } elseif ($data['align'] === 2) {
            $data['align'] = 'left';
        } else {
            $data['align'] = 'center';
        }

        unset($data['tw'], $data['th'], $data['iw'], $data['ih'], $data['random']);
        unset($data['ns'], $data['galid']);

        return $data;
    }

    /**
     * Render our syntax instructions for prosemirror
     *
     * Triggered by event: PROSEMIRROR_PARSE_UNKNOWN
     *
     * @param Event $event event object
     * @param mixed $param [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     *
     * @return void
     */
    public function parseToSyntax(Event $event, $param)
    {
        if ($event->data['node']['type'] !== 'dwplugin_stereogallery') {
            return;
        }
        $event->preventDefault();
        $event->stopPropagation();

        $event->data['newNode'] = new StereoGalleryNode($event->data['node'], $event->data['parent']);
    }

    /**
     * Render the nodes attributes to html so it can be displayed in the editor
     *
     * Triggered by event: AJAX_CALL_UNKNOQN
     *
     * @param Event $event event object
     * @param mixed $param [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     *
     * @return void
     */
    public function renderAttributesToHTML(Event $event, $param)
    {
        if ($event->data !== 'plugin_stereogallery_prosemirror') {
            return;
        }
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;
        $node = new StereoGalleryNode(['attrs' => json_decode($INPUT->str('attrs'), true)], new RootNode([]));
        $syntax = $node->toSyntax();
        $html = p_render('xhtml', p_get_instructions($syntax), $info);
        echo $html;
    }
}
