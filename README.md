# Deployment Tracker
Collect deployment metadata from various deployment engines and forward them along to purpose-driven application endpoints for storage and analysis later.

Outputs include:

1. Logstash (ELK stack) via Redis for log messages
2. Statsd for metrics aggregation
3. SQL database table for long-lived deployment summary information

## Installation

    npm install deployment-tracker
    node deployment-tracker

Note: Not compatible with Node.js versions 4.x

## Usage

```
# Record the start of a deployment
curl -X POST -H 'Content-Type:application/json' http://server:port/v1/deployments/84e803f7-9562-4d95-b828-25b167aea34b -d '{"deployment_id": 84e803f7-9562-4d95-b828-25b167aea34b, "engine": "vagrant_orchestrate", "engine_version": "0.6.3", "host": "localhost", "user": "cbaldauf", "environment": "dev", "package": "test", "package_url": "http://mypackage.mydomain.com", "version": "4.5.6", "arguments": "--strategy parallel" }'

# Record some log messages
curl -X POST -H 'Content-Type: application/json' http://server:port/v1/deployments/84e803f7-9562-4d95-b828-25b167aea34b -d '{"message": "Starting deployment phase 1", "severity": "info"}'

# Record the completion of a deployment
curl -X PUT -H 'Content-Type:application/json' http://server:port/v1/deployments/84e803f7-9562-4d95-b828-25b167aea34b -d '{"deployment_id": "84e803f7-9562-4d95-b828-25b167aea34b", "result": "success", "elapsed_seconds": 234}'
```

The service also supports tracking deployments on individual servers, using the
`/v1/deployments/{id}/servers` route

## API Docs
Full API docs are available at http://localhost:8080/swagger.json

## Configuration
Configuration lives in the config.js file at the root of the package. Currently
the recommendation is to overwrite the file, but support for specifying an alternate
file via an environment variable is envisioned.

A sample config might look something like this:
```
{
  redis :
  {
    host: "myredishost.mydomain.com"
  },
  statsd :
  {
    host: "mystatsdhost.mydomain.com",
    prefix: "deployment-tracker"
  }
}
```
### Redis

The redis output represents a step in the path toward showing up in Logstash (Elastic's ELK stack). Of course,
there are other ways to get data into ElasticSearch / LogStash, but deployment-tracker currently only supports
redis. If you're interested in a different logging output format or transport mechanism, please open an issue.

| Field             | Type    | Default            | Notes |
|-------------------|---------|--------------------|-------|
| host              | string  | 127.0.0.1          | The redis host to send log messages to |
| port              | integer | 6379               | The redis port to send log messages to |
| index             | string  | deployment-tracker | The index name to include in the log message |
| key               | string  | logstash           | The redis key to which messages are appended |
| additional_fileds | hash    | { }                | A hash of additional fields that will be merged into each log message that is sent to redis |

The config.redis object is passed directly to the constructor of the redis client implementation (in this case ioredis),
so any of the [ioredis connection options](https://github.com/luin/ioredis#connect-to-redis) should be supported.

```
{
  redis :
  {
    host : "myredishost.mydomain.com",
    port : 6379,
    index : "deployment-tracker",
    key : "logstash",
    additional_fields :
    {
        foo: "This will be appended to every log message"
        bar: "So will this"
    }
  }
}
```

## Development
1. Clone this repo
2. Spin up required infrastructure by running `vagrant up`
2. Make changes
3. Test locally using the `grunt` command
  - Alternatively, you can mock the redis endpoint with `DEPLOYMENT_TRACKER_MOCK_REDIS=true grunt`
4. Spin up a Vagrant box to test the deployment using the `vagrant up` command
5. File a pull request

## TODO:
* Proper Exception Handling / logging
* Configuration instructions and examples
