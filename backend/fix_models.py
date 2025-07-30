#!/usr/bin/env python3

import os
import re

# List of model files to fix
model_files = [
    'app/models/task.py',
    'app/models/file_operation.py', 
    'app/models/task_step.py',
    'app/models/agent_model.py',
    'app/models/system_metrics.py'
]

for file_path in model_files:
    if os.path.exists(file_path):
        print(f"Fixing {file_path}...")
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Replace imports
        content = re.sub(r'from sqlalchemy.dialects.postgresql import UUID\n', '', content)
        
        # Replace UUID columns
        content = re.sub(r'Column\(UUID\(as_uuid=True\), primary_key=True, default=uuid\.uuid4\)', 
                        'Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))', content)
        
        content = re.sub(r'Column\(UUID\(as_uuid=True\), ForeignKey\(([^)]+)\)([^)]*)\)', 
                        r'Column(String(36), ForeignKey(\1)\2)', content)
        
        content = re.sub(r'Column\(UUID\(as_uuid=True\)\)', 
                        'Column(String(36))', content)
        
        # Make sure String is imported
        if 'from sqlalchemy import' in content and 'String' not in content:
            content = re.sub(r'from sqlalchemy import ([^n]+)', r'from sqlalchemy import String, \1', content)
        
        with open(file_path, 'w') as f:
            f.write(content)
        
        print(f"✅ Fixed {file_path}")
    else:
        print(f"❌ File not found: {file_path}")

print("✅ All models fixed!")

