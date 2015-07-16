0.1.12 (July 16th, 2015)

  - Force the redis healthcheck (ping) to timeout after 2 seconds. This will cause
  the healthcheck to return either a 503 of 200 after 2 seconds, rather than timing
  out, which provides no insight into the health of the undelying components.

0.1.11 (July 14th, 2015)

  - Combine the configuration that was defined in the data/config/config.js file
  with the rest of the application configuration that lived at the root level config.js.
  - Rename the config.js file at the root of the project to config.json and update
  the format accordingly.

0.1.10 (July 13th, 2015)

  - POST /deployment/{ID}/logs now accepts an array of log messages to allow for
  more efficient batch delivery.

0.1.9 (July 8th, 2015)

  - Add support for redis config values such as key, index, and additional_fields.

0.1.5 (July 7th, 2015)

  - Bump version for first publish to npm.

0.1.4 (July 6th, 2015)

  - Rationalize statsd metrics to make them more easily navigable.

0.1.3 (July 6th, 2015)

  - Use the statsd config passed in, not the global config hash.
