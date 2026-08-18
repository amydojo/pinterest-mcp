# Privacy Policy — Remy Relics Publishing Bridge

**Effective date:** August 17, 2026  
**Last updated:** August 17, 2026

Remy Relics Publishing Bridge (the “App”) is an internal content-publishing and automation tool operated for **Remy Relics / LabDojo**. The App is designed to help publish and verify original Remy Relics content on the operator’s own Pinterest business account.

This Privacy Policy explains what information the App accesses, how that information is used, and the limited circumstances in which it may be processed or shared.

## 1. Scope

The App is currently intended for the operator’s own Remy Relics Pinterest business account. It is not offered as a consumer service and is not designed to access unrelated Pinterest users’ accounts or private data.

## 2. Information the App accesses

To perform its publishing and verification functions, the App may access limited information associated with the authenticated Remy Relics Pinterest account, including:

- Pinterest board identifiers, names, and related board metadata;
- Pinterest Pin identifiers, titles, descriptions, alt text, destination links, and related Pin metadata;
- information returned by Pinterest after a Pin or board is created;
- authentication tokens or application credentials required to communicate securely with the Pinterest API; and
- technical request information needed to operate and secure the bridge, such as request timestamps, error details, and deployment logs.

The App may also process content supplied by the operator for publication, such as approved image URLs, titles, descriptions, alt text, board selections, and destination links.

## 3. How information is used

The App uses the information above only as necessary to:

- list and select the operator’s Pinterest boards;
- validate Pins before publication;
- detect likely duplicate Pins;
- publish approved original content to the operator’s Pinterest account;
- create a board when explicitly requested and permitted;
- read back newly created Pins for verification;
- troubleshoot errors and maintain the security and reliability of the App; and
- maintain an internal record of publishing status when configured to do so.

The App does not use Pinterest data to build advertising profiles, sell personal information, or train generative AI models.

## 4. Authentication and credentials

Pinterest application credentials, access tokens, and bridge secrets are intended to be stored in protected deployment environment variables or equivalent secret-storage systems. They are not intended to be committed to the public source-code repository, stored in public documents, or embedded in published content.

The App does not ask end users to provide their Pinterest password directly to the App.

## 5. Sharing of information

The App does not sell or rent personal information.

Information may be transmitted to or processed by service providers only as necessary to operate the App, such as:

- **Pinterest**, to authenticate requests and create, read, or verify Pins and boards;
- **hosting or infrastructure providers**, when used to run the bridge, store environment variables, or provide operational logs; and
- **content-hosting infrastructure**, when needed to make an approved image available to Pinterest for publication.

These providers process information according to their own terms and privacy practices.

The App may also disclose information when required by law or when reasonably necessary to protect the security, integrity, or legal rights of the operator or the App.

## 6. Data retention

The App is designed to minimize retained Pinterest data. Pinterest responses and technical logs may be retained only for as long as reasonably necessary for publishing verification, duplicate prevention, debugging, security, or recordkeeping.

Authentication credentials and tokens may be retained securely for as long as required to operate the authorized integration and may be revoked or replaced when access is no longer needed.

## 7. Data deletion and revocation

Because the App is currently an internal tool for the operator’s own account, the operator may stop the integration by disabling the App, revoking Pinterest authorization, removing deployment credentials, or deleting locally retained operational records.

The App intentionally does not provide a Pinterest Pin deletion tool in its initial release. Content already published to Pinterest can be managed directly through the authorized Pinterest account and remains subject to Pinterest’s own data-retention and deletion practices.

## 8. Security

The App is designed with safeguards intended to reduce unauthorized or accidental publishing, including dry-run operation by default, restricted destination hosts, authenticated bridge access, duplicate checks, bounded batch publishing, and post-publication readback verification.

No method of transmission, storage, or online service can be guaranteed to be completely secure, but reasonable efforts are made to protect credentials and minimize the amount of data processed.

## 9. Children’s privacy

The App is not directed to children and is not designed to collect personal information from children.

## 10. Third-party services

The App interacts with third-party services, including Pinterest and potentially hosting or content-delivery providers. Use of those services is also governed by their respective privacy policies and terms.

## 11. Changes to this policy

This Privacy Policy may be updated if the App’s functionality, data practices, or legal requirements change. The “Last updated” date at the top of this page will be revised when material changes are made.

## 12. Contact

Questions about this Privacy Policy or the Remy Relics Publishing Bridge can be submitted through the public project repository:

https://github.com/amydojo/pinterest-mcp
