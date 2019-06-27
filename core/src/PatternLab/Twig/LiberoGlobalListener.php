<?php

namespace PatternLab\Twig;

use PatternLab\Config;
use PatternLab\Listener;
use PatternLab\PatternEngine\Twig\TwigUtil;
use function file_get_contents;
use function json_try_decode;

final class LiberoGlobalListener extends Listener
{
    public function __construct()
    {
        $this->addListener('twigPatternLoader.customize', 'onTwigPatternLoaderCustomize');
    }

    public function onTwigPatternLoaderCustomize()
    {
        $settings = json_try_decode(file_get_contents(Config::getOption('metaDir') . 'globals.json'), true);

        TwigUtil::getInstance()->addGlobal('libero', $settings);
    }
}
