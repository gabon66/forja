FROM php:8.3-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends msmtp-mta ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY docker/msmtprc /etc/msmtprc
RUN chown root:www-data /etc/msmtprc \
    && chmod 640 /etc/msmtprc \
    && printf 'sendmail_path="/usr/bin/msmtp -t"\n' > /usr/local/etc/php/conf.d/mail.ini

WORKDIR /var/www/html
COPY . /var/www/html

