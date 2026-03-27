<?php

declare(strict_types=1);



namespace CodeIgniter\Typography;

use Config\DocTypes;


class Typography
{
    
    public $blockElements = 'address|blockquote|div|dl|fieldset|form|h\d|hr|noscript|object|ol|p|pre|script|table|ul';

    
    public $skipElements = 'p|pre|ol|ul|dl|object|table|h\d';

    
    public $inlineElements = 'a|abbr|acronym|b|bdo|big|br|button|cite|code|del|dfn|em|i|img|ins|input|label|map|kbd|q|samp|select|small|span|strong|sub|sup|textarea|tt|var';

    
    public $innerBlockRequired = ['blockquote'];

    
    public $lastBlockElement = '';

    
    public $protectBracedQuotes = false;

    
    public function autoTypography(string $str, bool $reduceLinebreaks = false): string
    {
        if ($str === '') {
            return '';
        }

        if (str_contains($str, "\r")) {
            $str = str_replace(["\r\n", "\r"], "\n", $str);
        }

        if ($reduceLinebreaks === false) {
            $str = preg_replace("/\n\n+/", "\n\n", $str);
        }

        $htmlComments = [];
        if (str_contains($str, '<!--') && preg_match_all('#(<!\-\-.*?\-\->)#s', $str, $matches) >= 1) {
            for ($i = 0, $total = count($matches[0]); $i < $total; $i++) {
                $htmlComments[] = $matches[0][$i];
                $str            = str_replace($matches[0][$i], '{@HC' . $i . '}', $str);
            }
        }

        if (str_contains($str, '<pre')) {
            $str = preg_replace_callback('#<pre.*?>.*?</pre>#si', $this->protectCharacters(...), $str);
        }

        $str = preg_replace_callback('#<.+?>#si', $this->protectCharacters(...), $str);

        if ($this->protectBracedQuotes === false) {
            $str = preg_replace_callback('#\{.+?\}#si', $this->protectCharacters(...), $str);
        }

        $str = preg_replace('#<(
        $chunks = preg_split('/(<(?:[^<>]+(?:"[^"]*"|\'[^\']*\')?)+>)/', $str, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

        $str     = '';
        $process = true;

        for ($i = 0, $c = count($chunks) - 1; $i <= $c; $i++) {
            if (preg_match('#<(
    public function formatCharacters(string $str): string
    {
        static $table;

        if (! isset($table)) {
            $table = [
                '/\'"(\s|$)/'     => '&#8217;&#8221;$1',
                '/(^|\s|<p>)\'"/' => '$1&#8216;&#8220;',
                '/\'"(\W)/'       => '&#8217;&#8221;$1',
                '/(\W)\'"/'       => '$1&#8216;&#8220;',
                '/"\'(\s|$)/'     => '&#8221;&#8217;$1',
                '/(^|\s|<p>)"\'/' => '$1&#8220;&#8216;',
                '/"\'(\W)/'       => '&#8221;&#8217;$1',
                '/(\W)"\'/'       => '$1&#8220;&#8216;',
                '/\'(\s|$)/'     => '&#8217;$1',
                '/(^|\s|<p>)\'/' => '$1&#8216;',
                '/\'(\W)/'       => '&#8217;$1',
                '/(\W)\'/'       => '$1&#8216;',
                '/"(\s|$)/'     => '&#8221;$1',
                '/(^|\s|<p>)"/' => '$1&#8220;',
                '/"(\W)/'       => '&#8221;$1',
                '/(\W)"/'       => '$1&#8220;',
                '/(\w)\'(\w)/' => '$1&#8217;$2',
                '/\s?\-\-\s?/' => '&#8212;',
                '/(\w)\.{3}/'  => '$1&#8230;',
                '/(\W)  /' => '$1&nbsp; ',
                '/&(?!#?[a-zA-Z0-9]{2,};)/' => '&amp;',
            ];
        }

        return preg_replace(array_keys($table), $table, $str);
    }

    
    protected function formatNewLines(string $str): string
    {
        if ($str === '' || (! str_contains($str, "\n") && ! in_array($this->lastBlockElement, $this->innerBlockRequired, true))) {
            return $str;
        }

        $str = str_replace("\n\n", "</p>\n\n<p>", $str);

        $br  = '<br' . _solidus() . '>';
        $str = preg_replace("/([^\n])(\n)([^\n])/", '\\1' . $br . '\\2\\3', $str);

        if ($str !== "\n") {
            $str = '<p>' . rtrim($str) . '</p>';
        }

        return preg_replace('/<p><\/p>(.*)/', '\\1', $str, 1);
    }

    
    protected function protectCharacters(array $match): string
    {
        return str_replace(["'", '"', '--', '  '], ['{@SQ}', '{@DQ}', '{@DD}', '{@NBS}'], $match[0]);
    }

    
    public function nl2brExceptPre(string $str): string
    {
        $newstr   = '';
        $docTypes = new DocTypes();

        for ($ex = explode('pre>', $str), $ct = count($ex), $i = 0; $i < $ct; $i++) {
            $xhtml = ! ($docTypes->html5 ?? false);
            $newstr .= (($i % 2) === 0) ? nl2br($ex[$i], $xhtml) : $ex[$i];

            if ($ct - 1 !== $i) {
                $newstr .= 'pre>';
            }
        }

        return $newstr;
    }
}
