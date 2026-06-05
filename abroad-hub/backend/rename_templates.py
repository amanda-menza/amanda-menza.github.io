#!/usr/bin/env python
"""
Script to rename document templates to a standardized format.
"""
import os
import shutil
from pathlib import Path

# Define the mapping from current names to standardized names
template_mapping = {
    'Medical History and Immunizations.pdf': 'medical_health_history_and_immunization_records.pdf',
    'Housing Questionnaire.pdf': 'housing_questionnaire.pdf',
    'code_of_conduct.pdf': 'acknowledgement_of_code_of_conduct.pdf',
}

# Directory containing document templates
templates_dir = Path('media/document_templates')

print("Starting template file renaming...")

# Check if the directory exists
if not templates_dir.exists():
    print(f"ERROR: Directory {templates_dir} not found!")
    exit(1)

# Make backup directory
backup_dir = templates_dir / 'backup'
backup_dir.mkdir(exist_ok=True)

# Backup existing files
for file_path in templates_dir.glob('*.pdf'):
    if file_path.name != 'backup':
        shutil.copy(file_path, backup_dir / file_path.name)
        print(f"Backed up: {file_path.name}")

# Rename files according to the mapping
for old_name, new_name in template_mapping.items():
    old_path = templates_dir / old_name
    new_path = templates_dir / new_name
    
    if old_path.exists():
        # Copy instead of rename to preserve original
        shutil.copy(old_path, new_path)
        print(f"Renamed: {old_name} → {new_name}")
    else:
        print(f"WARNING: Source file not found: {old_name}")

# Check if assumption_of_risk_form.pdf exists, if not, create a copy from code_of_conduct.pdf
risk_form_path = templates_dir / 'assumption_of_risk_form.pdf'
code_of_conduct_path = templates_dir / 'code_of_conduct.pdf'

if not risk_form_path.exists() and code_of_conduct_path.exists():
    shutil.copy(code_of_conduct_path, risk_form_path)
    print(f"Created missing risk form template (copied from code of conduct)")

print("Template renaming completed!")
print("Original files have been preserved in the 'backup' directory.")
print("\nIMPORTANT: Update the actual content of assumption_of_risk_form.pdf as it was created as a copy.") 