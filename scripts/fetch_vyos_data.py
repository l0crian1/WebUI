#!/usr/bin/env python3
"""
VyOS GraphQL API Client

This script provides a command-line interface to fetch data from the VyOS GraphQL API.
It can be used to test the API or to fetch data for the VyOS WebUI.
"""

import argparse
import json
import os
import sys
import urllib.request
import ssl
import time

# Default configuration
DEFAULT_API_ENDPOINT = 'https://10.0.101.245/graphql'
DEFAULT_API_KEY = 'test123'


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description='Fetch data from the VyOS GraphQL API')
    
    # API configuration
    parser.add_argument('--endpoint', type=str, default=DEFAULT_API_ENDPOINT,
                        help=f'GraphQL API endpoint (default: {DEFAULT_API_ENDPOINT})')
    parser.add_argument('--key', type=str, default=DEFAULT_API_KEY,
                        help=f'API key (default: {DEFAULT_API_KEY})')
    parser.add_argument('--insecure', action='store_true',
                        help='Allow insecure HTTPS connections')
    
    # Query selection
    parser.add_argument('--query', type=str, choices=['memory', 'cpu', 'storage', 'interfaces', 'all'],
                        default='memory', help='Data to fetch (default: memory)')
    
    # Output options
    parser.add_argument('--format', type=str, choices=['json', 'pretty'], default='pretty',
                        help='Output format (default: pretty)')
    parser.add_argument('--output', type=str, help='Output file (default: stdout)')
    parser.add_argument('--monitor', action='store_true',
                        help='Continuously monitor the selected query')
    parser.add_argument('--interval', type=int, default=5,
                        help='Interval between monitoring updates in seconds (default: 5)')
    
    return parser.parse_args()


def build_query(query_type, api_key):
    """Build a GraphQL query for the specified type."""
    if query_type == 'memory':
        return f"""{{
            ShowMemory(data: {{key: "{api_key}"}}) {{
                success
                errors
                data {{
                    result
                }}
            }}
        }}"""
    elif query_type == 'cpu':
        return f"""{{
            ShowCpu(data: {{key: "{api_key}"}}) {{
                success
                errors
                data {{
                    result
                }}
            }}
        }}"""
    elif query_type == 'storage':
        return f"""{{
            ShowStorage(data: {{key: "{api_key}"}}) {{
                success
                errors
                data {{
                    result
                }}
            }}
        }}"""
    elif query_type == 'interfaces':
        return f"""{{
            ShowInterfaces(data: {{key: "{api_key}"}}) {{
                success
                errors
                data {{
                    result
                }}
            }}
        }}"""
    elif query_type == 'all':
        return f"""{{
            memory: ShowMemory(data: {{key: "{api_key}"}}) {{
                success
                errors
                data {{
                    result
                }}
            }}
            cpu: ShowCpu(data: {{key: "{api_key}"}}) {{
                success
                errors
                data {{
                    result
                }}
            }}
            storage: ShowStorage(data: {{key: "{api_key}"}}) {{
                success
                errors
                data {{
                    result
                }}
            }}
            interfaces: ShowInterfaces(data: {{key: "{api_key}"}}) {{
                success
                errors
                data {{
                    result
                }}
            }}
        }}"""
    else:
        raise ValueError(f"Unknown query type: {query_type}")


def execute_query(query, endpoint, insecure=False):
    """Execute a GraphQL query against the VyOS API."""
    try:
        # Prepare the request
        request_data = json.dumps({"query": query}).encode('utf-8')
        headers = {
            'Content-Type': 'application/json',
        }
        
        # Create the request
        req = urllib.request.Request(endpoint, data=request_data, headers=headers, method='POST')
        
        # Handle insecure connections if specified
        context = None
        if insecure:
            context = ssl._create_unverified_context()
        
        # Execute the request
        with urllib.request.urlopen(req, context=context) as response:
            response_data = response.read()
            return json.loads(response_data.decode('utf-8'))
    except Exception as e:
        print(f"Error executing query: {e}", file=sys.stderr)
        sys.exit(1)


def format_output(data, format_type):
    """Format the output according to the specified format."""
    if format_type == 'json':
        return json.dumps(data)
    elif format_type == 'pretty':
        return json.dumps(data, indent=2)
    else:
        return str(data)


def write_output(content, output_file=None):
    """Write the output to a file or stdout."""
    if output_file:
        with open(output_file, 'w') as f:
            f.write(content)
    else:
        print(content)


def main():
    """Main function."""
    args = parse_args()
    
    # Build the query
    query = build_query(args.query, args.key)
    
    if args.monitor:
        try:
            while True:
                # Execute the query
                result = execute_query(query, args.endpoint, args.insecure)
                
                # Format and display the output
                output = format_output(result, args.format)
                
                # Clear the screen and write the output
                os.system('cls' if os.name == 'nt' else 'clear')
                print(f"Monitoring {args.query} - Press Ctrl+C to stop")
                print(f"Last update: {time.strftime('%Y-%m-%d %H:%M:%S')}")
                print()
                print(output)
                
                # Wait for the specified interval
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\nMonitoring stopped")
    else:
        # Execute the query
        result = execute_query(query, args.endpoint, args.insecure)
        
        # Format the output
        output = format_output(result, args.format)
        
        # Write the output
        write_output(output, args.output)


if __name__ == '__main__':
    main() 