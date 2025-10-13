
#!/bin/bash

# Find all .js files recursively and zip each one
find apps/swivel-portal-api/dist -name "*.js" -type f | while read file; do
    # Get directory path and filename
    dir=$(dirname "$file")
    filename=$(basename "$file")
    
    # Create zip file with same name as .js file
    cd "$dir"
    zip "${filename}.zip" "$filename"
    cd - > /dev/null
done