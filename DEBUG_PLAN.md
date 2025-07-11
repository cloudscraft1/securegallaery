# VaultSecure Gallery Backend Debugging Plan

## Current Issue Analysis
Based on code review and git history, the backend is experiencing startup crashes and service instability.

### Key Findings:
1. **Supervisord Configuration**: Currently running `simple_server.py` (emergency fallback) instead of `server.py` (main application)
2. **Service Persistence**: Backend exits with status 0 and restarts repeatedly
3. **Image Loading**: Missing connection between frontend and backend image serving
4. **Security Features**: Advanced security implemented but needs testing

## Root Cause
The `supervisord.conf` is configured to run the emergency server instead of the main application server, causing the service to exit normally after completing basic functionality.

## Debugging Steps

### Phase 1: Fix Service Configuration
1. **Update supervisord.conf** to run the main server:
   - Change from `python simple_server.py` to `python server.py`
   - Ensure proper working directory and environment

2. **Verify Main Server Startup**:
   - Test `server.py` can start without crashes
   - Check all dependencies are available in production
   - Verify image directory creation and permissions

### Phase 2: Test Image Discovery and Creation
1. **Verify Image Directory**:
   - Ensure `/app/backend/images/gallery/` exists
   - Test sample image creation functionality
   - Check file permissions and write access

2. **Test Image Discovery**:
   - Run `discover_images()` function
   - Verify metadata generation
   - Check file path handling

### Phase 3: Security and API Testing
1. **Test Security Features**:
   - Session creation and validation
   - JWT token generation and verification
   - Rate limiting functionality
   - Security headers and CORS

2. **Test API Endpoints**:
   - `/api/test` - basic connectivity
   - `/api/debug` - image discovery status
   - `/api/session` - session management
   - `/api/images` - image listing with tokens
   - `/api/secure/image/{id}/view` - secure image serving

### Phase 4: Frontend Integration
1. **Test Frontend Connection**:
   - Verify React frontend can connect to backend
   - Check CORS configuration
   - Test API calls from frontend

2. **Test Security Features**:
   - Screenshot detection
   - Developer tools detection
   - Canvas-based image rendering

## Implementation Priority

### Immediate (High Priority)
1. ✅ Fix supervisord configuration
2. ✅ Test main server startup
3. ✅ Verify image discovery works

### Short-term (Medium Priority)
1. Test all API endpoints
2. Verify security token flow
3. Test frontend-backend integration

### Long-term (Low Priority)
1. Add comprehensive logging
2. Implement monitoring
3. Performance optimization

## Expected Outcomes
- Backend runs persistently without restarts
- Image loading works correctly in frontend
- Security features function properly
- No more startup crashes or service instability

## Rollback Plan
If main server fails:
1. Revert to emergency server temporarily
2. Use test server for detailed diagnostics
3. Implement gradual feature rollout

## Monitoring Points
- Service uptime and restart frequency
- Image loading success rate
- Security violation logs
- API response times
- Frontend error rates

## Success Metrics
- Backend stays online for >1 hour without restart
- Images load successfully in frontend
- Security features detect violations
- No critical errors in logs
