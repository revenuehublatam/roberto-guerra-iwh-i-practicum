# Integrating With HubSpot I: Foundations Practicum

This Express app displays and creates **Trail Plant** custom object records in a HubSpot developer test account.

**Custom object records:** [Trail Plants in the developer test account](https://app.hubspot.com/contacts/52079797/objects/2-69783128/views/all/list)

## Local setup

1. Run `npm install`.
2. Copy `.env.example` to `.env` and set `HUBSPOT_PRIVATE_APP_TOKEN` to a private app token from this developer test account.
3. Run `npm start` and visit <http://localhost:3000>.

The token belongs only in `.env` on your local machine. The repository ignores `.env` and `node_modules/`.
