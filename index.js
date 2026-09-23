require('dotenv').config();

const axios = require('axios');
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const objectType = process.env.HUBSPOT_CUSTOM_OBJECT_TYPE || '2-69783128';
const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const objectUrl = `https://api.hubapi.com/crm/v3/objects/${encodeURIComponent(objectType)}`;

app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

function apiHeaders() {
  if (!token) throw new Error('Add HUBSPOT_PRIVATE_APP_TOKEN to your local .env file.');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function reportApiError(error) {
  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;
  console.error('HubSpot request failed:', status || 'configuration', message);
  return status === 401 || status === 403
    ? 'HubSpot rejected the app token or its permissions.'
    : message;
}

// Route 1: read every Trail Plant and display its three custom properties.
app.get('/', async (req, res) => {
  try {
    const records = [];
    let after;
    do {
      const response = await axios.get(objectUrl, {
        headers: apiHeaders(),
        params: { properties: 'name,habitat,care_notes', limit: 100, ...(after && { after }) },
        timeout: 10000,
      });
      records.push(...response.data.results);
      after = response.data.paging?.next?.after;
    } while (after);
    res.render('homepage', { title: 'Trail Plants | Integrating With HubSpot I Practicum', records });
  } catch (error) {
    res.status(500).render('homepage', {
      title: 'Trail Plants | Integrating With HubSpot I Practicum',
      records: [], error: reportApiError(error),
    });
  }
});

// Route 2: show the form for adding a custom object record.
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum', values: {},
  });
});

// Route 3: create the record in HubSpot, then return to the table.
app.post('/update-cobj', async (req, res) => {
  const values = {
    name: (req.body.name || '').trim(),
    habitat: (req.body.habitat || '').trim(),
    care_notes: (req.body.care_notes || '').trim(),
  };
  const title = 'Update Custom Object Form | Integrating With HubSpot I Practicum';
  if (!values.name || !values.habitat || !values.care_notes) {
    return res.status(400).render('updates', {
      title, values, error: 'Complete all three fields before adding a plant.',
    });
  }
  try {
    await axios.post(objectUrl, { properties: values }, {
      headers: apiHeaders(), timeout: 10000,
    });
    return res.redirect('/');
  } catch (error) {
    return res.status(500).render('updates', {
      title, values, error: reportApiError(error),
    });
  }
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
