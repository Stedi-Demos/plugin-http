# register the plugin definition
POST {{PLUGINS_BASE_URL}}/plugin-definitions
Content-Type: application/json
Authorization: Key {{STEDI_API_KEY}}

file,pluginDefinition.json;
HTTP 200

# create an instance for brandx
POST {{PLUGINS_BASE_URL}}/plugins/stedi-http
Content-Type: application/json
Authorization: Key {{STEDI_API_KEY}}
[Options]
skip: false

file,sampleInstance.json;
HTTP 200