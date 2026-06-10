<?php

function parseDeviceName(string $userAgent): string
{
    if (empty($userAgent)) {
        return 'Unknown Device';
    }

    // Apple devices
    if (preg_match('/iPhone\s*(?:Simulator)?\s*[\d,]*\s*.*?CPU\s*(?:iPhone\s*)?OS\s*([\d_]+)/i', $userAgent)) {
        preg_match('/iPhone[\d,]*/i', $userAgent, $m);
        $model = $m[0] ?? 'iPhone';
        preg_match('/CPU (?:iPhone )?OS ([\d_]+)/i', $userAgent, $os);
        $ver = str_replace('_', '.', $os[1] ?? '');
        return "Apple {$model} (iOS {$ver})";
    }
    if (preg_match('/iPad/i', $userAgent)) {
        return 'Apple iPad';
    }

    // Samsung mobile models (SM- series)
    if (preg_match('/SM-[A-Za-z0-9]+/', $userAgent, $m)) {
        preg_match('/Android ([\d.]+)/', $userAgent, $os);
        $ver = $os[1] ?? '';
        return "Samsung {$m[0]}" . ($ver ? " (Android {$ver})" : '');
    }

    // Other Android devices
    if (preg_match('/Android ([\d.]+)/', $userAgent, $os)) {
        if (preg_match('/; ([\w\s]+) Build/', $userAgent, $m)) {
            return trim($m[1]) . " (Android {$os[1]})";
        }
        return "Android Device (Android {$os[1]})";
    }

    // Windows
    if (preg_match('/Windows NT ([\d.]+)/', $userAgent, $os)) {
        $versionMap = [
            '10.0' => '10/11',
            '6.3'  => '8.1',
            '6.2'  => '8',
            '6.1'  => '7',
            '6.0'  => 'Vista',
            '5.2'  => 'XP x64',
            '5.1'  => 'XP',
        ];
        $winVer = $versionMap[$os[1]] ?? $os[1];
        $browser = 'Unknown Browser';
        if (preg_match('/(Chrome|Firefox|Safari|Edge|Opera)\/(\S+)/', $userAgent, $b)) {
            $browser = "{$b[1]} {$b[2]}";
        } elseif (preg_match('/ Edg\/(\S+)/', $userAgent, $b)) {
            $browser = "Edge {$b[1]}";
        }
        return "Windows {$winVer} — {$browser}";
    }

    // macOS
    if (preg_match('/Mac OS X ([\d_]+)/', $userAgent, $os)) {
        $ver = str_replace('_', '.', $os[1]);
        return "macOS {$ver}";
    }

    // Linux
    if (stripos($userAgent, 'Linux') !== false) {
        return 'Linux Device';
    }

    return substr($userAgent, 0, 100);
}

function generateOtpCode(): string
{
    $digits = ['0','1','2','3','4','5','6','7','8','9'];
    $code = '';
    for ($i = 0; $i < 6; $i++) {
        $code .= $digits[array_rand($digits)];
    }
    return $code;
}

function isOtpExpired(string $expiresAt): bool
{
    return strtotime($expiresAt) < time();
}
