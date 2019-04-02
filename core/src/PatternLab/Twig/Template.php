<?php

namespace PatternLab\Twig;

use Locale;
use Twig\Template as BaseTemplate;

abstract class Template extends BaseTemplate
{
    private static $isRendering = false;

    public function render(array $context)
    {
        $isRendering = self::$isRendering;

        if (!$isRendering) {
            Locale::setDefault($context['lang'] ?? $context['attributes']['lang'] ?? 'en');
            self::$isRendering = true;
        }

        $rendered = parent::render($context);

        if (!$isRendering) {
            self::$isRendering = false;
        }

        return $rendered;
    }
}
