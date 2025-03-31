# VyOS WebUI Scripts

This directory contains utility scripts for the VyOS WebUI.

## fetch_vyos_data.py

A Python script to fetch data from the VyOS GraphQL API. This script can be used to test the API or to fetch data for the VyOS WebUI.

### Prerequisites

- Python 3.6 or higher

### Usage

```bash
# Basic usage - fetch memory data
python fetch_vyos_data.py --query memory --insecure

# Monitor all resources with auto-refresh every 5 seconds
python fetch_vyos_data.py --query all --monitor --insecure

# Fetch CPU data and write to a file
python fetch_vyos_data.py --query cpu --output cpu_data.json --insecure

# Specify a different VyOS router and API key
python fetch_vyos_data.py --endpoint https://192.168.1.1/graphql --key your_api_key --query memory --insecure
```

### Command-line Options

- `--endpoint`: GraphQL API endpoint (default: https://10.0.101.245/graphql)
- `--key`: API key (default: test123)
- `--insecure`: Allow insecure HTTPS connections
- `--query`: Data to fetch (choices: memory, cpu, storage, interfaces, all; default: memory)
- `--format`: Output format (choices: json, pretty; default: pretty)
- `--output`: Output file (default: stdout)
- `--monitor`: Continuously monitor the selected query
- `--interval`: Interval between monitoring updates in seconds (default: 5)

### Examples

#### Fetching Memory Data

```bash
python fetch_vyos_data.py --query memory --insecure
```

Expected output:

```json
{
  "data": {
    "ShowMemory": {
      "success": true,
      "errors": [],
      "data": {
        "result": "               total        used        free      shared  buff/cache   available\nMem:          7.7G        5.5G        799M        396M        1.4G        4.9G\nSwap:           0B          0B          0B"
      }
    }
  }
}
```

#### Monitoring All Resources

```bash
python fetch_vyos_data.py --query all --monitor --insecure
```

This will continuously update the screen with data from all resources. 