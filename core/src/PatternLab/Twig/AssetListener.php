<?php

namespace PatternLab\Twig;

use PatternLab\Config;
use PatternLab\Listener;
use PatternLab\PatternEngine\Twig\TwigUtil;
use Symfony\Bridge\Twig\Extension\AssetExtension;
use Symfony\Component\Asset\Context\NullContext;
use Symfony\Component\Asset\Packages;
use Symfony\Component\Asset\PathPackage;
use Symfony\Component\Asset\VersionStrategy\StaticVersionStrategy;

final class AssetListener extends Listener
{
    public function __construct()
    {
        $this->addListener('twigPatternLoader.customize', 'onTwigPatternLoaderCustomize');
    }

    public function onTwigPatternLoaderCustomize()
    {
        $package = new PathPackage(
            '/',
            new StaticVersionStrategy(Config::getOption('cacheBuster')),
            new class extends NullContext
            {
                public function getBasePath()
                {
                    return '../..';
                }
            }
        );

        TwigUtil::getInstance()->addExtension(new AssetExtension(new Packages($package)));
    }
}
