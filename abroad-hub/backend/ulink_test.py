import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import the U-link parser functions directly from ulink.py
from abroadhub.ulink import parse_transcript, parse_pin

# Sample U-link HTML response for a transcript
SAMPLE_TRANSCRIPT_HTML = """
<html>
<head>
<title>HCC Ulink</title>
</head>
<body background="/static/bg0.gif">

<h1>Welcome to HCC Ulink!</h1>
This web site is the new front-end to the SISS terminal, allowing students to register for classes and faculty to review their classes, all using the World Wide Web (WWW)!
<P>
You are connected as user 'abroad', your role is 'ADVISOR'.
<p>
<table border="1" width="100%" height="50%">
    <tr><td width="200" bgcolor="#cccccc" valign="top">
        <h2>Advisor menu</h2>
        <b><a href="/cgi-bin/view-schedule.pl">View student transcript</a><p>
        <b><a href="#" onclick="alert('coming soon!');">Degree audit</a><p>
        <b><a href="#" onclick="alert('coming soon!');">Burser/billing</a><p>
        <b><a href="/cgi-bin/view-pin.pl">View student PIN</a><p>
        <b><a href="#" onclick="alert('coming soon!');">Help</a><p>
    </td><td bgcolor="#cccccc" valign="top">
        <h2>View student transcript</h2>
<form>Username: <input name=username value='bob'><input type=submit></form><hr>
<pre>siss% act HCC_SISS
siss% q tr bob
SISS Record for: bob
--------------------------------------------------------------------------------

**** FALL 2023 ****
BIOL 101             GENERAL BIOLOGY                A
CHEM 101             INTRO CHEMISTRY                B-
PHIL 101             INTRO PHILOSOPHY               B-
PHYS 101             INTRO PHYSICS                  B+


**** SPRING 2024 ****
CHEM 102             GENERAL CHEMISTRY I            B+
ENGL 101             COMPOSITION I                  A
HIST 101             US HISTORY I                   A+
PHIL 201             ETHICS                         B


**** FALL 2024 ****
BIOL 102             BIOLOGY II                     A-
BIOL 201             HUMAN ANATOMY                  B+
KORE 101             ELEM KOREAN I                  A-


**** SPRING 2025 ****
CHEM 201             GENERAL CHEMISTRY II           IP
GERM 101             ELEM GERMAN I                  IP
HEBR 101             ELEM HEBREW I                  IP
HIST 102             US HISTORY II                  IP

--------------------------------------------------------------------------------
siss% </pre>
    </td></tr>
</table>

<p><p><p><hr>
<span style="font-size: 70%;">(C) 2000 Professor Jeff K. 

</body></html>
"""

# Sample U-link HTML response for a PIN
SAMPLE_PIN_HTML = """
<html>
<head>
<title>HCC Ulink</title>
</head>
<body background="/static/bg0.gif">

<h1>Welcome to HCC Ulink!</h1>
<P>
You are connected as user 'abroad', your role is 'ADVISOR'.
<p>
<table border="1" width="100%" height="50%">
    <tr><td width="200" bgcolor="#cccccc" valign="top">
        <h2>Advisor menu</h2>
    </td><td bgcolor="#cccccc" valign="top">
        <h2>View student PIN</h2>
<form>Username: <input name=username value='bob'><input type=submit></form><hr>
<pre>siss% act HCC_SISS
siss% q pin bob
SISS Record for: bob
--------------------------------------------------------------------------------

PIN: 123456

--------------------------------------------------------------------------------
siss% </pre>
    </td></tr>
</table>
</body></html>
"""

def test_transcript_parsing():
    """Test the transcript parsing functionality"""
    print("\n=== TESTING TRANSCRIPT PARSING ===")
    
    # Parse the sample transcript
    courses = parse_transcript(SAMPLE_TRANSCRIPT_HTML)
    
    # Verify we have the correct number of courses
    print(f"Found {len(courses)} courses")
    
    # Check the parsed data for accuracy
    for course in courses:
        print(f"Department: {course['department']}, Number: {course['number']}, "
              f"Title: {course['title']}, Grade: {course['grade']}, "
              f"Term: {course['term']}, Year: {course['year']}")
    
    # Verify some specific courses
    expected_courses = [
        {'department': 'BIOL', 'number': 101, 'title': 'GENERAL BIOLOGY', 'grade': 'A', 'term': 'FALL', 'year': 2023},
        {'department': 'CHEM', 'number': 102, 'title': 'GENERAL CHEMISTRY I', 'grade': 'B+', 'term': 'SPRING', 'year': 2024},
        {'department': 'HIST', 'number': 102, 'title': 'US HISTORY II', 'grade': 'IP', 'term': 'SPRING', 'year': 2025}
    ]
    
    for expected in expected_courses:
        found = False
        for course in courses:
            if (course['department'] == expected['department'] and 
                course['number'] == expected['number'] and
                course['grade'] == expected['grade']):
                found = True
                break
        
        if found:
            print(f"✅ Found expected course: {expected['department']} {expected['number']}")
        else:
            print(f"❌ Missing expected course: {expected['department']} {expected['number']}")

def test_pin_parsing():
    """Test the PIN parsing functionality"""
    print("\n=== TESTING PIN PARSING ===")
    
    # Parse the sample PIN
    pin = parse_pin(SAMPLE_PIN_HTML)
    
    # Verify the PIN was parsed correctly
    if pin == "123456":
        print(f"✅ Correctly parsed PIN: {pin}")
    else:
        print(f"❌ Incorrectly parsed PIN. Expected: 123456, Got: {pin}")

if __name__ == "__main__":
    # Run the tests
    test_transcript_parsing()
    test_pin_parsing() 