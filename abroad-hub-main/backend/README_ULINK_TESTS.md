# ULINK Transcript Parsing Tests

This directory contains test files for validating the ULINK transcript parsing functionality, particularly the error handling improvements.

## Test Files

1. `ulink_test.py` - Original basic tests for transcript and PIN parsing
2. `ulink_error_handling_test.py` - Comprehensive tests for error handling with various types of transcript data

## Running the Tests

You can run the tests from the command line in the backend directory:

```bash
# Activate your virtual environment first (if applicable)
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows

# Run the original test file
python ulink_test.py

# Run the new error handling tests
python ulink_error_handling_test.py
```

## What the Tests Cover

The error handling tests validate:

1. **Valid Transcript Parsing** - Tests whether normal transcripts with standard grades are parsed correctly
2. **Invalid Transcript Parsing** - Tests handling of malformed transcript data with unusual grade formats
3. **Empty Transcript Parsing** - Tests handling of transcripts with no courses
4. **Malformed HTML Parsing** - Tests handling of completely invalid HTML
5. **Prerequisite Verification** - Tests the verify_prerequisites function with various scenarios:
   - Valid user with some met prerequisites
   - User with unusual grade formats
   - User with parsing errors
   - Non-existent user

## Expected Output

When running the tests, you should see detailed output showing:
- The number of courses found
- Any parsing errors detected
- Whether prerequisites are satisfied
- Lists of completed and missing prerequisites

Each test should indicate success with ✅ or failure with ❌.

## Troubleshooting

If you encounter import errors, make sure:
1. Django is set up correctly
2. You're running the tests from the backend directory
3. Your virtual environment is activated
4. Your PYTHONPATH includes the project root directory 