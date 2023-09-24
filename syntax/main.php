<?php

use dokuwiki\Extension\SyntaxPlugin;
use dokuwiki\File\MediaResolver;
use dokuwiki\plugin\stereogallery\classes\BasicFormatter;
use dokuwiki\plugin\stereogallery\classes\FeedStereoGallery;
use dokuwiki\plugin\stereogallery\classes\ListStereoGallery;
use dokuwiki\plugin\stereogallery\classes\NamespaceStereoGallery;
use dokuwiki\plugin\stereogallery\classes\Options;
use dokuwiki\plugin\stereogallery\classes\XHTMLFormatter;

/**
 * Embed an image stereogallery
 *
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     Andreas Gohr <andi@splitbrain.org>
 * @author     Joe Lapp <joe.lapp@pobox.com>
 * @author     Dave Doyle <davedoyle.canadalawbook.ca>
 * @author Christoph Zimmermann <nussgipfel@brain4free.org>
 */
class syntax_plugin_stereogallery_main extends SyntaxPlugin
{
    /** @inheritdoc */
    public function getType()
    {
        return 'substition';
    }

    /** @inheritdoc */
    public function getPType()
    {
        return 'block';
    }

    /** @inheritdoc */
    public function getSort()
    {
        return 301;
    }

    /** @inheritdoc */
    public function connectTo($mode)
    {
        $this->Lexer->addSpecialPattern('\{\{stereogallery>[^}]*\}\}', $mode, 'plugin_stereogallery_main');
    }

    /** @inheritdoc */
    public function handle($match, $state, $pos, Doku_Handler $handler)
    {
        global $ID;
        $match = substr($match, 16, -2); //strip markup "{{stereogallery>" from start and "}}" from end

        $options = new Options();

        // unique stereogallery ID
        $options->stereogalleryID = substr(md5($match), 0, 4);

        // alignment
        if (substr($match, 0, 1) == ' ') $options->align += Options::ALIGN_RIGHT;
        if (substr($match, -1, 1) == ' ') $options->align += Options::ALIGN_LEFT;

        // extract src and params
        [$src, $params] = sexplode('?', $match, 2);
        $src = trim($src);

        // resolve relative namespace
        if (!preg_match('/^https?:\/\//i', $src)) {
            $mediaResolver = new MediaResolver($ID);
            $src = $mediaResolver->resolveId($src);
        }

        // parse parameters
        $options->parseParameters($params);

        return [
            $src, $options
        ];
    }

    /** @inheritdoc */
    public function render($mode, Doku_Renderer $R, $data)
    {
        [$src, $options] = $data;

        try {
            if (is_array($src)) {
                $stereogallery = new ListStereoGallery($src, $options);
            } elseif (preg_match('/^https?:\/\//i', $src)) {
                $stereogallery = new FeedStereoGallery($src, $options);
            } else {
                $stereogallery = new NamespaceStereoGallery($src, $options);
            }

            $R->info['cache'] = $options->cache;
            if ($mode == 'xhtml') {
                $formatter = new XHTMLFormatter($R, $options);
            } else {
                $formatter = new BasicFormatter($R, $options);
            }
            $formatter->render($stereogallery);
        } catch (Exception $e) {
            msg(hsc($e->getMessage()), -1);
            $R->cdata($this->getLang('fail'));
        }
        return true;
    }
}
