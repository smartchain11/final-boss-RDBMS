<?php

declare(strict_types=1);



namespace CodeIgniter\Security;

use CodeIgniter\Cookie\Cookie;
use CodeIgniter\Exceptions\InvalidArgumentException;
use CodeIgniter\Exceptions\LogicException;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\Method;
use CodeIgniter\HTTP\Request;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\I18n\Time;
use CodeIgniter\Security\Exceptions\SecurityException;
use CodeIgniter\Session\Session;
use Config\Cookie as CookieConfig;
use Config\Security as SecurityConfig;
use ErrorException;
use SensitiveParameter;


class Security implements SecurityInterface
{
    public const CSRF_PROTECTION_COOKIE  = 'cookie';
    public const CSRF_PROTECTION_SESSION = 'session';
    protected const CSRF_HASH_BYTES      = 16;

    
    protected $csrfProtection = self::CSRF_PROTECTION_COOKIE;

    
    protected $tokenRandomize = false;

    
    protected $hash;

    
    protected $tokenName = 'csrf_token_name';

    
    protected $headerName = 'X-CSRF-TOKEN';

    
    protected $cookie;

    
    protected $cookieName = 'csrf_cookie_name';

    
    protected $expires = 7200;

    
    protected $regenerate = true;

    
    protected $redirect = false;

    
    protected $samesite = Cookie::SAMESITE_LAX;

    private readonly IncomingRequest $request;

    
    private ?string $rawCookieName = null;

    
    private ?Session $session = null;

    
    private ?string $hashInCookie = null;

    
    protected SecurityConfig $config;

    
    public function __construct(SecurityConfig $config)
    {
        $this->config = $config;

        $this->rawCookieName = $config->cookieName;

        if ($this->isCSRFCookie()) {
            $cookie = config(CookieConfig::class);

            $this->configureCookie($cookie);
        } else {
            $this->configureSession();
        }

        $this->request      = service('request');
        $this->hashInCookie = $this->request->getCookie($this->cookieName);

        $this->restoreHash();
        if ($this->hash === null) {
            $this->generateHash();
        }
    }

    private function isCSRFCookie(): bool
    {
        return $this->config->csrfProtection === self::CSRF_PROTECTION_COOKIE;
    }

    private function configureSession(): void
    {
        $this->session = service('session');
    }

    private function configureCookie(CookieConfig $cookie): void
    {
        $cookiePrefix     = $cookie->prefix;
        $this->cookieName = $cookiePrefix . $this->rawCookieName;
        Cookie::setDefaults($cookie);
    }

    
    public function verify(RequestInterface $request)
    {
        $method           = $request->getMethod();
        $methodsToProtect = [Method::POST, Method::PUT, Method::DELETE, Method::PATCH];
        if (! in_array($method, $methodsToProtect, true)) {
            return $this;
        }

        $postedToken = $this->getPostedToken($request);

        try {
            $token = ($postedToken !== null && $this->config->tokenRandomize)
                ? $this->derandomize($postedToken) : $postedToken;
        } catch (InvalidArgumentException) {
            $token = null;
        }

        if (! isset($token, $this->hash) || ! hash_equals($this->hash, $token)) {
            throw SecurityException::forDisallowedAction();
        }

        $this->removeTokenInRequest($request);

        if ($this->config->regenerate) {
            $this->generateHash();
        }

        log_message('info', 'CSRF token verified.');

        return $this;
    }

    
    private function removeTokenInRequest(RequestInterface $request): void
    {
        assert($request instanceof Request);

        $superglobals = service('superglobals');
        if ($superglobals->post($this->config->tokenName) !== null) {
            $superglobals->unsetPost($this->config->tokenName);
            $request->setGlobal('post', $superglobals->getPostArray());
        } else {
            $body = $request->getBody() ?? '';
            $json = json_decode($body);
            if ($json !== null && json_last_error() === JSON_ERROR_NONE) {
                unset($json->{$this->config->tokenName});
                $request->setBody(json_encode($json));
            } else {
                parse_str($body, $parsed);
                unset($parsed[$this->config->tokenName]);
                $request->setBody(http_build_query($parsed));
            }
        }
    }

    private function getPostedToken(RequestInterface $request): ?string
    {
        assert($request instanceof IncomingRequest);


        if ($tokenValue = $request->getPost($this->config->tokenName)) {
            return is_string($tokenValue) ? $tokenValue : null;
        }

        if ($request->hasHeader($this->config->headerName)) {
            $tokenValue = $request->header($this->config->headerName)->getValue();

            return (is_string($tokenValue) && $tokenValue !== '') ? $tokenValue : null;
        }

        $body = (string) $request->getBody();

        if ($body !== '') {
            $json = json_decode($body);
            if ($json !== null && json_last_error() === JSON_ERROR_NONE) {
                $tokenValue = $json->{$this->config->tokenName} ?? null;

                return is_string($tokenValue) ? $tokenValue : null;
            }

            parse_str($body, $parsed);
            $tokenValue = $parsed[$this->config->tokenName] ?? null;

            return is_string($tokenValue) ? $tokenValue : null;
        }

        return null;
    }

    
    public function getHash(): ?string
    {
        return $this->config->tokenRandomize ? $this->randomize($this->hash) : $this->hash;
    }

    
    protected function randomize(string $hash): string
    {
        $keyBinary  = random_bytes(static::CSRF_HASH_BYTES);
        $hashBinary = hex2bin($hash);

        if ($hashBinary === false) {
            throw new LogicException('$hash is invalid: ' . $hash);
        }

        return bin2hex(($hashBinary ^ $keyBinary) . $keyBinary);
    }

    
    protected function derandomize(#[SensitiveParameter] string $token): string
    {
        $key   = substr($token, -static::CSRF_HASH_BYTES * 2);
        $value = substr($token, 0, static::CSRF_HASH_BYTES * 2);

        try {
            return bin2hex((string) hex2bin($value) ^ (string) hex2bin($key));
        } catch (ErrorException $e) {
            throw new InvalidArgumentException($e->getMessage(), $e->getCode(), $e);
        }
    }

    
    public function getTokenName(): string
    {
        return $this->config->tokenName;
    }

    
    public function getHeaderName(): string
    {
        return $this->config->headerName;
    }

    
    public function getCookieName(): string
    {
        return $this->config->cookieName;
    }

    
    public function shouldRedirect(): bool
    {
        return $this->config->redirect;
    }

    
    public function sanitizeFilename(string $str, bool $relativePath = false): string
    {
        helper('security');

        return sanitize_filename($str, $relativePath);
    }

    
    private function restoreHash(): void
    {
        if ($this->isCSRFCookie()) {
            if ($this->isHashInCookie()) {
                $this->hash = $this->hashInCookie;
            }
        } elseif ($this->session->has($this->config->tokenName)) {
            $this->hash = $this->session->get($this->config->tokenName);
        }
    }

    
    public function generateHash(): string
    {
        $this->hash = bin2hex(random_bytes(static::CSRF_HASH_BYTES));

        if ($this->isCSRFCookie()) {
            $this->saveHashInCookie();
        } else {
            $this->saveHashInSession();
        }

        return $this->hash;
    }

    private function isHashInCookie(): bool
    {
        if ($this->hashInCookie === null) {
            return false;
        }

        $length  = static::CSRF_HASH_BYTES * 2;
        $pattern = '#^[0-9a-f]{' . $length . '}$#iS';

        return preg_match($pattern, $this->hashInCookie) === 1;
    }

    private function saveHashInCookie(): void
    {
        $this->cookie = new Cookie(
            $this->rawCookieName,
            $this->hash,
            [
                'expires' => $this->config->expires === 0 ? 0 : Time::now()->getTimestamp() + $this->config->expires,
            ],
        );

        $response = service('response');
        $response->setCookie($this->cookie);
    }

    private function saveHashInSession(): void
    {
        $this->session->set($this->config->tokenName, $this->hash);
    }
}
