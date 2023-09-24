<?php

use dokuwiki\plugin\stereogallery\classes\Options;

/**
 * DokuWiki Plugin stereogallery (Syntax Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <andi@splitbrain.org>
 * @author  Christoph Zimmermann <nussgipfel@brain4free.org>
 */
class syntax_plugin_stereogallery_list extends syntax_plugin_stereogallery_main
{
    /** @inheritDoc */
    public function connectTo($mode)
    {
        $this->Lexer->addSpecialPattern('<stereogallery.*?>.+?</stereogallery>', $mode, 'plugin_stereogallery_list');
    }

    /** @inheritDoc */
    public function handle($match, $state, $pos, Doku_Handler $handler)
    {
        $match = substr($match, 14, -16); //strip markup "<stereogallery" from start and "</stereogallery>"" from end
        [$params, $list] = sexplode('>', $match, 2);

        $options = new Options();
        $options->parseParameters($params);

        $list = explode("\n", $list);
        $list = array_map('trim', $list);
        $list = array_filter($list);

        return [$list, $options];
    }
}
