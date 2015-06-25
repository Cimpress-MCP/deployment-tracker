# Deployment Tracker
Collect deployment metadata from various deployment engines and forwards them along to purpose-driven application endpoints for analysis later.

Outputs include:
1. Logstash (ELK stack) for log messages
2. Statsd for metrics aggregation
3. SQL database table for long-lived deployment summary information

## Installation

    npm install deployment-tracker
    node deployment-tracker

## Usage

```
# Record the start of a deployment
curl -X POST -H 'Content-Type:application/json'  http://server:port/v1/deployments/84e803f7-9562-4d95-b828-25b167aea34b -d '{"deployment_id": 84e803f7-9562-4d95-b828-25b167aea34b, "engine": "vagrant_orchestrate", "engine_version": "0.6.3", "host": "localhost", "user": "cbaldauf", "environment": "dev", "package": "test", "version": "4.5.6"}'

# Record some log messages
curl -X POST -H 'Content-Type: application/json' http://server:port/v1/deployments/84e803f7-9562-4d95-b828-25b167aea34b -d '{"message": "Starting deployment phase 1", "severity": "info"}'


# Record the completion of a deployment
curl -X PUT -H 'Content-Type:application/json' http://server:port/v1/deployments/84e803f7-9562-4d95-b828-25b167aea34b -d '{"deployment_id": "84e803f7-9562-4d95-b828-25b167aea34b", "result": "success", "elapsed_seconds": 234}'
```

The service also supports tracking deployments on individual servers, using the
/v1/deployments/{id}/servers route

## API Docs
Full API docs are available at http://localhost:8080/swagger.json

## Configuraiton
TODO: come up with a clean mechanism for controlling metadata

## Development
1. Clone this repo
2. Make changes
3. Test locally using the `grunt` command
4. Spin up a Vagrant box to test the deployment using the `vagrant up` command
5. File a pull request

## TODO:
* Paging for /v1/deployments
* Add servers SQL data store
* Expose /servers/ & /servers/{hostname} endpoints
* Proper Exception Handling / logging
