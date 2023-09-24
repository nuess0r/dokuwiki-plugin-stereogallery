<?php

namespace dokuwiki\plugin\stereogallery\test;

use dokuwiki\plugin\stereogallery\classes\NamespaceStereoGallery;
use dokuwiki\plugin\stereogallery\classes\Options;
use DokuWikiTest;

/**
 * Namespace StereoGallery tests for the stereogallery plugin
 *
 * @group plugin_stereogallery
 * @group plugins
 */
class NamespaceStereoGalleryTest extends DokuWikiTest
{
    protected $pluginsEnabled = ['stereogallery'];

    /**
     * Copy demo images to the media directory
     *
     * @inheritdoc
     */
    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();
        global $conf;
        \TestUtils::rcopy($conf['mediadir'], __DIR__ . '/data/media/stereogallery');
    }


    /**
     * Check that the images are returned correctly
     */
    public function testGetImages()
    {
        $stereogallery = new NamespaceStereoGallery('stereogallery', new Options());

        $images = $stereogallery->getImages();
        $this->assertIsArray($images);
        $this->assertCount(4, $images);
    }
}
