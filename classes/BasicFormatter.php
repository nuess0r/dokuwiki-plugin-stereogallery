<?php

namespace dokuwiki\plugin\stereogallery\classes;

/**
 * Formats the stereogallery
 *
 * This is here because it was part of the orgininal DokuWiki Gallery plug-in.
 * It generates a basic list of images with links to detail pages.
 * No WebXR stereo view.
 */
class BasicFormatter
{
    protected Options $options;
    protected \Doku_Renderer $renderer;

    /**
     * Create a new StereoGallery formatter
     *
     * @param \Doku_Renderer $renderer
     * @param Options $options
     */
    public function __construct(\Doku_Renderer $renderer, Options $options)
    {
        $this->options = $options;
        $this->renderer = $renderer;
    }

    /**
     * Render the whole StereoGallery
     *
     * @param AbstractStereoGallery $stereogallery
     * @return void
     */
    public function render(AbstractStereoGallery $stereogallery)
    {
        $images = $stereogallery->getImages();
        foreach ($images as $image) {
            $this->renderImage($image);
        }
    }

    /**
     * Render a single thumbnail image in the stereogallery
     *
     * @param Image $image
     * @return void
     */
    protected function renderImage(StereoImage $image)
    {
        [$w, $h] = $this->getThumbnailSize($image);
        $link = $image->getDetaillink() ?: $image->getSrc();

        $imgdata = [
            'src' => $image->getSrc(),
            'title' => $image->getTitle(),
            'align' => '',
            'width' => $w,
            'height' => $h,
            'cache' => ''
        ];

        if ($image->isExternal()) {
            $this->renderer->externallink($link, $imgdata);
        } else {
            $this->renderer->internalmedia(":$link", $imgdata); // prefix with : to ensure absolute src
        }
    }


    // region Utilities

    /**
     * Calculate the thumbnail size
     */
    protected function getThumbnailSize(StereoImage $image)
    {
        [$thumbWidth, $thumbHeight] = $this->fitBoundingBox(
            $image->getWidth(),
            $image->getHeight(),
            $this->options->thumbnailWidth,
            $this->options->thumbnailHeight
        );
        return [$thumbWidth, $thumbHeight];
    }


    /**
     * Calculate the size of a thumbnail to fit into a bounding box
     *
     * @param int $imgWidth
     * @param int $imgHeight
     * @param int $bBoxWidth
     * @param int $bBoxHeight
     * @return int[]
     */
    protected function fitBoundingBox($imgWidth, $imgHeight, $bBoxWidth, $bBoxHeight)
    {
        /* use the visible area of one eye to calculate scale factor */
        $scale = min($bBoxWidth / ($imgWidth/2), $bBoxHeight / $imgHeight);

        $width = round($imgWidth * $scale);
        $height = round($imgHeight * $scale);

        return [$width, $height];
    }

    // endregion
}
