<?php

namespace dokuwiki\plugin\stereogallery\test;

use dokuwiki\plugin\stereogallery\classes\FeedStereoGallery;
use dokuwiki\plugin\stereogallery\classes\Options;
use DokuWikiTest;

/**
 * Media Feed tests for the stereogallery plugin
 *
 * @group plugin_stereogallery
 * @group plugins
 * @group internet
 */
class FeedStereoGalleryTest extends DokuWikiTest
{
    protected $pluginsEnabled = ['stereogallery'];

    public function testGetImages()
    {
        /* TODO: Add proper source for JPS images */
        $url = 'https://www.flickr.com/services/feeds/photoset.gne?nsid=22019303@N00&set=72177720310667219&lang=en-us&format=atom';
        $stereogallery = new FeedStereoGallery($url, new Options());
        $images = $stereogallery->getImages();
        $this->assertIsArray($images);
        $this->assertCount(3, $images);
    }
}
