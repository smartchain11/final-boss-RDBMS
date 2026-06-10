FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
        libzip-dev \
        libicu-dev \
        zip \
        unzip \
    && docker-php-ext-install mysqli pdo pdo_mysql zip intl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && a2dismod -f mpm_event 2>/dev/null || true \
    && a2dismod -f mpm_worker 2>/dev/null || true \
    && a2enmod rewrite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN composer install --no-dev --optimize-autoloader \
    && chmod -R 777 writable/ \
    && sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf \
    && sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf \
    && echo "ServerName localhost" >> /etc/apache2/apache2.conf \
    && mkdir -p /var/run/apache2 /var/lock/apache2

EXPOSE 80

CMD ["apache2-foreground"]
