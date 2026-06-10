<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Email extends BaseConfig
{
    public string $fromEmail  = 'jmoreno58@adssu.edu.ph';
    public string $fromName   = 'Necry OER Portal';
    public string $recipients = '';

    public string $userAgent = 'NecryOER-Mailer';

    public string $protocol = 'smtp';

    public string $mailPath = '/usr/sbin/sendmail';

    public string $SMTPHost = 'smtp.gmail.com';

    public string $SMTPAuthMethod = 'login';

    public string $SMTPUser = 'jmoreno58@adssu.edu.ph';

    public string $SMTPPass = 'fqjlxbzbdkvtsodj';

    public int $SMTPPort = 587;

    public int $SMTPTimeout = 10;

    public bool $SMTPKeepAlive = false;

    public string $SMTPCrypto = 'tls';

    public bool $wordWrap = true;

    public int $wrapChars = 76;

    public string $mailType = 'html';

    public string $charset = 'UTF-8';

    public bool $validate = false;

    public int $priority = 3;

    public string $CRLF = "\r\n";

    public string $newline = "\r\n";

    public bool $BCCBatchMode = false;

    public int $BCCBatchSize = 200;

    public bool $DSN = false;
}
