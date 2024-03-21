const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "landscaster-b4d11",
    private_key_id: "7fc34ef1d12a07dde3c61296b487ae831b6d03e2",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCNqfrvWodAJxGY\ncHHtN3lMbeva82DrQY6kP9ae5knKysqa56n+iQWYc4UPJkjCWK/NfQDIGHhsxqHk\nvZRaFK3RDAlfaDxrvVisFnJo6akm8XrzAj4lTlne4Yr1AFc/FmtHpBpwg0wtPUtr\nKcbz2blruoFKzWp76tYl1jIUz3/U2C+r+gjRaCEZCKVuUWFOhDH6NKkUD8uiNSzD\nfn0L3zyyjLZbDRrH8VN5JUsBNobHNU4X1zED8VZk75UTXKMdtWKbc8gma/fE8f7g\n4/oTDNVswIJbEOmIqxmYafip84cBGyD8/td2nAFpz3bqrwFFurMzH9WNk0VOTFZd\nLqt0WGpVAgMBAAECggEAAvutL8voncLxS9szpoOls/ntQkEDpoQiK4wM0VM6rZKZ\nFp0zsdJMSUFjRWnJXBz/bWS3bDgmXQqya7ZLZGQ4Fejoz54DlJgdpGbxt3zZ6xOh\nQsf7srOGLUmeBcGEzbOuNhe3ZUJdqANVXGcsFr0Gs34aF+RSQDeoI1Xx2+ypHbxu\nHROtWbOon5Jv/OzI7AhWboMqsq+kcW6S+BtoBEWJOLurBqJceeMVPIYzJnECq+9g\nB9VfxjEGdus7ON6BLrrQM0QTNg4ycSPqsJzoPPsus7HGt9fd1TfwUuDWwGvI6I26\nE2P71uel/yMtbYHrGqj8pvH+LPFiHYdM9QWJiE4EoQKBgQC/mPhqm6uG2B/mpSsI\nuJNuXvAXcGPvSPT2fgKHFFhAZxlCq+Xitq4F/fbk9qvmJ45cLHST3FumOqv38GuH\nuylg2BWi7xx3qGxY77KWlYIMfniHPfB1wws860V+rY78kdaNL0ScGovRmrEj24Hg\nQvckDOKdgWQn4EZ0/idjqvt/UQKBgQC9SDYgwIe0qkMCvC+zcTxKLFdg88uuT2/P\noCJfVCTLqht00tTQ53PhdY5SN9CcrSoRnI4f4OpkMVQLrPvV9EnmRh1ZLu22LG3a\ncYKFWB3nXYNQ2rZixc0AtSFJ4gjiTHtw0KyTWTCyyoAM1XvFPFWaWpB8ZUO5vXFZ\nZuSCgYYhxQKBgD6i0qt/gr7NjvhHDN+H/+K4NMNk4bbLYhHnNgpU81jym4Z5Tekl\nEZUx5nIJ1j6itd6aRe5Evs2EJs4ikfTIkglv+vrOMr9Hl0wn6HlkHSTaf6qu7BqD\njfv3aju0n6cgQkTbrBFgeE8oxDpVu4rGOadWcwtMzqJepon+wH/L2PZRAoGBAKMR\nrDhJRmC6cqLPl9TjUEqiquDHCInyu+RHFHXGWzDvK1pZLKmRTX9GtMdWeK4SbXTg\nyHzkW2rYKI0qiYgJPwVZEH299WOGIVoZgpX4lUK3iKNG2ex8dqIOalBpoLe9pndJ\n//Ot2kueM/VakpgY47LoJSRWZaOGdznLcECS8Aj1AoGAYFFQqEgrdzP4lbdwcekD\nks3Rq1mRAoDcgB2Nm7mZTSb4bly6WRhzPilNP1e9S+0Lz6YckSchDITCHERJGVgC\noEqUpRUl2e/9ZCzUzfu34OADRMv+83QtXOQhTeGtcX5mF/allAOfL1bvr9Mm9sgK\nTHdy7Kkp00pv10+7ezuT5JM=\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-tohqa@landscaster-b4d11.iam.gserviceaccount.com",
    client_id: "116777587743899294703",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-tohqa%40landscaster-b4d11.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  }),
});

const db = admin.firestore();

module.exports = db;
