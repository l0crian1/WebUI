#!/bin/bash
# Test script for VyOS GraphQL API connection

# Default values
API_ENDPOINT="https://10.0.101.245/graphql"
API_KEY="test123"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --endpoint)
      API_ENDPOINT="$2"
      shift 2
      ;;
    --key)
      API_KEY="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "=== Testing VyOS GraphQL API Connection ==="
echo "Endpoint: $API_ENDPOINT"
echo "API Key: $API_KEY"
echo ""

# Test memory query
echo "Testing memory query..."
curl -k --raw "$API_ENDPOINT" \
  -H 'Content-Type: application/json' \
  -d "{\"query\":\" {\\n ShowMemory (data: {key: \\\"$API_KEY\\\"}) {success errors data {result}}}\"}" \
  -v

echo ""
echo "=== Test Complete ==="
echo "If you see a 'success: true' in the response, the API is working correctly."
echo "If you see a connection error or 'success: false', check your VyOS router and API configuration."
echo ""
echo "Common issues:"
echo "1. VyOS router is not reachable"
echo "2. GraphQL API is not enabled on the router"
echo "3. API key is incorrect"
echo "4. HTTPS certificate issues (this script uses -k to ignore them)" 