import requests
import re
import logging
import os
from datetime import datetime
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from .models import TranscriptCache, CourseRecord, AppUser, Course
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# U-link credentials and URL from environment variables
ULINK_BASE_URL = os.environ.get("ULINK_BASE_URL", "http://ulink.colab.duke.edu:8000")
ULINK_USERNAME = os.environ.get("ULINK_USERNAME", "abroad")
ULINK_PASSWORD = os.environ.get("ULINK_PASSWORD", "ece@458")

# Endpoints
TRANSCRIPT_ENDPOINT = "/cgi-bin/view-schedule.pl"
PIN_ENDPOINT = "/cgi-bin/view-pin.pl"

# Flag to enable mock data for testing
USE_MOCK_ULINK = os.environ.get("USE_MOCK_ULINK", "true").lower() == "true"

def get_mock_transcript_html(ulink_username):
    """
    Return a mock HTML transcript for testing purposes.
    
    Args:
        ulink_username (str): The U-link username of the student
        
    Returns:
        str: Mock HTML content for testing
    """
    # Create a student name based on the username
    student_name = ulink_username.replace(".", " ").title()
    
    return f"""
    <html>
    <head><title>HCC Ulink</title></head>
    <body>
    <h1>Welcome to HCC Ulink!</h1>
    <pre>
siss% view-schedule {ulink_username}
SISS Record for: {student_name}
------------------------------------------

**** FALL 2023 ****
CS 101 Introduction to Computer Science A
MATH 201 Calculus I C
ENG 110 Academic Writing A-
CHEM 130 General Chemistry I B
BRAZIL 203 Introduction to Brazilian Portuguese A

**** SPRING 2024 ****
CS 102 Data Structures and Algorithms B+
MATH 202 Calculus II B
PHYS 101 Introductory Physics A-
HIST 105 World History IP

**** SUMMER 2024 ****
ECON 101 Principles of Economics S
BIO 110 Introduction to Biology A-

**** FALL 2024 ****
CS 201 Computer Systems B+
MATH 301 Linear Algebra A
PHIL 120 Introduction to Ethics B
SOC 101 Introduction to Sociology IP
    </pre>
    </body>
    </html>
    """

def get_mock_pin(ulink_username):
    """
    Return a mock PIN for testing purposes.
    
    Args:
        ulink_username (str): The U-link username of the student
        
    Returns:
        str: Mock PIN HTML content for testing
    """
    # Generate a PIN based on the username (for testing only)
    # In a real scenario, this would be a secure PIN
    mock_pin = "1234"
    student_name = ulink_username.replace(".", " ").title()
    
    return f"""
    <html>
    <head><title>HCC Ulink</title></head>
    <body>
    <h1>Welcome to HCC Ulink!</h1>
    <p>PIN for '{student_name}': <b>{mock_pin}</b></p>
    </body>
    </html>
    """


def get_basic_auth():
    """Return the HTTP Basic Auth tuple for U-link."""
    return (ULINK_USERNAME, ULINK_PASSWORD)


def fetch_transcript_html(ulink_username):
    """
    Fetch the raw HTML transcript for a student from U-link.
    
    Args:
        ulink_username (str): The U-link username of the student
        
    Returns:
        str: HTML content of the response, or None if an error occurred
    """
    # If mock data is enabled, return mock transcript
    if USE_MOCK_ULINK:
        logger.info(f"Using mock transcript data for {ulink_username}")
        return get_mock_transcript_html(ulink_username)
    
    # Otherwise, proceed with the actual API call
    try:
        url = f"{ULINK_BASE_URL}{TRANSCRIPT_ENDPOINT}"
        params = {"username": ulink_username}
        response = requests.get(url, params=params, auth=get_basic_auth())
        
        if response.status_code == 200:
            return response.text
        else:
            logger.error(f"Failed to fetch transcript for {ulink_username}. Status code: {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error fetching transcript for {ulink_username}: {str(e)}")
        return None


def parse_transcript(html_content):
    """
    Parse the HTML transcript content into a structured format.
    
    Args:
        html_content (str): HTML content from the U-link transcript page
        
    Returns:
        dict: Dictionary with 'courses' list, 'validation_errors' list, and 'is_valid' boolean
    """
    try:
        # Extract content from pre tag
        pre_pattern = re.compile(r'<pre>(.*?)</pre>', re.DOTALL)
        pre_match = pre_pattern.search(html_content)
        if not pre_match:
            logger.error("Could not find transcript data in HTML content")
            return {'courses': [], 'validation_errors': ["Could not find transcript data in HTML content"], 'is_valid': False}
            
        pre_content = pre_match.group(1)
        
        # Parse the transcript
        courses = []
        validation_errors = []
        line_errors = []  # Store errors by line for better error reporting
        current_term = None
        current_year = None
        line_number = 0
        has_critical_errors = False  # Flag for critical structural errors
        
        # HTML structure validation
        if "SISS Record for:" not in html_content:
            validation_errors.append("Missing expected SISS header - transcript format may have changed")
            has_critical_errors = True
        
        # Valid terms and grades for validation
        valid_terms = ['FALL', 'SPRING', 'SUMMER', 'WINTER']
        valid_grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'IP', 'W', 'S']
        current_year_value = datetime.now().year
        course_term_combinations = []
        processed_line_count = 0
        success_count = 0
        
        for line in pre_content.strip().split('\n'):
            line_number += 1
            line_data = {'line': line, 'errors': []}
            
            # Skip lines that are part of the SISS command output
            if line.startswith('siss%') or 'SISS Record for:' in line or '---' in line:
                continue
            
            try:
                processed_line_count += 1
                # Check for term headers
                term_match = re.match(r'\*\*\*\* (\w+) (\d{4}) \*\*\*\*', line)
                if term_match:
                    current_term = term_match.group(1)  # FALL, SPRING, etc.
                    try:
                        current_year = int(term_match.group(2))  # 2023, 2024, etc.
                    except ValueError:
                        error_msg = f"Invalid year format at line {line_number}: {term_match.group(2)}"
                        validation_errors.append(error_msg)
                        line_data['errors'].append(error_msg)
                        current_year = None
                    
                    # Term validation
                    if current_term not in valid_terms:
                        error_msg = f"Invalid term at line {line_number}: {current_term}"
                        validation_errors.append(error_msg)
                        line_data['errors'].append(error_msg)
                    
                    # Year validation
                    if current_year and (current_year < 1990 or current_year > current_year_value):
                        error_msg = f"Suspicious year at line {line_number}: {current_year}"
                        validation_errors.append(error_msg)
                        line_data['errors'].append(error_msg)
                    
                    if line_data['errors']:
                        line_errors.append(line_data)
                    continue
                
                # Only try to match courses if we have term and year context
                if not current_term or not current_year:
                    continue
                    
                # Check for course lines (they have consistent format)
                # Format: DEPT NUM TITLE GRADE - updated regex to match new requirements
                course_match = re.match(r'([A-Z0-9]{1,8})\s+(\d{3})\s+(.*?)\s+([A-Z][+-]?|IP|W|S)$', line.strip())
                if course_match:
                    department = course_match.group(1)
                    course_num_str = course_match.group(2)
                    title = course_match.group(3).strip()
                    grade = course_match.group(4)
                    
                    # Course line is valid but might have content errors
                    line_has_errors = False
                    
                    try:
                        number = int(course_num_str)
                    except ValueError:
                        error_msg = f"Invalid course number at line {line_number}: {course_num_str}"
                        validation_errors.append(error_msg)
                        line_data['errors'].append(error_msg)
                        line_has_errors = True
                        continue
                    
                    # Department code validation - updated to match format [A-Z0-9]{1,8}
                    if not re.match(r'^[A-Z0-9]{1,8}$', department):
                        error_msg = f"Invalid department code format at line {line_number}: {department}"
                        validation_errors.append(error_msg)
                        line_data['errors'].append(error_msg)
                        line_has_errors = True
                    
                    # Course number validation - exactly 3 digits
                    # Check that the original string representation has exactly 3 digits
                    if len(course_num_str) != 3 or not course_num_str.isdigit():
                        error_msg = f"Invalid course number at line {line_number}: {course_num_str} - must be exactly 3 digits"
                        validation_errors.append(error_msg)
                        line_data['errors'].append(error_msg)
                        line_has_errors = True
                    
                    # Title validation
                    if not title or len(title) < 3 or len(title) > 100:
                        error_msg = f"Suspicious course title at line {line_number}: '{title}' for {department} {number}"
                        validation_errors.append(error_msg)
                        line_data['errors'].append(error_msg)
                        line_has_errors = True
                    
                    # Grade validation
                    if grade not in valid_grades:
                        error_msg = f"Invalid grade at line {line_number}: '{grade}' for {department} {number}"
                        validation_errors.append(error_msg)
                        line_data['errors'].append(error_msg)
                        line_has_errors = True
                    
                    # Check for duplicates
                    combo = (department, number, current_term, current_year)
                    if combo in course_term_combinations:
                        error_msg = f"Duplicate course entry at line {line_number}: {department} {number} in {current_term} {current_year}"
                        validation_errors.append(error_msg)
                        line_data['errors'].append(error_msg)
                        line_has_errors = True
                    
                    course_term_combinations.append(combo)
                    
                    # Even if there are errors, we still add the course to the list
                    # unless it has critical errors that would make the data unusable
                    if not line_has_errors or (line_has_errors and not has_critical_errors):
                        courses.append({
                            'department': department,
                            'number': number,
                            'title': title,
                            'grade': grade,
                            'term': current_term,
                            'year': current_year,
                            'has_errors': line_has_errors
                        })
                        success_count += 1
                else:
                    # Line doesn't match expected course format
                    if line.strip():  # Only log non-empty lines
                        error_msg = f"Line {line_number} doesn't match expected course format: '{line.strip()}'"
                        validation_errors.append(error_msg)
                        line_data['errors'].append(error_msg)
                        line_errors.append(line_data)
            except Exception as e:
                # Catch any unexpected errors in the line parsing
                error_msg = f"Error parsing line {line_number} '{line}': {str(e)}"
                logger.error(error_msg)
                validation_errors.append(error_msg)
                line_data['errors'].append(error_msg)
                line_errors.append(line_data)
                continue
            
            # Add lines with errors to the line_errors list
            if line_data['errors']:
                line_errors.append(line_data)
        
        # Check if we found any courses
        if len(courses) == 0:
            validation_errors.append("No courses found in transcript - possible parsing error")
            has_critical_errors = True
        
        # Calculate data quality metrics
        data_quality = {
            'total_lines_processed': processed_line_count,
            'successful_course_lines': success_count,
            'error_lines': len(line_errors),
            'partial_data': len(validation_errors) > 0 and len(courses) > 0,
            'has_critical_errors': has_critical_errors
        }
        
        return {
            'courses': courses,
            'validation_errors': validation_errors,
            'line_errors': line_errors,
            'data_quality': data_quality,
            'is_valid': len(validation_errors) == 0,  # Still valid if no errors
            'is_usable': not has_critical_errors and len(courses) > 0  # Data is usable even with some errors
        }
    except Exception as e:
        # Catch any unexpected errors in the entire function
        logger.error(f"Error in parse_transcript: {str(e)}")
        return {
            'courses': [],
            'validation_errors': [f"Error processing transcript: {str(e)}"],
            'line_errors': [],
            'data_quality': {'has_critical_errors': True},
            'is_valid': False,
            'is_usable': False
        }


def get_student_transcript(ulink_username, force_refresh=False):
    """
    Get a student's transcript, either from cache or directly from U-link.
    
    Args:
        ulink_username (str): The U-link username of the student
        force_refresh (bool): Whether to force a refresh from U-link
        
    Returns:
        dict: Dictionary with 'course_records' list and 'validation_errors' list
    """
    try:
        # Get the associated AppUser
        try:
            app_user = AppUser.objects.get(ulink_username=ulink_username)
        except AppUser.DoesNotExist:
            logger.error(f"No AppUser found with ulink_username {ulink_username}")
            return {'course_records': None, 'validation_errors': ["User not found"], 'is_valid': False, 'is_usable': False, 'using_cached_data': False}
        
        # Check if we have a recent cache
        has_cached_data = False
        cached_course_records = None
        
        try:
            cache = TranscriptCache.objects.get(user=app_user)
            cached_course_records = CourseRecord.objects.filter(transcript=cache)
            has_cached_data = cached_course_records.exists()
            
            # Return cache if it exists and we're not forcing a refresh
            if has_cached_data and not force_refresh:
                return {
                    'course_records': cached_course_records, 
                    'validation_errors': [], 
                    'is_valid': True,
                    'is_usable': True,
                    'using_cached_data': True
                }
        except TranscriptCache.DoesNotExist:
            # No cache exists, will create one
            pass
        
        # Fetch and parse transcript from U-link
        html_content = fetch_transcript_html(ulink_username)
        if not html_content:
            # If we have cached data, use it with a warning
            if has_cached_data:
                return {
                    'course_records': cached_course_records,
                    'validation_errors': ["Failed to fetch new transcript data, using cached data"],
                    'is_valid': False,
                    'is_usable': True,
                    'using_cached_data': True
                }
            
            return {
                'course_records': None, 
                'validation_errors': ["Failed to fetch transcript data"], 
                'is_valid': False,
                'is_usable': False,
                'using_cached_data': False
            }
            
        transcript_data = parse_transcript(html_content)
        courses = transcript_data['courses']
        validation_errors = transcript_data['validation_errors']
        is_valid = transcript_data['is_valid']
        is_usable = transcript_data['is_usable']
        
        # If data is not usable but we have cached data, use the cached data
        if not is_usable and has_cached_data:
            return {
                'course_records': cached_course_records,
                'validation_errors': validation_errors + ["Using cached data due to issues with new data"],
                'is_valid': False,
                'is_usable': True,
                'using_cached_data': True,
                'data_quality': transcript_data.get('data_quality', {})
            }
        
        # If no courses were found or validation completely failed, return the errors
        if not courses or not is_usable:
            # If we have cached data, return it with the validation errors
            if has_cached_data:
                return {
                    'course_records': cached_course_records,
                    'validation_errors': validation_errors + ["Using cached data due to issues with new data"],
                    'is_valid': False,
                    'is_usable': True,
                    'using_cached_data': True,
                    'data_quality': transcript_data.get('data_quality', {})
                }
                
            return {
                'course_records': None,
                'validation_errors': validation_errors,
                'is_valid': False,
                'is_usable': False,
                'using_cached_data': False,
                'data_quality': transcript_data.get('data_quality', {})
            }
        
        # Only update cache if data has no errors (is_valid)
        if is_valid:
            cache, created = TranscriptCache.objects.get_or_create(user=app_user)
            
            # Clear old course records if we're refreshing
            if not created:
                CourseRecord.objects.filter(transcript=cache).delete()
            
            # Create new course records, filtering out courses with errors
            course_records = []
            courses_with_errors = 0
            
            for course_data in courses:
                # Skip courses with errors if there are enough good courses
                if course_data.get('has_errors', False):
                    courses_with_errors += 1
                    # Only include courses with errors if they're not too many
                    if courses_with_errors > len(courses) / 3:  # More than 1/3 of courses have errors
                        continue
                
                # Get or create the Course object
                course, _ = Course.objects.get_or_create(
                    department=course_data['department'],
                    number=course_data['number']
                )
                
                course_record = CourseRecord(
                    transcript=cache,
                    course=course,
                    title=course_data['title'],
                    grade=course_data['grade'],
                    term=course_data['term'],
                    year=course_data['year']
                )
                course_records.append(course_record)
            
            # Bulk create all course records
            CourseRecord.objects.bulk_create(course_records)
            
            # Force an update of the last_refreshed timestamp when force_refresh=True
            if force_refresh:
                cache.save()  # This will update the auto_now last_refreshed field
            
            return {
                'course_records': CourseRecord.objects.filter(transcript=cache),
                'validation_errors': validation_errors if validation_errors else [],
                'is_valid': is_valid,
                'is_usable': True,
                'using_cached_data': False,
                'data_quality': transcript_data.get('data_quality', {})
            }
        
        # If transcript has errors, don't update cache
        else:
            # If we have cached data, return it with error messages
            if has_cached_data:
                return {
                    'course_records': cached_course_records,
                    'validation_errors': validation_errors + ["Transcript has errors - not updating cache"],
                    'is_valid': False,
                    'is_usable': True,
                    'using_cached_data': True,
                    'data_quality': transcript_data.get('data_quality', {})
                }
            
            # No cached data available
            return {
                'course_records': None,
                'validation_errors': validation_errors + ["Transcript has errors - not updating cache"],
                'is_valid': False,
                'is_usable': False,
                'using_cached_data': False,
                'data_quality': transcript_data.get('data_quality', {})
            }
        
    except Exception as e:
        logger.error(f"Error in get_student_transcript for {ulink_username}: {str(e)}")
        
        # Try to return cached data in case of unexpected errors
        try:
            app_user = AppUser.objects.get(ulink_username=ulink_username)
            cache = TranscriptCache.objects.get(user=app_user)
            cached_records = CourseRecord.objects.filter(transcript=cache)
            
            if cached_records.exists():
                return {
                    'course_records': cached_records,
                    'validation_errors': [f"Error processing transcript: {str(e)}", "Using cached data due to processing error"],
                    'is_valid': False,
                    'is_usable': True,
                    'using_cached_data': True
                }
        except Exception:
            # If even the cached data retrieval fails, return a clean error
            pass
            
        return {
            'course_records': None,
            'validation_errors': [f"Error processing transcript: {str(e)}"],
            'is_valid': False,
            'is_usable': False,
            'using_cached_data': False
        }


def verify_prerequisites(ulink_username, prerequisites, force_refresh=False):
    """
    Check if a student meets the prerequisites for a program.
    
    Args:
        ulink_username (str): The U-link username of the student
        prerequisites (list): List of Course objects representing prerequisites
        force_refresh (bool): Whether to force a refresh of transcript data from ULINK
        
    Returns:
        dict: Dictionary with 'satisfied' boolean and lists of 'completed' and 'missing' prerequisites
    """
    if not prerequisites:
        return {"satisfied": True, "completed": [], "missing": []}
    
    try:
        # Get student transcript
        transcript_result = get_student_transcript(ulink_username, force_refresh=force_refresh)
        course_records = transcript_result.get('course_records')
        validation_errors = transcript_result.get('validation_errors', [])
        is_valid = transcript_result.get('is_valid', False)
        
        if not course_records:
            return {
                "satisfied": False, 
                "completed": [], 
                "missing": [p.department + " " + str(p.number) for p in prerequisites],
                "parsing_errors": validation_errors,
                "validation_errors": validation_errors,  # Add validation_errors for consistency
                "is_valid": is_valid
            }
        
        # Get the timestamp when the transcript was last refreshed
        try:
            from .models import TranscriptCache, AppUser
            app_user = AppUser.objects.get(ulink_username=ulink_username)
            transcript_cache = TranscriptCache.objects.get(user=app_user)
            last_refreshed = transcript_cache.last_refreshed
        except Exception as e:
            logger.error(f"Error getting transcript timestamp: {str(e)}")
            last_refreshed = None
        
        completed = []
        missing = []
        
        for prereq in prerequisites:
            # Check if student has completed this course with a passing grade
            passed_course = False
            for record in course_records:
                try:
                    if record.course.department == prereq.department and record.course.number == prereq.number:
                        # Check if course is completed with passing grade (D- or better, S for pass/fail, or IP)
                        if record.grade in ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'S', 'IP']:
                            passed_course = True
                            completed.append(f"{prereq.department} {prereq.number}")
                            break
                except Exception as e:
                    logger.error(f"Error checking prerequisite {prereq.department} {prereq.number}: {str(e)}")
                    continue
            
            if not passed_course:
                missing.append(f"{prereq.department} {prereq.number}")
        
        return {
            "satisfied": len(missing) == 0,
            "completed": completed,
            "missing": missing,
            "last_refreshed": last_refreshed.isoformat() if last_refreshed else None,
            "parsing_errors": validation_errors,
            "validation_errors": validation_errors,  # Add validation_errors for consistency
            "is_valid": is_valid
        }
    except Exception as e:
        logger.error(f"Error in verify_prerequisites for {ulink_username}: {str(e)}")
        error_message = [f"Error verifying prerequisites: {str(e)}"]
        return {
            "satisfied": False, 
            "completed": [], 
            "missing": [p.department + " " + str(p.number) for p in prerequisites],
            "parsing_errors": error_message,
            "validation_errors": error_message,  # Add validation_errors for consistency
            "is_valid": False
        }


def fetch_student_pin_html(ulink_username):
    """
    Fetch the HTML containing a student's PIN from U-link.
    
    Args:
        ulink_username (str): The U-link username of the student
        
    Returns:
        str: HTML content of the response, or None if an error occurred
    """
    # If mock data is enabled, return mock PIN
    if USE_MOCK_ULINK:
        logger.info(f"Using mock PIN data for {ulink_username}")
        return get_mock_pin(ulink_username)
        
    try:
        url = f"{ULINK_BASE_URL}{PIN_ENDPOINT}"
        params = {"username": ulink_username}
        response = requests.get(url, params=params, auth=get_basic_auth())

        if response.status_code == 200:
            return response.text
        else:
            logger.error(f"Failed to fetch PIN for {ulink_username}. Status code: {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error fetching PIN for {ulink_username}: {str(e)}")
        return None


def parse_pin(html_content):
    """
    Extract a student's PIN from the HTML content.
    
    Args:
        html_content (str): HTML content from the U-link PIN page
        
    Returns:
        str: The student's PIN, or None if it couldn't be found
    """
    try:
        # Look for a pattern like "PIN: 1234" in the pre-formatted content
        pre_pattern = re.compile(r"PIN for '.*?': <b>(\d+)</b>")
        print("pre pattern ",pre_pattern)
        pre_match = pre_pattern.search(html_content)
        print("pre match ",pre_match)
        if not pre_match:
            return None
        pin_match=pre_match.group(1)
        print("pin match ",pin_match)
        if pin_match:
            return pin_match
        
        return None
    except Exception as e:
        logger.error(f"Error parsing PIN: {str(e)}")
        return None


def get_student_pin(ulink_username):
    """
    Get a student's PIN from U-link.
    
    Args:
        ulink_username (str): The U-link username of the student
        
    Returns:
        str: The student's PIN, or None if it couldn't be retrieved
        
    Raises:
        ConnectionError: If there's an issue connecting to Ulink
    """
    try:
        # Fetch the HTML content
        html_content = fetch_student_pin_html(ulink_username)
        
        # If we couldn't get the HTML, check if it's a connection issue
        if not html_content:
            # Check connection to Ulink
            if not USE_MOCK_ULINK:  # Only test connection if not in mock mode
                try:
                    url = f"{ULINK_BASE_URL}/ping"
                    response = requests.get(url, timeout=5)
                except (requests.RequestException, requests.ConnectionError, requests.Timeout) as e:
                    # This is a connection error
                    logger.error(f"Connection error to Ulink in get_student_pin: {str(e)}")
                    raise ConnectionError(f"Unable to connect to Ulink: {str(e)}")
            return None
        
        # Parse the PIN from the HTML content    
        pin = parse_pin(html_content)
        return pin
    except (requests.RequestException, requests.ConnectionError, requests.Timeout) as e:
        # This is a connection error
        logger.error(f"Connection error in get_student_pin for {ulink_username}: {str(e)}")
        raise ConnectionError(f"Unable to connect to Ulink: {str(e)}")
    except Exception as e:
        logger.error(f"Error in get_student_pin for {ulink_username}: {str(e)}")
        # Check if this looks like a connection error
        error_str = str(e).lower()
        if any(term in error_str for term in ["connection", "network", "timeout", "unreachable", "resolve"]):
            raise ConnectionError(f"Unable to connect to Ulink: {str(e)}")
        return None


def verify_ulink_account(ulink_username, pin):
    """
    Verify that a U-link username and PIN are valid.
    
    Args:
        ulink_username (str): The U-link username to verify
        pin (str): The PIN associated with the username
        
    Returns:
        bool: True if the credentials are valid, False otherwise
        
    Raises:
        ConnectionError: If there's an issue connecting to Ulink
    """
    try:
        # Fetch the PIN from U-link
        actual_pin = get_student_pin(ulink_username)
        print("actual pin ",actual_pin)
        print("sent pin ",pin)
        
        # If we couldn't get the PIN or the account doesn't exist
        if not actual_pin:
            # Check if this is due to a connection issue before returning False
            if USE_MOCK_ULINK:
                # In mock mode, no actual connection is made, so it's not a connection issue
                return False
                
            # Test connection to Ulink before returning credential failure
            try:
                url = f"{ULINK_BASE_URL}/ping"
                response = requests.get(url, timeout=5)
                # If we can connect but couldn't get pin, it's a credential issue
                return False
            except (requests.RequestException, requests.ConnectionError, requests.Timeout) as e:
                # Connection issue detected
                logger.error(f"Connection error to U-link detected: {str(e)}")
                raise ConnectionError(f"Unable to connect to Ulink service: {str(e)}")
            
        # Compare PINs
        return actual_pin == pin
    except (requests.RequestException, requests.ConnectionError, requests.Timeout) as e:
        # Specific handling for connection errors
        logger.error(f"Connection error to U-link for {ulink_username}: {str(e)}")
        raise ConnectionError(f"Unable to connect to Ulink service: {str(e)}")
    except Exception as e:
        logger.error(f"Error verifying U-link account for {ulink_username}: {str(e)}")
        # If there are signs this is a connection issue, raise ConnectionError
        error_str = str(e).lower()
        if any(term in error_str for term in ["connection", "network", "timeout", "unreachable", "resolve"]):
            raise ConnectionError(f"Unable to connect to Ulink service: {str(e)}")
        return False
