# Security Policy

## Supported Versions

Security fixes target the `main` branch.

## Reporting A Vulnerability

Please do not open a public issue for a security vulnerability.

Report security problems by emailing the maintainer or opening a private GitHub security advisory if available. Include:

- affected files or routes
- steps to reproduce
- expected impact
- suggested fix, if known

## Security Notes

- Always set a strong `BETTER_AUTH_SECRET` in production.
- Set `CORS_ORIGIN` to your deployed domain in production.
- Do not commit `.env` files or production database credentials.
- Use a direct database URL for Prisma migrations and a runtime URL for the app.
- Review Swagger exposure before deploying private APIs.
