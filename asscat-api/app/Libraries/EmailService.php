<?php

namespace App\Libraries;

use CodeIgniter\Email\Email;
use Config\Email as EmailConfig;

class EmailService
{
    private Email $email;

    public function __construct()
    {
        $config = config('Email');
        $this->email = new Email($config);
        $this->email->setFrom($config->fromEmail, $config->fromName);
        $this->email->setMailType('html');
    }

    private function send(string $to, string $subject, string $body): bool
    {
        $this->email->setTo($to);
        $this->email->setSubject($subject);
        $this->email->setMessage($body);

        $result = $this->email->send();
        if (! $result) {
            log_message('error', 'Email send failed: ' . $this->email->printDebugger(['subject', 'to', 'headers']));
        }
        return $result;
    }

    private function htmlTemplate(string $title, string $heading, string $content, string $extra = ''): string
    {
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Segoe UI',Tahoma,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 16px;">
                <tr><td align="center">
                    <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.06);">
                        <tr><td style="background:#005587;padding:32px 40px;text-align:center;">
                            <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0;letter-spacing:-0.5px;text-transform:uppercase;">Necry OER Portal</h1>
                            <p style="color:#8ab8d4;font-size:11px;margin:8px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Open Educational Resources</p>
                        </td></tr>
                        <tr><td style="padding:40px 40px 24px;">
                            <h2 style="color:#1e293b;font-size:18px;font-weight:800;margin:0 0 8px;text-transform:uppercase;letter-spacing:-0.3px;">{$heading}</h2>
                            {$content}
                        </td></tr>
                        {$extra}
                        <tr><td style="padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                            <p style="color:#94a3b8;font-size:10px;margin:0;text-align:center;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Necry OER Portal &bull; Agusan del Sur State University</p>
                        </td></tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        HTML;
    }

    public function sendVerificationCode(string $to, string $code): bool
    {
        $subject = 'Verify Your Email — Necry OER Portal';
        $content = <<<HTML
            <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 20px;">Use the 6-digit code below to verify your email address:</p>
            <div style="background:#f1f5f9;border-radius:16px;padding:24px;text-align:center;margin-bottom:20px;">
                <span style="font-size:32px;font-weight:900;color:#005587;letter-spacing:8px;">{$code}</span>
            </div>
            <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center;">This code expires in <strong>15 minutes</strong>. If you did not request this, ignore this email.</p>
HTML;
        return $this->send($to, $subject, $this->htmlTemplate('Verify Email', 'Email Verification', $content));
    }

    public function sendPasswordResetCode(string $to, string $code): bool
    {
        $subject = 'Reset Your Password — Necry OER Portal';
        $content = <<<HTML
            <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 20px;">A password reset was requested for your account. Enter the code below to proceed:</p>
            <div style="background:#f1f5f9;border-radius:16px;padding:24px;text-align:center;margin-bottom:20px;">
                <span style="font-size:32px;font-weight:900;color:#005587;letter-spacing:8px;">{$code}</span>
            </div>
            <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center;">This code expires in <strong>15 minutes</strong>. If you did not request a reset, ignore this email.</p>
HTML;
        return $this->send($to, $subject, $this->htmlTemplate('Reset Password', 'Password Reset', $content));
    }

    public function sendPurchaseReceipt(string $to, string $userName, string $resourceTitle, float $amount, string $paymentMethod): bool
    {
        $subject = 'Purchase Confirmed — Necry OER Portal';
        $formatted = number_format($amount, 2);
        $content = <<<HTML
            <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 16px;">Hi <strong>{$userName}</strong>,</p>
            <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 16px;">Your purchase was successful. Here are the details:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:16px;padding:20px;margin-bottom:20px;">
                <tr><td style="padding:4px 0;"><strong style="color:#1e293b;font-size:12px;">Item:</strong></td><td style="text-align:right;color:#475569;font-size:12px;">{$resourceTitle}</td></tr>
                <tr><td style="padding:4px 0;"><strong style="color:#1e293b;font-size:12px;">Amount Paid:</strong></td><td style="text-align:right;color:#005587;font-size:14px;font-weight:900;">₱{$formatted}</td></tr>
                <tr><td style="padding:4px 0;"><strong style="color:#1e293b;font-size:12px;">Payment Method:</strong></td><td style="text-align:right;color:#475569;font-size:12px;text-transform:uppercase;">{$paymentMethod}</td></tr>
            </table>
            <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center;">Access your purchase from your Dashboard &rarr; Activity History.</p>
HTML;
        return $this->send($to, $subject, $this->htmlTemplate('Purchase Receipt', 'Purchase Confirmed', $content));
    }

    public function sendUpgradeConfirmation(string $to, string $userName, string $tier, float $amount): bool
    {
        $subject = 'Subscription Upgraded — Necry OER Portal';
        $formatted = number_format($amount, 2);
        $tierLabel = str_replace('_', '+ ', $tier);
        $content = <<<HTML
            <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 16px;">Hi <strong>{$userName}</strong>,</p>
            <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 16px;">Your subscription has been upgraded!</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:16px;padding:20px;margin-bottom:20px;">
                <tr><td style="padding:4px 0;"><strong style="color:#1e293b;font-size:12px;">Plan:</strong></td><td style="text-align:right;color:#005587;font-size:14px;font-weight:900;text-transform:uppercase;">{$tierLabel}</td></tr>
                <tr><td style="padding:4px 0;"><strong style="color:#1e293b;font-size:12px;">Amount Charged:</strong></td><td style="text-align:right;color:#475569;font-size:12px;">₱{$formatted}</td></tr>
                <tr><td style="padding:4px 0;"><strong style="color:#1e293b;font-size:12px;">Valid For:</strong></td><td style="text-align:right;color:#475569;font-size:12px;">30 Days</td></tr>
            </table>
            <p style="color:#475569;font-size:13px;line-height:1.6;margin:0;">You now have access to all <strong>{$tierLabel}</strong> features. Enjoy!</p>
HTML;
        return $this->send($to, $subject, $this->htmlTemplate('Upgrade Confirmed', 'Subscription Upgraded', $content));
    }

    public function sendNewDeviceAlert(string $to, string $userName, string $deviceName, string $ipAddress, string $location): bool
    {
        $subject = 'New Sign-In Detected — Necry OER Portal';
        $content = <<<HTML
            <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 16px;">Hi <strong>{$userName}</strong>,</p>
            <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 16px;">A new device signed into your account:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #fecaca;">
                <tr><td style="padding:4px 0;"><strong style="color:#991b1b;font-size:12px;">Device:</strong></td><td style="text-align:right;color:#475569;font-size:12px;">{$deviceName}</td></tr>
                <tr><td style="padding:4px 0;"><strong style="color:#991b1b;font-size:12px;">IP Address:</strong></td><td style="text-align:right;color:#475569;font-size:12px;">{$ipAddress}</td></tr>
                <tr><td style="padding:4px 0;"><strong style="color:#991b1b;font-size:12px;">Location:</strong></td><td style="text-align:right;color:#475569;font-size:12px;">{$location}</td></tr>
            </table>
            <p style="color:#dc2626;font-size:12px;font-weight:700;margin:0 0 4px;">If this was not you, reset your password immediately.</p>
            <p style="color:#94a3b8;font-size:11px;margin:0;">If this was you, you can ignore this alert.</p>
HTML;
        return $this->send($to, $subject, $this->htmlTemplate('Security Alert', 'New Device Sign-In', $content));
    }
}
