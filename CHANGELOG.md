0.1.18 (August 21th, 2015)

  - Increased field length for Deployment model fields package_url and arguments to 2048

0.1.17 (August 20th, 2015)

  - Now reporting deployment.engine as a metric to statsd for POST to deployments

0.1.16 (July 31st, 2015)

  - Update all logger references to log to the `/var/log/deployment-tracker` directory.
  This now requires that the directory be created before running the application and may
  require running node as root.

0.1.15 (July 28th, 2015)

  - Fix database healthcheck to properly report failure if the database can't be
  accessed. Previous behavior was a reported error, but a healthcheck test result of "passed".

0.1.14 (July 27th, 2015)

  - Update healthcheck test format to be friendlier for json parsing. For example:
  https://github.com/sensu/sensu-community-plugins/blob/master/plugins/http/check-http-json.rb

0.1.13 (July 17th, 2015)

  - Redact any config value with a key of `password` from the `/config` route.

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
