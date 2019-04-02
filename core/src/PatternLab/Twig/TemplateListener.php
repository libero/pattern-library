<?php

namespace PatternLab\Twig;

use PatternLab\Listener;
use PatternLab\PatternEngine\Twig\TwigUtil;

final class TemplateListener extends Listener
{
    public function __construct()
    {
        $this->addListener('twigPatternLoader.customize', 'onTwigPatternLoaderCustomize');
    }

    public function onTwigPatternLoaderCustomize()
    {
        TwigUtil::getInstance()->setBaseTemplateClass(Template::class);
    }
}
