#!/bin/bash
BASE_URL="http://localhost:5001/api"
TOKEN=$1

if [ -z "$TOKEN" ]; then
  echo "Usage: ./test_api.sh <JWT_TOKEN>"
  exit 1
fi

echo "1. Registering Business..."
BUS_RES=$(curl -s -X POST "$BASE_URL/business/register" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shopName": "Fashion Hub", "ownerName": "Test User", "phone": "1234567890", "location": "New York", "businessType": "Clothing", "email": "test@fashionhub.com"}')
echo "Business Response: $BUS_RES"

echo -e "\n2. Creating Coupon..."
COUPON_RES=$(curl -s -X POST "$BASE_URL/coupons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Summer Sale", "discount": "20%", "detail": "20% off on all summer wear", "category": "Fashion"}')
echo "Coupon Response: $COUPON_RES"

echo -e "\n3. Getting Business Coupons..."
MY_COUPONS=$(curl -s -X GET "$BASE_URL/coupons/business" \
  -H "Authorization: Bearer $TOKEN")
echo "My Coupons: $MY_COUPONS"

echo -e "\n4. Getting All Coupons (Public)..."
ALL_COUPONS=$(curl -s -X GET "$BASE_URL/coupons")
echo "All Coupons: $ALL_COUPONS"
