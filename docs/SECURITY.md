# VAC Security & Privacy

Visual Archive Club maintains this project to support public storytelling and club operations while respecting members' personal information.

## Principles

- Member applications, contact details, payment references and private documents belong in access-controlled services, not Git.
- Production credentials are stored in hosting or backend secret-management settings, never in client-side code or repository files.
- Public content and private administrative information are handled separately.
- Member information is collected only for a legitimate club purpose and should be retained only as long as necessary.
- Team members use individual administrator accounts and the minimum permissions their roles need.
- Contributors use synthetic test records instead of real students' personal information.

## Safe development practices

Use the blank `.env.example` template with your own **local, uncommitted** settings. Never paste credentials, private documents or sensitive logs in a PR, issue, README, screenshot or chat.

Check source changes before merging:

```bash
npm run security:test
npm run security:public
npm run security:audit
npm run build
```

Security scanners help find common mistakes but do not guarantee that software or repository history is free of issues.

## Reporting

If you discover a security or privacy problem, contact the VAC maintainers through a private, trusted channel. Do **not** publish exploit instructions, personal data, credentials or reproduction tokens in a public GitHub issue.

## Responsible maintenance

Keep dependencies updated, review administrator access periodically and test changes with non-sensitive example data. Follow your institution's requirements for data privacy and use.

Copyright and artwork rights are separate from the source code license.
