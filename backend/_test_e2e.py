import urllib.request, json, time, os

# Test 1: Validate
print("=== Test 1: Validate ===")
req = urllib.request.Request(
    'http://127.0.0.1:8000/api/validate',
    data=json.dumps({'platform':'youtube','url':'https://www.youtube.com/watch?v=npOu_xwk9Ic'}).encode(),
    headers={'Content-Type':'application/json'},
    method='POST'
)
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
print("Valid:", result.get('valid'))
print("Title:", result.get('title'))
print("FFmpeg:", result.get('ffmpeg_available'))
print()

# Test 2: Download + Progress + File serve
print("=== Test 2: Download ===")
req = urllib.request.Request(
    'http://127.0.0.1:8000/api/download',
    data=json.dumps({'platform':'youtube','url':'https://www.youtube.com/watch?v=npOu_xwk9Ic'}).encode(),
    headers={'Content-Type':'application/json'},
    method='POST'
)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())
job_id = data['job_id']
print("Job ID:", job_id)

# Poll until complete
for i in range(20):
    time.sleep(2)
    resp2 = urllib.request.urlopen('http://127.0.0.1:8000/api/progress/' + job_id)
    progress = json.loads(resp2.read())
    status = progress['status']
    pct = progress['progress']
    fname = progress.get('file_name', '')
    fsize = progress.get('file_size_str', '')
    err = progress.get('error_message', '')
    print('  [{}] status={} progress={}% file={} size={}'.format(i+1, status, pct, fname, fsize))
    if status == 'completed':
        print("  File path (temp):", progress.get('file_path'))
        break
    elif status == 'error':
        print("  ERROR:", err)
        break

if status == 'completed':
    print()
    print("=== Test 3: File endpoint ===")
    file_url = 'http://127.0.0.1:8000/api/download/' + job_id + '/file'
    req3 = urllib.request.Request(file_url)
    resp3 = urllib.request.urlopen(req3)
    content_disp = resp3.headers.get('Content-Disposition', '')
    content_type = resp3.headers.get('Content-Type', '')
    content_len = resp3.headers.get('Content-Length', '0')
    print("Content-Disposition:", content_disp)
    print("Content-Type:", content_type)
    print("Content-Length:", content_len)
    # Read a small chunk to confirm it's a real file
    chunk = resp3.read(1024)
    print("First bytes length:", len(chunk))
    resp3.close()
    print()
    
    # Test 4: Check temp file cleanup
    print("=== Test 4: Temp file cleanup ===")
    time.sleep(2)
    temp_path = progress.get('file_path', '')
    if temp_path:
        exists = os.path.exists(temp_path)
        print("Temp file still exists:", exists)
