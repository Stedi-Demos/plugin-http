# Stedi HTTP Plugin

### Requirements

You must have a working Node 18 or later environment installed on your machine before you proceed with the Getting Started steps.

### Getting Started

1. Ensure you have the dependencies installed.

   ```bash
     npm install
   ```

### Deploying the functions to Stedi

To deploy the project to your Stedi account:

1. Update the provided `.env` in the project root and ensure the following environment variable is defined:

   - `STEDI_API_KEY`: A Stedi API key is required for authentication. You
     can [generate an API key](https://www.stedi.com/app/settings/api-keys) in your Stedi account.

1. Deploy the resources:

   ```bash
     npm run deploy
   ```
