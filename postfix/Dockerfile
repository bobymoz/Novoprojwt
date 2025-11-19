FROM alpine:latest

RUN apk add --no-cache postfix rsyslog cyrus-sasl cyrus-sasl-plain

COPY main.cf /etc/postfix/main.cf
COPY master.cf /etc/postfix/master.cf

# Expor porta SMTP
EXPOSE 25

# Script de inicialização
CMD ["sh", "-c", "postfix start-fg"]