<?php

namespace PatternLab\Twig;

use PatternLab\Config;
use PatternLab\Listener;
use PatternLab\PatternEngine\Twig\TwigUtil;
use Symfony\Bridge\Twig\Extension\AssetExtension;
use Symfony\Component\Asset\PackageInterface;
use Symfony\Component\Asset\Packages;
use function League\Uri\build;
use function League\Uri\parse;

final class AssetListener extends Listener
{
    public function __construct()
    {
        $this->addListener('twigPatternLoader.customize', 'onTwigPatternLoaderCustomize');
    }

    public function onTwigPatternLoaderCustomize()
    {
        $package = new class implements PackageInterface
        {
            public function getVersion($path)
            {
                return Config::getOption('cacheBuster');
            }

            public function getUrl($path)
            {
                $parts = parse($path);
                $parts['query'] = $this->getVersion($path);
                $path = build($parts);

                return "../../{$path}";
            }
        };

        TwigUtil::getInstance()->addExtension(new AssetExtension(new Packages($package)));
    }
}
