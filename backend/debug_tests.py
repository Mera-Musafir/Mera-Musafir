#!/usr/bin/env python3
"""
Debug script to identify test issues
Run with: python debug_tests.py
"""

import pytest
import sys
import os

def main():
    """Run specific failing test with detailed output"""
    
    print("🔍 DEBUGGING FAILED TESTS")
    print("=" * 50)
    
    # Run the specific failing test with maximum verbosity
    pytest_args = [
        "tests/test_chat.py::TestChatRoutes::test_join_chat_adds_user_to_existing_chat",
        "-v",           # Verbose
        "-s",           # Don't capture output (show prints)
        "--tb=long",    # Long traceback
        "--no-cov",     # Disable coverage for cleaner output
    ]
    
    print("Running failing test with detailed output...")
    print("-" * 50)
    
    exit_code = pytest.main(pytest_args)
    
    print()
    print("-" * 50)
    if exit_code == 0:
        print("✅ Test now passes!")
    else:
        print("❌ Test still failing - check the detailed output above")
        print()
        print("🔧 DEBUGGING STEPS:")
        print("1. Check if the CRUD function logic is correct")
        print("2. Verify database relationships are properly set up")
        print("3. Ensure test fixtures create users correctly")
        print("4. Check if authentication mocking works as expected")
    
    return exit_code

if __name__ == "__main__":
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    exit_code = main()
    sys.exit(exit_code)
