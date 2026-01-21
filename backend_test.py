import requests
import sys
import json
from datetime import datetime

class FamilyTreeAPITester:
    def __init__(self, base_url="https://ancestry-hub-18.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request error: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Unexpected error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n=== HEALTH CHECK TESTS ===")
        
        # Test root endpoint
        self.run_test("Root endpoint", "GET", "", 200)
        
        # Test health endpoint
        self.run_test("Health check", "GET", "health", 200)

    def test_auth_flow(self):
        """Test authentication endpoints"""
        print("\n=== AUTHENTICATION TESTS ===")
        
        # Test user registration
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}"
        }
        
        success, response = self.run_test(
            "User registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            
            # Test login with same credentials
            login_data = {
                "email": test_user["email"],
                "password": test_user["password"]
            }
            
            success, login_response = self.run_test(
                "User login",
                "POST",
                "auth/login",
                200,
                data=login_data
            )
            
            # Test get current user
            if self.token:
                self.run_test(
                    "Get current user",
                    "GET",
                    "auth/me",
                    200
                )
        else:
            print("❌ Registration failed - cannot continue with auth tests")
            return False
            
        return True

    def test_members_crud(self):
        """Test family members CRUD operations"""
        print("\n=== FAMILY MEMBERS CRUD TESTS ===")
        
        if not self.token:
            print("❌ No auth token - skipping member tests")
            return False

        # Test create member
        member_data = {
            "name": "John Smith",
            "relationship": "Father",
            "birth_date": "1970-05-15",
            "bio": "Family patriarch and storyteller",
            "photo_url": "https://example.com/john.jpg"
        }
        
        success, response = self.run_test(
            "Create family member",
            "POST",
            "members",
            200,
            data=member_data
        )
        
        member_id = None
        if success and 'id' in response:
            member_id = response['id']
            print(f"   Member created with ID: {member_id}")
            
            # Test get all members
            self.run_test(
                "Get all members",
                "GET",
                "members",
                200
            )
            
            # Test get specific member
            self.run_test(
                "Get specific member",
                "GET",
                f"members/{member_id}",
                200
            )
            
            # Test update member
            update_data = {
                "bio": "Updated biography for John Smith"
            }
            
            self.run_test(
                "Update member",
                "PUT",
                f"members/{member_id}",
                200,
                data=update_data
            )
            
            # Test delete member (at the end)
            self.run_test(
                "Delete member",
                "DELETE",
                f"members/{member_id}",
                200
            )
        else:
            print("❌ Member creation failed - cannot continue with member tests")
            return False
            
        return True

    def test_photos_crud(self):
        """Test photo album operations"""
        print("\n=== PHOTO ALBUM TESTS ===")
        
        if not self.token:
            print("❌ No auth token - skipping photo tests")
            return False

        # First create a member for photo testing
        member_data = {
            "name": "Jane Doe",
            "relationship": "Mother",
            "birth_date": "1975-08-20"
        }
        
        success, response = self.run_test(
            "Create member for photo test",
            "POST",
            "members",
            200,
            data=member_data
        )
        
        if success and 'id' in response:
            member_id = response['id']
            
            # Test add photo
            photo_data = {
                "photo_url": "https://example.com/family-photo.jpg",
                "caption": "Beautiful family moment"
            }
            
            success, photo_response = self.run_test(
                "Add photo to member",
                "POST",
                f"members/{member_id}/photos",
                200,
                data=photo_data
            )
            
            photo_id = None
            if success and 'id' in photo_response:
                photo_id = photo_response['id']
                
                # Test get photos
                self.run_test(
                    "Get member photos",
                    "GET",
                    f"members/{member_id}/photos",
                    200
                )
                
                # Test delete photo
                self.run_test(
                    "Delete photo",
                    "DELETE",
                    f"members/{member_id}/photos/{photo_id}",
                    200
                )
            
            # Clean up - delete the test member
            self.run_test(
                "Cleanup test member",
                "DELETE",
                f"members/{member_id}",
                200
            )
        else:
            print("❌ Member creation for photo test failed")
            return False
            
        return True

    def test_events_crud(self):
        """Test events CRUD operations"""
        print("\n=== EVENTS CRUD TESTS ===")
        
        if not self.token:
            print("❌ No auth token - skipping event tests")
            return False

        # Test create event
        event_data = {
            "title": "Family Reunion 2024",
            "description": "Annual family gathering with potluck dinner",
            "event_date": "2024-12-25",
            "event_time": "14:00",
            "location": "Grandma's House"
        }
        
        success, response = self.run_test(
            "Create event",
            "POST",
            "events",
            200,
            data=event_data
        )
        
        event_id = None
        if success and 'id' in response:
            event_id = response['id']
            print(f"   Event created with ID: {event_id}")
            
            # Test get all events
            self.run_test(
                "Get all events",
                "GET",
                "events",
                200
            )
            
            # Test get specific event
            self.run_test(
                "Get specific event",
                "GET",
                f"events/{event_id}",
                200
            )
            
            # Test update event
            update_data = {
                "description": "Updated description for family reunion"
            }
            
            self.run_test(
                "Update event",
                "PUT",
                f"events/{event_id}",
                200,
                data=update_data
            )
            
            # Test delete event
            self.run_test(
                "Delete event",
                "DELETE",
                f"events/{event_id}",
                200
            )
        else:
            print("❌ Event creation failed - cannot continue with event tests")
            return False
            
        return True

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Family Tree API Tests")
        print(f"Testing against: {self.base_url}")
        
        # Run test suites
        self.test_health_check()
        
        auth_success = self.test_auth_flow()
        if auth_success:
            self.test_members_crud()
            self.test_photos_crud()
            self.test_events_crud()
        
        # Print final results
        print(f"\n📊 TEST SUMMARY")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Return results for further processing
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed/self.tests_run)*100 if self.tests_run > 0 else 0,
            "test_details": self.test_results
        }

def main():
    tester = FamilyTreeAPITester()
    results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    if results["failed_tests"] > 0:
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())