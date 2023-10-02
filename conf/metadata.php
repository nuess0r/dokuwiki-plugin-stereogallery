<?php

/**
 * Options for the stereogallery plugin
 *
 * @author Dmitry Baikov <dsbaikov@gmail.com>
 * @author Christoph Zimmermann <nussgipfel@brain4free.org>
 */

use dokuwiki\plugin\stereogallery\classes\Options;

$meta['thumbnail_width'] = array('numeric');
$meta['thumbnail_height'] = array('numeric');
$meta['image_width'] = array('numeric');
$meta['image_height'] = array('numeric');
$meta['cols'] = array('numeric');

$meta['sort'] = array(
    'multichoice',
    '_choices' => array(
        Options::SORT_FILE,
        Options::SORT_CTIME,
        Options::SORT_MTIME,
        Options::SORT_TITLE,
        Options::SORT_RANDOM,
    )
);

$meta['options'] = array('multicheckbox', '_choices' => array(
    'cache',
    'crop',
    'direct',
    'recursive',
    'reverse',
    'showcaption',
    'showname',
    'showtitle',
));
